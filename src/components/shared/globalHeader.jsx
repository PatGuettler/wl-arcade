import React from "react";
import { User as UserIcon, ArrowLeft, Home } from "lucide-react";

const GlobalHeader = ({
  user,
  coins = 0,
  onProfileClick,
  onBack,
  onHome, // NEW: Handler for Home button
  isSubScreen = false,
  title,
}) => {
  return (
    <div className="w-full p-4 flex justify-between items-center z-30 bg-slate-900/50 backdrop-blur-md border-b border-white/10 h-20 shrink-0">
      <div className="flex items-center gap-4">
        {isSubScreen ? (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 group"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          </button>
        ) : (
          <button
            onClick={onProfileClick}
            className="flex items-center gap-3 text-left hover:bg-white/10 p-2 -ml-2 rounded-2xl transition-all active:scale-95 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 group-hover:border-white/40 transition-colors">
              <UserIcon size={20} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider group-hover:text-cyan-300">
                Player
              </div>
              <div className="text-white font-black text-lg leading-none">
                {user}
              </div>
            </div>
          </button>
        )}

        {isSubScreen && title && (
          <h1 className="text-xl font-black text-white">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* NEW: Home Button (Only visible on sub-screens) */}
        {isSubScreen && (
          <button
            onClick={onHome}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
            title="Return Home"
          >
            <Home size={24} />
          </button>
        )}

        {/* Coin Display */}
        <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-full px-4 py-1 flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          <div className="text-xl">🪙</div>
          <div className="text-yellow-400 font-black text-xl">
            {coins.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalHeader;
