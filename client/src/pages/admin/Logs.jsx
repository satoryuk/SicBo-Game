import React, { useState, useEffect } from 'react'
import api from '../../api'
import { page, card, table } from '../../styles'


const ACTION_COLORS = {
  ban_user:      '#c0392b',
  unban_user:    '#27ae60',
  reset_balance: '#c9a84c',
  add_coins:     '#4488ff',
}

const ACTION_ICONS = {
  ban_user:      '🚫',
  unban_user:    '✅',
  reset_balance: '🔄',
  add_coins:     '➕',
}

export default function Logs() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    api.get('/api/admin/logs').then(r => setLogs(r.data.logs || r.data))
  }, [])

  return (
    <div style={page}>
      <div style={{  margin: '0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <h2 style={{ color: '#c9a84c', letterSpacing: '0.15em', margin: 0 }}>📋 ADMIN LOGS</h2>

        <div style={card}>
          <table style={table.wrap}>
            <thead>
              <tr>
                {['Time', 'Admin', 'Action', 'Target', 'Detail'].map(h => (
                  <th key={h} style={table.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l._id}>
                  <td style={{ ...table.td, fontSize: '0.6rem', whiteSpace: 'nowrap' }}>
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td style={{ ...table.td, color: '#f0d080', fontWeight: 700 }}>
                    {l.adminName}
                  </td>
                  <td style={{ ...table.td }}>
                    <span style={{
                      color: ACTION_COLORS[l.action] || '#a08050',
                      fontSize: '0.65rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.08em'
                    }}>
                      {ACTION_ICONS[l.action] || '⚙️'} {l.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ ...table.td, color: '#c9a84c' }}>
                    {l.targetName || '—'}
                  </td>
                  <td style={{ ...table.td, fontSize: '0.65rem', color: '#a08050' }}>
                    {l.detail || '—'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...table.td, textAlign: 'center', padding: 30 }}>
                    No admin actions yet
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
