// Dot layout map for each face value
const DOT_LAYOUTS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Die({ value, rolling }) {
  return (
    <div
      className={`w-[72px] h-[72px] bg-white rounded-2xl p-2.5 grid grid-cols-3 grid-rows-3 gap-0.5 shadow-[0_6px_20px_rgba(0,0,0,0.7)] ${
        rolling ? "animate-shake" : ""
      }`}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full w-full h-full ${
            DOT_LAYOUTS[value]?.includes(i) ? "bg-[#1a0a0a]" : "bg-transparent"
          }`}
        />
      ))}
    </div>
  );
}

export default function DiceTray({ dice, rolling, total }) {
  return (
    <div className="bg-sicbo-green-dark border-2 border-sicbo-gold-dark rounded-2xl py-7 px-5 text-center relative">
      <style>{`
        @keyframes shake {
          0%   { transform: rotate(0deg) scale(1); }
          15%  { transform: rotate(-18deg) scale(1.1); }
          30%  { transform: rotate(14deg) scale(0.95); }
          45%  { transform: rotate(-12deg) scale(1.08); }
          60%  { transform: rotate(8deg) scale(0.97); }
          75%  { transform: rotate(-5deg) scale(1.03); }
          90%  { transform: rotate(3deg) scale(1); }
          100% { transform: rotate(0deg) scale(1); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

      <div className="text-[0.6rem] tracking-[0.3em] text-sicbo-text-muted mb-4">
        ROLL RESULT
      </div>

      <div className="flex justify-center gap-5 mb-4">
        {dice.map((val, i) => (
          <Die key={i} value={val} rolling={rolling} />
        ))}
      </div>

      <div className="text-xs text-sicbo-text-muted tracking-[0.15em]">
        Total:{" "}
        <span className="text-[#f0d080] text-lg font-bold">{total ?? "—"}</span>
      </div>
    </div>
  );
}
