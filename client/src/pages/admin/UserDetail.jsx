import React, { useState, useEffect } from "react";
import api from "../../api";
import { useParams, useNavigate } from "react-router-dom";
import { page, card, btn, input, table } from "../../styles";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [coins, setCoins] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch();
  }, [id]);

  const fetch = async () => {
    const { data: d } = await api.get(`/api/admin/users/${id}`);
    setData(d);
  };

  const flash = (text, color = "green") => {
    setMsg({ text, color });
    setTimeout(() => setMsg(null), 3000);
  };

  const addCoins = async () => {
    if (!coins) return;
    await api.post(`/api/admin/users/${id}/add-coins`, {
      coins: Number(coins),
      reason,
    });
    flash(`Added ${coins} coins!`);
    setCoins("");
    setReason("");
    fetch();
  };

  const resetBalance = async () => {
    const amt = prompt("Reset balance to how many coins?", "1000");
    if (!amt) return;
    await api.post(`/api/admin/users/${id}/reset-balance`, {
      coins: Number(amt),
    });
    flash(`Balance reset to ${amt} coins`);
    fetch();
  };

  const ban = async () => {
    const r = prompt("Reason for ban:");
    if (!r) return;
    await api.post(`/api/admin/users/${id}/ban`, { reason: r });
    flash(`User banned`, "red");
    fetch();
  };

  const unban = async () => {
    await api.post(`/api/admin/users/${id}/unban`, {});
    flash(`User unbanned`);
    fetch();
  };

  const { user, rounds, transactions } = data || {};

  if (!data)
    return (
      <div style={{ ...page, textAlign: "center", padding: 40 }}>
        Loading...
      </div>
    );

  return (
    <div style={page}>
      <div
        style={{
          margin: "0",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <button
          style={{ ...btn.ghost, alignSelf: "flex-start" }}
          onClick={() => navigate("/admin/users")}
        >
          ← Back
        </button>

        {msg && (
          <div
            style={{
              background:
                msg.color === "green"
                  ? "rgba(39,174,96,0.15)"
                  : "rgba(192,57,43,0.15)",
              border: `1px solid ${msg.color === "green" ? "#27ae60" : "#c0392b"}`,
              borderRadius: 8,
              padding: "10px 16px",
              color: msg.color === "green" ? "#27ae60" : "#ff6655",
            }}
          >
            {msg.text}
          </div>
        )}

        {/* User info */}
        <div
          style={{
            ...card,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f0d080" }}
            >
              {user.username}
            </div>
            <div style={{ color: "#a08050", fontSize: "0.7rem", marginTop: 4 }}>
              🪙 {user.coins} coins &nbsp;|&nbsp; {user.rank} &nbsp;|&nbsp;
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </div>
            <div style={{ color: "#a08050", fontSize: "0.7rem" }}>
              Rounds: {user.totalRounds} &nbsp;|&nbsp; Wins: {user.totalWins}{" "}
              &nbsp;|&nbsp; Biggest Win: 🪙 {user.biggestWin}
            </div>
            {user.isBanned && (
              <div
                style={{ color: "#ff6655", fontSize: "0.7rem", marginTop: 4 }}
              >
                🚫 BANNED — {user.bannedReason}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={btn.primary} onClick={resetBalance}>
              Reset Balance
            </button>
            {user.isBanned ? (
              <button style={btn.success} onClick={unban}>
                Unban
              </button>
            ) : (
              <button style={btn.danger} onClick={ban}>
                Ban User
              </button>
            )}
          </div>
        </div>

        {/* Add coins */}
        <div style={card}>
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "#a08050",
              marginBottom: 12,
            }}
          >
            ➕ ADD COINS MANUALLY
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...input, marginBottom: 0, flex: 1 }}
              type="number"
              placeholder="Coins to add"
              value={coins}
              onChange={(e) => setCoins(e.target.value)}
            />
            <input
              style={{ ...input, marginBottom: 0, flex: 2 }}
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button
              style={{ ...btn.primary, whiteSpace: "nowrap" }}
              onClick={addCoins}
            >
              Add
            </button>
          </div>
        </div>

        {/* Recent rounds */}
        <div style={card}>
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "#a08050",
              marginBottom: 12,
            }}
          >
            🎲 RECENT ROUNDS
          </div>
          <table style={table.wrap}>
            <thead>
              <tr>
                {["Dice", "Total", "Bet", "Wager", "Result", "Date"].map(
                  (h) => (
                    <th key={h} style={table.th}>
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rounds.map((r) => (
                <tr key={r._id}>
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
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Transactions */}
        <div style={card}>
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "#a08050",
              marginBottom: 12,
            }}
          >
            💳 TRANSACTIONS
          </div>
          <table style={table.wrap}>
            <thead>
              <tr>
                {["Type", "Coins", "Amount", "Note", "Date"].map((h) => (
                  <th key={h} style={table.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td
                    style={{
                      ...table.td,
                      textTransform: "uppercase",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color: {
                        deposit: "#27ae60",
                        withdraw: "#c0392b",
                        bet: "#a08050",
                        win: "#c9a84c",
                        bonus: "#4488ff",
                      }[t.type],
                    }}
                  >
                    {t.type}
                  </td>
                  <td
                    style={{
                      ...table.td,
                      color: t.coins >= 0 ? "#27ae60" : "#c0392b",
                    }}
                  >
                    {t.coins >= 0 ? "+" : ""}
                    {t.coins}
                  </td>
                  <td style={table.td}>
                    {t.amount > 0 ? `$${t.amount}` : "—"}
                  </td>
                  <td style={{ ...table.td, fontSize: "0.65rem" }}>{t.note}</td>
                  <td style={{ ...table.td, fontSize: "0.6rem" }}>
                    {new Date(t.createdAt).toLocaleString()}
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
