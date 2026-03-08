"""
FastAPI 后端服务 - AI 聊天接口
"""
import os
from typing import AsyncGenerator
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

# 加载 .env 文件
load_dotenv()

# 配置
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-openai-api-key-here")
OPENAI_API_BASE = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
MODEL = os.getenv("MODEL", "gpt-3.5-turbo")

print(OPENAI_API_BASE, OPENAI_API_KEY, MODEL)
print("****")
# 请求模型
class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None

# 响应模型
class ChatResponse(BaseModel):
    content: str
    conversation_id: str | None = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """应用生命周期管理"""
    # 启动时创建 http client
    app.state.http_client = httpx.AsyncClient(timeout=60.0)
    yield
    # 关闭时清理
    await app.state.http_client.aclose()


app = FastAPI(
    title="AI Chat API",
    description="AI 聊天后端服务",
    version="1.0.0",
    lifespan=lifespan
)

# 配置 CORS，允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "AI Chat API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    发送消息给 AI 并获取回复
    """
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your-openai-api-key-here":
        raise HTTPException(
            status_code=500,
            detail="OpenAI API Key 未配置，请设置环境变量 OPENAI_API_KEY"
        )
    
    try:
        client: httpx.AsyncClient = app.state.http_client
        
        # 调用 OpenAI API
        response = await client.post(
            f"{OPENAI_API_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": MODEL,
                "messages": [{"role": "user", "content": request.message}],
                "temperature": 0.7,
                "max_tokens": 2000
            }
        )
        
        if response.status_code != 200:
            error_detail = response.text
            raise HTTPException(
                status_code=response.status_code,
                detail=f"OpenAI API 错误: {error_detail}"
            )
        
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        return ChatResponse(
            content=content,
            conversation_id=request.conversation_id
        )
        
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"请求失败: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"服务器错误: {str(e)}")


@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    流式返回 AI 回复（用于打字机效果）
    """
    from fastapi.responses import StreamingResponse
    # return StreamingResponse(
    #     # generate(),
    #     "data: dlfjakldjfldfdasgkadhgdashgadjgldsjagldasjgldsajlkdasjgldasjgkldsajgkldasjglkdsjgljaslkgjdaslgjdlaskgjdlasjglasjls\n\n",
    #     media_type="text/event-stream",
    #     headers={
    #         "Cache-Control": "no-cache",
    #         "Connection": "keep-alive",
    #     }
    # )
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your-openai-api-key-here":
        raise HTTPException(
            status_code=500,
            detail="OpenAI API Key 未配置，请设置环境变量 OPENAI_API_KEY"
        )
    
    async def generate():
        client: httpx.AsyncClient = app.state.http_client
        
        try:
            async with client.stream(
                "POST",
                f"{OPENAI_API_BASE}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": MODEL,
                    "messages": [{"role": "user", "content": request.message}],
                    "temperature": 0.7,
                    "max_tokens": 2000,
                    "stream": True
                }
            ) as response:
                if response.status_code != 200:
                    error = await response.aread()
                    yield f"data: [ERROR] {error.decode()}\n\n"
                    return
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            yield "data: [DONE]\n\n"
                            break
                        try:
                            import json
                            chunk = json.loads(data)
                            delta = chunk["choices"][0]["delta"]
                            if "content" in delta:
                                content = delta["content"]
                                # SSE 格式
                                yield f"data: {content}\n\n"
                        except:
                            pass
                            
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            # HTTP/1.1 默认 keep-alive，无需设置
            # Nginx 用户可能需要: "X-Accel-Buffering": "no"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
