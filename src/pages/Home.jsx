import { useState, useEffect } from 'react'
import { Brain, FileText, MessageSquare, Mic, Trash2, Search } from 'lucide-react'
import UploadZone from '../components/Upload'
import { saveMemory } from '../lib/memoryService'
import { loadDemoData } from '../lib/demoData'
import { supabase } from '../lib/supabase'

const SOURCE_ICONS = {
  chat: MessageSquare,
  pdf: FileText,
  note: FileText,
  voice: Mic,
}

const SOURCE_COLORS = {
  chat: 'bg-blue-50 text-blue-600',
  pdf: 'bg-purple-50 text-purple-600',
  note: 'bg-yellow-50 text-yellow-600',
  voice: 'bg-green-50 text-green-600',
}

export default function Home() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(false)
  const [pasteMode, setPasteMode] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [pasteTitle, setPasteTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchMemories() }, [])

  async function fetchMemories() {
    const { data } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })
    setMemories(data || [])
  }

  async function handleUpload(file) {
    setLoading(true)
    try {
      const text = await file.text()
      const sourceType = file.type.includes('audio') ? 'voice' : 'pdf'
      await saveMemory(file.name, text, sourceType)
      await fetchMemories()
    } catch (err) {
      console.error(err)
      alert('Upload failed: ' + err.message)
    }
    setLoading(false)
  }

  async function handlePaste() {
    if (!pasteText.trim() || !pasteTitle.trim()) return
    setLoading(true)
    try {
      await saveMemory(pasteTitle, pasteText, 'chat')
      setPasteText('')
      setPasteTitle('')
      setPasteMode(false)
      await fetchMemories()
    } catch (err) {
      console.error(err)
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  async function deleteMemory(id) {
    await supabase.from('memories').delete().eq('id', id)
    setMemories(prev => prev.filter(m => m.id !== id))
  }

  async function handleLoadDemo() {
    setLoading(true)
    await loadDemoData()
    await fetchMemories()
    setLoading(false)
  }

  const filteredMemories = memories.filter(memory =>
    memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (memory.tags && memory.tags.some(tag =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="text-blue-600" size={28} />
            Team Memory Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Your team's second brain — never lose a decision, idea, or task again.
          </p>
        </div>
        <button
          onClick={handleLoadDemo}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Loading...' : 'Load Demo Data'}
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Memories', value: memories.length },
          { label: 'Chats Saved', value: memories.filter(m => m.source_type === 'chat').length },
          { label: 'Docs Saved', value: memories.filter(m => m.source_type === 'pdf').length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-600">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Upload Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Add New Memory</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPasteMode(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!pasteMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Upload File
          </button>
          <button
            onClick={() => setPasteMode(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${pasteMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Paste Chat / Text
          </button>
        </div>

        {pasteMode ? (
          <div className="space-y-3">
            <input
              value={pasteTitle}
              onChange={e => setPasteTitle(e.target.value)}
              placeholder="Title (e.g. Sprint planning - May 20)"
              className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400"
            />
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="Paste your chat, meeting notes, or any text here..."
              rows={6}
              className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400 resize-none"
            />
            <button
              onClick={handlePaste}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Processing...' : 'Save to Memory'}
            </button>
          </div>
        ) : (
          <UploadZone onUpload={handleUpload} />
        )}
      </div>

      {/* Memories List */}
      <div>
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="font-semibold">Saved Memories ({memories.length})</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="border rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-400 w-64"
            />
          </div>
        </div>

        {filteredMemories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Brain size={40} className="mx-auto mb-3 opacity-30" />
            <p>{searchQuery ? 'No memories match your search.' : 'No memories yet. Upload something or load demo data!'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMemories.map(memory => {
              const Icon = SOURCE_ICONS[memory.source_type] || FileText
              const colorClass = SOURCE_COLORS[memory.source_type] || 'bg-gray-50 text-gray-600'
              return (
                <div key={memory.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{memory.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {memory.source_type} · {new Date(memory.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {memory.content.slice(0, 120)}...
                    </p>
                    {memory.tags && memory.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {memory.tags.map((tag, i) => (
                          <span
                            key={i}
                            onClick={() => setSearchQuery(tag)}
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 cursor-pointer hover:bg-blue-100 transition"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMemory(memory.id)}
                    className="text-gray-300 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}