import { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { insightsAPI, txAPI } from '../utils/api'
import { CATEGORY_COLORS, type Summary, type Transaction } from '../types'

export default function Insights() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [aiSummary, setAiSummary] = useState<string>('')
  const [anomalies, setAnomalies] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshingAI, setRefreshingAI] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [sumRes, aiRes, anomalyRes] = await Promise.all([
        insightsAPI.getSummary(),
        insightsAPI.getAISummary(),
        txAPI.getAnomalies(),
      ])
      setSummary(sumRes.data)
      setAiSummary(aiRes.data.summary)
      setAnomalies(anomalyRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const refreshAI = async () => {
    setRefreshingAI(true)
    try {
      const { data } = await insightsAPI.getAISummary()
      setAiSummary(data.summary)
    } finally {
      setRefreshingAI(false)
    }
  }

  useEffect(() => { load() }, [])

  const categoryBarData = summary
    ? Object.entries(summary.by_category)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value: Math.round(value) }))
    : []

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {[1, 2, 3].map((i) => <div key={i} className="skeleton card" style={{ height: 120, marginBottom: 16 }} />)}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }} className="animate-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>AI Insights</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
          Powered by ML anomaly detection and AI-generated spending analysis
        </p>
      </div>

      {/* AI Summary card */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(124,111,255,0.08) 0%, var(--bg-card) 100%)',
          borderColor: 'rgba(124,111,255,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="var(--accent)" />
            <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Spending Summary
            </span>
          </div>
          <button
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: '6px 12px' }}
            onClick={refreshAI}
            disabled={refreshingAI}
          >
            <RefreshCw size={12} style={{ animation: refreshingAI ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
        <p style={{ color: 'var(--text-dim)', lineHeight: 1.75, fontSize: 15 }}>{aiSummary}</p>
      </div>

      {/* Anomaly section */}
      {anomalies.length > 0 && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertTriangle size={18} color="var(--amber)" />
            <span style={{ fontWeight: 700, color: 'var(--amber)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Unusual Transactions ({anomalies.length})
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>
            These transactions were flagged as anomalies by our ML model based on your personal spending history.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {anomalies.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: 'var(--bg)',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{tx.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.category}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--amber)' }}>
                  ${Math.abs(tx.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category breakdown chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <TrendingUp size={18} color="var(--accent)" />
          <h3 style={{ fontWeight: 700 }}>Spending by Category (This Month)</h3>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={categoryBarData} layout="vertical" margin={{ left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12, fill: 'var(--text-dim)', fontFamily: 'var(--font-display)' }} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
              formatter={(v: number) => [`$${v}`, 'Amount']}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {categoryBarData.map((entry) => (
                <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Month stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {categoryBarData.slice(0, 6).map((cat) => (
          <div
            key={cat.name}
            className="card"
            style={{ padding: '14px 16px', borderLeft: `3px solid ${CATEGORY_COLORS[cat.name] || '#6b7280'}` }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{cat.name}</div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)', color: CATEGORY_COLORS[cat.name] }}>
              ${cat.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
