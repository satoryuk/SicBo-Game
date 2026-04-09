import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
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
        { path: "/admin", label: "Dashboard", icon: "📊" },
        { path: "/admin/users", label: "Users", icon: "👥" },
        { path: "/admin/withdrawals", label: "Withdrawals", icon: "💸" },
        { path: "/admin/rounds", label: "Bets Log", icon: "🎲" },
        { path: "/admin/transactions", label: "Transactions", icon: "💳" },
        { path: "/admin/leaderboard", label: "Leaderboard", icon: "🏆" },
        { path: "/admin/suspicious", label: "Suspicious", icon: "🚨" },
        { path: "/admin/settings", label: "Settings", icon: "⚙️" },
        { path: "/admin/logs", label: "Logs", icon: "📋" },
      ]
    : [
        { path: "/game", label: "Play", icon: "🎲" },
        { path: "/wallet", label: "Wallet", icon: "💰" },
        { path: "/profile", label: "Profile", icon: "👤" },
      ];

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-[#0b1a10] to-[#0e2218] border-r-2 border-sicbo-gold-dark/50 flex flex-col font-cinzel">
      {/* Logo Only */}
      <div
        className="p-6 border-b border-sicbo-gold-dark/30 cursor-pointer hover:bg-sicbo-gold/5 transition-all duration-300 flex justify-center"
        onClick={() => navigate(isAdmin ? "/admin" : "/game")}
      >
        <img
          src={`${process.env.PUBLIC_URL}/logo_removebg.png`}
          alt="SIC BO"
          className="w-20 h-auto object-contain"
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4">
        {navLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`w-full px-6 py-3 flex items-center gap-3 text-left font-cinzel text-sm tracking-wide transition-all duration-300 border-l-4 ${
              location.pathname === link.path
                ? "border-sicbo-gold bg-sicbo-gold/15 text-sicbo-gold shadow-[inset_0_0_20px_rgba(201,168,76,0.1)]"
                : "border-transparent text-sicbo-text-muted hover:bg-sicbo-gold/5 hover:border-sicbo-gold-dark hover:text-sicbo-text"
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sicbo-gold-dark/30">
        <button
          onClick={logout}
          className="w-full px-4 py-3 bg-transparent border-2 border-red-600/40 text-red-400/80 rounded-lg font-cinzel text-xs tracking-wider hover:bg-red-600/20 hover:border-red-600 hover:text-red-400 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
