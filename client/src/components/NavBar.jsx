import { useNavigate, useLocation } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navLinks = isAdmin
    ? [
        { path: "/admin", label: "📊 Dashboard" },
        { path: "/admin/users", label: "👥 Users" },
        { path: "/admin/withdrawals", label: "💸 Withdrawals" },
        { path: "/admin/rounds", label: "🎲 Bets Log" },
        { path: "/admin/transactions", label: "💳 Transactions" },
        { path: "/admin/leaderboard", label: "🏆 Leaderboard" },
        { path: "/admin/suspicious", label: "🚨 Suspicious" },
        { path: "/admin/settings", label: "⚙️ Settings" },
        { path: "/admin/logs", label: "📋 Logs" },
      ]
    : [
        { path: "/game", label: "🎲 Play" },
        { path: "/wallet", label: "💰 Wallet" },
        { path: "/profile", label: "👤 Profile" },
      ];

  return (
    <nav style={s.nav}>
      <div
        style={s.brand}
        onClick={() => navigate(isAdmin ? "/admin" : "/game")}
      >
        <img
          src={`${process.env.PUBLIC_URL}/logo_removebg.png`}
          alt="SIC BO"
          style={s.logo}
        />
        <span style={s.brandText}>SIC BO</span>
        {isAdmin && <span style={s.adminBadge}>ADMIN</span>}
      </div>
      <div style={s.links}>
        {navLinks.map((l) => (
          <button
            key={l.path}
            onClick={() => navigate(l.path)}
            style={{
              ...s.link,
              ...(location.pathname === l.path ? s.linkActive : {}),
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div style={s.right}>
        <span style={s.username}>@{user.username}</span>
        <button style={s.logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const s = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(135deg, #0b1a10, #0e2218)",
    borderBottom: "1px solid #8a6a1f",
    padding: "12px 24px",
    flexWrap: "wrap",
    gap: 10,
    fontFamily: "'Cinzel', serif",
  },
  brand: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  logo: { width: 32, height: 32, objectFit: "contain" },
  brandText: {
    color: "#c9a84c",
    fontWeight: 900,
    fontSize: "1.1rem",
    letterSpacing: "0.15em",
  },
  adminBadge: {
    background: "rgba(192,57,43,0.2)",
    border: "1px solid #c0392b",
    color: "#ff6655",
    fontSize: "0.55rem",
    padding: "2px 8px",
    borderRadius: 20,
    letterSpacing: "0.15em",
  },
  links: { display: "flex", gap: 4, flexWrap: "wrap" },
  link: {
    background: "none",
    border: "1px solid transparent",
    borderRadius: 6,
    color: "#a08050",
    fontFamily: "'Cinzel', serif",
    fontSize: "0.65rem",
    letterSpacing: "0.08em",
    cursor: "pointer",
    padding: "6px 12px",
  },
  linkActive: {
    borderColor: "#8a6a1f",
    color: "#f0d080",
    background: "rgba(201,168,76,0.1)",
  },
  right: { display: "flex", alignItems: "center", gap: 10 },
  username: { color: "#a08050", fontSize: "0.7rem", letterSpacing: "0.1em" },
  logoutBtn: {
    background: "none",
    border: "1px solid rgba(255,100,80,0.3)",
    borderRadius: 6,
    color: "rgba(255,100,80,0.7)",
    fontFamily: "'Cinzel', serif",
    fontSize: "0.6rem",
    cursor: "pointer",
    padding: "5px 10px",
  },
};
