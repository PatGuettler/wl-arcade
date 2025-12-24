import React from "react";
import { UnicornAvatar } from "../../components/assets/gameAssets";

export const PlayerTrack = ({
  levelData,
  windowPos,
  windowSize,
  collectedNodes,
  gameState,
  showHint,
  unicornImage,
  onNodeClick,
  layoutConstants,
}) => {
  const { PADDING, FULL_W, NODE_GAP, NODE_WIDTH } = layoutConstants;

  // Helper to determine highlighting for hints
  const getMaxIndexInWindow = () => {
    const indices = Array.from({ length: windowSize }, (_, i) => windowPos + i);
    let maxVal = -Infinity;
    indices.forEach((i) => {
      if (levelData[i] > maxVal) maxVal = levelData[i];
    });
    return maxVal;
  };

  const maxValInWindow = getMaxIndexInWindow();

  return (
    <div className="flex gap-5 relative" style={{ paddingLeft: PADDING }}>
      {/* Player's Sliding Window Frame */}
      {gameState === "playing" && (
        <>
          <div
            className="absolute top-1/2 -translate-y-1/2 h-40 border-4 border-emerald-500 rounded-2xl transition-all duration-500 ease-out shadow-[0_0_40px_rgba(16,185,129,0.5)] pointer-events-none z-10"
            style={{
              left: PADDING + windowPos * FULL_W - 10,
              width: windowSize * FULL_W - NODE_GAP + 20,
            }}
          />

          {/* Player's Unicorn Avatar */}
          <div
            className="absolute -translate-y-1/2 pointer-events-none z-20 transition-all duration-500 ease-out"
            style={{
              left:
                PADDING + windowPos * FULL_W + (windowSize * FULL_W) / 2 - 40,
              top: "50%",
              marginTop: "-140px",
            }}
          >
            <div className="text-center">
              <div className="w-20 h-20 animate-bounce drop-shadow-2xl">
                <UnicornAvatar image={unicornImage} className="w-full h-full" />
              </div>
              <div className="text-emerald-400 font-black text-xs mt-1 bg-emerald-950/80 px-2 py-1 rounded-full border border-emerald-500">
                YOU
              </div>
            </div>
          </div>
        </>
      )}

      {/* Player Nodes */}
      {levelData.map((val, idx) => {
        let bg = "bg-slate-900 border-slate-700 text-slate-500";
        const isInWindow = idx >= windowPos && idx < windowPos + windowSize;
        const isCollected = collectedNodes.includes(idx);
        const isMax = val === maxValInWindow;
        if (gameState === "playing" && isInWindow) {
          if (showHint && isMax) {
            bg =
              "bg-yellow-500/30 border-yellow-400 text-white shadow-[0_0_20px_rgba(234,179,8,0.4)] animate-pulse";
          } else {
            bg = "bg-slate-800 border-slate-500 text-white";
          }
        }

        return (
          <div
            key={idx}
            onClick={() => onNodeClick(idx)}
            className={`flex-shrink-0 rounded-2xl border-4 flex items-center justify-center text-2xl font-black ${bg} hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer relative`}
            style={{ width: NODE_WIDTH, height: NODE_WIDTH }}
          >
            {val}
          </div>
        );
      })}
    </div>
  );
};
