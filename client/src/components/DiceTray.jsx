import PropTypes from "prop-types";

/* ── constants ── */
const DIE_SIZE = 82;
const DIE_HALF = DIE_SIZE / 2;
const PERSPECTIVE = 600;

/* ── pip positions on a 3×3 grid (indices 0-8) ── */
const PIPS = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/* ── single face renderer ── */
function Face({ value, bg, shadow }) {
  const dots = PIPS[value] || [];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: bg,
        borderRadius: 8,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: shadow || "none",
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gridTemplateRows: "repeat(3,1fr)",
        padding: "18%",
        gap: "12%",
        boxSizing: "border-box",
      }}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          style={{
            display: "block",
            borderRadius: "50%",
            aspectRatio: "1",
            background: dots.includes(i)
              ? "radial-gradient(circle at 35% 30%, #555, #111)"
              : "transparent",
            boxShadow: dots.includes(i)
              ? "inset 0 2px 3px rgba(255,255,255,0.12), 0 1px 4px rgba(0,0,0,0.45)"
              : "none",
          }}
        />
      ))}
    </div>
  );
}

/* ── single die (true CSS 3-D cube) ── */
function Die({ value, rolling, index }) {
  /* standard die adjacency (opposite faces sum to 7)
     For the isometric view rotateX(-30deg) rotateY(45deg) we see: top, front, right.
     We compute all 6 faces so the cube is complete. */
  const adj = {
    1: { front: 2, right: 3 },
    2: { front: 1, right: 3 },
    3: { front: 2, right: 6 },
    4: { front: 6, right: 2 },
    5: { front: 6, right: 3 },
    6: { front: 5, right: 4 },
  };

  const S = DIE_SIZE;
  const H = DIE_HALF;
  const f = adj[value] || { front: 2, right: 3 };

  /* Compute all 6 face values (opposite faces sum to 7) */
  const top = value;
  const bottom = 7 - value;
  const front = f.front;
  const back = 7 - f.front;
  const right = f.right;
  const left = 7 - f.right;

  /* shared style for every face */
  const faceWrap = (transform) => ({
    position: "absolute",
    width: S,
    height: S,
    transform,
    transformStyle: "preserve-3d",
  });

  /* isometric-ish resting angle */
  const restTransform = `rotateX(-30deg) rotateY(45deg)`;

  return (
    /* outer wrapper — gives the component a fixed box in the flow */
    <div
      className={rolling ? "" : "dice-idle"}
      style={{
        width: S + 30,
        height: S + 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* cube pivot — must carry preserve-3d */}
      <div
        className={rolling ? `dice-roll-${index}` : ""}
        style={{
          width: S,
          height: S,
          position: "relative",
          transformStyle: "preserve-3d",
          transform: rolling ? undefined : restTransform,
          transition: rolling ? "none" : "transform 0.6s ease-out",
        }}
      >
        {/* TOP — the "value" face */}
        <div style={faceWrap(`rotateX(90deg) translateZ(${H}px)`)}>
          <Face
            value={top}
            bg="linear-gradient(135deg, #fefefe, #ececec)"
            shadow="inset 0 0 12px rgba(255,255,255,0.5)"
          />
        </div>

        {/* FRONT */}
        <div style={faceWrap(`translateZ(${H}px)`)}>
          <Face
            value={front}
            bg="linear-gradient(180deg, #e6e6e6, #c9c9c9)"
            shadow="inset 0 -6px 14px rgba(0,0,0,0.08)"
          />
        </div>

        {/* RIGHT */}
        <div style={faceWrap(`rotateY(90deg) translateZ(${H}px)`)}>
          <Face
            value={right}
            bg="linear-gradient(90deg, #d4d4d4, #aaaaaa)"
            shadow="inset -6px 0 14px rgba(0,0,0,0.1)"
          />
        </div>

        {/* BACK */}
        <div style={faceWrap(`rotateY(180deg) translateZ(${H}px)`)}>
          <Face
            value={back}
            bg="linear-gradient(180deg, #c9c9c9, #b0b0b0)"
            shadow="inset 0 6px 14px rgba(0,0,0,0.08)"
          />
        </div>

        {/* LEFT */}
        <div style={faceWrap(`rotateY(-90deg) translateZ(${H}px)`)}>
          <Face
            value={left}
            bg="linear-gradient(90deg, #aaaaaa, #c0c0c0)"
            shadow="inset 6px 0 14px rgba(0,0,0,0.1)"
          />
        </div>

        {/* BOTTOM */}
        <div style={faceWrap(`rotateX(-90deg) translateZ(${H}px)`)}>
          <Face
            value={bottom}
            bg="linear-gradient(135deg, #c0c0c0, #a8a8a8)"
            shadow="inset 0 0 12px rgba(0,0,0,0.15)"
          />
        </div>
      </div>
    </div>
  );
}

/* ── tray ── */
export default function DiceTray({ dice, rolling, total }) {
  const validDice = Array.isArray(dice) ? dice : [1, 1, 1];
  const displayTotal = total ?? validDice.reduce((sum, val) => sum + val, 0);

  return (
    <div className="bg-gradient-to-br from-sicbo-green-dark/80 to-sicbo-green/60 border-2 border-sicbo-gold-dark/50 rounded-2xl py-8 px-5 text-center relative shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* ── keyframe CSS ── */}
      <style>{`
        /* resting glow */
        .dice-idle {
          filter: drop-shadow(0 8px 18px rgba(0,0,0,0.55))
                  drop-shadow(0 0 22px rgba(201,168,76,0.2));
          animation: dice-glow 2.4s ease-in-out infinite;
        }
        @keyframes dice-glow {
          0%,100% { filter: drop-shadow(0  8px 18px rgba(0,0,0,0.55)) drop-shadow(0 0 22px rgba(201,168,76,0.2)); }
          50%     { filter: drop-shadow(0 12px 26px rgba(0,0,0,0.7))  drop-shadow(0 0 34px rgba(201,168,76,0.4)); }
        }

        /* rolling animations — each die has unique path, timing, rate */
        .dice-roll-0 {
          animation: droll0 2.2s cubic-bezier(.22,.61,.36,1) forwards;
          transform-style: preserve-3d;
        }
        .dice-roll-1 {
          animation: droll1 2.35s cubic-bezier(.22,.61,.36,1) 0.06s forwards;
          transform-style: preserve-3d;
        }
        .dice-roll-2 {
          animation: droll2 2.5s cubic-bezier(.22,.61,.36,1) 0.12s forwards;
          transform-style: preserve-3d;
        }

        /* die 0 — fast tumble, heavy X-axis spin */
        @keyframes droll0 {
          0%   { transform: rotateX(-30deg)  rotateY(45deg)  translateY(0)     scale(1);    }
          6%   { transform: rotateX(80deg)   rotateY(130deg) translateY(-55px) scale(1.12); }
          14%  { transform: rotateX(220deg)  rotateY(280deg) translateY(-40px) scale(0.97); }
          24%  { transform: rotateX(400deg)  rotateY(460deg) translateY(-68px) scale(1.15); }
          36%  { transform: rotateX(620deg)  rotateY(650deg) translateY(-50px) scale(1.05); }
          50%  { transform: rotateX(840deg)  rotateY(830deg) translateY(-60px) scale(1.08); }
          64%  { transform: rotateX(1020deg) rotateY(990deg) translateY(-40px) scale(1.02); }
          76%  { transform: rotateX(1150deg) rotateY(1100deg) translateY(-22px) scale(1);   }
          86%  { transform: rotateX(1250deg) rotateY(1180deg) translateY(-10px) scale(1);   }
          94%  { transform: rotateX(1310deg) rotateY(1230deg) translateY(-3px)  scale(1);   }
          100% { transform: rotateX(-30deg)  rotateY(45deg)  translateY(0)     scale(1);    }
        }

        /* die 1 — wider arc, heavy Y-axis spin */
        @keyframes droll1 {
          0%   { transform: rotateX(-30deg)  rotateY(45deg)   translateY(0)     scale(1);    }
          7%   { transform: rotateX(110deg)  rotateY(190deg)  translateY(-62px) scale(1.18); }
          16%  { transform: rotateX(260deg)  rotateY(380deg)  translateY(-45px) scale(0.94); }
          27%  { transform: rotateX(440deg)  rotateY(590deg)  translateY(-72px) scale(1.13); }
          40%  { transform: rotateX(650deg)  rotateY(800deg)  translateY(-55px) scale(1.06); }
          53%  { transform: rotateX(860deg)  rotateY(1000deg) translateY(-62px) scale(1.04); }
          66%  { transform: rotateX(1030deg) rotateY(1160deg) translateY(-38px) scale(1.01); }
          78%  { transform: rotateX(1160deg) rotateY(1290deg) translateY(-18px) scale(1);    }
          88%  { transform: rotateX(1250deg) rotateY(1370deg) translateY(-7px)  scale(1);    }
          95%  { transform: rotateX(1300deg) rotateY(1410deg) translateY(-2px)  scale(1);    }
          100% { transform: rotateX(-30deg)  rotateY(45deg)   translateY(0)     scale(1);    }
        }

        /* die 2 — highest toss, balanced spin */
        @keyframes droll2 {
          0%   { transform: rotateX(-30deg)  rotateY(45deg)   translateY(0)     scale(1);    }
          8%   { transform: rotateX(140deg)  rotateY(160deg)  translateY(-78px) scale(1.22); }
          18%  { transform: rotateX(310deg)  rotateY(340deg)  translateY(-55px) scale(0.93); }
          30%  { transform: rotateX(520deg)  rotateY(540deg)  translateY(-80px) scale(1.16); }
          42%  { transform: rotateX(720deg)  rotateY(730deg)  translateY(-60px) scale(1.08); }
          55%  { transform: rotateX(900deg)  rotateY(910deg)  translateY(-65px) scale(1.04); }
          67%  { transform: rotateX(1060deg) rotateY(1070deg) translateY(-42px) scale(1.01); }
          78%  { transform: rotateX(1180deg) rotateY(1190deg) translateY(-20px) scale(1);    }
          88%  { transform: rotateX(1270deg) rotateY(1270deg) translateY(-8px)  scale(1);    }
          95%  { transform: rotateX(1320deg) rotateY(1310deg) translateY(-2px)  scale(1);    }
          100% { transform: rotateX(-30deg)  rotateY(45deg)   translateY(0)     scale(1);    }
        }
      `}</style>

      <div className="text-[0.6rem] tracking-[0.3em] text-sicbo-gold/80 mb-5 font-bold">
        🎲 ROLL RESULT
      </div>

      {/* perspective container */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 36,
          perspective: PERSPECTIVE,
          perspectiveOrigin: "50% 40%",
          transformStyle: "preserve-3d",
          minHeight: 140,
          padding: "20px 0 10px",
        }}
        role="img"
        aria-label={`Dice showing ${validDice.join(", ")}`}
      >
        {validDice.map((v, i) => (
          <Die key={i} value={v} rolling={rolling} index={i} />
        ))}
      </div>

      <div className="text-xs text-sicbo-text-muted tracking-[0.15em]">
        Total:{" "}
        <span
          className="text-[#f0d080] text-2xl font-bold ml-2 inline-block min-w-[3rem] transition-all duration-300"
          aria-live="polite"
        >
          {displayTotal}
        </span>
      </div>
    </div>
  );
}

DiceTray.propTypes = {
  dice: PropTypes.arrayOf(PropTypes.oneOf([1, 2, 3, 4, 5, 6])),
  rolling: PropTypes.bool,
  total: PropTypes.number,
};

DiceTray.defaultProps = {
  dice: [1, 1, 1],
  rolling: false,
  total: null,
};
