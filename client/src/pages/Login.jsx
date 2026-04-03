import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
      window.location.href = "/game";
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
          welcome back
        </h2>

        {error && (
          <div className="bg-red-900/15 border border-red-700 text-red-400 rounded-lg px-3.5 py-2 text-xs mb-3.5 tracking-wider">
            {error}
          </div>
        )}

        <input
          className="w-full px-4 py-3 mb-3 bg-black/40 border border-sicbo-gold-dark rounded-lg text-sicbo-text font-cinzel text-sm tracking-wider outline-none lowercase"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          onKeyDown={handleKey}
          autoCapitalize="none"
          autoCorrect="off"
        />
        <input
          className="w-full px-4 py-3 mb-3 bg-black/40 border border-sicbo-gold-dark rounded-lg text-sicbo-text font-cinzel text-sm tracking-wider outline-none"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKey}
        />

        <button
          className="w-full py-3.5 mt-2 bg-gradient-to-r from-sicbo-gold-dark via-sicbo-gold to-sicbo-gold-dark border-none rounded-xl text-sicbo-dark font-cinzel text-sm font-black tracking-[0.2em] cursor-pointer shadow-[0_4px_20px_rgba(201,168,76,0.4)] disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "logging in..." : "login"}
        </button>

        <button
          className="mt-4 bg-transparent border-none text-sicbo-text-muted font-cinzel text-[0.65rem] tracking-wider cursor-pointer underline"
          onClick={() => navigate("/signup")}
        >
          don't have an account? sign up
        </button>
      </div>
    </div>
  );
}
