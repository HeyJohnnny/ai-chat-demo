import { useState, useRef, useEffect } from 'react'
import './App.css'
import ChatBox from './components/ChatBox'
import Message from './components/Message'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const messagesEndRef = useRef(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  const handleSendMessage = async (userMessage) => {
    // 添加用户消息
    const userMsg = { id: Date.now(), role: 'user', content: userMessage }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setStreamingMessage('')

    try {
      // 使用流式接口获取打字机效果
      const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: null
        })
      })

      if (!response.ok) {
        throw new Error('请求失败')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let aiResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              // 流结束，保存完整消息
              const aiMsg = {
                id: Date.now(),
                role: 'assistant',
                content: aiResponse
              }
              setMessages(prev => [...prev, aiMsg])
              setStreamingMessage('')
              setIsLoading(false)
              return
            }
            
            if (data.startsWith('[ERROR]')) {
              throw new Error(data.slice(7))
            }

            aiResponse += data
            setStreamingMessage(aiResponse)
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg = {
        id: Date.now(),
        role: 'assistant',
        content: '抱歉，发生了错误：' + error.message
      }
      setMessages(prev => [...prev, errorMsg])
      setStreamingMessage('')
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setStreamingMessage('')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 AI 聊天助手</h1>
        <button className="clear-btn" onClick={clearChat}>
          清空对话
        </button>
      </header>

      <main className="chat-container">
        {messages.length === 0 && !streamingMessage ? (
          <div className="welcome">
            <h2>欢迎使用 AI 聊天助手</h2>
            <p>输入你的问题，AI 会逐字回复你</p>
          </div>
        ) : (
          <div className="messages">
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            
            {/* 流式消息（打字机效果） */}
            {streamingMessage && (
              <Message
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamingMessage
                }}
                isTyping={true}
              />
            )}
            
            {/* 加载动画 */}
            {isLoading && !streamingMessage && (
              <div className="message assistant">
                <div className="avatar">🤖</div>
                <div className="content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <ChatBox onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}

export default App
