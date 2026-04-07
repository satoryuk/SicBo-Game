import React, { useState, useEffect } from 'react'
import api from '../../api'
import { page, card, btn, table } from '../../styles'


const TYPE_COLORS = {
  deposit:  '#27ae60',
  withdraw: '#c0392b',
  bet:      '#a08050',
  win:      '#c9a84c',
  bonus:    '#4488ff',
}

export default function Transactions() {
  const [txns,    setTxns]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [filter,  setFilter]  = useState('')
  const [page_,   setPage]    = useState(1)
  const [summary, setSummary] = useState({})

  useEffect(() => { fetchTxns() }, [filter, page_])

  const fetchTxns = async () => {
    const { data } = await api.get(
      `/api/admin/transactions?type=${filter}&page=${page_}&limit=20`
    )
    setTxns(data.transactions)
    setTotal(data.total)

    // Calculate summary from current page
    const s = {}
    data.transactions.forEach(t => {
      if (!s[t.type]) s[t.type] = { count: 0, coins: 0, amount: 0 }
      s[t.type].count++
      s[t.type].coins  += t.coins
      s[t.type].amount += t.amount
    })
    setSummary(s)
  }

  const FILTERS = ['', 'deposit', 'withdraw', 'bet', 'win', 'bonus']

  return (
    <div style={page}>
      <div style={{  margin: '0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#c9a84c', letterSpacing: '0.15em', margin: 0 }}>💳 TRANSACTIONS</h2>
          <span style={{ color: '#a08050', fontSize: '0.7rem' }}>Total: {total}</span>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {['deposit','withdraw','bet','win','bonus'].map(type => (
            <div key={type} style={{
              background: 'rgba(0,0,0,0.3)', border: `1px solid ${TYPE_COLORS[type]}22`,
              borderRadius: 10, padding: '12px 10px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.55rem', color: TYPE_COLORS[type], letterSpacing: '0.2em', marginBottom: 4 }}>
                {type.toUpperCase()}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: TYPE_COLORS[type] }}>
                {summary[type]?.count || 0}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#a08050', marginTop: 2 }}>
                {type === 'deposit' || type === 'withdraw'
                  ? `$${(summary[type]?.amount || 0).toFixed(2)}`
                  : `🪙 ${summary[type]?.coins || 0}`
                }
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f || 'all'}
              onClick={() => { setFilter(f); setPage(1) }}
              style={{
                ...btn.ghost,
                borderColor: filter === f ? TYPE_COLORS[f] || '#c9a84c' : '#8a6a1f',
                color:       filter === f ? TYPE_COLORS[f] || '#c9a84c' : '#a08050',
                background:  filter === f ? `${TYPE_COLORS[f] || '#c9a84c'}15` : 'none',
                padding: '6px 14px', fontSize: '0.65rem',
              }}>
              {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={card}>
          <table style={table.wrap}>
            <thead>
              <tr>
                {['Player','Type','Coins','Amount','Note','Date'].map(h => (
                  <th key={h} style={table.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={t._id}>
                  <td style={{ ...table.td, color: '#f0d080', fontWeight: 700 }}>{t.username}</td>
                  <td style={{ ...table.td, color: TYPE_COLORS[t.type], fontWeight: 700,
                    fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {t.type}
                  </td>
                  <td style={{ ...table.td, color: t.coins >= 0 ? '#27ae60' : '#c0392b' }}>
                    {t.coins >= 0 ? '+' : ''}{t.coins}
                  </td>
                  <td style={{ ...table.td, color: t.amount > 0 ? '#27ae60' : '#a08050' }}>
                    {t.amount > 0 ? `$${t.amount.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ ...table.td, fontSize: '0.65rem', 
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.note}
                  </td>
                  <td style={{ ...table.td, fontSize: '0.6rem' }}>
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {txns.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...table.td, textAlign: 'center', padding: 30 }}>
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
          <button style={btn.ghost} disabled={page_ === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ color: '#a08050', fontSize: '0.7rem' }}>Page {page_}</span>
          <button style={btn.ghost} disabled={txns.length < 20} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>

      </div>
    </div>
  )
}
