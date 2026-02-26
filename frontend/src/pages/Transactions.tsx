import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { Plus, Trash2, AlertTriangle, Upload, X } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { CATEGORY_COLORS } from '../types'
import { txAPI } from '../utils/api'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Income', 'Other']

export default function Transactions() {
  const { transactions, isLoading, addTransaction, deleteTransaction, refetch } = useTransactions()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [filterCat, setFilterCat] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addTransaction({
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category || undefined,
        date: new Date(form.date).toISOString(),
        notes: form.notes || undefined,
      })
      setForm({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' })
      setShowForm(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await txAPI.uploadCSV(file)
      await refetch()
    } catch (e) {
      alert('CSV upload failed. Make sure columns are: date, description, amount')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const filtered = filterCat ? transactions.filter((t) => t.category === filterCat) : transactions

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }} className="animate-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Transactions</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{transactions.length} total · ML auto-categorized</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} style={{ display: 'none' }} />
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload size={14} /> {uploading ? 'Uploading...' : 'Import CSV'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? 'Cancel' : 'Add Transaction'}
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card animate-in" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>New Transaction</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label className="label">Description</label>
                <input
                  className="input"
                  placeholder="e.g. Starbucks coffee"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Amount ($)</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  placeholder="-12.50"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  className="input"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label className="label">Category (optional — AI will predict)</label>
                <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Auto-detect with ML</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notes</label>
                <input className="input" placeholder="Optional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Transaction'}
            </button>
          </form>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          className="btn"
          style={{
            fontSize: 12,
            padding: '6px 14px',
            background: !filterCat ? 'var(--accent-dim)' : 'transparent',
            border: `1px solid ${!filterCat ? 'var(--accent)' : 'var(--border)'}`,
            color: !filterCat ? 'var(--accent)' : 'var(--text-muted)',
          }}
          onClick={() => setFilterCat('')}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className="btn"
            style={{
              fontSize: 12,
              padding: '6px 14px',
              background: filterCat === cat ? `${CATEGORY_COLORS[cat]}18` : 'transparent',
              border: `1px solid ${filterCat === cat ? CATEGORY_COLORS[cat] : 'var(--border)'}`,
              color: filterCat === cat ? CATEGORY_COLORS[cat] : 'var(--text-muted)',
            }}
            onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />
          ))
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            No transactions yet. Add one or import a CSV.
          </div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 18px',
                borderColor: tx.is_anomaly ? 'rgba(251,191,36,0.3)' : undefined,
                background: tx.is_anomaly ? 'rgba(251,191,36,0.04)' : undefined,
              }}
            >
              {/* Category dot */}
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: CATEGORY_COLORS[tx.category] || '#6b7280',
                  flexShrink: 0,
                }}
              />

              {/* Description */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {tx.description}
                  {tx.is_anomaly && <AlertTriangle size={13} color="var(--amber)" title="Unusual transaction" />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {format(new Date(tx.date), 'MMM d, yyyy')}
                  {tx.notes && ` · ${tx.notes}`}
                </div>
              </div>

              {/* Category badge */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: `${CATEGORY_COLORS[tx.category] || '#6b7280'}18`,
                  color: CATEGORY_COLORS[tx.category] || '#6b7280',
                  border: `1px solid ${CATEGORY_COLORS[tx.category] || '#6b7280'}40`,
                }}
              >
                {tx.category}
              </span>

              {/* Amount */}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: 15,
                  color: tx.is_income ? 'var(--green)' : 'var(--red)',
                  minWidth: 90,
                  textAlign: 'right',
                }}
              >
                {tx.is_income ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteTransaction(tx.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 4,
                  borderRadius: 6,
                }}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
