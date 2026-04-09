import React, { useState, useEffect } from "react";
import api from "../../api";
import { page, card, table } from "../../styles";

/* ──────── inline CSS keyframes injected once ──────── */
const STYLE_ID = "dashboard-animations";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes dash-fadeUp {
      from { opacity:0; transform:translateY(18px) }
      to   { opacity:1; transform:translateY(0) }
    }
    @keyframes dash-pulseGlow {
      0%,100% { box-shadow:0 0 20px rgba(201,168,76,.12) }
      50%     { box-shadow:0 0 34px rgba(201,168,76,.22) }
    }
    @keyframes dash-chartDraw {
      from { stroke-dashoffset:2000 }
      to   { stroke-dashoffset:0 }
    }
    @keyframes dash-dotPop {
      from { r:0; opacity:0 }
      to   { r:4; opacity:1 }
    }
    .dash-stat-card {
      position:relative;
      text-align:center;
      padding:20px 14px 16px;
      border-radius:16px;
      background:linear-gradient(160deg,rgba(11,42,26,.92),rgba(14,53,34,.88));
      border:1px solid rgba(138,106,31,.35);
      backdrop-filter:blur(10px);
      overflow:hidden;
      transition:transform .25s, box-shadow .25s, border-color .25s;
      animation:dash-fadeUp .5s ease-out both;
    }
    .dash-stat-card::before {
      content:'';
      position:absolute;
      inset:0;
      border-radius:16px;
      background:radial-gradient(circle at 50% -20%,rgba(201,168,76,.07),transparent 70%);
      pointer-events:none;
    }
    .dash-stat-card:hover {
      transform:translateY(-4px);
      box-shadow:0 8px 32px rgba(201,168,76,.18);
      border-color:rgba(201,168,76,.55);
    }
    .dash-table-row {
      transition:background .2s;
    }
    .dash-table-row:hover {
      background:rgba(201,168,76,.04)!important;
    }
  `;
  document.head.appendChild(s);
}

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
    { label: "Total Players", value: data.totalUsers, color: "#f0d080", accent: "#f0d080", icon: "👥" },
    { label: "Active (24h)", value: data.activeUsers, color: "#4ade80", accent: "#27ae60", icon: "🟢" },
    { label: "Total Rounds", value: data.totalRounds?.toLocaleString(), color: "#c9a84c", accent: "#c9a84c", icon: "🎲" },
    { label: "Banned Users", value: data.bannedUsers, color: "#f87171", accent: "#c0392b", icon: "🚫" },
    { label: "Total Deposits", value: `$${data.totalDeposits?.toFixed(2)}`, color: "#4ade80", accent: "#27ae60", icon: "💵" },
    { label: "Total Withdrawals", value: `$${data.totalWithdrawals?.toFixed(2)}`, color: "#f87171", accent: "#c0392b", icon: "🏧" },
    { label: "Net Revenue", value: `$${data.netRevenue?.toFixed(2)}`, color: "#c9a84c", accent: "#c9a84c", icon: "💰" },
    { label: "House Profit", value: `🪙 ${data.houseProfit?.toLocaleString()}`, color: "#c084fc", accent: "#9b59b6", icon: "🏦" },
    { label: "Pending Withdrawals", value: data.pendingWithdrawals, color: data.pendingWithdrawals > 0 ? "#fb923c" : "#4ade80", accent: data.pendingWithdrawals > 0 ? "#ff6655" : "#27ae60", icon: "⏳" },
    { label: "Flagged Players", value: data.flaggedUsers, color: data.flaggedUsers > 0 ? "#fbbf24" : "#4ade80", accent: data.flaggedUsers > 0 ? "#c9a84c" : "#27ae60", icon: "🚨" },
  ];

  /* ── Smooth curve helper (Catmull-Rom → cubic Bézier) ── */
  const buildCurvePath = (coords) => {
    if (coords.length < 2) return `M${coords[0].x},${coords[0].y}`;
    if (coords.length === 2) return `M${coords[0].x},${coords[0].y} L${coords[1].x},${coords[1].y}`;

    let d = `M${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[Math.max(i - 1, 0)];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[Math.min(i + 2, coords.length - 1)];
      const tension = 0.35;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  /* ── Section header style ── */
  const sectionLabel = {
    fontSize: "0.65rem",
    letterSpacing: "0.25em",
    color: "#a08050",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const sectionBar = {
    flex: 1,
    height: 1,
    background: "linear-gradient(90deg,rgba(138,106,31,.3),transparent)",
  };

  return (
    <div style={page}>
      <div style={{ margin: 0, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Title ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h2 style={{
            color: "#c9a84c",
            letterSpacing: "0.15em",
            margin: 0,
            fontSize: "1.35rem",
            whiteSpace: "nowrap",
          }}>
            📊 ADMIN DASHBOARD
          </h2>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#8a6a1f,transparent)" }} />
          <div style={{ fontSize: "0.6rem", color: "#a08050", letterSpacing: "0.1em" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
          {stats.map((s, idx) => (
            <div
              key={s.label}
              className="dash-stat-card"
              style={{
                animationDelay: `${idx * 60}ms`,
                borderBottom: `3px solid ${s.accent}`,
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: 6, filter: "drop-shadow(0 0 6px rgba(201,168,76,.15))" }}>
                {s.icon}
              </div>
              <div style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: s.color,
                textShadow: `0 0 18px ${s.accent}33`,
                lineHeight: 1.2,
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: "0.52rem",
                color: "#a08050",
                letterSpacing: "0.15em",
                marginTop: 6,
                textTransform: "uppercase",
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Line Chart ── */}
        {data.dailyRevenue?.length > 0 && (() => {
          const chartW = 560, chartH = 180;
          const padL = 50, padR = 20, padT = 30, padB = 32;
          const w = chartW - padL - padR;
          const h = chartH - padT - padB;
          const pts = data.dailyRevenue;
          const maxVal = Math.max(...pts.map((x) => x.total), 1);
          const niceMax = Math.ceil(maxVal / 10) * 10 || 10;

          const coords = pts.map((d, i) => ({
            x: padL + (pts.length > 1 ? (i / (pts.length - 1)) * w : w / 2),
            y: padT + h - (d.total / niceMax) * h,
            val: d.total,
            date: d._id.slice(5),
          }));

          const curvePath = buildCurvePath(coords);
          const areaPath = `${curvePath} L${coords[coords.length - 1].x},${padT + h} L${coords[0].x},${padT + h} Z`;
          const gridCount = 4;

          return (
            <div style={{
              ...card,
              animation: "dash-fadeUp .5s ease-out both",
              animationDelay: "0.6s",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* subtle top glow */}
              <div style={{
                position: "absolute",
                top: -40,
                left: "50%",
                transform: "translateX(-50%)",
                width: 300,
                height: 80,
                background: "radial-gradient(ellipse,rgba(201,168,76,.08),transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={sectionLabel}>
                <span>📈 DAILY DEPOSITS (LAST 7 DAYS)</span>
                <div style={sectionBar} />
                <span style={{ color: "#c9a84c", fontSize: "0.7rem", fontWeight: 700 }}>
                  ${pts.reduce((s, d) => s + d.total, 0).toFixed(0)} total
                </span>
              </div>
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                style={{ width: "100%", height: "auto", display: "block" }}
              >
                <defs>
                  <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#c9a84c" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8a6a1f" />
                    <stop offset="50%" stopColor="#f0d080" />
                    <stop offset="100%" stopColor="#c9a84c" />
                  </linearGradient>
                  <filter id="chartGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Grid lines */}
                {Array.from({ length: gridCount + 1 }).map((_, i) => {
                  const y = padT + (i / gridCount) * h;
                  const val = Math.round(niceMax - (i / gridCount) * niceMax);
                  return (
                    <g key={i}>
                      <line x1={padL} y1={y} x2={padL + w} y2={y}
                        stroke="#a08050" strokeOpacity="0.1" strokeWidth="0.5"
                        strokeDasharray={i === gridCount ? "none" : "4,4"} />
                      <text x={padL - 8} y={y + 3.5} fill="#a08050" fontSize="7.5" textAnchor="end"
                        fontFamily="'Cinzel', serif">
                        ${val}
                      </text>
                    </g>
                  );
                })}

                {/* Area fill */}
                <path d={areaPath} fill="url(#chartAreaGrad)" />

                {/* Glow behind line */}
                <path d={curvePath} fill="none" stroke="#c9a84c" strokeWidth="5" strokeOpacity="0.15"
                  strokeLinecap="round" strokeLinejoin="round" />

                {/* Main line */}
                <path d={curvePath} fill="none" stroke="url(#chartLineGrad)" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ strokeDasharray: 2000, animation: "dash-chartDraw 1.2s ease-out both" }} />

                {/* Data points & labels */}
                {coords.map((c, i) => (
                  <g key={i}>
                    {/* outer glow ring */}
                    <circle cx={c.x} cy={c.y} r="8" fill="none" stroke="#c9a84c" strokeOpacity="0.1" strokeWidth="1" />
                    {/* dot */}
                    <circle cx={c.x} cy={c.y} r="4" fill="#0e3522" stroke="#f0d080" strokeWidth="2"
                      filter="url(#chartGlow)"
                      style={{ animation: `dash-dotPop .3s ease-out ${1 + i * 0.1}s both` }} />
                    {/* value label */}
                    <rect x={c.x - 18} y={c.y - 20} width="36" height="14" rx="4"
                      fill="rgba(10,30,18,.85)" stroke="rgba(201,168,76,.2)" strokeWidth="0.5" />
                    <text x={c.x} y={c.y - 10} fill="#f0d080" fontSize="7" textAnchor="middle"
                      fontWeight="700" fontFamily="'Cinzel', serif">
                      ${c.val}
                    </text>
                    {/* date */}
                    <text x={c.x} y={padT + h + 14} fill="#a08050" fontSize="7.5" textAnchor="middle"
                      fontFamily="'Cinzel', serif">
                      {c.date}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          );
        })()}

        {/* ── Recent Rounds ── */}
        <div style={{
          ...card,
          animation: "dash-fadeUp .5s ease-out both",
          animationDelay: "0.8s",
        }}>
          <div style={sectionLabel}>
            <span>🎲 RECENT ROUNDS</span>
            <div style={sectionBar} />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ ...table.wrap, minWidth: 640 }}>
              <thead>
                <tr>
                  {["Player", "Dice", "Total", "Bet", "Wager", "Result", "Time"].map((h) => (
                    <th key={h} style={{
                      ...table.th,
                      fontSize: "0.65rem",
                      letterSpacing: "0.12em",
                      padding: "10px 12px",
                      borderBottom: "2px solid rgba(138,106,31,.3)",
                      textTransform: "uppercase",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentRounds.map((r, idx) => (
                  <tr key={r._id} className="dash-table-row" style={{
                    animation: "dash-fadeUp .35s ease-out both",
                    animationDelay: `${0.9 + idx * 0.04}s`,
                  }}>
                    <td style={{ ...table.td, color: "#f0d080", fontWeight: 600, padding: "10px 12px" }}>
                      {r.username}
                    </td>
                    <td style={{ ...table.td, padding: "10px 12px", fontVariantNumeric: "tabular-nums" }}>
                      <span style={{
                        background: "rgba(201,168,76,.08)",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: "0.75rem",
                        letterSpacing: "0.15em",
                      }}>
                        {r.diceValues?.join(" · ")}
                      </span>
                    </td>
                    <td style={{ ...table.td, padding: "10px 12px", fontWeight: 700, color: "#f5e6c8" }}>
                      {r.total}
                    </td>
                    <td style={{
                      ...table.td,
                      textTransform: "capitalize",
                      fontSize: "0.65rem",
                      padding: "10px 12px",
                    }}>
                      <span style={{
                        background: "rgba(201,168,76,.06)",
                        border: "1px solid rgba(201,168,76,.12)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: "0.6rem",
                        letterSpacing: "0.08em",
                      }}>
                        {r.betType}
                      </span>
                    </td>
                    <td style={{ ...table.td, padding: "10px 12px" }}>🪙 {r.betAmount}</td>
                    <td style={{
                      ...table.td,
                      padding: "10px 12px",
                      fontWeight: 700,
                    }}>
                      <span style={{
                        color: r.won ? "#4ade80" : "#f87171",
                        background: r.won ? "rgba(39,174,96,.1)" : "rgba(192,57,43,.1)",
                        border: `1px solid ${r.won ? "rgba(39,174,96,.2)" : "rgba(192,57,43,.2)"}`,
                        padding: "2px 10px",
                        borderRadius: 6,
                        fontSize: "0.72rem",
                      }}>
                        {r.won ? `+${r.payout}` : `−${r.betAmount}`}
                      </span>
                    </td>
                    <td style={{ ...table.td, fontSize: "0.6rem", padding: "10px 12px", color: "#887050" }}>
                      {new Date(r.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
