import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/Auth'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import TodoPage from './pages/TodoPage'
import ExpensePage from './pages/ExpensePage'
import NotePage from './pages/NotePage'
import WeatherPage from './pages/WeatherPage'
import AIPage from './pages/AIPage'

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/todos" element={<TodoPage />} />
                    <Route path="/expenses" element={<ExpensePage />} />
                    <Route path="/notes" element={<NotePage />} />
                    <Route path="/weather" element={<WeatherPage />} />
                    <Route path="/ai" element={<AIPage />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
