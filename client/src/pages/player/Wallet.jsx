import React, { useState, useEffect } from 'react'
import api from '../../api'
import { page, card, btn, input, table } from '../../styles'

const RATE = 100  // $1 = 100 coins
const LOW_BALANCE_THRESHOLD = 100  // warn when < 100 coins


export default function Wallet() {
  const [user,    setUser]    = useState(JSON.parse(localStorage.getItem('user') || '{}'))
  const [coins,   setCoins]   = useState(0)
  const [txns,    setTxns]    = useState([])
  const [depAmt,  setDepAmt]  = useState('')
  const [withAmt, setWithAmt] = useState('')
  const [msg,     setMsg]     = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const [me, t] = await Promise.all([
      api.get('/api/auth/me'),
      api.get('/api/wallet/transactions'),
    ])
    setCoins(me.data.coins)
    setTxns(t.data)
    const updated = { ...user, coins: me.data.coins }
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }

  const deposit = async () => {
    if (!depAmt || depAmt <= 0) return flash('Enter a valid amount', 'red')
    setLoading(true)
    try {
      const { data } = await api.post('/api/wallet/deposit', { amount: Number(depAmt) })
      setCoins(data.coins)
      setDepAmt('')
      flash(`✅ Deposited $${depAmt} → +${data.addedCoins} coins!`, 'green')
      fetchData()
    } catch (e) { flash(e.response?.data?.message || 'Error', 'red') }
    setLoading(false)
  }

  const withdraw = async () => {
    if (!withAmt || withAmt <= 0) return flash('Enter a valid amount', 'red')
    setLoading(true)
    try {
      const { data } = await api.post('/api/wallet/withdraw', { coins: Number(withAmt) })
      setCoins(data.coins)
      setWithAmt('')
      flash(`⏳ Withdrawal of ${withAmt} coins ($${(withAmt / RATE).toFixed(2)}) submitted — pending admin approval.`, 'yellow')
      fetchData()
    } catch (e) { flash(e.response?.data?.message || 'Error', 'red') }
    setLoading(false)
  }

  const flash = (text, color) => {
    setMsg({ text, color })
    setTimeout(() => setMsg(null), 5000)
  }

  const typeColor = { deposit:'#27ae60', withdraw:'#c0392b', bet:'#a08050', win:'#c9a84c', bonus:'#4488ff' }
  const statusColor = { completed:'#27ae60', pending:'#c9a84c', rejected:'#c0392b' }

  const isLowBalance = coins < LOW_BALANCE_THRESHOLD

  return (
    <div style={page}>
      <div style={{  margin: '0', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Low balance warning */}
        {isLowBalance && (
          <div style={{
            background: 'rgba(192,57,43,0.12)', border: '1px solid #c0392b',
            borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: '1.3rem' }}>⚠️</span>
            <div>
              <div style={{ color: '#ff6655', fontWeight: 700, fontSize: '0.8rem' }}>Low Balance Warning</div>
              <div style={{ color: '#a08050', fontSize: '0.7rem', marginTop: 2 }}>
                You have only <strong style={{ color: '#c9a84c' }}>🪙 {coins}</strong> coins left. Deposit to keep playing!
              </div>
            </div>
          </div>
        )}

        {/* Coin balance */}
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: '#a08050' }}>YOUR WALLET</div>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: isLowBalance ? '#c0392b' : '#c9a84c', margin: '10px 0', transition: 'color 0.5s' }}>
            🪙 {coins.toLocaleString()}
          </div>
          <div style={{ color: '#a08050', fontSize: '0.7rem' }}>
            ≈ ${(coins / RATE).toFixed(2)} real value &nbsp;|&nbsp; Rate: $1 = {RATE} coins
          </div>
        </div>

        {msg && (
          <div style={{
            background: msg.color === 'green'  ? 'rgba(39,174,96,0.15)'  :
                        msg.color === 'yellow' ? 'rgba(201,168,76,0.15)' : 'rgba(192,57,43,0.15)',
            border: `1px solid ${msg.color === 'green' ? '#27ae60' : msg.color === 'yellow' ? '#c9a84c' : '#c0392b'}`,
            borderRadius: 8, padding: '10px 16px',
            color: msg.color === 'green' ? '#27ae60' : msg.color === 'yellow' ? '#c9a84c' : '#ff6655',
            fontSize: '0.8rem', textAlign: 'center',
          }}>
            {msg.text}
          </div>
        )}

        {/* Deposit & Withdraw */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Deposit */}
          <div style={card}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: '#27ae60', marginBottom: 12 }}>
              💵 DEPOSIT MONEY
            </div>
            <input style={input} type="number" placeholder="Amount in $ (e.g. 10)"
              value={depAmt} onChange={e => setDepAmt(e.target.value)} />
            {depAmt > 0 && (
              <div style={{ color: '#a08050', fontSize: '0.7rem', marginBottom: 8 }}>
                → You will receive <strong style={{ color: '#c9a84c' }}>{depAmt * RATE} coins</strong>
              </div>
            )}
            <button style={{ ...btn.success, width: '100%' }} onClick={deposit} disabled={loading}>
              Deposit
            </button>
          </div>

          {/* Withdraw */}
          <div style={card}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: '#c0392b', marginBottom: 12 }}>
              🏧 WITHDRAW COINS
            </div>
            <input style={input} type="number" placeholder={`Coins (min ${RATE})`}
              value={withAmt} onChange={e => setWithAmt(e.target.value)} />
            {withAmt >= RATE && (
              <div style={{ color: '#a08050', fontSize: '0.7rem', marginBottom: 8 }}>
                → You will receive <strong style={{ color: '#27ae60' }}>${(withAmt / RATE).toFixed(2)}</strong>
                <span style={{ color: '#a08050', fontSize: '0.6rem', display: 'block', marginTop: 2 }}>
                  ⏳ Requires admin approval
                </span>
              </div>
            )}
            <button style={{ ...btn.danger, width: '100%' }} onClick={withdraw} disabled={loading}>
              Request Withdrawal
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div style={card}>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#a08050', marginBottom: 14 }}>
            📜 TRANSACTION HISTORY
          </div>
          <table style={table.wrap}>
            <thead>
              <tr>
                {['Type','Status','Coins','Amount','Note','Date'].map(h => (
                  <th key={h} style={table.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={t._id}>
                  <td style={{ ...table.td, color: typeColor[t.type] || '#a08050', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                    {t.type}
                  </td>
                  <td style={{ ...table.td, color: statusColor[t.status] || '#a08050', fontSize: '0.6rem', fontWeight: 700 }}>
                    {t.status || 'completed'}
                  </td>
                  <td style={{ ...table.td, color: t.coins >= 0 ? '#27ae60' : '#c0392b' }}>
                    {t.coins >= 0 ? '+' : ''}{t.coins}
                  </td>
                  <td style={table.td}>{t.amount > 0 ? `$${t.amount}` : '—'}</td>
                  <td style={{ ...table.td, fontSize: '0.65rem' }}>{t.note}</td>
                  <td style={{ ...table.td, fontSize: '0.6rem' }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {txns.length === 0 && (
                <tr><td colSpan={6} style={{ ...table.td, textAlign: 'center', padding: 20 }}>No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
