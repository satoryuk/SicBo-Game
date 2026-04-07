import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { page, card, btn, table } from '../styles'

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
const MEDAL = ['🥇','🥈','🥉']
const RANK_COLORS = { Bronze:'#cd7f32', Silver:'#c0c0c0', Gold:'#c9a84c', VIP:'#9b59b6' }

export default function Leaderboard() {
  const [players, setPlayers] = useState([])
  const [sortBy,  setSortBy]  = useState('coins')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    axios.get(`/api/leaderboard?by=${sortBy}`)
      .then(({ data }) => { setPlayers(data); setLoading(false) })
      .catch(console.error)
  }, [sortBy])

  return (
    <div style={page}>
      <div style={{  margin: '0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <h2 style={{ color: '#c9a84c', letterSpacing: '0.15em', margin: 0, textAlign: 'center' }}>
          🏆 LEADERBOARD
        </h2>

        {/* Sort tabs */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {[['coins','💰 Richest'], ['wins','🎯 Most Wins'], ['rounds','🎲 Most Rounds']].map(([key, label]) => (
            <button key={key} onClick={() => setSortBy(key)} style={{
              ...btn.ghost,
              borderColor: sortBy === key ? '#c9a84c' : '#8a6a1f',
              color:       sortBy === key ? '#c9a84c' : '#a08050',
              background:  sortBy === key ? 'rgba(201,168,76,0.1)' : 'none',
              fontSize: '0.7rem',
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={card}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#a08050' }}>Loading...</div>
          ) : (
            <table style={table.wrap}>
              <thead>
                <tr>
                  {['#','Player','Rank','Coins','Wins','Rounds'].map(h => (
                    <th key={h} style={table.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => (
                  <tr key={p._id}>
                    <td style={{ ...table.td, fontSize: '1.1rem' }}>{MEDAL[i] ?? i + 1}</td>
                    <td style={{ ...table.td, color: '#f0d080', fontWeight: 700 }}>{p.username}</td>
                    <td style={{ ...table.td, color: RANK_COLORS[p.rank] || '#a08050', fontSize: '0.65rem', fontWeight: 700 }}>
                      {p.rank}
                    </td>
                    <td style={{ ...table.td, color: '#c9a84c' }}>🪙 {p.coins?.toLocaleString()}</td>
                    <td style={{ ...table.td, color: '#27ae60' }}>{p.totalWins}</td>
                    <td style={table.td}>{p.totalRounds}</td>
                  </tr>
                ))}
                {players.length === 0 && (
                  <tr><td colSpan={6} style={{ ...table.td, textAlign: 'center', padding: 30 }}>No players yet</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}