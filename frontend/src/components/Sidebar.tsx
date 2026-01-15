import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import './Sidebar.css'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const { handleLogout, user } = useAuth()

  const menuItems = [
    { label: 'Dashboard', icon: '📊', path: '/' },
    { label: 'Todos', icon: '✓', path: '/todos' },
    { label: 'Expenses', icon: '💰', path: '/expenses' },
    { label: 'Notes', icon: '📝', path: '/notes' },
    { label: 'Weather', icon: '🌤️', path: '/weather' },
    { label: 'AI Assistant', icon: '🤖', path: '/ai' },
  ]

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h1>AWB</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="toggle-btn"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link key={item.label} to={item.path} className="nav-item">
            <span className="nav-icon">{item.icon}</span>
            {isOpen && <span className="nav-label">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isOpen && (
          <div className="user-section">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
            <div className="user-info">
              <p className="user-name">{user?.username}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
