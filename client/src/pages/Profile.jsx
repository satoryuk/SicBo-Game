import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const winRate = profile?.totalRounds
    ? ((profile.totalWins / profile.totalRounds) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-sicbo-dark bg-gradient-to-b from-sicbo-gold/5 to-transparent font-cinzel flex items-center justify-center p-5">
      <div className="bg-gradient-to-br from-sicbo-green-dark to-sicbo-green border-2 border-sicbo-gold-dark rounded-3xl p-9 w-full max-w-md shadow-[0_0_40px_rgba(201,168,76,0.2)]">
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          PROFILE
        </h1>
        <div className="w-52 h-px bg-gradient-to-r from-transparent via-sicbo-gold to-transparent mx-auto my-3.5" />

        {loading ? (
          <div className="text-sicbo-text-muted text-center py-10 tracking-[0.2em]">
            Loading...
          </div>
        ) : profile ? (
          <>
            <div className="text-3xl font-bold text-[#f0d080] text-center mb-7 tracking-wider [text-shadow:0_0_15px_rgba(240,208,128,0.3)]">
              {profile.username}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/30 border border-sicbo-gold-dark rounded-xl p-4 text-center">
                <div className="text-[0.65rem] text-sicbo-text-muted tracking-[0.15em] mb-2 uppercase">
                  Balance
                </div>
                <div className="text-2xl font-bold text-green-500 tracking-wider">
                  ${profile.balance.toLocaleString()}
                </div>
              </div>

              <div className="bg-black/30 border border-sicbo-gold-dark rounded-xl p-4 text-center">
                <div className="text-[0.65rem] text-sicbo-text-muted tracking-[0.15em] mb-2 uppercase">
                  Total Rounds
                </div>
                <div className="text-2xl font-bold text-sicbo-text tracking-wider">
                  {profile.totalRounds}
                </div>
              </div>

              <div className="bg-black/30 border border-sicbo-gold-dark rounded-xl p-4 text-center">
                <div className="text-[0.65rem] text-sicbo-text-muted tracking-[0.15em] mb-2 uppercase">
                  Wins
                </div>
                <div className="text-2xl font-bold text-[#f0d080] tracking-wider">
                  {profile.totalWins}
                </div>
              </div>

              <div className="bg-black/30 border border-sicbo-gold-dark rounded-xl p-4 text-center">
                <div className="text-[0.65rem] text-sicbo-text-muted tracking-[0.15em] mb-2 uppercase">
                  Losses
                </div>
                <div className="text-2xl font-bold text-red-600 tracking-wider">
                  {profile.totalLosses}
                </div>
              </div>

              <div className="col-span-2 bg-black/30 border border-sicbo-gold-dark rounded-xl p-4 text-center">
                <div className="text-[0.65rem] text-sicbo-text-muted tracking-[0.15em] mb-2 uppercase">
                  Win Rate
                </div>
                <div className="text-2xl font-bold text-sicbo-gold tracking-wider">
                  {winRate}%
                </div>
              </div>
            </div>

            <div className="text-[0.65rem] text-sicbo-gold-dark text-center tracking-wider mb-6">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                className="bg-transparent border border-sicbo-gold-dark text-sicbo-text-muted rounded-lg py-2.5 px-5 font-cinzel text-xs tracking-wider cursor-pointer hover:bg-sicbo-gold-dark/20 flex items-center justify-center gap-1.5"
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
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Play Game
              </button>
              <button
                className="bg-transparent border border-sicbo-gold-dark text-sicbo-text-muted rounded-lg py-2.5 px-5 font-cinzel text-xs tracking-wider cursor-pointer hover:bg-sicbo-gold-dark/20 flex items-center justify-center gap-1.5"
                onClick={() => navigate("/leaderboard")}
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
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                Leaderboard
              </button>
              <button
                className="bg-transparent border border-red-600/40 text-red-400 rounded-lg py-2.5 px-5 font-cinzel text-xs tracking-wider cursor-pointer hover:bg-red-600/20"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="text-red-400 text-center py-10 tracking-wider">
            Failed to load profile
          </div>
        )}
      </div>
    </div>
  );
}
