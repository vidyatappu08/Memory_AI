import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { API_URL } from '../lib/config'
import { Heart, AlertTriangle, CheckCircle, TrendingUp, RefreshCw, Loader, XCircle, Info } from 'lucide-react'

const SEVERITY_COLORS = {
  high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
  low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700' },
}

const ISSUE_ICONS = {
  unresolved_task: AlertTriangle,
  missed_deadline: XCircle,
  contradiction: AlertTriangle,
  knowledge_gap: Info,
}

const GRADE_COLORS = {
  A: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50' },
  'B+': { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
  B: { bg: 'bg-blue-400', text: 'text-blue-600', light: 'bg-blue-50' },
  C: { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50' },
  D: { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' },
}

function ScoreRing({ score, grade }) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const gradeColor = GRADE_COLORS[grade] || GRADE_COLORS['B']

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={score >= 80 ? '#22c55e' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444'}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">{score}</span>
          <span className="text-sm text-gray-500">out of 100</span>
          <span className={`text-lg font-bold mt-1 ${gradeColor.text}`}>{grade}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">Memory Health Score</p>
    </div>
  )
}

export default function HealthScore() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(false)

  async function generateHealthScore() {
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

      const response = await fetch(`${API_URL}/api/health-score`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ memories })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setHealth(data)
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
            <div className="bg-green-600 text-white p-1.5 rounded-lg">
              <Heart size={20} />
            </div>
            Memory Health Score
          </h1>
          <p className="text-gray-500 mt-1">
            AI analyzes your team's memory quality and surfaces critical issues
          </p>
        </div>
        <button
          onClick={generateHealthScore}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition shadow-sm"
        >
          {loading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {loading ? 'Analyzing...' : health ? 'Refresh Analysis' : 'Analyze Team Memory'}
        </button>
      </div>

      {/* Empty state */}
      {!health && !loading && (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl">
          <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="text-green-600" size={32} />
          </div>
          <p className="font-semibold text-gray-700 text-lg">Check Your Team Memory Health</p>
          <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
            AI will scan all your memories and give your team a health score with detailed insights
          </p>
          <button
            onClick={generateHealthScore}
            className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-green-700 transition"
          >
            Analyze Now
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl">
          <Loader className="animate-spin text-green-600 mx-auto mb-4" size={32} />
          <p className="font-semibold text-gray-700">AI is analyzing your team memories...</p>
          <p className="text-gray-400 text-sm mt-2">Checking for issues, gaps, and contradictions</p>
        </div>
      )}

      {/* Results */}
      {health && !loading && (
        <div className="space-y-6">

          {/* Score + Stats Row */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">

              {/* Score Ring */}
              <ScoreRing score={health.score} grade={health.grade} />

              {/* Divider */}
              <div className="w-px h-40 bg-gray-200 hidden md:block" />

              {/* Stats + Summary */}
              <div className="flex-1">
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{health.summary}</p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Decisions', value: health.stats?.total_decisions || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Unresolved Tasks', value: health.stats?.unresolved_tasks || 0, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Contradictions', value: health.stats?.contradictions || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'Knowledge Gaps', value: health.stats?.knowledge_gaps || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} rounded-xl p-3`}>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Issues */}
          {health.issues && health.issues.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                Issues Found ({health.issues.length})
              </h2>
              <div className="space-y-3">
                {health.issues.map((issue, i) => {
                  const colors = SEVERITY_COLORS[issue.severity] || SEVERITY_COLORS.low
                  const Icon = ISSUE_ICONS[issue.type] || AlertTriangle
                  return (
                    <div key={i} className={`${colors.bg} border ${colors.border} rounded-xl p-4 flex items-start gap-3`}>
                      <Icon size={18} className={`${colors.text} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${colors.text}`}>{issue.description}</p>
                        <p className="text-xs text-gray-400 mt-1 capitalize">{issue.type.replace(/_/g, ' ')}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors.badge}`}>
                        {issue.severity}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Positives */}
          {health.positives && health.positives.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                What Your Team Is Doing Well
              </h2>
              <div className="space-y-2">
                {health.positives.map((positive, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">{positive}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
              <TrendingUp size={18} />
              How to Improve Your Score
            </h2>
            <ul className="space-y-2">
              {[
                'Resolve flagged tasks and mark them complete in Action Items',
                'Document important decisions with clear context',
                'Follow up on open items mentioned in meetings',
                'Save client calls and feedback as memories regularly',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                  <span className="text-blue-400 mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  )
}