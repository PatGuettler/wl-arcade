import React, { useState, useEffect, useRef } from "react";
import { Timer, X } from "lucide-react";
import { getBestTimes } from "../../utils/storage";
import LevelSelector from "../../components/shared/levelSelector";
import VictoryModal from "../../components/shared/victoryModal";
import { Bill } from "../../components/assets/gameAssets";
import { handleNextLevel } from "../../utils/levelMap";

const CashCounterGame = ({ onExit, maxLevel, onSaveProgress, history }) => {
  const bestTimes = getBestTimes(history);
  const [gameState, setGameState] = useState("level-select");
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState(0);
  const [current, setCurrent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(0);

  const bills = [1, 5, 10, 20, 50, 100];

  useEffect(() => {
    if (gameState === "playing") {
      startTimeRef.current = Date.now();
      const i = setInterval(
        () => setElapsed(Date.now() - startTimeRef.current),
        50
      );
      return () => clearInterval(i);
    }
  }, [gameState]);

  const launchLevel = (lvl) => {
    let tgt =
      lvl <= 3
        ? Math.floor(Math.random() * 20) + 1
        : lvl <= 8
        ? Math.floor(Math.random() * 80) + 20
        : Math.floor(Math.random() * 900) + 100;
    setLevel(lvl);
    setTarget(tgt);
    setCurrent(0);
    setGameState("playing");
  };

  const handleBill = (v) => {
    if (gameState !== "playing") return;
    const next = current + v;
    setCurrent(next);
    if (next === target) {
      onSaveProgress(level + 1, elapsed / 1000);
      setGameState("scoring");
      setTimeout(
        () => setGameState(level === 15 ? "victory" : "levelComplete"),
        1000
      );
    } else if (next > target) {
      setGameState("scoring");
      setTimeout(() => setGameState("failed"), 1000);
    }
  };

  if (gameState === "level-select")
    return (
      <LevelSelector
        title="Cash Counter"
        maxLevel={maxLevel}
        totalLevels={15}
        bestTimes={bestTimes}
        onSelectLevel={launchLevel}
        onBack={onExit}
      />
    );

  const pct = Math.min(100, (current / target) * 100);

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col relative font-sans text-white">
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur px-6 py-3 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto">
          <div className="text-cyan-400 text-xs font-bold tracking-widest mb-1">
            TARGET
          </div>
          <div className="text-3xl font-black text-emerald-400 flex items-center gap-4">
            ${target}
            <div className="flex items-center gap-2 text-slate-400 text-xl font-mono border-l border-slate-700 pl-4 ml-2">
              <Timer size={18} /> {(elapsed / 1000).toFixed(2)}s
            </div>
          </div>
        </div>
        <button
          onClick={() => setGameState("level-select")}
          className="pointer-events-auto p-3 bg-slate-800 rounded-full hover:bg-rose-500"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg
            className="absolute inset-0 w-full h-full rotate-[-90deg]"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#1e293b"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={current > target ? "#ef4444" : "#10b981"}
              strokeWidth="10"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * pct) / 100}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <div className="text-center">
            <div className="text-slate-400 text-sm font-bold uppercase mb-1">
              Current
            </div>
            <div
              className={`text-6xl font-black ${
                current > target ? "text-rose-500" : "text-white"
              }`}
            >
              ${current}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md justify-items-center">
          {bills.map((v) => (
            <Bill
              key={v}
              value={v}
              disabled={gameState !== "playing"}
              onClick={() => handleBill(v)}
            />
          ))}
        </div>
      </div>
      {(gameState === "failed" ||
        gameState === "levelComplete" ||
        gameState === "victory") && (
        <VictoryModal
          state={gameState}
          failReason="Over limit!"
          time={(elapsed / 1000).toFixed(2)}
          onAction={
            gameState === "failed"
              ? () => launchLevel(level)
              : () => handleNextLevel(level, 20, setGameState, launchLevel)
          }
          isNext={gameState === "levelComplete"}
        />
      )}
    </div>
  );
};

export default CashCounterGame;
