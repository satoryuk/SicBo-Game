import React, { useState, useEffect } from "react";
import api from "../../api";
import { page, card, table } from "../../styles";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/admin/dashboard").then((r) => setData(r.data));
  }, []);

  if (!data) {
    return (
      <div style={page}>
        <div
          style={{
            textAlign: "center",
            paddingTop: 100,
            color: "#a08050",
            fontSize: "0.9rem",
            letterSpacing: "0.15em",
          }}
        >
          Loading dashboard...
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Players",
      value: data.totalUsers,
      color: "#f0d080",
      icon: "👥",
    },
    {
      label: "Active (24h)",
      value: data.activeUsers,
      color: "#27ae60",
      icon: "🟢",
    },
    {
      label: "Total Rounds",
      value: data.totalRounds?.toLocaleString(),
      color: "#c9a84c",
      icon: "🎲",
    },
    {
      label: "Banned Users",
      value: data.bannedUsers,
      color: "#c0392b",
      icon: "🚫",
    },
    {
      label: "Total Deposits",
      value: `$${data.totalDeposits?.toFixed(2)}`,
      color: "#27ae60",
      icon: "💵",
    },
    {
      label: "Total Withdrawals",
      value: `$${data.totalWithdrawals?.toFixed(2)}`,
      color: "#c0392b",
      icon: "🏧",
    },
    {
      label: "Net Revenue",
      value: `$${data.netRevenue?.toFixed(2)}`,
      color: "#c9a84c",
      icon: "💰",
    },
    {
      label: "House Profit",
      value: `🪙 ${data.houseProfit?.toLocaleString()}`,
      color: "#9b59b6",
      icon: "🏦",
    },
    {
      label: "Pending Withdrawals",
      value: data.pendingWithdrawals,
      color: data.pendingWithdrawals > 0 ? "#ff6655" : "#27ae60",
      icon: "⏳",
    },
    {
      label: "Flagged Players",
      value: data.flaggedUsers,
      color: data.flaggedUsers > 0 ? "#c9a84c" : "#27ae60",
      icon: "🚨",
    },
  ];

  return (
    <div style={page}>
      <div
        style={{
          margin: "0",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <h2 style={{ color: "#c9a84c", letterSpacing: "0.15em", margin: 0 }}>
          📊 ADMIN DASHBOARD
        </h2>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12,
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{ ...card, textAlign: "center", padding: "16px 10px" }}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>
                {s.icon}
              </div>
              <div
                style={{ fontSize: "1.1rem", fontWeight: 700, color: s.color }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "0.55rem",
                  color: "#a08050",
                  letterSpacing: "0.15em",
                  marginTop: 4,
                }}
              >
                {s.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* Daily Revenue */}
        {data.dailyRevenue?.length > 0 && (
          <div style={card}>
            <div
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                color: "#a08050",
                marginBottom: 14,
              }}
            >
              📈 DAILY DEPOSITS (LAST 7 DAYS)
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                height: 80,
              }}
            >
              {data.dailyRevenue.map((d) => {
                const maxVal = Math.max(
                  ...data.dailyRevenue.map((x) => x.total),
                );
                const h = maxVal > 0 ? (d.total / maxVal) * 72 : 4;
                return (
                  <div
                    key={d._id}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <div style={{ fontSize: "0.5rem", color: "#c9a84c" }}>
                      ${d.total}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: h,
                        background: "#c9a84c",
                        borderRadius: "3px 3px 0 0",
                        minHeight: 4,
                      }}
                    />
                    <div style={{ fontSize: "0.5rem", color: "#a08050" }}>
                      {d._id.slice(5)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Rounds */}
        <div style={card}>
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              color: "#a08050",
              marginBottom: 14,
            }}
          >
            🎲 RECENT ROUNDS
          </div>
          <table style={table.wrap}>
            <thead>
              <tr>
                {[
                  "Player",
                  "Dice",
                  "Total",
                  "Bet",
                  "Wager",
                  "Result",
                  "Time",
                ].map((h) => (
                  <th key={h} style={table.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentRounds.map((r) => (
                <tr key={r._id}>
                  <td style={{ ...table.td, color: "#f0d080" }}>
                    {r.username}
                  </td>
                  <td style={table.td}>{r.diceValues?.join("·")}</td>
                  <td style={table.td}>{r.total}</td>
                  <td
                    style={{
                      ...table.td,
                      textTransform: "capitalize",
                      fontSize: "0.65rem",
                    }}
                  >
                    {r.betType}
                  </td>
                  <td style={table.td}>🪙 {r.betAmount}</td>
                  <td
                    style={{
                      ...table.td,
                      color: r.won ? "#27ae60" : "#c0392b",
                      fontWeight: 700,
                    }}
                  >
                    {r.won ? `+${r.payout}` : `−${r.betAmount}`}
                  </td>
                  <td style={{ ...table.td, fontSize: "0.6rem" }}>
                    {new Date(r.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
