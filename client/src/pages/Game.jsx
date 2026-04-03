import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import DiceTray from "../components/DiceTray";
import BetPanel from "../components/BetPanel";
import BalanceBar from "../components/BalanceBar";

export default function Game() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [balance, setBalance] = useState(user?.balance || 1000);
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

  useEffect(() => {
    // Fetch current user balance from server
    const fetchBalance = async () => {
      try {
        const { data } = await api.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBalance(data.balance);
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };
    fetchBalance();

    socket.connect();
    socket.emit("join_room", "main");
    socket.on("roll_result", (data) => {
      console.log("Someone else rolled:", data);
    });
    return () => socket.disconnect();
  }, []);

  const roll = async () => {
    if (!betValue) return setResult({ error: "Choose a bet type first!" });
    if (betAmount <= 0) return setResult({ error: "Add chips to bet!" });

    setRolling(true);
    setResult(null);

    try {
      const { data } = await api.post(
        "/api/game/roll",
        { betType, betValue, betAmount },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setDice(data.vals);
      setTotal(data.total);
      setBalance(data.balance);
      setRounds((r) => r + 1);
      setResult(data);
      setBetAmount(0);

      if (data.won) setLastWin(data.payout);

      setHistory((prev) => [data.won ? "win" : "lose", ...prev].slice(0, 12));

      socket.emit("broadcast_roll", { roomId: "main", result: data });
    } catch (err) {
      setResult({ error: err.response?.data?.message || "Server error" });
    }

    setRolling(false);
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-sicbo-dark bg-gradient-to-b from-sicbo-gold/5 to-transparent font-cinzel text-sicbo-text flex flex-col items-center py-8 px-4 pb-16">
      <header className="text-center mb-8">
        <h1 className="text-[clamp(2rem,6vw,3.6rem)] font-black tracking-[0.12em] text-sicbo-gold [text-shadow:0_0_30px_rgba(201,168,76,0.5),0_2px_0_#000] m-0">
          SIC BO
        </h1>
        <div className="font-noto text-base text-sicbo-text-muted tracking-[0.3em] mt-1.5">
          骰寶 · DICE TREASURE
        </div>
        <div className="w-52 h-px bg-gradient-to-r from-transparent via-sicbo-gold to-transparent mx-auto mt-2.5" />
      </header>

      <BalanceBar balance={balance} lastWin={lastWin} rounds={rounds} />

      <div className="w-full max-w-[680px] flex flex-col gap-5">
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

        <button
          className="w-full py-4 bg-gradient-to-r from-sicbo-gold-dark via-sicbo-gold to-sicbo-gold-dark border-none rounded-xl text-sicbo-dark font-cinzel text-base font-black tracking-[0.2em] cursor-pointer shadow-[0_4px_20px_rgba(201,168,76,0.4)] disabled:opacity-50"
          onClick={roll}
          disabled={rolling}
        >
          {rolling ? "🎲 Rolling..." : "🎲 ROLL THE DICE"}
        </button>

        <div className="bg-gradient-to-br from-[#0a1a10] to-[#0d2218] border-2 border-sicbo-gold-dark rounded-xl py-4 px-5 text-center min-h-[72px] flex items-center justify-center flex-col gap-1.5">
          {result?.error ? (
            <div className="text-red-400 text-sm tracking-wider">
              ⚠ {result.error}
            </div>
          ) : result ? (
            <>
              <div className="text-[0.7rem] text-sicbo-text-muted tracking-[0.2em]">
                Dice: {result.vals?.join(" · ")} | Total: {result.total}
                {result.isTriple ? " 🔴 Triple!" : ""}
              </div>
              <div
                className={`text-2xl font-bold tracking-wider ${
                  result.won
                    ? "text-[#f0d080] [text-shadow:0_0_20px_rgba(240,208,128,0.5)]"
                    : "text-red-700"
                }`}
              >
                {result.won ? `🎉 YOU WIN! +${result.payout}` : "✗ LOSE"}
              </div>
            </>
          ) : (
            <div className="text-sicbo-text-muted text-[0.7rem] tracking-[0.2em]">
              Place a bet and roll the dice
            </div>
          )}
        </div>

        <div className="flex gap-1.5 justify-center flex-wrap">
          {history.map((h, i) => (
            <span
              key={i}
              className={`text-[0.55rem] py-0.5 px-2 rounded-full font-bold tracking-wider ${
                h === "win"
                  ? "bg-sicbo-gold/15 text-sicbo-gold border border-sicbo-gold-dark"
                  : "bg-red-900/15 text-red-700 border border-red-900"
              }`}
            >
              {h === "win" ? "✓" : "✗"}
            </span>
          ))}
        </div>

        <div className="bg-black/30 border border-sicbo-gold-dark rounded-xl p-4">
          <div className="text-[0.65rem] tracking-[0.25em] text-sicbo-text-muted mb-3 text-center">
            PAYOUT TABLE
          </div>
          <table className="w-full border-collapse text-[0.65rem] tracking-wider">
            <thead>
              <tr>
                {["Bet Type", "Condition", "Payout"].map((h) => (
                  <th
                    key={h}
                    className="text-sicbo-gold border-b border-sicbo-gold-dark py-1.5 px-2 text-left font-bold"
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
                      className="text-sicbo-text-muted py-1 px-2 border-b border-sicbo-gold/5"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between gap-2">
          <button
            className="bg-transparent border border-sicbo-gold-dark text-sicbo-text-muted rounded-lg py-2 px-4 font-cinzel text-[0.7rem] tracking-wider cursor-pointer hover:bg-sicbo-gold-dark/20 flex items-center gap-1.5"
            onClick={() => navigate("/profile")}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Profile
          </button>
          <button
            className="bg-transparent border border-sicbo-gold-dark text-sicbo-text-muted rounded-lg py-2 px-4 font-cinzel text-[0.7rem] tracking-wider cursor-pointer hover:bg-sicbo-gold-dark/20 flex items-center gap-1.5"
            onClick={() => navigate("/leaderboard")}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            Leaderboard
          </button>
          <button
            className="bg-transparent border border-red-600/40 text-red-400 rounded-lg py-2 px-4 font-cinzel text-[0.7rem] tracking-wider cursor-pointer hover:bg-red-600/20"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
