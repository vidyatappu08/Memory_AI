import Chat from '../components/Chat'
import { Search, Zap } from 'lucide-react'

const suggestions = [
  "What did Rahul suggest about the payment button?",
  "Who owns the login page redesign?",
  "What bugs were reported this week?",
  "What tasks are due this sprint?",
]

export default function SearchPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <Search size={16} />
              </div>
              Ask Your Team Memory
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Ask anything — get instant answers from your team's history
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-700 font-medium">AI Active</span>
          </div>
        </div>

        {/* Suggestion chips */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                const input = document.querySelector('input[placeholder="Ask anything about your team..."]')
                if (input) {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
                  nativeInputValueSetter.call(input, s)
                  input.dispatchEvent(new Event('input', { bubbles: true }))
                }
              }}
              className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-3 py-1.5 rounded-full transition border border-transparent hover:border-blue-200"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <Chat />
      </div>
    </div>
  )
}