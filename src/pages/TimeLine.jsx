import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Clock, FileText, MessageSquare, Mic } from 'lucide-react'

const SOURCE_COLORS = {
  chat: 'bg-blue-500',
  pdf: 'bg-purple-500',
  note: 'bg-yellow-500',
  voice: 'bg-green-500',
}

const SOURCE_ICONS = {
  chat: MessageSquare,
  pdf: FileText,
  note: FileText,
  voice: Mic,
}

export default function TimelinePage() {
  const [memories, setMemories] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: true })
      setMemories(data || [])
    }
    load()
  }, [])

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="text-blue-600" size={26} />
          Memory Timeline
        </h1>
        <p className="text-gray-500 mt-1">Your teams full history, every decision, every idea.</p>
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p>No memories yet. Go to Dashboard and add some!</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-6">
            {memories.map((memory) => {
              const Icon = SOURCE_ICONS[memory.source_type] || FileText
              const dotColor = SOURCE_COLORS[memory.source_type] || 'bg-gray-400'
              return (
                <div key={memory.id} className="flex gap-6 items-start">
                  <div className={`w-10 h-10 rounded-full ${dotColor} flex items-center justify-center flex-shrink-0 z-10 shadow`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm">{memory.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(memory.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                      {memory.content.slice(0, 150)}...
                    </p>
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full text-white ${dotColor}`}>
                      {memory.source_type}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}