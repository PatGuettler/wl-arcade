import React, { useState, useEffect, useRef } from "react";
import { Timer, X, ZoomIn, ZoomOut, CheckCircle } from "lucide-react";
import { useGameViewport } from "../../hooks/gameViewport";
import { UnicornSVG } from "../../components/assets/gameAssets";
import { getDB, getBestTimes, saveDb } from "../../utils/storage";

const UnicornJumpGame = ({ userId = "default", onExit, onSelectLevel }) => {
  const viewport = useGameViewport(1);
  const [gameState, setGameState] = useState("playing");
  const [level, setLevel] = useState(1);
  const [levelData, setLevelData] = useState([]);
  const [visitedIndices, setVisitedIndices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [nodePositions, setNodePositions] = useState([]);
  const [db, setDb] = useState(getDB());
  const startTimeRef = useRef(0);

  // Updated path parameters for smoother S-curve and closer nodes
  const NODE_SPACING_Y = 120; // closer nodes vertically
  const PATH_WIDTH = 300; // narrower path
  const PATH_FREQUENCY = 0.6; // smoother sine wave

  useEffect(() => {
    let interval = null;
    if (gameState === "playing") {
      startTimeRef.current = Date.now();
      interval = setInterval(
        () => setElapsedTime(Date.now() - startTimeRef.current),
        50
      );
    }
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    const startLvl = db.users[userId]?.maxLevel
      ? db.users[userId].maxLevel + 1
      : 1;
    launchLevel(startLvl);
  }, []);

  const launchLevel = (lvl) => {
    setLevel(lvl); // update current level immediately
    const len = 15 + lvl * 5;
    const arr = new Array(len).fill(null);
    let curr = 0,
      last = 0,
      maxJ = lvl > 5 ? 6 : lvl > 2 ? 4 : 3;

    while (curr < len) {
      let j;
      do {
        j = Math.floor(Math.random() * maxJ) + 1;
      } while (j === last && len - curr > j);
      last = j;
      if (j > len - curr) j = len - curr;
      arr[curr] = j;
      curr += j;
    }

    for (let i = 0; i < len; i++) {
      if (arr[i] === null) {
        arr[i] = Math.floor(Math.random() * maxJ) + 1;
      }
    }

    //path drawer
    const positions = [];
    for (let i = 0; i <= len; i++) {
      const t = i / len; // 0-1
      const y = i * NODE_SPACING_Y;

      // Small horizontal deviation using sine
      const x =
        window.innerWidth / 6 + Math.sin(t * Math.PI * 3) * (PATH_WIDTH * 2); // 0.5 = less swing

      positions.push({ x, y });
    }

    setLevelData(arr);
    setNodePositions(positions);
    setCurrentIndex(0);
    setVisitedIndices([0]);
    viewport.setZoom(1);
    viewport.setPan({ x: 0, y: window.innerHeight * 0.3 });
    setElapsedTime(0);
    setGameState("playing");
  };

  // Auto-center camera
  useEffect(() => {
    if (gameState === "playing" && nodePositions[currentIndex]) {
      const pos = nodePositions[currentIndex];
      const targetScreenX = window.innerWidth / 2;
      const targetScreenY = window.innerHeight * 0.35;
      const newPanX = targetScreenX - pos.x * viewport.zoom;
      const newPanY = targetScreenY - pos.y * viewport.zoom;
      viewport.setPan({ x: newPanX, y: newPanY });
    }
  }, [currentIndex, gameState, nodePositions]);

  const handleNodeClick = (idx) => {
    if (viewport.isDragging || gameState !== "playing") return;
    const power = levelData[currentIndex];
    const dist = idx - currentIndex;

    if (dist === power) {
      setCurrentIndex(idx);
      setVisitedIndices((p) => [...p, idx]);
      if (idx === levelData.length) {
        setGameState("victory");
        saveProgress(level, elapsedTime);
      }
    } else {
      setGameState("failed");
    }
  };

  const saveProgress = (lvl, time) => {
    const currentUser = db.users[userId] || { maxLevel: 0, history: [] };
    const newHistory = [...currentUser.history, { level: lvl, time }];
    const bestTimes = getBestTimes(newHistory);
    const maxLevel = Math.max(currentUser.maxLevel || 0, lvl);

    const updatedUser = {
      ...currentUser,
      maxLevel,
      history: newHistory,
      bestTimes,
    };

    const newDb = {
      ...db,
      users: {
        ...db.users,
        [userId]: updatedUser,
      },
      lastUser: userId,
    };

    setDb(newDb);
    saveDB(newDb);
  };

  const handleDown = (e) => viewport.startDrag(e);
  const handleMove = (e) => viewport.doDrag(e);
  const handleUp = () => viewport.endDrag();

  const formatTime = (ms) => (ms / 1000).toFixed(2);

  return (
    <div
      className={`w-full h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 overflow-hidden text-white select-none ${
        viewport.isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onMouseDown={handleDown}
      onMouseMove={handleMove}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      onTouchStart={(e) => {
        viewport.touchStart(e);
        viewport.startDrag(e);
      }}
      onTouchMove={(e) => {
        viewport.touchMove(e);
        handleMove(e);
      }}
      onTouchEnd={(e) => {
        viewport.touchEnd(e);
        handleUp(e);
      }}
      onWheel={(e) => viewport.applyZoom(e.deltaY * -0.001)}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur px-6 py-3 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto">
          <div className="text-cyan-400 text-xs font-bold tracking-widest mb-1">
            UNICORN JUMP
          </div>
          <div className="text-xl font-bold flex items-center gap-4">
            <span>Lvl {level}</span>
            <div className="flex items-center gap-2 text-slate-400 font-mono border-l border-slate-700 pl-4 ml-2">
              <Timer size={16} /> {formatTime(elapsedTime)}s
            </div>
          </div>
        </div>
        <button
          onClick={onExit}
          className="pointer-events-auto p-3 bg-slate-800 rounded-full hover:bg-rose-500 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => viewport.applyZoom(0.1)}
          className="p-3 bg-slate-800 rounded-full text-cyan-400 border border-slate-600 hover:bg-slate-700"
        >
          <ZoomIn />
        </button>
        <button
          onClick={() => viewport.applyZoom(-0.1)}
          className="p-3 bg-slate-800 rounded-full text-slate-400 border border-slate-600 hover:bg-slate-700"
        >
          <ZoomOut />
        </button>
      </div>

      {/* Game World */}
      <div
        className="absolute inset-0 origin-center will-change-transform"
        style={{
          transform: `translate(${viewport.pan.x}px, ${viewport.pan.y}px) scale(${viewport.zoom})`,
          transition: viewport.isDragging ? "none" : "transform 0.3s ease-out",
        }}
      >
        <div className="relative">
          <svg className="absolute top-0 left-0 w-full h-[90000px] overflow-visible pointer-events-none">
            <defs>
              <linearGradient
                id="rainbowGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="20%" stopColor="#f97316" />
                <stop offset="40%" stopColor="#eab308" />
                <stop offset="60%" stopColor="#22c55e" />
                <stop offset="80%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>

            {nodePositions.slice(0, -1).map((pos, i) => {
              const nextPos = nodePositions[i + 1];
              if (!nextPos) return null;

              const prevPos = nodePositions[i - 1] || pos;
              const nextNextPos = nodePositions[i + 2] || nextPos;

              // Control points for smooth curve
              const cp1x = pos.x + (nextPos.x - prevPos.x) * 0.25;
              const cp1y = pos.y + (nextPos.y - prevPos.y) * 0.25;
              const cp2x = nextPos.x - (nextNextPos.x - pos.x) * 0.25;
              const cp2y = nextPos.y - (nextNextPos.y - pos.y) * 0.25;

              const isRainbow = i < currentIndex;

              return (
                <path
                  key={`path-${i}`}
                  d={`M ${pos.x} ${pos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${nextPos.x} ${nextPos.y}`}
                  fill="none"
                  stroke={isRainbow ? "url(#rainbowGradient)" : "#1e293b"}
                  strokeWidth={isRainbow ? "10" : "8"}
                  strokeLinecap="round"
                  className={
                    isRainbow
                      ? "drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                      : ""
                  }
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {levelData.map((val, idx) => {
            const pos = nodePositions[idx];
            if (!pos) return null;

            const isCurrent = idx === currentIndex;
            const isVisited = visitedIndices.includes(idx);

            let baseClasses =
              "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:scale-105";
            if (isVisited && !isCurrent) {
              baseClasses =
                "bg-emerald-900 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)]";
            } else if (isCurrent) {
              baseClasses =
                "bg-cyan-500 border-white text-slate-900 ring-4 ring-cyan-500/30 scale-110 z-20";
            }

            return (
              <div
                key={idx}
                onClick={() => handleNodeClick(idx)}
                className={`absolute flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 text-xl font-black transition-all duration-300 cursor-pointer ${baseClasses}`}
                style={{
                  left: pos.x - 32,
                  top: pos.y - 32,
                }}
              >
                <span className="relative z-10 drop-shadow-md">{val}</span>
                {isVisited && !isCurrent && (
                  <div
                    className="absolute text-2xl animate-pulse drop-shadow-md select-none pointer-events-none z-40 opacity-80"
                    style={{ marginTop: "-50px" }}
                  >
                    🌈
                  </div>
                )}
              </div>
            );
          })}

          {/* Unicorn */}
          {nodePositions[currentIndex] && (
            <div
              className="absolute pointer-events-none z-30 w-20 h-20 transition-all duration-500 ease-in-out filter drop-shadow-2xl"
              style={{
                left: nodePositions[currentIndex].x - 40,
                top: nodePositions[currentIndex].y - 100,
              }}
            >
              <UnicornSVG />
            </div>
          )}

          {/* Goal */}
          {(() => {
            const lastIdx = levelData.length;
            const pos = nodePositions[lastIdx];
            if (!pos) return null;

            const isVisited = visitedIndices.includes(lastIdx);
            return (
              <div
                onClick={() => handleNodeClick(lastIdx)}
                className={`absolute flex items-center justify-center w-16 h-16 rounded-full border-4 transition-transform z-10 cursor-pointer ${
                  isVisited
                    ? "bg-emerald-500 border-emerald-300 scale-110 shadow-[0_0_50px_rgba(16,185,129,0.8)] animate-pulse"
                    : "bg-slate-900 border-slate-700 opacity-60 hover:opacity-100 hover:scale-105 hover:border-emerald-500/50"
                }`}
                style={{ left: pos.x - 32, top: pos.y - 32 }}
              >
                <CheckCircle
                  className={`w-8 h-8 pointer-events-none ${
                    isVisited ? "text-white" : "text-slate-600"
                  }`}
                />
                <span className="absolute -bottom-8 text-xs font-bold tracking-widest text-emerald-400 pointer-events-none">
                  GOAL
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Victory/Fail Modal */}
      {(gameState === "victory" || gameState === "failed") && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border-2 border-cyan-500 rounded-3xl p-8 max-w-md text-center shadow-2xl">
            <h2
              className={`text-4xl font-bold mb-4 ${
                gameState === "victory" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {gameState === "victory" ? "🎉 Victory!" : "💔 Try Again"}
            </h2>
            <p className="text-xl mb-2">Time: {formatTime(elapsedTime)}s</p>
            {gameState === "failed" && (
              <p className="text-slate-400 mb-6">Wrong jump!</p>
            )}
            <button
              onClick={() =>
                launchLevel(gameState === "victory" ? level + 1 : level)
              }
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-colors"
            >
              {gameState === "victory" ? "Next Level" : "Retry"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnicornJumpGame;
