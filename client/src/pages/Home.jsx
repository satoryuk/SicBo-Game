import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DiceTray from "../components/DiceTray";
import BetPanel from "../components/BetPanel";
import BalanceBar from "../components/BalanceBar";

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

  const roll = () => {
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
          const payouts = {
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
          payout = betAmount * (payouts[betValue] || 6);
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
        <div className="text-[0.65rem] text-sicbo-gold tracking-[0.15em] mt-3 py-1.5 px-4 bg-sicbo-gold/10 border border-sicbo-gold-dark rounded-full inline-block">
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

        <div className="bg-gradient-to-br from-sicbo-gold/10 to-sicbo-gold/5 border-2 border-sicbo-gold-dark rounded-xl p-5 text-center">
          <div className="text-sm text-[#f0d080] tracking-wider mb-3.5">
            Want to save your progress and compete?
          </div>
          <div className="flex gap-2.5 justify-center">
            <button
              className="bg-gradient-to-r from-sicbo-gold-dark to-sicbo-gold border-none text-sicbo-dark rounded-lg py-2.5 px-6 font-cinzel text-xs font-bold tracking-wider cursor-pointer hover:opacity-90"
              onClick={() => navigate("/signup")}
            >
              Create Account
            </button>
            <button
              className="bg-transparent border border-sicbo-gold-dark text-sicbo-text-muted rounded-lg py-2.5 px-6 font-cinzel text-xs tracking-wider cursor-pointer hover:bg-sicbo-gold-dark/20"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            className="bg-transparent border border-sicbo-gold-dark text-sicbo-text-muted rounded-lg py-2 px-4 font-cinzel text-[0.7rem] tracking-wider cursor-pointer hover:bg-sicbo-gold-dark/20"
            onClick={() => navigate("/leaderboard")}
          >
            🏆 View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
