import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import WeatherWidget from '../components/WeatherWidget'
import './Dashboard.css'

export default function Dashboard() {
  const features = [
    {
      title: 'Todo List',
      icon: '✓',
      description: '管理您的任务和项目',
      path: '/todos',
    },
    {
      title: 'Expenses',
      icon: '💰',
      description: '追踪和分析支出',
      path: '/expenses',
    },
    {
      title: 'Smart Notes',
      icon: '📝',
      description: '文本和绘图便签',
      path: '/notes',
    },
    {
      title: 'Weather',
      icon: '🌤️',
      description: '天气预报和节气信息',
      path: '/weather',
    },
  ]

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Administrative Workbench</h1>
        <p className="subtitle">欢迎使用您的行政管理中心</p>
      </header>

      <div className="dashboard-grid">
        {features.map((feature) => (
          <Link key={feature.path} to={feature.path} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <div className="feature-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
            <div className="feature-arrow">
              <ArrowRight size={20} />
            </div>
          </Link>
        ))}
      </div>

      <section className="stats-section">
        <h2>快速统计</h2>
        <div className="stats-container">
          <WeatherWidget />
          <div className="stats-placeholder">
            <p>更多统计数据即将推出...</p>
          </div>
        </div>
      </section>
    </div>
  )
}
