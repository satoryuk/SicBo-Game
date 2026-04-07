import { useState } from 'react'
import api from '../../api'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async () => {
    if (!username || !password) return setError('Please fill in all fields')
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/api/auth/login', { username, password })

      if (data.user.role !== 'admin') {
        setError('Access denied — admin accounts only')
        setLoading(false)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/admin'
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
    setLoading(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Logo */}
        <div style={s.logo}>🎲</div>
        <h1 style={s.title}>SIC BO</h1>
        <div style={s.badge}>ADMIN PORTAL</div>
        <div style={s.divider} />

        <p style={s.sub}>Sign in with your admin credentials</p>

        {error && <div style={s.error}>{error}</div>}

        {/* Username */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Username</label>
          <input
            style={s.input}
            placeholder="admin username"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase())}
            onKeyDown={handleKey}
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>

        {/* Password */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Password</label>
          <input
            style={s.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in...' : '🔐 Sign In'}
        </button>

        <div style={s.footer}>
          Player? <span style={s.link} onClick={() => window.location.href = '/login'}>← Go to player login</span>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#080f0a',
    backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(192,57,43,0.12) 0%, transparent 60%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Cinzel', serif", padding: 20,
  },
  card: {
    background: 'linear-gradient(135deg, #120808, #1a0f0f)',
    border: '2px solid rgba(192,57,43,0.5)',
    borderRadius: 20, padding: '44px 40px',
    width: '100%',  textAlign: 'center',
    boxShadow: '0 0 60px rgba(192,57,43,0.15)',
  },
  logo: { fontSize: '2.5rem', marginBottom: 8 },
  title: { color: '#c9a84c', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.2em', margin: '0 0 8px' },
  badge: {
    display: 'inline-block',
    background: 'rgba(192,57,43,0.2)', border: '1px solid #c0392b',
    color: '#ff6655', fontSize: '0.55rem', letterSpacing: '0.2em',
    padding: '3px 12px', borderRadius: 20, marginBottom: 16,
  },
  divider: { height: 1, background: 'linear-gradient(to right, transparent, rgba(192,57,43,0.4), transparent)', marginBottom: 20 },
  sub: { color: '#a08050', fontSize: '0.65rem', letterSpacing: '0.15em', marginBottom: 24 },
  error: {
    background: 'rgba(192,57,43,0.12)', border: '1px solid #c0392b',
    borderRadius: 8, padding: '10px 14px', color: '#ff6655',
    fontSize: '0.75rem', marginBottom: 16, letterSpacing: '0.05em',
  },
  fieldGroup: { textAlign: 'left', marginBottom: 14 },
  label: { display: 'block', color: '#a08050', fontSize: '0.6rem', letterSpacing: '0.15em', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(192,57,43,0.3)',
    borderRadius: 8, color: '#f5e6c8',
    fontFamily: "'Cinzel', serif", fontSize: '0.85rem',
    outline: 'none',
  },
  btn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, #7b1e14, #c0392b, #7b1e14)',
    border: 'none', borderRadius: 10, color: '#fff',
    fontFamily: "'Cinzel', serif", fontWeight: 700,
    fontSize: '0.85rem', letterSpacing: '0.15em',
    cursor: 'pointer', marginTop: 8,
    boxShadow: '0 4px 20px rgba(192,57,43,0.4)',
  },
  footer: { color: '#a08050', fontSize: '0.65rem', marginTop: 20 },
  link: { color: '#c0392b', cursor: 'pointer', textDecoration: 'underline', marginLeft: 4 },
}
