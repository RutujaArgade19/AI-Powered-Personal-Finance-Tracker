import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts'
import { insightsAPI } from '../utils/api'
import { CATEGORY_COLORS, type Summary } from '../types'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [aiText, setAiText] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [summaryRes, aiRes] = await Promise.all([
          insightsAPI.getSummary(),
          insightsAPI.getAISummary(),
        ])
        setSummary(summaryRes.data)
        setAiText(aiRes.data.summary)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pieData = summary
    ? Object.entries(summary.by_category)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value: Math.round(value) }))
    : []

  if (loading) return <LoadingState />

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }} className="animate-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Good {getGreeting()}, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Here's your financial overview for this month</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Total Spent"
          value={`$${summary?.current_month.total_spent.toLocaleString('en', { minimumFractionDigits: 2 })}`}
          icon={TrendingDown}
          color="var(--red)"
        />
        <StatCard
          label="Total Income"
          value={`$${summary?.current_month.total_income.toLocaleString('en', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="var(--green)"
        />
        <StatCard
          label="Net Savings"
          value={`$${Math.abs(summary?.current_month.net || 0).toLocaleString('en', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color={(summary?.current_month.net || 0) >= 0 ? 'var(--green)' : 'var(--red)'}
          prefix={(summary?.current_month.net || 0) < 0 ? '-' : '+'}
        />
      </div>

      {/* AI Summary */}
      {aiText && (
        <div
          className="card"
          style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, rgba(124,111,255,0.08) 0%, var(--bg-card) 100%)',
            borderColor: 'rgba(124,111,255,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✨
            </div>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Insight
            </span>
          </div>
          <p style={{ color: 'var(--text-dim)', lineHeight: 1.7, fontSize: 15 }}>{aiText}</p>
        </div>
      )}

      {/* Anomaly warning */}
      {(summary?.anomaly_count || 0) > 0 && (
        <div
          className="card"
          style={{
            marginBottom: 24,
            background: 'rgba(251,191,36,0.06)',
            borderColor: 'rgba(251,191,36,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <AlertTriangle size={20} color="var(--amber)" />
          <span style={{ color: 'var(--amber)' }}>
            <strong>{summary?.anomaly_count}</strong> unusual transaction(s) detected this month.{' '}
            <a href="/transactions" style={{ color: 'var(--amber)', textDecoration: 'underline' }}>Review them →</a>
          </span>
        </div>
      )}

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Spending trend */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>6-Month Spending Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={summary?.monthly_trend}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-display)' }}
                labelStyle={{ color: 'var(--text)' }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, 'Spent']}
              />
              <Area type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>By Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                formatter={(v: number) => [`$${v}`, '']}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  prefix = '',
}: {
  label: string
  value: string
  icon: typeof TrendingUp
  color: string
  prefix?: string
}) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={16} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-mono)', color }}>
        {prefix}{value}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="skeleton" style={{ height: 32, width: 300, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 200 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[1, 2, 3].map((i) => <div key={i} className="skeleton card" style={{ height: 100 }} />)}
      </div>
      <div className="skeleton card" style={{ height: 80, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="skeleton card" style={{ height: 280 }} />
        <div className="skeleton card" style={{ height: 280 }} />
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}
