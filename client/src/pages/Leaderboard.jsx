import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    api
      .get("/api/leaderboard", { headers })
      .then(({ data }) => {
        setPlayers(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [token]);

  const MEDAL = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-sicbo-dark bg-gradient-to-b from-sicbo-gold/5 to-transparent font-cinzel flex items-center justify-center p-5">
      <div className="bg-gradient-to-br from-sicbo-green-dark to-sicbo-green border-2 border-sicbo-gold-dark rounded-3xl p-9 w-full max-w-xl shadow-[0_0_40px_rgba(201,168,76,0.2)]">
        <h1 className="text-2xl font-black text-sicbo-gold tracking-[0.15em] text-center m-0 [text-shadow:0_0_20px_rgba(201,168,76,0.4)] flex items-center justify-center gap-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
          LEADERBOARD
        </h1>
        <div className="w-52 h-px bg-gradient-to-r from-transparent via-sicbo-gold to-transparent mx-auto my-3.5 mb-6" />

        {loading ? (
          <div className="text-sicbo-text-muted text-center py-10 tracking-[0.2em]">
            Loading...
          </div>
        ) : (
          <table className="w-full border-collapse text-xs tracking-wider mb-6">
            <thead>
              <tr>
                {["#", "Player", "Balance", "Wins", "Rounds"].map((h) => (
                  <th
                    key={h}
                    className="text-sicbo-gold border-b border-sicbo-gold-dark py-2 px-2.5 text-left font-bold text-[0.65rem] tracking-[0.15em]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p._id} className="border-b border-sicbo-gold/5">
                  <td className="text-sicbo-text-muted py-2.5 px-2.5">
                    {MEDAL[i] ?? i + 1}
                  </td>
                  <td className="text-[#f0d080] font-bold py-2.5 px-2.5">
                    {p.username}
                  </td>
                  <td className="text-green-600 py-2.5 px-2.5">
                    ${p.balance.toLocaleString()}
                  </td>
                  <td className="text-sicbo-text-muted py-2.5 px-2.5">
                    {p.totalWins}
                  </td>
                  <td className="text-sicbo-text-muted py-2.5 px-2.5">
                    {p.totalRounds}
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-sicbo-text-muted text-center py-8"
                  >
                    No players yet. Be the first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="flex flex-col gap-2.5">
          {token ? (
            <div className="flex gap-2.5">
              <button
                className="flex-1 bg-transparent border border-sicbo-gold-dark text-sicbo-text-muted rounded-lg py-2.5 px-5 font-cinzel text-[0.7rem] tracking-wider cursor-pointer hover:bg-sicbo-gold-dark/20 flex items-center justify-center gap-1.5"
                onClick={() => navigate("/game")}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Game
              </button>
              <button
                className="flex-1 bg-transparent border border-sicbo-gold-dark text-sicbo-text-muted rounded-lg py-2.5 px-5 font-cinzel text-[0.7rem] tracking-wider cursor-pointer hover:bg-sicbo-gold-dark/20 flex items-center justify-center gap-1.5"
                onClick={() => navigate("/profile")}
              >
                <svg
                  className="w-3.5 h-3.5"
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
                Profile
              </button>
            </div>
          ) : (
            <>
              <button
                className="bg-transparent border border-sicbo-gold-dark text-sicbo-text-muted rounded-lg py-2.5 px-5 font-cinzel text-[0.7rem] tracking-wider cursor-pointer hover:bg-sicbo-gold-dark/20 flex items-center justify-center gap-1.5"
                onClick={() => navigate("/")}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Home
              </button>
              <button
                className="bg-gradient-to-r from-sicbo-gold-dark to-sicbo-gold border-none text-sicbo-dark rounded-lg py-2.5 px-5 font-cinzel text-xs font-bold tracking-wider cursor-pointer hover:opacity-90"
                onClick={() => navigate("/signup")}
              >
                Join the Competition
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
