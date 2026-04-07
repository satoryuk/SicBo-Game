import React, { useState, useEffect } from 'react'
import api from '../../api'
import { page, card, btn, input } from '../../styles'


export default function Settings() {
  const [settings, setSettings] = useState({ minBet: 1, maxBet: 10000, maintenanceMode: false })
  const [msg,      setMsg]      = useState(null)
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    api.get('/api/admin/settings').then(r => setSettings(r.data))
  }, [])

  const save = async () => {
    setLoading(true)
    try {
      const { data } = await api.put('/api/admin/settings', settings)
      setSettings(data.settings)
      flash('✅ Settings saved successfully!', 'green')
    } catch (e) {
      flash(e.response?.data?.message || 'Error saving settings', 'red')
    }
    setLoading(false)
  }

  const flash = (text, color) => {
    setMsg({ text, color })
    setTimeout(() => setMsg(null), 3000)
  }

  return (
    <div style={page}>
      <div style={{  margin: '0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <h2 style={{ color: '#c9a84c', letterSpacing: '0.15em', margin: 0 }}>⚙️ GAME SETTINGS</h2>

        {msg && (
          <div style={{
            background: msg.color === 'green' ? 'rgba(39,174,96,0.15)' : 'rgba(192,57,43,0.15)',
            border: `1px solid ${msg.color === 'green' ? '#27ae60' : '#c0392b'}`,
            borderRadius: 8, padding: '10px 16px',
            color: msg.color === 'green' ? '#27ae60' : '#ff6655', fontSize: '0.8rem',
          }}>
            {msg.text}
          </div>
        )}

        <div style={card}>

          {/* Min Bet */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#a08050', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: 8 }}>
              🎲 MINIMUM BET (coins)
            </label>
            <input style={input} type="number" min="1"
              value={settings.minBet}
              onChange={e => setSettings(s => ({ ...s, minBet: Number(e.target.value) }))} />
            <div style={{ color: '#a08050', fontSize: '0.6rem', marginTop: -6 }}>
              Players cannot bet less than this amount per round
            </div>
          </div>

          {/* Max Bet */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#a08050', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: 8 }}>
              🎲 MAXIMUM BET (coins)
            </label>
            <input style={input} type="number" min="1"
              value={settings.maxBet}
              onChange={e => setSettings(s => ({ ...s, maxBet: Number(e.target.value) }))} />
            <div style={{ color: '#a08050', fontSize: '0.6rem', marginTop: -6 }}>
              Players cannot bet more than this amount per round
            </div>
          </div>

          {/* Maintenance Mode */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#a08050', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: 12 }}>
              🔧 MAINTENANCE MODE
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                style={{
                  ...btn.success,
                  opacity: settings.maintenanceMode ? 0.4 : 1,
                  flex: 1,
                }}
                onClick={() => setSettings(s => ({ ...s, maintenanceMode: false }))}>
                🟢 Game Active
              </button>
              <button
                style={{
                  ...btn.danger,
                  opacity: settings.maintenanceMode ? 1 : 0.4,
                  flex: 1,
                }}
                onClick={() => setSettings(s => ({ ...s, maintenanceMode: true }))}>
                🔴 Maintenance
              </button>
            </div>
            {settings.maintenanceMode && (
              <div style={{
                background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)',
                borderRadius: 8, padding: '8px 12px', marginTop: 10,
                color: '#ff6655', fontSize: '0.65rem',
              }}>
                ⚠️ Game is currently in maintenance mode. Players cannot place bets.
              </div>
            )}
          </div>

          {/* Current values summary */}
          <div style={{
            background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '14px 16px',
            marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
          }}>
            {[
              { label: 'Min Bet', value: `🪙 ${settings.minBet}`, color: '#c9a84c' },
              { label: 'Max Bet', value: `🪙 ${settings.maxBet}`, color: '#c9a84c' },
              { label: 'Status',  value: settings.maintenanceMode ? '🔴 Maintenance' : '🟢 Active', color: settings.maintenanceMode ? '#c0392b' : '#27ae60' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.55rem', color: '#a08050', letterSpacing: '0.15em', marginBottom: 4 }}>{s.label}</div>
                <div style={{ color: s.color, fontWeight: 700, fontSize: '0.9rem' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <button style={{ ...btn.primary, width: '100%' }} onClick={save} disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
