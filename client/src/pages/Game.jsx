import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import DiceTray from "../components/DiceTray";
import BetPanel from "../components/BetPanel";
import BalanceBar from "../components/BalanceBar";

export default function Game() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [balance, setBalance] = useState(user?.coins || 1000);
  const [lastWin, setLastWin] = useState(null);
  const [rounds, setRounds] = useState(0);
  const [betType, setBetType] = useState("bigsmall");
  const [betValue, setBetValue] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [dice, setDice] = useState([1, 1, 1]);
  const [total, setTotal] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [bonus, setBonus] = useState(null);

  useEffect(() => {
    // Fetch current user coins from server
    const fetchBalance = async () => {
      try {
        const { data } = await api.get("/api/auth/me");
        setBalance(data.coins);
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };
    fetchBalance();

    // Check login bonus from login response (stored in sessionStorage)
    const b = sessionStorage.getItem("loginBonus");
    if (b) {
      setBonus(JSON.parse(b));
      sessionStorage.removeItem("loginBonus");
    }

    socket.connect();
    socket.emit("join_room", "main");
    socket.on("roll_result", (data) =>
      console.log("Other player rolled:", data),
    );
    return () => socket.disconnect();
  }, []);

  const roll = async () => {
    if (!betValue) return setResult({ error: "Choose a bet type first!" });
    if (betAmount <= 0) return setResult({ error: "Add chips to bet!" });
    if (betAmount > balance) return setResult({ error: "Not enough coins!" });

    setRolling(true);
    setResult(null);

    try {
      const { data } = await api.post("/api/game/roll", {
        betType,
        betValue,
        betAmount,
      });

      // Delay showing results to match animation duration
      setTimeout(() => {
        setDice(data.vals);
        setTotal(data.total);
        setBalance(data.coins);
        setRounds((r) => r + 1);
        setResult(data);
        setBetAmount(0);

        if (data.won) setLastWin(data.payout);
        setHistory((prev) => [data.won ? "win" : "lose", ...prev].slice(0, 12));

        // Update localStorage coins
        const updated = { ...user, coins: data.coins };
        localStorage.setItem("user", JSON.stringify(updated));

        socket.emit("broadcast_roll", { roomId: "main", result: data });
        setRolling(false);
      }, 2400);
    } catch (err) {
      setResult({ error: err.response?.data?.message || "Server error" });
      setRolling(false);
    }
  };

  return (
    <div style={s.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&family=Cinzel:wght@400;700;900&display=swap"
        rel="stylesheet"
      />

      {/* Login bonus popup */}
      {bonus && (
        <div style={s.bonusPopup}>
          🎁 Daily Login Bonus!{" "}
          <strong style={{ color: "#f0d080" }}>+{bonus.coins} coins</strong>
          &nbsp;(Day {bonus.streak} streak)
          <button
            onClick={() => setBonus(null)}
            style={{
              marginLeft: 12,
              background: "none",
              border: "none",
              color: "#a08050",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <header style={s.header}>
        <h1 style={s.title}>SIC BO</h1>
        <div style={s.subtitle}>骰寶 · DICE TREASURE</div>
        <div style={s.goldLine} />
      </header>

      <BalanceBar balance={balance} lastWin={lastWin} rounds={rounds} />

      <div style={s.wrap}>
        <DiceTray dice={dice} rolling={rolling} total={total} />

        <BetPanel
          balance={balance}
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          betType={betType}
          setBetType={setBetType}
          betValue={betValue}
          setBetValue={setBetValue}
        />

        {/* Low coin warning */}
        {balance < 50 && balance > 0 && (
          <div style={s.warning}>
            ⚠ Low coins! &nbsp;
            <span
              style={{
                color: "#c9a84c",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/wallet")}
            >
              Deposit more →
            </span>
          </div>
        )}
        {balance === 0 && (
          <div
            style={{ ...s.warning, borderColor: "#c0392b", color: "#ff6655" }}
          >
            🚫 No coins left! &nbsp;
            <span
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate("/wallet")}
            >
              Go to Wallet →
            </span>
          </div>
        )}

        {/* Roll Button */}
        <button
          style={{ ...s.rollBtn, opacity: rolling || balance === 0 ? 0.6 : 1 }}
          onClick={roll}
          disabled={rolling || balance === 0}
        >
          {rolling ? "🎲 Rolling..." : "🎲 ROLL THE DICE"}
        </button>

        {/* Result Panel */}
        <div style={s.resultPanel}>
          {result?.error ? (
            <div
              style={{
                color: "#ff6655",
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
              }}
            >
              ⚠ {result.error}
            </div>
          ) : result ? (
            <>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#a08050",
                  letterSpacing: "0.15em",
                }}
              >
                Dice: {result.vals?.join(" · ")} &nbsp;|&nbsp; Total:{" "}
                {result.total}
                {result.isTriple ? " 🔴 Triple!" : ""}
              </div>
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: result.won ? "#f0d080" : "#c0392b",
                  textShadow: result.won
                    ? "0 0 20px rgba(240,208,128,0.5)"
                    : "none",
                }}
              >
                {result.won ? `🎉 WIN! +${result.payout} coins` : "✗ LOSE"}
              </div>
              <div style={{ fontSize: "0.65rem", color: "#a08050" }}>
                Balance: 🪙 {result.coins?.toLocaleString()}
              </div>
            </>
          ) : (
            <div
              style={{
                color: "#a08050",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
              }}
            >
              Place a bet and roll the dice
            </div>
          )}
        </div>

        {/* History badges */}
        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {history.map((h, i) => (
            <span
              key={i}
              style={{
                fontSize: "0.55rem",
                padding: "3px 8px",
                borderRadius: 20,
                fontWeight: 700,
                letterSpacing: "0.1em",
                background:
                  h === "win"
                    ? "rgba(201,168,76,0.15)"
                    : "rgba(192,57,43,0.15)",
                color: h === "win" ? "#c9a84c" : "#c0392b",
                border: `1px solid ${h === "win" ? "#8a6a1f" : "#7b1e14"}`,
              }}
            >
              {h === "win" ? "✓" : "✗"}
            </span>
          ))}
        </div>

        {/* Payout Table */}
        <div style={s.infoBox}>
          <div style={s.infoTitle}>PAYOUT TABLE</div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.65rem",
            }}
          >
            <thead>
              <tr>
                {["Bet Type", "Condition", "Payout"].map((h) => (
                  <th
                    key={h}
                    style={{
                      color: "#c9a84c",
                      borderBottom: "1px solid #8a6a1f",
                      padding: "6px 8px",
                      textAlign: "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Big", "Total 11–17 (no triple)", "1:1"],
                ["Small", "Total 4–10 (no triple)", "1:1"],
                ["Single Number", "Appears on 1 die", "1:1"],
                ["Single Number", "Appears on 2 dice", "2:1"],
                ["Single Number", "Appears on 3 dice", "3:1"],
                ["Total 4 or 17", "Exact sum", "50:1"],
                ["Total 5 or 16", "Exact sum", "18:1"],
                ["Total 6 or 15", "Exact sum", "14:1"],
                ["Total 7 or 14", "Exact sum", "12:1"],
                ["Total 8 or 13", "Exact sum", "8:1"],
                ["Total 9–12", "Exact sum", "6:1"],
              ].map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        color: "#a08050",
                        padding: "5px 8px",
                        borderBottom: "1px solid rgba(201,168,76,0.08)",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#0d0d0d",
    backgroundImage:
      "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)",
    fontFamily: "'Cinzel', serif",
    color: "#f5e6c8",
  },
  bonusPopup: {
    background: "rgba(68,136,255,0.15)",
    border: "1px solid #4488ff",
    color: "#88aaff",
    padding: "10px 20px",
    textAlign: "center",
    fontSize: "0.8rem",
    letterSpacing: "0.08em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  header: { textAlign: "center", padding: "24px 0 0" },
  title: {
    fontSize: "clamp(2rem, 6vw, 3.6rem)",
    fontWeight: 900,
    color: "#c9a84c",
    letterSpacing: "0.12em",
    textShadow: "0 0 30px rgba(201,168,76,0.5)",
    margin: 0,
  },
  subtitle: {
    fontFamily: "'Noto Serif TC', serif",
    fontSize: "1rem",
    color: "#a08050",
    letterSpacing: "0.3em",
    marginTop: 6,
  },
  goldLine: {
    width: 200,
    height: 1,
    background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
    margin: "10px auto 0",
  },
  wrap: {
    width: "100%",
    maxWidth: 680,
    margin: "0 auto",
    padding: "0 0 60px 0",
    display: "flex",
    flexDirection: "column",
    gap: 22,
  },
  warning: {
    background: "rgba(201,168,76,0.08)",
    border: "1px solid #8a6a1f",
    borderRadius: 8,
    padding: "10px 16px",
    color: "#a08050",
    fontSize: "0.75rem",
    textAlign: "center",
  },
  rollBtn: {
    width: "100%",
    padding: 18,
    background: "linear-gradient(135deg, #8a6a1f, #c9a84c, #8a6a1f)",
    border: "none",
    borderRadius: 12,
    color: "#0d0d0d",
    fontFamily: "'Cinzel', serif",
    fontSize: "1rem",
    fontWeight: 900,
    letterSpacing: "0.2em",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
  },
  resultPanel: {
    background: "linear-gradient(135deg, #0a1a10, #0d2218)",
    border: "2px solid #8a6a1f",
    borderRadius: 12,
    padding: "18px 20px",
    textAlign: "center",
    minHeight: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 6,
  },
  infoBox: {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid #8a6a1f",
    borderRadius: 10,
    padding: 16,
  },
  infoTitle: {
    fontSize: "0.65rem",
    letterSpacing: "0.25em",
    color: "#a08050",
    marginBottom: 12,
    textAlign: "center",
  },
};
