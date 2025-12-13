import React from "react";

const UnicornTutorial = ({ fromNode, toNode, jumpDistance }) => {
  if (!fromNode || !toNode) return null;

  const cpX = (fromNode.x + toNode.x) / 2 + 50;
  const cpY = (fromNode.y + toNode.y) / 2;

  return (
    <>
      <div
        className="absolute w-48 text-center pointer-events-none animate-bounce z-50"
        style={{
          left: fromNode.x - 96,
          top: fromNode.y - 140,
        }}
      >
        <div className="bg-slate-900/90 text-cyan-400 border border-cyan-500/50 p-3 rounded-xl shadow-xl text-sm font-bold mb-2">
          Current Number:{" "}
          <span className="text-white text-lg">{jumpDistance}</span>
        </div>
        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-cyan-500 mx-auto opacity-80" />
      </div>
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-40">
        <path
          d={`M ${fromNode.x} ${fromNode.y} Q ${cpX} ${cpY} ${toNode.x} ${toNode.y}`}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="4"
          strokeDasharray="10 5"
          className="animate-pulse opacity-60"
        />
      </svg>
      <div
        className="absolute w-48 text-center pointer-events-none z-50"
        style={{
          left: toNode.x - 96,
          top: toNode.y + 50,
        }}
      >
        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-emerald-500 mx-auto opacity-80 mb-2" />
        <div className="bg-emerald-900/90 text-emerald-100 border border-emerald-500 p-3 rounded-xl shadow-xl text-sm font-bold animate-pulse">
          Click Here!
          <div className="text-xs text-emerald-400 font-normal mt-1">
            (Exactly {jumpDistance} spots away)
          </div>
        </div>
      </div>
    </>
  );
};

export default UnicornTutorial;
