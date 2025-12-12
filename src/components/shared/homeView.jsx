import React from "react";
import { Play, ShoppingBag, Trophy, User as UserIcon } from "lucide-react";
import { UNICORNS } from "../../utils/storage";
import { UnicornSVG } from "../assets/gameAssets";

const HomeView = ({
  user,
  userData,
  onPlay,
  onShop,
  onProfile,
  handleLogout,
}) => {
  // Find the user's equipped unicorn object to get the name/desc if needed
  const currentUnicorn =
    UNICORNS.find((u) => u.id === userData.equippedUnicorn) || UNICORNS[0];

  return (
    <div className="w-full h-screen bg-slate-950 overflow-hidden relative flex flex-col items-center">
      {/* Top Bar */}
      <div className="w-full p-4 flex justify-between items-center z-20 bg-slate-900/50 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
            <UserIcon size={20} className="text-white" />
          </div>
          <div>
            <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
              Player
            </div>
            <div className="text-white font-black text-lg leading-none">
              {user}
            </div>
          </div>
        </div>

        {/* Coin Display */}
        <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-full px-4 py-1 flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          <div className="text-xl">🪙</div>
          <div className="text-yellow-400 font-black text-xl">
            {userData.coins.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Avatar Display */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md relative z-10">
        {/* "Stage" Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />

        <div className="text-center mb-8 animate-pop-in">
          <h2 className="text-slate-400 text-sm font-bold tracking-[0.2em] uppercase mb-2">
            Current Companion
          </h2>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 drop-shadow-sm">
            {currentUnicorn.name}
          </h1>
        </div>

        {/* Avatar */}
        <div
          className="w-64 h-64 mb-12 drop-shadow-2xl animate-float relative group cursor-pointer"
          onClick={onShop}
        >
          <UnicornSVG />{" "}
          {/* You might want to pass props to UnicornSVG to change colors based on ID */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-300 text-xs py-1 px-3 rounded-full border border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Change Skin
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-3 gap-4 w-full px-6">
          <button
            onClick={onProfile}
            className="flex flex-col items-center justify-center gap-2 aspect-square bg-slate-800 rounded-3xl border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all hover:bg-slate-700 text-slate-400 font-bold"
          >
            <Trophy size={28} />
            <span className="text-xs">PROFILE</span>
          </button>

          <button
            onClick={onPlay}
            className="col-span-1 flex flex-col items-center justify-center gap-2 aspect-square bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-3xl border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] group"
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
            className="flex flex-col items-center justify-center gap-2 aspect-square bg-slate-800 rounded-3xl border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all hover:bg-slate-700 text-purple-400 font-bold"
          >
            <ShoppingBag size={28} />
            <span className="text-xs">SHOP</span>
          </button>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mb-6 text-slate-600 hover:text-slate-400 text-xs font-bold uppercase tracking-widest"
      >
        Log Out
      </button>
    </div>
  );
};

export default HomeView;
