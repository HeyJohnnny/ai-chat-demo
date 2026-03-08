import './Message.css'

function Message({ message, isTyping = false }) {
  const { role, content } = message
  const isUser = role === 'user'

  // 将换行符转换为 <br />
  const formatContent = (text) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ))
  }

  return (
    <div className={`message ${role} ${isTyping ? 'typing' : ''}`}>
      <div className="avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div className="content">
        <div className="role-label">
          {isUser ? '你' : 'AI 助手'}
        </div>
        <div className="text">
          {formatContent(content)}
          {isTyping && <span className="cursor">▋</span>}
        </div>
      </div>
    </div>
  )
}

export default Message
