import { API_URL } from '../lib/config'
import { useState, useRef, useEffect } from 'react'
import { searchMemories } from '../lib/memoryService'
import { Send, Brain, User } from 'lucide-react'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function askQuestion() {
    if (!input.trim()) return
    const question = input
    setInput('')
    setLoading(true)

    setMessages(prev => [...prev, { role: 'user', text: question }])

    try {
      const chunks = await searchMemories(question)
      const context = chunks.map(c => c.chunk_text).join('\n\n')

      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a team memory assistant. Answer the question using ONLY the context below. Always mention which source the info came from. Be concise and helpful.\n\nCONTEXT FROM TEAM MEMORIES:\n${context}\n\nQUESTION: ${question}`
          }]
        })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      const answer = data.content[0].text

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: answer,
        sources: chunks
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, something went wrong. Please try again.',
        sources: []
      }])
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center mt-20">
            <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="text-blue-600" size={32} />
            </div>
            <p className="font-semibold text-gray-700 text-lg">Ask anything about your team</p>
            <p className="text-gray-400 text-sm mt-2">
              Your AI assistant has access to all saved memories
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="bg-blue-600 text-white w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <Brain size={16} />
              </div>
            )}
            <div className={`max-w-xl ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
              }`}>
                <p>{msg.text}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium mb-1">Sources:</p>
                    {msg.sources.slice(0, 2).map((s, j) => (
                      <p key={j} className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                        <span className="text-blue-400 mt-0.5">•</span>
                        {s.chunk_text.slice(0, 90)}...
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="bg-gray-200 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <User size={16} className="text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain size={16} />
            </div>
            <div className="bg-white shadow-sm border border-gray-100 p-4 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askQuestion()}
            placeholder="Ask anything about your team..."
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-gray-700 placeholder-gray-400"
          />
          <button
            onClick={askQuestion}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}