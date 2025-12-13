import React from "react";
import { Play, ShoppingBag, Trophy } from "lucide-react";
import { UNICORNS } from "../../utils/storage";
import { UnicornSVG } from "../assets/gameAssets";
import GlobalHeader from "./globalHeader"; // Import the new header

const HomeView = ({
  user,
  userData,
  onPlay,
  onShop,
  onProfile,
  handleLogout,
}) => {
  const currentUnicorn = userData?.equippedUnicorn
    ? UNICORNS.find((u) => u.id === userData.equippedUnicorn)
    : UNICORNS[0];
  const unicornName = currentUnicorn ? currentUnicorn.name : "Companion";

  return (
    <div className="w-full h-screen bg-slate-950 overflow-hidden relative flex flex-col items-center select-none">
      {/* Standard Header */}
      <GlobalHeader
        user={user}
        coins={userData?.coins || 0}
        onProfileClick={onProfile}
      />

      {/* Main Avatar Display */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center mb-8 animate-pop-in relative z-20">
          <h2 className="text-slate-400 text-sm font-bold tracking-[0.2em] uppercase mb-2">
            Current Companion
          </h2>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 drop-shadow-sm">
            {unicornName}
          </h1>
        </div>

        {/* Avatar */}
        <div
          className="w-64 h-64 mb-12 drop-shadow-2xl animate-float relative group cursor-pointer z-20"
          onClick={onShop}
        >
          <UnicornSVG />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-300 text-xs py-1 px-3 rounded-full border border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Tap to Change Skin
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-3 gap-4 w-full px-6 relative z-20">
          <button
            onClick={onProfile}
            className="flex flex-col items-center justify-center gap-2 aspect-square bg-slate-800 rounded-3xl border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all hover:bg-slate-700 text-slate-400 font-bold cursor-pointer hover:text-white hover:border-slate-800"
          >
            <Trophy size={28} />
            <span className="text-xs">PROFILE</span>
          </button>

          <button
            onClick={onPlay}
            className="col-span-1 flex flex-col items-center justify-center gap-2 aspect-square bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-3xl border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] group cursor-pointer hover:brightness-110"
          >
            <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
              <Play size={32} className="text-white fill-current ml-1" />
            </div>
            <span className="text-emerald-950 font-black text-sm tracking-wide">
              PLAY
            </span>
          </button>

          <button
            onClick={onShop}
            className="flex flex-col items-center justify-center gap-2 aspect-square bg-slate-800 rounded-3xl border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all hover:bg-slate-700 text-purple-400 font-bold cursor-pointer hover:text-purple-300 hover:border-slate-800"
          >
            <ShoppingBag size={28} />
            <span className="text-xs">SHOP</span>
          </button>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mb-6 text-slate-600 hover:text-slate-400 text-xs font-bold uppercase tracking-widest z-30 cursor-pointer"
      >
        Log Out
      </button>
    </div>
  );
};

export default HomeView;
