import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!username || !password) return setError("Please fill in all fields");
    if (password.length < 6)
      return setError("Password must be at least 6 characters");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/register", {
        username,
        password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/game";
    } catch (err) {
      console.error("Signup error:", err.response?.data);
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-sicbo-dark bg-gradient-to-b from-sicbo-gold/5 to-transparent flex items-center justify-center p-5 font-cinzel">
      <div className="bg-gradient-to-br from-sicbo-green-dark to-sicbo-green border-2 border-sicbo-gold-dark rounded-3xl p-10 w-full max-w-sm text-center shadow-[0_0_40px_rgba(201,168,76,0.2)]">
        <div className="flex justify-start mb-4">
          <button
            className="bg-transparent border-none text-sicbo-gold-dark font-cinzel text-[0.6rem] tracking-wider cursor-pointer hover:text-sicbo-gold"
            onClick={() => navigate("/")}
          >
            ← back to demo
          </button>
        </div>
        <h1 className="text-5xl font-black text-sicbo-gold tracking-[0.15em] [text-shadow:0_0_30px_rgba(201,168,76,0.5)] m-0">
          SIC BO
        </h1>
        <div className="font-noto text-sm text-sicbo-text-muted tracking-[0.3em] mt-1.5">
          骰寶 · DICE TREASURE
        </div>
        <div className="w-40 h-px bg-gradient-to-r from-transparent via-sicbo-gold to-transparent mx-auto my-3" />

        <h2 className="text-xs tracking-[0.25em] text-sicbo-text-muted mb-5 font-normal">
          create account
        </h2>

        {error && (
          <div className="bg-red-900/15 border border-red-700 text-red-400 rounded-lg px-3.5 py-2 text-xs mb-3.5 tracking-wider">
            {error}
          </div>
        )}

        <div className="relative mb-3">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sicbo-gold-dark">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <input
            className="w-full pl-11 pr-4 py-3 bg-black/40 border border-sicbo-gold-dark rounded-lg text-sicbo-text font-cinzel text-sm tracking-wider outline-none lowercase focus:border-sicbo-gold"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            onKeyDown={handleKey}
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
        <div className="relative mb-3">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sicbo-gold-dark">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <input
            className="w-full pl-11 pr-12 py-3 bg-black/40 border border-sicbo-gold-dark rounded-lg text-sicbo-text font-cinzel text-sm tracking-wider outline-none focus:border-sicbo-gold"
            placeholder="password (min 6 characters)"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sicbo-gold-dark hover:text-sicbo-gold cursor-pointer bg-transparent border-none p-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
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
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
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
          className="w-full py-3.5 mt-2 bg-gradient-to-r from-sicbo-gold-dark via-sicbo-gold to-sicbo-gold-dark border-none rounded-xl text-sicbo-dark font-cinzel text-sm font-black tracking-[0.2em] cursor-pointer shadow-[0_4px_20px_rgba(201,168,76,0.4)] disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "creating account..." : "create account"}
        </button>

        <button
          className="mt-4 bg-transparent border-none text-sicbo-text-muted font-cinzel text-[0.65rem] tracking-wider cursor-pointer underline"
          onClick={() => navigate("/login")}
        >
          already have an account? login
        </button>
      </div>
    </div>
  );
}
