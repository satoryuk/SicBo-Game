import React, { useState, useEffect } from 'react'
import api from '../../api'
import { useNavigate } from 'react-router-dom'
import { page, card, btn, input, table } from '../../styles'

const RANK_COLORS = { Bronze:'#cd7f32', Silver:'#c0c0c0', Gold:'#c9a84c', VIP:'#9b59b6' }

export default function Users() {
  const [users,   setUsers]   = useState([])
  const [search,  setSearch]  = useState('')
  const [total,   setTotal]   = useState(0)
  const [page_,   setPage]    = useState(1)
  const [msg,     setMsg]     = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchUsers() }, [search, page_])

  const fetchUsers = async () => {
    const { data } = await api.get(
      `/api/admin/users?search=${search}&page=${page_}&limit=15`
    )
    setUsers(data.users)
    setTotal(data.total)
  }

  const flash = (text, color = 'green') => {
    setMsg({ text, color })
    setTimeout(() => setMsg(null), 3000)
  }

  const ban = async (id, username) => {
    const reason = prompt(`Reason for banning ${username}:`)
    if (!reason) return
    await api.post(`/api/admin/users/${id}/ban`, { reason })
    flash(`${username} banned`)
    fetchUsers()
  }

  const unban = async (id, username) => {
    await api.post(`/api/admin/users/${id}/unban`, {})
    flash(`${username} unbanned`)
    fetchUsers()
  }

  return (
    <div style={page}>
      <div style={{  margin: '0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#c9a84c', letterSpacing: '0.15em', margin: 0 }}>👥 USER MANAGEMENT</h2>
          <span style={{ color: '#a08050', fontSize: '0.7rem' }}>Total: {total}</span>
        </div>

        {msg && (
          <div style={{ background: msg.color === 'green' ? 'rgba(39,174,96,0.15)' : 'rgba(192,57,43,0.15)',
            border: `1px solid ${msg.color === 'green' ? '#27ae60' : '#c0392b'}`,
            borderRadius: 8, padding: '10px 16px',
            color: msg.color === 'green' ? '#27ae60' : '#ff6655', fontSize: '0.8rem' }}>
            {msg.text}
          </div>
        )}

        <input style={input} placeholder="🔍 Search username..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />

        <div style={card}>
          <table style={table.wrap}>
            <thead>
              <tr>
                {['Username','Rank','Coins','Wins','Rounds','Status','Actions'].map(h => (
                  <th key={h} style={table.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ ...table.td, color: '#f0d080', cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => navigate(`/admin/users/${u._id}`)}>
                    {u.username}
                  </td>
                  <td style={{ ...table.td, color: RANK_COLORS[u.rank] || '#a08050', fontSize: '0.65rem' }}>
                    {u.rank}
                  </td>
                  <td style={{ ...table.td, color: '#c9a84c' }}>🪙 {u.coins}</td>
                  <td style={table.td}>{u.totalWins}</td>
                  <td style={table.td}>{u.totalRounds}</td>
                  <td style={{ ...table.td, color: u.isBanned ? '#c0392b' : '#27ae60', fontSize: '0.65rem', fontWeight: 700 }}>
                    {u.isBanned ? '🚫 BANNED' : '✅ ACTIVE'}
                  </td>
                  <td style={{ ...table.td, display: 'flex', gap: 6 }}>
                    <button style={{ ...btn.ghost, padding: '4px 8px', fontSize: '0.6rem' }}
                      onClick={() => navigate(`/admin/users/${u._id}`)}>
                      View
                    </button>
                    {u.isBanned
                      ? <button style={{ ...btn.success, padding: '4px 8px', fontSize: '0.6rem' }}
                          onClick={() => unban(u._id, u.username)}>Unban</button>
                      : <button style={{ ...btn.danger, padding: '4px 8px', fontSize: '0.6rem' }}
                          onClick={() => ban(u._id, u.username)}>Ban</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button style={btn.ghost} disabled={page_ === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ color: '#a08050', alignSelf: 'center', fontSize: '0.7rem' }}>Page {page_}</span>
          <button style={btn.ghost} disabled={users.length < 15} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>
    </div>
  )
}
