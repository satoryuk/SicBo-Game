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
    <div className="bg-sicbo-green border-2 border-sicbo-gold-dark rounded-2xl p-6 font-cinzel">
      <div className="text-[0.65rem] tracking-[0.3em] text-sicbo-text-muted text-center mb-4">
        PLACE YOUR BET
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-sicbo-gold-dark pb-3">
        {[
          ["bigsmall", "Big / Small"],
          ["number", "Single Number"],
          ["total", "Exact Total"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`flex-1 py-2 px-1 bg-transparent border rounded-md font-cinzel text-[0.65rem] tracking-wider cursor-pointer text-center ${
              activeTab === key
                ? "bg-sicbo-gold/10 border-sicbo-gold-dark text-[#f0d080]"
                : "border-transparent text-sicbo-text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Big / Small */}
      {activeTab === "bigsmall" && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            ["small", "SMALL", "4 – 10", "#2255aa", "#6699ff"],
            ["big", "BIG", "11 – 17", "#7b1e14", "#ff6655"],
          ].map(([v, label, range, border, color]) => (
            <div
              key={v}
              onClick={() => setBetValue(v)}
              className="py-5 px-3 border-2 rounded-xl cursor-pointer text-center font-cinzel transition-all"
              style={{
                borderColor: betValue === v ? color : border,
                color: color,
                background: betValue === v ? `${color}22` : "rgba(0,0,0,0.3)",
                boxShadow: betValue === v ? `0 0 16px ${color}44` : "none",
              }}
            >
              <div className="text-lg font-bold">{label}</div>
              <div className="text-[0.6rem] mt-1 opacity-70">Total {range}</div>
              <div className="text-[0.65rem] mt-1.5">Pays 1 : 1</div>
            </div>
          ))}
        </div>
      )}

      {/* Single Number */}
      {activeTab === "number" && (
        <div>
          <div className="grid grid-cols-6 gap-2 mb-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                onClick={() => setBetValue(n)}
                className={`aspect-square border rounded-lg font-cinzel text-base font-bold cursor-pointer flex items-center justify-center ${
                  betValue === n
                    ? "border-[#f0d080] text-[#f0d080] bg-sicbo-gold/20 shadow-[0_0_10px_rgba(201,168,76,0.3)]"
                    : "border-sicbo-gold-dark text-sicbo-text bg-black/30"
                }`}
              >
                {n}
              </div>
            ))}
          </div>
          <div className="text-[0.6rem] text-sicbo-text-muted text-center tracking-[0.12em]">
            1 match → 1:1 &nbsp;|&nbsp; 2 matches → 2:1 &nbsp;|&nbsp; 3 matches
            → 3:1
          </div>
        </div>
      )}

      {/* Exact Total */}
      {activeTab === "total" && (
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 14 }, (_, i) => i + 4).map((t) => (
            <div
              key={t}
              onClick={() => setBetValue(t)}
              className={`py-2.5 px-1 border rounded-lg text-sicbo-text font-cinzel cursor-pointer text-center ${
                betValue === t
                  ? "border-[#f0d080] bg-sicbo-gold/20 shadow-[0_0_10px_rgba(201,168,76,0.3)]"
                  : "border-sicbo-gold-dark bg-black/30"
              }`}
            >
              <div className="text-sm font-bold">{t}</div>
              <div className="text-[0.5rem] text-sicbo-gold mt-0.5">
                {TOTAL_PAYOUTS[t]}:1
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chips Row */}
      <div className="flex items-center gap-2.5 mt-5 pt-4 border-t border-sicbo-gold/20">
        <span className="text-[0.6rem] tracking-[0.2em] text-sicbo-text-muted whitespace-nowrap">
          CHIPS
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {CHIPS.map((c) => (
            <div
              key={c}
              onClick={() => addChip(c)}
              className="w-10 h-10 rounded-full border-[3px] border-dashed flex items-center justify-center text-[0.6rem] font-bold cursor-pointer"
              style={{
                borderColor: CHIP_COLORS[c],
                color: CHIP_COLORS[c],
              }}
            >
              {c}
            </div>
          ))}
        </div>
        <div className="ml-auto text-right">
          <div className="text-[0.55rem] text-sicbo-text-muted tracking-[0.15em]">
            BET
          </div>
          <div className="text-lg text-[#f0d080] font-bold">${betAmount}</div>
        </div>
        <button
          onClick={() => setBetAmount(0)}
          className="bg-transparent border border-red-600/40 text-red-400/60 rounded-md px-2.5 py-1.5 font-cinzel text-[0.55rem] tracking-wider cursor-pointer whitespace-nowrap hover:bg-red-600/10"
        >
          ✕ Clear
        </button>
      </div>
    </div>
  );
}
