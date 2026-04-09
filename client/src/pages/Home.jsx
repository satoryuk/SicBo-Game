import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DiceTray from "../components/DiceTray";
import BetPanel from "../components/BetPanel";
import BalanceBar from "../components/BalanceBar";

const PAYOUT_TABLE = {
  4: 50,
  5: 18,
  6: 14,
  7: 12,
  8: 8,
  9: 6,
  10: 6,
  11: 6,
  12: 6,
  13: 8,
  14: 12,
  15: 14,
  16: 18,
  17: 50,
};

export default function Home() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(1000);
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

  const roll = useCallback(() => {
    if (!betValue) return setResult({ error: "Choose a bet type first!" });
    if (betAmount <= 0) return setResult({ error: "Add chips to bet!" });
    if (betAmount > balance)
      return setResult({ error: "Insufficient balance!" });

    setRolling(true);
    setResult(null);

    setTimeout(() => {
      const vals = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ];
      const sum = vals.reduce((a, b) => a + b, 0);
      const isTriple = vals[0] === vals[1] && vals[1] === vals[2];

      let won = false;
      let payout = 0;

      if (betType === "bigsmall") {
        if (betValue === "big" && sum >= 11 && sum <= 17 && !isTriple) {
          won = true;
          payout = betAmount;
        } else if (betValue === "small" && sum >= 4 && sum <= 10 && !isTriple) {
          won = true;
          payout = betAmount;
        }
      } else if (betType === "number") {
        const count = vals.filter((v) => v === betValue).length;
        if (count > 0) {
          won = true;
          payout = betAmount * count;
        }
      } else if (betType === "total") {
        if (sum === betValue) {
          won = true;
          payout = betAmount * (PAYOUT_TABLE[betValue] || 6);
        }
      }

      const newBalance = won ? balance + payout : balance - betAmount;
      setDice(vals);
      setTotal(sum);
      setBalance(newBalance);
      setRounds((r) => r + 1);
      setResult({ won, payout, vals, total: sum, isTriple });
      setBetAmount(0);

      if (won) setLastWin(payout);
      setHistory((prev) => [won ? "win" : "lose", ...prev].slice(0, 12));
      setRolling(false);
    }, 1500);
  }, [betValue, betAmount, balance, betType]);

  return (
    <div className="min-h-screen bg-sicbo-dark bg-gradient-to-b from-sicbo-gold/5 to-transparent font-cinzel text-sicbo-text flex flex-col items-center py-8 px-4 pb-16">
      <header className="text-center mb-10">
        <h1 className="text-[clamp(2.5rem,7vw,4rem)] font-black tracking-[0.12em] text-sicbo-gold [text-shadow:0_0_40px_rgba(201,168,76,0.6),0_4px_8px_rgba(0,0,0,0.8)] m-0 transition-all duration-300 hover:scale-105">
          SIC BO
        </h1>
        <div className="font-noto text-lg text-sicbo-text-muted tracking-[0.3em] mt-2">
          骰寶 · DICE TREASURE
        </div>
        <div className="w-64 h-px bg-gradient-to-r from-transparent via-sicbo-gold to-transparent mx-auto mt-4" />
        <div className="text-[0.7rem] text-sicbo-gold tracking-[0.15em] mt-4 py-2 px-5 bg-sicbo-gold/15 border-2 border-sicbo-gold-dark/50 rounded-full inline-block backdrop-blur-sm shadow-[0_4px_16px_rgba(201,168,76,0.2)] transition-all duration-300 hover:bg-sicbo-gold/20">
          🎮 DEMO MODE - Progress not saved
        </div>
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
          className="w-full py-5 bg-gradient-to-r from-sicbo-gold-dark via-sicbo-gold to-sicbo-gold-dark border-none rounded-xl text-sicbo-dark font-cinzel text-lg font-black tracking-[0.2em] cursor-pointer shadow-[0_6px_24px_rgba(201,168,76,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_8px_32px_rgba(201,168,76,0.7)] hover:scale-[1.02] active:scale-[0.98]"
          onClick={roll}
          disabled={rolling}
        >
          {rolling ? "🎲 Rolling..." : "🎲 ROLL THE DICE"}
        </button>

        <div className="bg-gradient-to-br from-[#0a1a10]/80 to-[#0d2218]/80 backdrop-blur-sm border-2 border-sicbo-gold-dark/50 rounded-xl py-5 px-6 text-center min-h-[90px] flex items-center justify-center flex-col gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-300">
          {result?.error ? (
            <div className="text-red-400 text-sm tracking-wider animate-pulse">
              ⚠ {result.error}
            </div>
          ) : result ? (
            <>
              <div className="text-[0.7rem] text-sicbo-text-muted tracking-[0.2em]">
                Dice: {result.vals?.join(" · ")} | Total: {result.total}
                {result.isTriple ? " 🔴 Triple!" : ""}
              </div>
              <div
                className={`text-3xl font-bold tracking-wider transition-all duration-500 ${
                  result.won
                    ? "text-[#f0d080] [text-shadow:0_0_24px_rgba(240,208,128,0.6)] animate-pulse"
                    : "text-red-600"
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

        <div className="flex gap-2 justify-center flex-wrap">
          {history.map((h, i) => (
            <span
              key={i}
              className={`text-[0.6rem] py-1 px-2.5 rounded-full font-bold tracking-wider transition-all duration-300 hover:scale-110 ${
                h === "win"
                  ? "bg-sicbo-gold/20 text-sicbo-gold border-2 border-sicbo-gold-dark shadow-[0_2px_8px_rgba(201,168,76,0.3)]"
                  : "bg-red-900/20 text-red-500 border-2 border-red-900/50 shadow-[0_2px_8px_rgba(192,57,43,0.2)]"
              }`}
            >
              {h === "win" ? "✓" : "✗"}
            </span>
          ))}
        </div>

        <div className="bg-gradient-to-br from-sicbo-gold/15 to-sicbo-gold/5 backdrop-blur-sm border-2 border-sicbo-gold-dark/60 rounded-xl p-6 text-center shadow-[0_4px_20px_rgba(201,168,76,0.2)] transition-all duration-300 hover:shadow-[0_6px_28px_rgba(201,168,76,0.3)]">
          <div className="text-sm text-[#f0d080] tracking-wider mb-4 font-semibold">
            ✨ Want to save your progress and compete?
          </div>
          <div className="flex gap-3 justify-center">
            <button
              className="bg-gradient-to-r from-sicbo-gold-dark to-sicbo-gold border-none text-sicbo-dark rounded-lg py-3 px-7 font-cinzel text-xs font-bold tracking-wider cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_4px_16px_rgba(201,168,76,0.4)]"
              onClick={() => navigate("/signup")}
            >
              Create Account
            </button>
            <button
              className="bg-transparent border-2 border-sicbo-gold-dark text-sicbo-text rounded-lg py-3 px-7 font-cinzel text-xs tracking-wider cursor-pointer hover:bg-sicbo-gold-dark/30 hover:border-sicbo-gold transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
