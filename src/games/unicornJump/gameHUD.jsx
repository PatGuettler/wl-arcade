import React from "react";
import { Timer, HelpCircle } from "lucide-react";

const GameHUD = ({
  level,
  elapsedTime,
  gameState,
  coins,
  onBuyHint,
  showHint,
  visitedIndices,
  hintCost,
}) => {
  const formatTime = (ms) => (ms / 1000).toFixed(2);
  const isTutorialPhase = level === 1 && visitedIndices.length <= 2;

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-none">
      <div className="bg-slate-900/80 backdrop-blur px-6 py-2 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto flex items-center gap-4">
        <div>
          <div className="text-cyan-400 text-[10px] font-bold tracking-widest uppercase leading-none mb-1">
            Unicorn Jump
          </div>
          <div className="text-xl font-bold flex items-center gap-4 leading-none">
            <span>Lvl {level}</span>
            <div className="flex items-center gap-2 text-slate-400 font-mono border-l border-slate-700 pl-4 ml-2">
              <Timer size={16} /> {formatTime(elapsedTime)}s
            </div>
          </div>
        </div>
      </div>

      {gameState === "playing" && (
        <button
          onClick={onBuyHint}
          disabled={coins < hintCost || showHint || isTutorialPhase}
          className={`
               pointer-events-auto px-4 py-2 rounded-xl font-bold flex items-center gap-2 border-2 transition-all shadow-xl h-full
               ${
                 coins >= hintCost && !showHint && !isTutorialPhase
                   ? "bg-slate-900/80 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-slate-900"
                   : "bg-slate-900/80 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed"
               }
             `}
        >
          <HelpCircle size={20} />
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] font-black uppercase">HINT</span>
            <span className="text-sm">{hintCost} 🪙</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default GameHUD;
