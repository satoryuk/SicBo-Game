import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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
      <div style={s.topRow}>
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

        {/* Desktop nav links */}
        {!isMobile && (
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
        )}

        <div style={s.right}>
          <span style={s.username}>@{user.username}</span>
          <button style={s.logoutBtn} onClick={logout}>
            Logout
          </button>
          {/* Hamburger button - mobile only */}
          {isMobile && (
            <button
              style={s.hamburger}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <div style={{
                ...s.hamburgerLine,
                transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
              }} />
              <div style={{
                ...s.hamburgerLine,
                opacity: menuOpen ? 0 : 1,
              }} />
              <div style={{
                ...s.hamburgerLine,
                transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
              }} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={s.mobileMenu}>
          {navLinks.map((l) => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              style={{
                ...s.mobileLink,
                ...(location.pathname === l.path ? s.mobileLinkActive : {}),
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

const s = {
  nav: {
    background: "linear-gradient(135deg, #0b1a10, #0e2218)",
    borderBottom: "1px solid #8a6a1f",
    fontFamily: "'Cinzel', serif",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    gap: 8,
  },
  brand: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 },
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
  right: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  username: { color: "#a08050", fontSize: "0.65rem", letterSpacing: "0.08em", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
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
  hamburger: {
    background: "none",
    border: "1px solid rgba(201,168,76,0.3)",
    borderRadius: 6,
    cursor: "pointer",
    padding: "6px 5px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
  },
  hamburgerLine: {
    width: 18,
    height: 2,
    background: "#c9a84c",
    borderRadius: 2,
    transition: "all 0.3s ease",
  },
  mobileMenu: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 16px 16px",
    gap: 2,
    borderTop: "1px solid rgba(138,106,31,0.3)",
    animation: "fadeIn 0.2s ease-out",
  },
  mobileLink: {
    background: "none",
    border: "none",
    borderRadius: 8,
    color: "#a08050",
    fontFamily: "'Cinzel', serif",
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    cursor: "pointer",
    padding: "10px 16px",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  mobileLinkActive: {
    color: "#f0d080",
    background: "rgba(201,168,76,0.1)",
    borderLeft: "3px solid #c9a84c",
  },
};
