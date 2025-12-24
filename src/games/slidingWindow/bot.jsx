import React from "react";

export const OpponentTrack = ({
  levelData,
  windowPos,
  windowSize,
  collectedNodes,
  gameState,
  layoutConstants,
}) => {
  const { PADDING, FULL_W, NODE_GAP, ROW_GAP, NODE_WIDTH } = layoutConstants;

  return (
    <div
      className="flex gap-5 relative"
      style={{ paddingLeft: PADDING, marginTop: ROW_GAP }}
    >
      {/* Opponent's Sliding Window Frame */}
      {gameState === "playing" && (
        <>
          <div
            className="absolute top-1/2 -translate-y-1/2 h-40 border-4 border-rose-500 rounded-2xl transition-all duration-500 ease-out shadow-[0_0_40px_rgba(239,68,68,0.5)] pointer-events-none z-10"
            style={{
              left: PADDING + windowPos * FULL_W - 10,
              width: windowSize * FULL_W - NODE_GAP + 20,
            }}
          />

          {/* Opponent Rival Avatar */}
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
              <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-red-600 rounded-full flex items-center justify-center text-3xl animate-bounce drop-shadow-2xl border-4 border-rose-300">
                👾
              </div>
              <div className="text-rose-400 font-black text-xs mt-1 bg-rose-950/80 px-2 py-1 rounded-full border border-rose-500">
                RIVAL
              </div>
            </div>
          </div>
        </>
      )}

      {/* Opponent Nodes */}
      {levelData.map((val, idx) => {
        let bg = "bg-slate-900 border-slate-700 text-slate-500";
        const isInWindow = idx >= windowPos && idx < windowPos + windowSize;
        const isCollected = collectedNodes.includes(idx);

        if (isCollected) {
          bg = "bg-rose-900/50 border-rose-600 text-rose-300";
        } else if (gameState === "playing" && isInWindow) {
          bg = "bg-rose-900/30 border-rose-700 text-slate-400";
        }

        return (
          <div
            key={idx}
            className={`flex-shrink-0 rounded-2xl border-4 flex items-center justify-center text-2xl font-black ${bg} transition-all duration-200 pointer-events-none`}
            style={{ width: NODE_WIDTH, height: NODE_WIDTH }}
          >
            {val}
            {isCollected && (
              <div className="absolute -top-8 text-3xl animate-bounce pointer-events-none">
                💀
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
