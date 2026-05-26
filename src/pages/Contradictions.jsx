import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { API_URL } from '../lib/config'
import { Zap, Loader, RefreshCw, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'

const SEVERITY_STYLES = {
  high: { border: 'border-red-200', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  medium: { border: 'border-yellow-200', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  low: { border: 'border-blue-200', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
}

export default function Contradictions() {
  const [contradictions, setContradictions] = useState([])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  async function findContradictions() {
    setLoading(true)
    try {
      const { data: memories } = await supabase
        .from('memories')
        .select('title, content, created_at')

      if (!memories || memories.length === 0) {
        alert('No memories found! Add some memories first.')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/api/contradictions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ memories })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setContradictions(data.contradictions || [])
      setGenerated(true)
    } catch (err) {
      console.error(err)
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="bg-orange-500 text-white p-1.5 rounded-lg">
              <Zap size={20} />
            </div>
            Contradiction Detector
          </h1>
          <p className="text-gray-500 mt-1">
            AI finds conflicting decisions and statements across all team memories
          </p>
        </div>
        <button
          onClick={findContradictions}
          disabled={loading}
          className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition shadow-sm"
        >
          {loading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {loading ? 'Scanning...' : generated ? 'Scan Again' : 'Find Contradictions'}
        </button>
      </div>

      {/* Empty state */}
      {!generated && !loading && (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl">
          <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="text-orange-500" size={32} />
          </div>
          <p className="font-semibold text-gray-700 text-lg">Find Conflicting Decisions</p>
          <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
            AI will scan all memories and find where your team said contradicting things across different meetings and chats
          </p>
          <button
            onClick={findContradictions}
            className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-orange-600 transition"
          >
            Scan Now
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl">
          <Loader className="animate-spin text-orange-500 mx-auto mb-4" size={32} />
          <p className="font-semibold text-gray-700">Scanning all memories for conflicts...</p>
          <p className="text-gray-400 text-sm mt-2">Comparing decisions, assignments and statements</p>
        </div>
      )}

      {/* Results */}
      {generated && !loading && (
        <div className="space-y-4">

          {/* Summary bar */}
          <div className={`rounded-2xl p-4 flex items-center gap-3 ${contradictions.length > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            {contradictions.length > 0 ? (
              <>
                <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                <p className="text-red-700 font-medium text-sm">
                  Found {contradictions.length} contradiction{contradictions.length > 1 ? 's' : ''} — resolve these to avoid confusion
                </p>
              </>
            ) : (
              <>
                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                <p className="text-green-700 font-medium text-sm">
                  No contradictions found — your team is consistent!
                </p>
              </>
            )}
          </div>

          {/* Contradiction cards */}
          {contradictions.map((c, i) => {
            const styles = SEVERITY_STYLES[c.severity] || SEVERITY_STYLES.low
            return (
              <div key={i} className={`bg-white border ${styles.border} rounded-2xl p-6 shadow-sm`}>

                {/* Topic + severity */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                    <h3 className="font-semibold text-gray-800">{c.topic}</h3>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles.badge}`}>
                    {c.severity} severity
                  </span>
                </div>

                {/* Two statements */}
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <div className={`flex-1 ${styles.bg} rounded-xl p-4`}>
                    <p className="text-xs font-medium text-gray-500 mb-1">Statement A</p>
                    <p className="text-sm text-gray-700">{c.statement_a}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="bg-gray-100 rounded-full p-2">
                      <ArrowRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <div className={`flex-1 ${styles.bg} rounded-xl p-4`}>
                    <p className="text-xs font-medium text-gray-500 mb-1">Statement B</p>
                    <p className="text-sm text-gray-700">{c.statement_b}</p>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Recommendation: </span>
                    {c.recommendation}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}