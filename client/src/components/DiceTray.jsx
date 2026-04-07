import React from "react";

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

  const S = 82;           // face size px
  const H = S / 2;        // half = translateZ offset
  const f = adj[value] || { front: 2, right: 3 };

  /* Compute all 6 face values (opposite faces sum to 7) */
  const top    = value;
  const bottom = 7 - value;
  const front  = f.front;
  const back   = 7 - f.front;
  const right  = f.right;
  const left   = 7 - f.right;

  /* shared style for every face — backface-visibility prevents overlap glitches */
  const faceWrap = (transform) => ({
    position: "absolute", width: S, height: S,
    transform,
    transformStyle: "preserve-3d",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  });

  /* isometric-ish resting angle */
  const restTransform = `rotateX(-30deg) rotateY(45deg)`;

  return (
    /* outer wrapper — gives the component a fixed box in the flow */
    <div className={rolling ? "" : "dice-idle"} style={{ width: S + 30, height: S + 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
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

        /* rolling animations — each die has unique timing */
        .dice-roll-0 { animation: droll0 2.2s cubic-bezier(.33,.1,.3,1) forwards; transform-style:preserve-3d; }
        .dice-roll-1 { animation: droll1 2.3s cubic-bezier(.33,.1,.3,1) forwards; transform-style:preserve-3d; }
        .dice-roll-2 { animation: droll2 2.4s cubic-bezier(.33,.1,.3,1) forwards; transform-style:preserve-3d; }

        @keyframes droll0 {
          0%   { transform: rotateX(-30deg)  rotateY(45deg)   rotateZ(0deg)   translateY(0);     }
          8%   { transform: rotateX(120deg)  rotateY(200deg)  rotateZ(80deg)  translateY(-65px) scale(1.18); }
          20%  { transform: rotateX(300deg)  rotateY(400deg)  rotateZ(170deg) translateY(-50px) scale(.96);  }
          35%  { transform: rotateX(540deg)  rotateY(600deg)  rotateZ(280deg) translateY(-58px) scale(1.12); }
          50%  { transform: rotateX(780deg)  rotateY(820deg)  rotateZ(400deg) translateY(-45px) scale(1.06); }
          65%  { transform: rotateX(1020deg) rotateY(1060deg) rotateZ(520deg) translateY(-35px) scale(1);    }
          80%  { transform: rotateX(1220deg) rotateY(1260deg) rotateZ(620deg) translateY(-18px) scale(1);    }
          92%  { transform: rotateX(1350deg) rotateY(1400deg) rotateZ(700deg) translateY(-6px)  scale(1);    }
          100% { transform: rotateX(-30deg)  rotateY(45deg)   rotateZ(0deg)   translateY(0)     scale(1);    }
        }
        @keyframes droll1 {
          0%   { transform: rotateX(-30deg)  rotateY(45deg)   rotateZ(0deg)   translateY(0);     }
          10%  { transform: rotateX(150deg)  rotateY(170deg)  rotateZ(100deg) translateY(-60px) scale(1.2);  }
          22%  { transform: rotateX(340deg)  rotateY(370deg)  rotateZ(200deg) translateY(-55px) scale(.94);  }
          36%  { transform: rotateX(560deg)  rotateY(580deg)  rotateZ(310deg) translateY(-62px) scale(1.1);  }
          50%  { transform: rotateX(800deg)  rotateY(840deg)  rotateZ(430deg) translateY(-48px) scale(1.04); }
          65%  { transform: rotateX(1050deg) rotateY(1100deg) rotateZ(560deg) translateY(-32px) scale(1);    }
          80%  { transform: rotateX(1260deg) rotateY(1300deg) rotateZ(670deg) translateY(-14px) scale(1);    }
          92%  { transform: rotateX(1380deg) rotateY(1420deg) rotateZ(740deg) translateY(-4px)  scale(1);    }
          100% { transform: rotateX(-30deg)  rotateY(45deg)   rotateZ(0deg)   translateY(0)     scale(1);    }
        }
        @keyframes droll2 {
          0%   { transform: rotateX(-30deg)  rotateY(45deg)   rotateZ(0deg)   translateY(0);     }
          12%  { transform: rotateX(180deg)  rotateY(140deg)  rotateZ(130deg) translateY(-72px) scale(1.22); }
          24%  { transform: rotateX(380deg)  rotateY(330deg)  rotateZ(240deg) translateY(-58px) scale(.93);  }
          38%  { transform: rotateX(600deg)  rotateY(550deg)  rotateZ(350deg) translateY(-64px) scale(1.14); }
          52%  { transform: rotateX(850deg)  rotateY(800deg)  rotateZ(470deg) translateY(-50px) scale(1.06); }
          66%  { transform: rotateX(1100deg) rotateY(1060deg) rotateZ(590deg) translateY(-36px) scale(1);    }
          80%  { transform: rotateX(1300deg) rotateY(1260deg) rotateZ(700deg) translateY(-20px) scale(1);    }
          92%  { transform: rotateX(1420deg) rotateY(1380deg) rotateZ(780deg) translateY(-6px)  scale(1);    }
          100% { transform: rotateX(-30deg)  rotateY(45deg)   rotateZ(0deg)   translateY(0)     scale(1);    }
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
          perspective: 600,
          perspectiveOrigin: "50% 40%",
          transformStyle: "preserve-3d",
          minHeight: 140,
          padding: "20px 0 10px",
        }}
      >
        {dice.map((v, i) => (
          <Die key={i} value={v} rolling={rolling} index={i} />
        ))}
      </div>

      <div className="text-xs text-sicbo-text-muted tracking-[0.15em]">
        Total:{" "}
        <span className="text-[#f0d080] text-2xl font-bold ml-2 inline-block min-w-[3rem] transition-all duration-300">
          {total ?? "—"}
        </span>
      </div>
    </div>
  );
}
