export const C = {
  gold: "#c9a84c",
  goldLight: "#f0d080",
  goldDark: "#8a6a1f",
  red: "#c0392b",
  redDark: "#7b1e14",
  green: "#27ae60",
  bgDark: "#0d0d0d",
  bgTable: "#0b2a1a",
  bgFelt: "#0e3522",
  textLight: "#f5e6c8",
  textDim: "#a08050",
};

export const card = {
  background: "linear-gradient(135deg, #0b2a1a, #0e3522)",
  border: "2px solid #8a6a1f",
  borderRadius: 16,
  padding: "24px 20px",
  boxShadow: "0 0 30px rgba(201,168,76,0.15)",
};

export const page = {
  minHeight: "100vh",
  background: "#0d0d0d",
  backgroundImage:
    "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)",
  fontFamily: "'Cinzel', serif",
  color: "#f5e6c8",
  padding: "30px 40px 60px",
};

export const btn = {
  primary: {
    background: "linear-gradient(135deg, #8a6a1f, #c9a84c, #8a6a1f)",
    border: "none",
    borderRadius: 8,
    color: "#0d0d0d",
    fontFamily: "'Cinzel', serif",
    fontWeight: 700,
    letterSpacing: "0.1em",
    cursor: "pointer",
    padding: "10px 20px",
    fontSize: "0.8rem",
  },
  danger: {
    background: "rgba(192,57,43,0.15)",
    border: "1px solid #c0392b",
    borderRadius: 8,
    color: "#ff6655",
    fontFamily: "'Cinzel', serif",
    cursor: "pointer",
    padding: "8px 16px",
    fontSize: "0.75rem",
  },
  ghost: {
    background: "none",
    border: "1px solid #8a6a1f",
    borderRadius: 8,
    color: "#a08050",
    fontFamily: "'Cinzel', serif",
    cursor: "pointer",
    padding: "8px 16px",
    fontSize: "0.75rem",
  },
  success: {
    background: "rgba(39,174,96,0.15)",
    border: "1px solid #27ae60",
    borderRadius: 8,
    color: "#27ae60",
    fontFamily: "'Cinzel', serif",
    cursor: "pointer",
    padding: "8px 16px",
    fontSize: "0.75rem",
  },
};

export const input = {
  width: "100%",
  padding: "10px 14px",
  background: "rgba(0,0,0,0.4)",
  border: "1px solid #8a6a1f",
  borderRadius: 8,
  color: "#f5e6c8",
  fontFamily: "'Cinzel', serif",
  fontSize: "0.85rem",
  outline: "none",
  boxSizing: "border-box",
  marginBottom: 10,
};

export const table = {
  wrap: { width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" },
  th: {
    color: "#c9a84c",
    borderBottom: "1px solid #8a6a1f",
    padding: "8px 10px",
    textAlign: "left",
  },
  td: {
    color: "#a08050",
    padding: "8px 10px",
    borderBottom: "1px solid rgba(201,168,76,0.08)",
  },
};
