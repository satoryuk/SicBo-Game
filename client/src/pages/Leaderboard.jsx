import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const MEDAL = ["🥇", "🥈", "🥉"];
const RANK_COLORS = {
  Bronze: "#cd7f32",
  Silver: "#c0c0c0",
  Gold: "#c9a84c",
  VIP: "#9b59b6",
};

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [sortBy, setSortBy] = useState("coins");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/leaderboard?by=${sortBy}`)
      .then(({ data }) => {
        setPlayers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [sortBy]);

  const sortOptions = useMemo(
    () => [
      ["coins", "💰 Richest"],
      ["wins", "🎯 Most Wins"],
      ["rounds", "🎲 Most Rounds"],
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-sicbo-dark bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,168,76,0.08)_0%,transparent_60%)] font-cinzel text-sicbo-text p-8 pb-16">
      <div className="flex flex-col gap-4">
        <h2 className="text-sicbo-gold tracking-[0.15em] m-0 text-center text-2xl font-bold">
          🏆 LEADERBOARD
        </h2>

        {/* Sort tabs */}
        <div className="flex gap-2 justify-center">
          {sortOptions.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`bg-transparent border rounded-lg font-cinzel text-[0.7rem] cursor-pointer px-3 py-2 transition-all duration-300 ${
                sortBy === key
                  ? "border-sicbo-gold text-sicbo-gold bg-sicbo-gold/10"
                  : "border-sicbo-gold-dark text-sicbo-text-muted hover:border-sicbo-gold-dark/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-gradient-to-br from-sicbo-green-dark to-sicbo-green border-2 border-sicbo-gold-dark rounded-2xl p-6 shadow-[0_0_30px_rgba(201,168,76,0.15)]">
          {loading ? (
            <div className="text-center p-10 text-sicbo-text-muted">
              Loading...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    {["#", "Player", "Rank", "Coins", "Wins", "Rounds"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-sicbo-gold border-b border-sicbo-gold-dark p-2 px-2.5 text-left"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => (
                    <tr key={p._id}>
                      <td className="text-sicbo-text-muted p-2 px-2.5 border-b border-sicbo-gold-dark/10 text-lg">
                        {MEDAL[i] ?? i + 1}
                      </td>
                      <td className="text-[#f0d080] p-2 px-2.5 border-b border-sicbo-gold-dark/10 font-bold">
                        {p.username}
                      </td>
                      <td
                        className="p-2 px-2.5 border-b border-sicbo-gold-dark/10 text-[0.65rem] font-bold"
                        style={{ color: RANK_COLORS[p.rank] || "#a08050" }}
                      >
                        {p.rank}
                      </td>
                      <td className="text-sicbo-gold p-2 px-2.5 border-b border-sicbo-gold-dark/10">
                        🪙 {p.coins?.toLocaleString()}
                      </td>
                      <td className="text-[#27ae60] p-2 px-2.5 border-b border-sicbo-gold-dark/10">
                        {p.totalWins}
                      </td>
                      <td className="text-sicbo-text-muted p-2 px-2.5 border-b border-sicbo-gold-dark/10">
                        {p.totalRounds}
                      </td>
                    </tr>
                  ))}
                  {players.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-sicbo-text-muted p-8 border-b border-sicbo-gold-dark/10 text-center"
                      >
                        No players yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
