import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  return (
    <div className="flex h-screen overflow-hidden bg-sicbo-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#0b1a10] to-[#0e2218] border-b-2 border-sicbo-gold-dark/50 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sicbo-gold text-2xl font-black tracking-[0.15em] [text-shadow:0_0_20px_rgba(201,168,76,0.5)]">
                SIC BO
              </div>
              <div className="text-sicbo-text-muted text-[0.6rem] tracking-[0.2em] font-noto">
                骰寶 · DICE TREASURE
              </div>
            </div>
            {isAdmin && (
              <div className="bg-red-900/20 border border-red-700/50 text-red-400 text-[0.6rem] px-3 py-1 rounded-full tracking-wider font-semibold">
                ADMIN
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sicbo-gold/70 text-[0.65rem] tracking-wider">
              LOGGED IN AS
            </div>
            <div className="text-sicbo-text text-sm tracking-wide font-semibold">
              @{user.username}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
