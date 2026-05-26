import { NavLink } from 'react-router-dom'
import { Brain, Home, Search, Clock, Sparkles, CheckSquare, Heart, Zap, Calendar } from 'lucide-react'

const links = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/search', icon: Search, label: 'Ask Memory' },
  { to: '/action-items', icon: CheckSquare, label: 'Action Items' },
  { to: '/health', icon: Heart, label: 'Health Score' },
  { to: '/contradictions', icon: Zap, label: 'Contradictions' },
  { to: '/meeting-brief', icon: Calendar, label: 'Meeting Brief' },
   { to: '/weekly-report', icon: FileText, label: 'Weekly Report' },
  { to: '/timeline', icon: Clock, label: 'Timeline' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-2 rounded-xl shadow">
          <Brain size={22} />
        </div>
        <div>
          <p className="font-bold text-gray-900">Second Brain</p>
          <p className="text-xs text-gray-400">Team Memory AI</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
              ${isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
          <Sparkles size={14} className="text-blue-500" />
          <p className="text-xs text-blue-600 font-medium">Microsoft Build 2025</p>
        </div>
      </div>
    </aside>
  )
}