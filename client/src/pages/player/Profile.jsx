import React, { useState, useEffect } from 'react'
import api from '../../api'
import { page, card, table } from '../../styles'

const RANK_COLORS = { Bronze:'#cd7f32', Silver:'#c0c0c0', Gold:'#c9a84c', VIP:'#9b59b6' }

export default function Profile() {
  const [stats,   setStats]   = useState(null)
  const [history, setHistory] = useState([])
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    api.get('/api/game/stats').then(r => setStats(r.data))
    api.get('/api/game/history').then(r => setHistory(r.data))
  }, [])

  const rankColor = stats ? RANK_COLORS[stats.rank] || '#a08050' : '#a08050'

  return (
    <div style={page}>
      <div style={{  margin: '0', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Profile Header */}
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>👤</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f0d080', letterSpacing: '0.1em' }}>
            {user.username}
          </div>
          {stats && (
            <div style={{
              display: 'inline-block', marginTop: 8,
              background: `${rankColor}22`, border: `1px solid ${rankColor}`,
              color: rankColor, borderRadius: 20, padding: '4px 16px',
              fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 700
            }}>
              {stats.rank}
            </div>
          )}
          {stats && (
            <div style={{ color: '#a08050', fontSize: '0.7rem', marginTop: 10 }}>
              🔥 Login Streak: <strong style={{ color: '#c9a84c' }}>{stats.loginStreak} days</strong>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Total Rounds', value: stats.totalRounds, color: '#f0d080' },
              { label: 'Win Rate',     value: `${stats.winRate}%`, color: '#27ae60' },
              { label: 'Total Wins',   value: stats.totalWins,   color: '#27ae60' },
              { label: 'Total Losses', value: stats.totalLosses, color: '#c0392b' },
              { label: 'Total Wagered', value: `🪙 ${stats.totalWagered}`, color: '#a08050' },
              { label: 'Biggest Win',  value: `🪙 ${stats.biggestWin}`,  color: '#c9a84c' },
            ].map(s => (
              <div key={s.label} style={{ ...card, textAlign: 'center', padding: '16px 12px' }}>
                <div style={{ fontSize: '0.55rem', color: '#a08050', letterSpacing: '0.2em', marginBottom: 6 }}>
                  {s.label.toUpperCase()}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rank Progress */}
        {stats && (
          <div style={card}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: '#a08050', marginBottom: 14 }}>
              🏅 RANK PROGRESS
            </div>
            {[
              { rank: 'Bronze', min: 0,   color: '#cd7f32' },
              { rank: 'Silver', min: 50,  color: '#c0c0c0' },
              { rank: 'Gold',   min: 200, color: '#c9a84c' },
              { rank: 'VIP',    min: 500, color: '#9b59b6' },
            ].map(r => (
              <div key={r.rank} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 60, color: r.color, fontSize: '0.7rem', fontWeight: 700 }}>{r.rank}</div>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4, background: r.color,
                    width: `${Math.min((stats.totalRounds / (r.min || 1)) * 100, 100)}%`,
                    transition: 'width 0.5s',
                  }} />
                </div>
                <div style={{ width: 60, color: '#a08050', fontSize: '0.6rem', textAlign: 'right' }}>
                  {stats.totalRounds}/{r.min || '—'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Bets */}
        <div style={card}>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#a08050', marginBottom: 14 }}>
            📜 RECENT BETS
          </div>
          <table style={table.wrap}>
            <thead>
              <tr>
                {['Dice','Total','Bet Type','Wager','Result','Date'].map(h => (
                  <th key={h} style={table.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(r => (
                <tr key={r._id}>
                  <td style={table.td}>{r.diceValues?.join(' · ')}</td>
                  <td style={table.td}>{r.total}</td>
                  <td style={{ ...table.td, textTransform: 'capitalize' }}>{r.betType}</td>
                  <td style={table.td}>🪙 {r.betAmount}</td>
                  <td style={{ ...table.td, color: r.won ? '#27ae60' : '#c0392b', fontWeight: 700 }}>
                    {r.won ? `+${r.payout}` : `-${r.betAmount}`}
                  </td>
                  <td style={{ ...table.td, fontSize: '0.6rem' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={6} style={{ ...table.td, textAlign: 'center', padding: 20 }}>No rounds yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
