import { useState, useRef, useEffect } from 'react'
import './ChatBox.css'

function ChatBox({ onSendMessage, isLoading }) {
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  // 自动调整文本框高度
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }, [input])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
      // 重置高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="chat-box">
      <form onSubmit={handleSubmit} className="input-container">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入你的问题，按 Enter 发送，Shift+Enter 换行..."
          disabled={isLoading}
          rows={1}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={input.trim() ? 'active' : ''}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
      <p className="hint">按 Enter 发送 · Shift+Enter 换行</p>
    </div>
  )
}

export default ChatBox
