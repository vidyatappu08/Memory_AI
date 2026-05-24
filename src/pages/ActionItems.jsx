import { API_URL } from '../lib/config'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { CheckSquare, Loader, User, Calendar, AlertCircle, RefreshCw, FileText } from 'lucide-react'

const PRIORITY_COLORS = {
  HIGH: 'bg-red-50 text-red-600 border-red-200',
  MEDIUM: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  LOW: 'bg-green-50 text-green-600 border-green-200',
}

const PRIORITY_DOT = {
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-green-500',
}

export default function ActionItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [generated, setGenerated] = useState(false)

  async function generateActionItems() {
    setLoading(true)
    try {
      const { data: memories } = await supabase
        .from('memories')
        .select('title, content')

      if (!memories || memories.length === 0) {
        alert('No memories found! Add some memories first.')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/api/action-items`, {
      method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ memories })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setItems(data.items)
      setGenerated(true)
    } catch (err) {
      console.error(err)
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  function toggleDone(index) {
    setDone(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const filteredItems = items.filter(item => {
    if (filter === 'ALL') return true
    if (filter === 'DONE') return done.includes(items.indexOf(item))
    if (filter === 'PENDING') return !done.includes(items.indexOf(item))
    return item.priority === filter
  })

  const stats = {
    total: items.length,
    done: done.length,
    high: items.filter(i => i.priority === 'HIGH').length,
    pending: items.length - done.length,
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <CheckSquare size={20} />
            </div>
            Action Items
          </h1>
          <p className="text-gray-500 mt-1">
            AI extracted tasks from all your team memories
          </p>
        </div>
        <button
          onClick={generateActionItems}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
        >
          {loading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          {loading ? 'Extracting...' : generated ? 'Refresh' : 'Extract Action Items'}
        </button>
      </div>

      {/* Stats */}
      {generated && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tasks', value: stats.total, color: 'text-blue-600' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
            { label: 'High Priority', value: stats.high, color: 'text-red-600' },
            { label: 'Completed', value: stats.done, color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {generated && (
        <div className="flex gap-2 mb-6">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW', 'PENDING', 'DONE'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!generated && !loading && (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="text-blue-600" size={32} />
          </div>
          <p className="font-semibold text-gray-700 text-lg">Extract Action Items</p>
          <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
            AI will scan all your team memories and pull out every task, owner, and deadline automatically
          </p>
          <button
            onClick={generateActionItems}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            Extract Now
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
          <p className="font-semibold text-gray-700">AI is scanning your memories...</p>
          <p className="text-gray-400 text-sm mt-2">Extracting tasks, owners and deadlines</p>
        </div>
      )}

      {/* Action Items List */}
      {generated && !loading && (
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No items match this filter.</p>
            </div>
          ) : (
            filteredItems.map((item, i) => {
              const realIndex = items.indexOf(item)
              const isDone = done.includes(realIndex)
              return (
                <div
                  key={i}
                  className={`bg-white border rounded-xl p-4 flex items-start gap-4 transition ${
                    isDone ? 'opacity-50 border-gray-100' : 'border-gray-200 shadow-sm'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleDone(realIndex)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                      isDone
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {isDone && <CheckSquare size={14} />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.task}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <User size={12} />
                        {item.owner}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {item.deadline}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <FileText size={12} />
                        {item.source}
                      </span>
                    </div>
                  </div>

                  {/* Priority badge */}
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex items-center gap-1.5 ${PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.LOW}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[item.priority] || PRIORITY_DOT.LOW}`} />
                    {item.priority}
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}