import React, { useState, useEffect } from 'react'
import api from '../../api'
import { page, card, btn, input, table } from '../../styles'


export default function Rounds() {
  const [rounds, setRounds] = useState([])
  const [total,  setTotal]  = useState(0)
  const [page_,  setPage]   = useState(1)

  useEffect(() => { fetchData() }, [page_])

  const fetchData = async () => {
    const { data } = await api.get(`/api/admin/rounds?page=${page_}&limit=30`)
    setRounds(data.rounds)
    setTotal(data.total)
  }

  const betTypeLabel = { bigsmall: 'Big/Small', number: 'Number', total: 'Total' }

  return (
    <div style={page}>
      <div style={{  margin: '0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#c9a84c', letterSpacing: '0.15em', margin: 0 }}>🎲 ALL BETS LOG</h2>
          <span style={{ color: '#a08050', fontSize: '0.7rem' }}>Total rounds: {total.toLocaleString()}</span>
        </div>

        <div style={card}>
          <table style={table.wrap}>
            <thead>
              <tr>
                {['Player','Dice','Total','Bet Type','Value','Wager','Result','Time'].map(h => (
                  <th key={h} style={table.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rounds.map(r => (
                <tr key={r._id}>
                  <td style={{ ...table.td, color: '#f0d080', fontWeight: 700 }}>{r.username}</td>
                  <td style={{ ...table.td, letterSpacing: '0.1em' }}>
                    {r.diceValues?.map((d, i) => (
                      <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 22, height: 22, borderRadius: 4,
                        background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)',
                        color: '#c9a84c', fontWeight: 700, fontSize: '0.7rem',
                        marginRight: 3,
                      }}>{d}</span>
                    ))}
                  </td>
                  <td style={{ ...table.td, color: '#f5e6c8', fontWeight: 700 }}>{r.total}</td>
                  <td style={{ ...table.td, fontSize: '0.65rem', color: '#a08050' }}>
                    {betTypeLabel[r.betType] || r.betType}
                  </td>
                  <td style={{ ...table.td, textTransform: 'capitalize' }}>
                    {String(r.betValue)}
                  </td>
                  <td style={{ ...table.td, color: '#c9a84c' }}>🪙 {r.betAmount}</td>
                  <td style={{ ...table.td, fontWeight: 700, color: r.won ? '#27ae60' : '#c0392b' }}>
                    {r.won ? `+${r.payout}` : `−${r.betAmount}`}
                  </td>
                  <td style={{ ...table.td, fontSize: '0.6rem' }}>
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {rounds.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ ...table.td, textAlign: 'center', padding: 30 }}>
                    No rounds found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
          <button style={btn.ghost} disabled={page_ === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ color: '#a08050', fontSize: '0.7rem' }}>Page {page_} of {Math.ceil(total / 30)}</span>
          <button style={btn.ghost} disabled={rounds.length < 30} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>

      </div>
    </div>
  )
}
