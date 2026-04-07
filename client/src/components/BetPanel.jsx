import { useState } from "react";

const TOTAL_PAYOUTS = {
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

const CHIPS = [5, 10, 25, 50, 100];
const CHIP_COLORS = {
  5: "#aaa",
  10: "#4488ff",
  25: "#27ae60",
  50: "#c9a84c",
  100: "#c0392b",
};

export default function BetPanel({
  balance,
  betAmount,
  setBetAmount,
  betType,
  setBetType,
  betValue,
  setBetValue,
}) {
  const [activeTab, setActiveTab] = useState("bigsmall");

  const switchTab = (tab) => {
    setActiveTab(tab);
    setBetType(tab);
    setBetValue(null);
  };

  const addChip = (amt) => {
    if (betAmount + amt > balance) return;
    setBetAmount((prev) => prev + amt);
  };

  return (
    <div className="bg-gradient-to-br from-sicbo-green/80 to-sicbo-green-dark/80 backdrop-blur-sm border-2 border-sicbo-gold-dark/50 rounded-2xl p-6 font-cinzel shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300">
      <div className="text-[0.65rem] tracking-[0.3em] text-sicbo-gold/80 text-center mb-5 font-bold">
        💰 PLACE YOUR BET
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-sicbo-gold-dark/30 pb-3">
        {[
          ["bigsmall", "Big / Small"],
          ["number", "Single Number"],
          ["total", "Exact Total"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`flex-1 py-2.5 px-2 border rounded-lg font-cinzel text-[0.65rem] tracking-wider cursor-pointer text-center transition-all duration-300 ${
              activeTab === key
                ? "bg-sicbo-gold/15 border-sicbo-gold text-[#f0d080] shadow-[0_0_12px_rgba(201,168,76,0.3)] scale-105"
                : "border-sicbo-gold-dark/30 text-sicbo-text-muted hover:border-sicbo-gold-dark/60 hover:bg-sicbo-gold/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Big / Small */}
      {activeTab === "bigsmall" && (
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            ["small", "SMALL", "4 – 10", "#2255aa", "#6699ff"],
            ["big", "BIG", "11 – 17", "#7b1e14", "#ff6655"],
          ].map(([v, label, range, border, color]) => (
            <div
              key={v}
              onClick={() => setBetValue(v)}
              className="py-6 px-4 border-2 rounded-xl cursor-pointer text-center font-cinzel transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                borderColor: betValue === v ? color : border,
                color: color,
                background: betValue === v ? `${color}33` : "rgba(0,0,0,0.4)",
                boxShadow:
                  betValue === v
                    ? `0 0 20px ${color}66, inset 0 2px 8px ${color}22`
                    : "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              <div className="text-xl font-black tracking-wider">{label}</div>
              <div className="text-[0.6rem] mt-2 opacity-80">Total {range}</div>
              <div className="text-[0.7rem] mt-2 font-semibold">Pays 1 : 1</div>
            </div>
          ))}
        </div>
      )}

      {/* Single Number */}
      {activeTab === "number" && (
        <div>
          <div className="grid grid-cols-6 gap-2.5 mb-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                onClick={() => setBetValue(n)}
                className={`aspect-square border-2 rounded-xl font-cinzel text-lg font-bold cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                  betValue === n
                    ? "border-[#f0d080] text-[#f0d080] bg-sicbo-gold/25 shadow-[0_0_16px_rgba(201,168,76,0.5),inset_0_2px_8px_rgba(201,168,76,0.2)]"
                    : "border-sicbo-gold-dark/50 text-sicbo-text bg-black/40 hover:border-sicbo-gold-dark hover:bg-black/50"
                }`}
              >
                {n}
              </div>
            ))}
          </div>
          <div className="text-[0.6rem] text-sicbo-text-muted text-center tracking-[0.12em] bg-black/20 rounded-lg py-2 px-3">
            1 match → 1:1 &nbsp;|&nbsp; 2 matches → 2:1 &nbsp;|&nbsp; 3 matches
            → 3:1
          </div>
        </div>
      )}

      {/* Exact Total */}
      {activeTab === "total" && (
        <div className="grid grid-cols-7 gap-2 mb-4">
          {Array.from({ length: 14 }, (_, i) => i + 4).map((t) => (
            <div
              key={t}
              onClick={() => setBetValue(t)}
              className={`py-3 px-1 border-2 rounded-lg text-sicbo-text font-cinzel cursor-pointer text-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                betValue === t
                  ? "border-[#f0d080] bg-sicbo-gold/25 shadow-[0_0_16px_rgba(201,168,76,0.5)]"
                  : "border-sicbo-gold-dark/50 bg-black/40 hover:border-sicbo-gold-dark hover:bg-black/50"
              }`}
            >
              <div className="text-sm font-bold">{t}</div>
              <div className="text-[0.5rem] text-sicbo-gold mt-1 font-semibold">
                {TOTAL_PAYOUTS[t]}:1
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chips Row */}
      <div className="flex items-center gap-3 mt-6 pt-5 border-t border-sicbo-gold/30">
        <span className="text-[0.6rem] tracking-[0.2em] text-sicbo-gold/70 whitespace-nowrap font-semibold">
          CHIPS
        </span>
        <div className="flex gap-2 flex-wrap">
          {CHIPS.map((c) => (
            <div
              key={c}
              onClick={() => addChip(c)}
              className="w-11 h-11 rounded-full border-[3px] border-dashed flex items-center justify-center text-[0.65rem] font-bold cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
              style={{
                borderColor: CHIP_COLORS[c],
                color: CHIP_COLORS[c],
                background: `radial-gradient(circle at 30% 30%, ${CHIP_COLORS[c]}22, ${CHIP_COLORS[c]}11)`,
              }}
            >
              {c}
            </div>
          ))}
        </div>
        <div className="ml-auto text-right bg-black/30 rounded-lg px-3 py-2 border border-sicbo-gold-dark/30">
          <div className="text-[0.55rem] text-sicbo-gold/70 tracking-[0.15em] font-semibold">
            BET
          </div>
          <div className="text-xl text-[#f0d080] font-bold">${betAmount}</div>
        </div>
        <button
          onClick={() => setBetAmount(0)}
          className="bg-transparent border-2 border-red-600/50 text-red-400/80 rounded-lg px-3 py-2 font-cinzel text-[0.6rem] tracking-wider cursor-pointer whitespace-nowrap hover:bg-red-600/20 hover:border-red-600 hover:text-red-400 transition-all duration-300 active:scale-95"
        >
          ✕ Clear
        </button>
      </div>
    </div>
  );
}
