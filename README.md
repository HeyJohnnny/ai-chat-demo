# AI 聊天 Demo 项目

一个基于 React + FastAPI 的 AI 聊天应用，支持打字机效果的流式回复。

## 项目结构

```
ai-chat-demo/
├── backend/          # FastAPI 后端服务
│   ├── main.py      # 主服务代码
│   ├── requirements.txt
│   └── .env.example # 环境变量示例
│
└── frontend/         # React 前端
    ├── src/
    │   ├── components/
    │   │   ├── ChatBox.jsx    # 输入框组件
    │   │   └── Message.jsx    # 消息展示组件
    │   ├── App.jsx            # 主应用
    │   └── App.css            # 样式
    ├── package.json
    └── vite.config.js
```

## 功能特性

- 🤖 **AI 对话**: 接入 OpenAI GPT API
- ⌨️ **打字机效果**: 流式显示 AI 回复，逐字呈现
- 💬 **聊天界面**: 简洁美观的聊天 UI
- 🔄 **自动滚动**: 新消息自动滚动到底部
- 📱 **响应式设计**: 支持移动端和桌面端

## 快速开始

### 1. 启动后端服务

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置 API Key
cp .env.example .env
# 编辑 .env 文件，填入你的 OpenAI API Key

# 启动服务
python main.py
```

后端服务将在 `http://localhost:8000` 启动。

### 2. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:3000` 启动。

### 3. 开始聊天

打开浏览器访问 `http://localhost:3000`，即可开始与 AI 对话！

## API 接口

### 普通对话
```http
POST /api/chat
Content-Type: application/json

{
  "message": "你好",
  "conversation_id": null
}
```

### 流式对话（打字机效果）
```http
POST /api/chat/stream
Content-Type: application/json

{
  "message": "你好",
  "conversation_id": null
}
```

## 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `OPENAI_API_KEY` | OpenAI API 密钥 | - |
| `OPENAI_API_BASE` | OpenAI API 地址 | https://api.openai.com/v1 |
| `MODEL` | 使用的模型 | gpt-3.5-turbo |

## 技术栈

- **前端**: React 18 + Vite
- **后端**: FastAPI + Uvicorn
- **AI**: OpenAI GPT API
- **HTTP 客户端**: Axios (前端) / httpx (后端)


## 许可证

MIT
