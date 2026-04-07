import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bonus, setBonus] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!username || !password) return setError("Please fill in all fields");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/login", {
        username,
        password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Admins go to admin dashboard, players go to game
      const dest = data.user.role === "admin" ? "/admin" : "/game";

      if (data.bonusGranted && data.user.role !== "admin") {
        setBonus({ coins: data.bonusCoins, day: data.streakDay });
        setTimeout(() => {
          window.location.href = dest;
        }, 2500);
      } else {
        window.location.href = dest;
      }
    } catch (err) {
      console.error("Login error:", err.response?.data);
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-sicbo-dark bg-gradient-to-b from-sicbo-gold/5 to-transparent flex items-center justify-center p-5 font-cinzel">
      {/* Daily Bonus Popup */}
      {bonus && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="bg-gradient-to-br from-[#0b2a1a] to-[#0e3522] border-2 border-sicbo-gold rounded-3xl p-12 text-center shadow-[0_0_80px_rgba(201,168,76,0.5)] font-cinzel animate-fadeIn">
            <div className="text-6xl mb-4 animate-bounce">🎁</div>
            <div className="text-sicbo-gold text-xl font-black tracking-[0.2em] mb-3">
              DAILY BONUS!
            </div>
            <div className="text-[#f5e6c8] text-4xl font-black my-4 animate-pulse">
              +{bonus.coins} 🪙
            </div>
            <div className="text-sicbo-text-muted text-sm tracking-[0.15em]">
              🔥 Day {bonus.day} Login Streak
            </div>
            <div className="text-sicbo-text-muted text-xs mt-4 opacity-70">
              Redirecting to game...
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-sicbo-green-dark/90 to-sicbo-green/80 backdrop-blur-md border-2 border-sicbo-gold-dark rounded-3xl p-10 w-full max-w-md text-center shadow-[0_8px_48px_rgba(201,168,76,0.3)] transition-all duration-300 hover:shadow-[0_12px_60px_rgba(201,168,76,0.4)] animate-fadeIn">
        <div className="flex justify-start mb-5">
          <button
            className="bg-transparent border-none text-sicbo-gold-dark font-cinzel text-[0.65rem] tracking-wider cursor-pointer hover:text-sicbo-gold transition-all duration-300 hover:translate-x-[-4px]"
            onClick={() => navigate("/")}
          >
            ← back to demo
          </button>
        </div>
        <h1 className="text-6xl font-black text-sicbo-gold tracking-[0.15em] [text-shadow:0_0_40px_rgba(201,168,76,0.6)] m-0 mb-2 transition-all duration-300 hover:scale-105">
          SIC BO
        </h1>
        <div className="font-noto text-base text-sicbo-text-muted tracking-[0.3em] mt-2">
          骰寶 · DICE TREASURE
        </div>
        <div className="w-48 h-px bg-gradient-to-r from-transparent via-sicbo-gold to-transparent mx-auto my-4" />

        <h2 className="text-xs tracking-[0.25em] text-sicbo-gold/70 mb-6 font-semibold">
          WELCOME BACK
        </h2>

        {error && (
          <div className="bg-red-900/20 border-2 border-red-700/60 text-red-400 rounded-lg px-4 py-3 text-xs mb-4 tracking-wider animate-fadeIn shadow-[0_4px_16px_rgba(192,57,43,0.3)]">
            {error}
          </div>
        )}

        <div className="relative mb-4">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sicbo-gold-dark transition-colors duration-300">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <input
            className="w-full pl-12 pr-4 py-3.5 bg-black/50 border-2 border-sicbo-gold-dark/50 rounded-lg text-sicbo-text font-cinzel text-sm tracking-wider outline-none lowercase focus:border-sicbo-gold focus:bg-black/60 transition-all duration-300 shadow-inner"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            onKeyDown={handleKey}
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
        <div className="relative mb-4">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sicbo-gold-dark transition-colors duration-300">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <input
            className="w-full pl-12 pr-12 py-3.5 bg-black/50 border-2 border-sicbo-gold-dark/50 rounded-lg text-sicbo-text font-cinzel text-sm tracking-wider outline-none focus:border-sicbo-gold focus:bg-black/60 transition-all duration-300 shadow-inner"
            placeholder="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sicbo-gold-dark hover:text-sicbo-gold cursor-pointer bg-transparent border-none p-0 transition-all duration-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>

        <button
          className="w-full py-4 mt-3 bg-gradient-to-r from-sicbo-gold-dark via-sicbo-gold to-sicbo-gold-dark border-none rounded-xl text-sicbo-dark font-cinzel text-sm font-black tracking-[0.2em] cursor-pointer shadow-[0_6px_24px_rgba(201,168,76,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_8px_32px_rgba(201,168,76,0.7)] hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "LOGGING IN..." : "LOGIN"}
        </button>

        <button
          className="mt-5 bg-transparent border-none text-sicbo-text-muted font-cinzel text-[0.7rem] tracking-wider cursor-pointer underline hover:text-sicbo-gold transition-all duration-300"
          onClick={() => navigate("/signup")}
        >
          don't have an account? sign up
        </button>
      </div>
    </div>
  );
}
