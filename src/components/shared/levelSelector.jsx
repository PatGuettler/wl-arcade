import React from 'react';
import { ArrowLeft, Lock } from 'lucide-react';

const LevelSelector = ({ title, maxLevel, totalLevels, onSelectLevel, onBack, bestTimes }) => {
  <div className="w-full h-full bg-slate-950 p-6 overflow-y-auto animate-fade-in">
    <div className="max-w-md mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={18} /> Back
      </button>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white mb-2">{title}</h1>
        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">Select a Level</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: totalLevels }, (_, i) => {
          const lvl = i + 1;
          const locked = lvl > maxLevel;
          const completed = lvl < maxLevel;
          return (
            <button key={lvl} disabled={locked} onClick={() => onSelectLevel(lvl)}
              className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition-all ${locked ? 'bg-slate-900 border-slate-800 text-slate-700' : 'bg-slate-800 border-emerald-500 text-emerald-400 hover:scale-105'}`}
            >
              {locked ? <Lock size={20} /> : <><span className="text-2xl font-black">{lvl}</span>{bestTimes[lvl] && <span className="text-[10px] font-mono mt-1 text-slate-400">{bestTimes[lvl].toFixed(1)}s</span>}{completed && <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />}</>}
            </button>
          );
        })}
      </div>
    </div>
  </div>
};

export default LevelSelector;