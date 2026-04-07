import React, { useState, useEffect } from 'react'
import api from '../../api'
import { page, card, btn, table } from '../../styles'


export default function Withdrawals() {
  const [txns,  setTxns]  = useState([])
  const [total, setTotal] = useState(0)
  const [page_, setPage]  = useState(1)
  const [msg,   setMsg]   = useState(null)

  useEffect(() => { fetchData() }, [page_])

  const fetchData = async () => {
    const { data } = await api.get(`/api/admin/withdrawals?page=${page_}&limit=20`)
    setTxns(data.transactions)
    setTotal(data.total)
  }

  const flash = (text, color = 'green') => {
    setMsg({ text, color })
    setTimeout(() => setMsg(null), 3000)
  }

  const approve = async (id, amount, username) => {
    if (!window.confirm(`Approve $${amount} withdrawal for ${username}?`)) return
    try {
      await api.post(`/api/admin/withdrawals/${id}/approve`, {})
      flash(`✅ Approved $${amount} for ${username}`)
      fetchData()
    } catch (e) { flash(e.response?.data?.message || 'Error', 'red') }
  }

  const reject = async (id, amount, username) => {
    const reason = prompt(`Reason for rejecting ${username}'s $${amount} withdrawal:`)
    if (!reason) return
    try {
      await api.post(`/api/admin/withdrawals/${id}/reject`, { reason })
      flash(`❌ Rejected — coins refunded to ${username}`, 'red')
      fetchData()
    } catch (e) { flash(e.response?.data?.message || 'Error', 'red') }
  }

  return (
    <div style={page}>
      <div style={{  margin: '0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#c9a84c', letterSpacing: '0.15em', margin: 0 }}>💸 PENDING WITHDRAWALS</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {total > 0 && (
              <span style={{
                background: 'rgba(192,57,43,0.2)', border: '1px solid #c0392b',
                borderRadius: 20, color: '#ff6655', fontSize: '0.65rem',
                padding: '3px 10px', letterSpacing: '0.1em',
              }}>
                {total} PENDING
              </span>
            )}
          </div>
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
          background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 10, padding: '12px 16px', fontSize: '0.7rem', color: '#a08050',
        }}>
          ℹ️ Coins are <strong style={{ color: '#c9a84c' }}>already deducted</strong> from players when they submit a request.
          Approving pays out real money. Rejecting <strong style={{ color: '#27ae60' }}>refunds coins</strong> to the player.
        </div>

        <div style={card}>
          <table style={table.wrap}>
            <thead>
              <tr>
                {['Player','Coins','Amount ($)','Submitted','Actions'].map(h => (
                  <th key={h} style={table.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={t._id}>
                  <td style={{ ...table.td, color: '#f0d080', fontWeight: 700 }}>{t.username}</td>
                  <td style={{ ...table.td, color: '#c0392b', fontWeight: 700 }}>
                    🪙 {Math.abs(t.coins).toLocaleString()}
                  </td>
                  <td style={{ ...table.td, color: '#27ae60', fontWeight: 700 }}>
                    ${t.amount.toFixed(2)}
                  </td>
                  <td style={{ ...table.td, fontSize: '0.65rem' }}>
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td style={{ ...table.td, display: 'flex', gap: 6 }}>
                    <button
                      style={{ ...btn.success, padding: '5px 12px', fontSize: '0.65rem' }}
                      onClick={() => approve(t._id, t.amount, t.username)}>
                      ✅ Approve
                    </button>
                    <button
                      style={{ ...btn.danger, padding: '5px 12px', fontSize: '0.65rem' }}
                      onClick={() => reject(t._id, t.amount, t.username)}>
                      ❌ Reject
                    </button>
                  </td>
                </tr>
              ))}
              {txns.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...table.td, textAlign: 'center', padding: 40, color: '#27ae60' }}>
                    ✅ No pending withdrawals
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button style={btn.ghost} disabled={page_ === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ color: '#a08050', alignSelf: 'center', fontSize: '0.7rem' }}>Page {page_}</span>
            <button style={btn.ghost} disabled={txns.length < 20} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
