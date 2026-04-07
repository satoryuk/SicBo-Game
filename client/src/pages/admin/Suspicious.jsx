import React, { useState, useEffect } from 'react'
import api from '../../api'
import { useNavigate } from 'react-router-dom'
import { page, card, btn, table } from '../../styles'

const RANK_COLORS = { Bronze:'#cd7f32', Silver:'#c0c0c0', Gold:'#c9a84c', VIP:'#9b59b6' }

export default function Suspicious() {
  const [users, setUsers] = useState([])
  const [msg,   setMsg]   = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data } = await api.get('/api/admin/suspicious')
    setUsers(data)
  }

  const flash = (text, color = 'green') => {
    setMsg({ text, color })
    setTimeout(() => setMsg(null), 3000)
  }

  const unflag = async (id, username) => {
    await api.post(`/api/admin/users/${id}/flag`, { flagged: false })
    flash(`${username} removed from suspicious list`)
    fetchData()
  }

  const ban = async (id, username) => {
    const reason = prompt(`Reason for banning ${username}:`)
    if (!reason) return
    await api.post(`/api/admin/users/${id}/ban`, { reason })
    flash(`${username} has been banned`, 'red')
    fetchData()
  }

  const winRate = u =>
    u.totalRounds > 0 ? ((u.totalWins / u.totalRounds) * 100).toFixed(1) : '0.0'

  return (
    <div style={page}>
      <div style={{  margin: '0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#c9a84c', letterSpacing: '0.15em', margin: 0 }}>🚨 SUSPICIOUS ACTIVITY</h2>
          {users.length > 0 && (
            <span style={{
              background: 'rgba(192,57,43,0.2)', border: '1px solid #c0392b',
              borderRadius: 20, color: '#ff6655', fontSize: '0.65rem',
              padding: '3px 10px', letterSpacing: '0.1em',
            }}>
              {users.length} FLAGGED
            </span>
          )}
        </div>

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

        {/* Info box */}
        <div style={{
          background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.25)',
          borderRadius: 10, padding: '12px 16px', color: '#a08050', fontSize: '0.7rem',
        }}>
          🚨 Players are automatically flagged when their <strong style={{ color: '#c9a84c' }}>win rate exceeds 70%</strong> after
          at least <strong style={{ color: '#c9a84c' }}>20 rounds</strong>. Review and take action as needed.
        </div>

        <div style={card}>
          <table style={table.wrap}>
            <thead>
              <tr>
                {['Player','Rank','Coins','Rounds','Wins','Win Rate %','Biggest Win','Status','Actions'].map(h => (
                  <th key={h} style={table.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const wr = parseFloat(winRate(u))
                const alertColor = wr >= 85 ? '#c0392b' : wr >= 70 ? '#c9a84c' : '#27ae60'
                return (
                  <tr key={u._id}>
                    <td style={{ ...table.td, color: '#f0d080', fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/users/${u._id}`)}>
                      {u.username}
                    </td>
                    <td style={{ ...table.td, color: RANK_COLORS[u.rank] || '#a08050', fontSize: '0.65rem' }}>
                      {u.rank}
                    </td>
                    <td style={{ ...table.td, color: '#c9a84c' }}>🪙 {u.coins?.toLocaleString()}</td>
                    <td style={table.td}>{u.totalRounds}</td>
                    <td style={table.td}>{u.totalWins}</td>
                    <td style={{ ...table.td, color: alertColor, fontWeight: 700 }}>
                      {winRate(u)}%
                      {wr >= 85 && <span style={{ marginLeft: 4, fontSize: '0.7rem' }}>⚠️</span>}
                    </td>
                    <td style={{ ...table.td, color: '#c9a84c' }}>🪙 {u.biggestWin}</td>
                    <td style={{ ...table.td, color: '#ff6655', fontSize: '0.65rem', fontWeight: 700 }}>
                      {u.isBanned ? '🚫 BANNED' : '🚨 FLAGGED'}
                    </td>
                    <td style={{ ...table.td }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button style={{ ...btn.ghost, padding: '4px 8px', fontSize: '0.6rem' }}
                          onClick={() => navigate(`/admin/users/${u._id}`)}>
                          View
                        </button>
                        {!u.isBanned && (
                          <button style={{ ...btn.danger, padding: '4px 8px', fontSize: '0.6rem' }}
                            onClick={() => ban(u._id, u.username)}>
                            Ban
                          </button>
                        )}
                        <button style={{ ...btn.ghost, padding: '4px 8px', fontSize: '0.6rem', borderColor: '#27ae60', color: '#27ae60' }}
                          onClick={() => unflag(u._id, u.username)}>
                          Unflag
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ ...table.td, textAlign: 'center', padding: 40, color: '#27ae60' }}>
                    ✅ No suspicious players detected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
