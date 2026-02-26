import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.tsx'
import { DollarSign, TrendingUp, Brain } from 'lucide-react'

export default function AuthPage() {
  const { login, register, isLoading } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, name, password)
      }
    } catch (e: any) {
      console.error('Auth error full:', e)
      // Show the most specific error message available
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        JSON.stringify(e?.response?.data) ||
        'Unknown error — check browser console (F12)'
      setError(msg)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg)' }}>
      {/* Left panel */}
      <div style={{
        background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1030 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', borderRight: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,111,255,0.15) 0%, transparent 70%)',
          top: '20%', left: '10%', pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px var(--accent-glow)',
          }}>
            <DollarSign size={24} color="white" />
          </div>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>FinanceAI</span>
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 20 }}>
          Your money,<br />
          <span style={{ color: 'var(--accent)' }}>intelligently</span><br />
          managed.
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.7, maxWidth: 360, marginBottom: 48 }}>
          AI-powered transaction categorization, anomaly detection, and plain-English spending insights.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: Brain, text: 'ML auto-categorizes every transaction' },
            { icon: TrendingUp, text: 'Detects unusual spending patterns' },
            { icon: DollarSign, text: 'Weekly AI summaries & tips' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: 'var(--accent-dim)',
                border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color="var(--accent)" />
              </div>
              <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', maxWidth: 480, margin: '0 auto', width: '100%',
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
          {mode === 'login' ? 'Sign in to your account' : 'Get started for free'}
        </p>

        {/* API URL debug info */}
        <div style={{
          background: 'rgba(124,111,255,0.08)', border: '1px solid rgba(124,111,255,0.2)',
          borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 11,
          color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
        }}>
          API: {window.location.hostname === 'localhost' ? 'http://localhost:8099' : 'checking...'}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <div>
              <label className="label">Full Name</label>
              <input className="input" type="text" placeholder="Jane Smith"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="jane@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,85,102,0.1)', border: '1px solid rgba(255,85,102,0.3)',
              borderRadius: 8, padding: '10px 14px', color: 'var(--red)', fontSize: 13,
              wordBreak: 'break-all',
            }}>
              ❌ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary"
            style={{ justifyContent: 'center', padding: '12px', fontSize: 15 }}
            disabled={isLoading}>
            {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {/* Quick test button */}
          <button
            type="button"
            className="btn btn-ghost"
            style={{ justifyContent: 'center', fontSize: 12 }}
            onClick={async () => {
              try {
                const res = await fetch('http://localhost:8099/health')
                const data = await res.json()
                alert('✅ Backend reachable: ' + JSON.stringify(data))
              } catch (e: any) {
                alert('❌ Cannot reach backend at http://localhost:8099\n\nError: ' + e.message)
              }
            }}
          >
            🔍 Test backend connection
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
