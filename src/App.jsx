import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Search from './pages/Search'
import TimelinePage from './pages/TimeLine'
import ActionItems from './pages/ActionItems'
import HealthScore from './pages/HealthScore'
import Contradictions from './pages/Contradictions'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 text-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/action-items" element={<ActionItems />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/health" element={<HealthScore />} />
            <Route path="/contradictions" element={<Contradictions />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}