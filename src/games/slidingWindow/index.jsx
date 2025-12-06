import React, { useState, useEffect, useRef } from "react";
import { Timer, X, ZoomIn, ZoomOut, GripVertical } from "lucide-react";
import { useGameViewport } from "../../hooks/gameViewport";
import { getBestTimes } from "../../utils/storage";
import VictoryModal from "../../components/shared/victoryModal";
import {
  BracketLeftSVG,
  BracketRightSVG,
} from "../../components/assets/gameAssets";

const SlidingWindowGame = ({ onExit, maxLevel, onSaveProgress, history }) => {
  const viewport = useGameViewport(1);
  const [gameState, setGameState] = useState("level-select");
  const [level, setLevel] = useState(1);
  const [levelData, setLevelData] = useState([]);
  const [windowSize, setWindowSize] = useState(3);
  const [windowPos, setWindowPos] = useState(0);
  const [failMessage, setFailMessage] = useState("");
  const [bracketPos, setBracketPos] = useState(0);
  const bracketPosRef = useRef(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  const isDraggingBracket = useRef(false);
  const dragStartBracketX = useRef(0);
  const bracketStartRef = useRef(0);
  const startTimeRef = useRef(0);

  const NODE_WIDTH = 50;
  const NODE_GAP = 16;
  const FULL_W = 96;
  const PADDING = 40;

  useEffect(() => {
    if (gameState === "setup" || gameState === "playing") {
      startTimeRef.current = Date.now();
      const interval = setInterval(
        () => setElapsedTime(Date.now() - startTimeRef.current),
        50
      );
      return () => clearInterval(interval);
    }
  }, [gameState, timerKey]);

  const launchLevel = (lvl) => {
    const len = 15 + (lvl > 5 ? 5 : 0);
    const min = lvl > 5 ? -100 : 0;
    const max = lvl > 2 ? 100 : 20;
    const data = Array.from(
      { length: len },
      () => Math.floor(Math.random() * (max - min + 1)) + min
    );
    setLevel(lvl);
    setLevelData(data);
    setWindowSize(Math.floor(Math.random() * 3) + 3);
    setWindowPos(0);
    setBracketPos(0);
    setElapsedTime(0);
    setTimerKey((p) => p + 1);
    viewport.setZoom(1);
    viewport.setPan({ x: 0, y: 0 });
    bracketPosRef.current = 0;
    setGameState("setup");
  };

  const handleNodeClick = (idx) => {
    if (gameState !== "playing") return;
    const winIndices = Array.from(
      { length: windowSize },
      (_, i) => windowPos + i
    );
    if (!winIndices.includes(idx)) return fail("Clicked outside window!");

    const maxVal = Math.max(...winIndices.map((i) => levelData[i]));
    if (levelData[idx] === maxVal) {
      if (windowPos + windowSize >= levelData.length) {
        onSaveProgress(level + 1, elapsedTime / 1000);
        setGameState("scoring");
        setTimeout(
          () => setGameState(level === 20 ? "victory" : "levelComplete"),
          500
        );
      } else {
        setWindowPos((p) => p + 1);
        viewport.centerOn(
          PADDING + (windowPos + 1) * FULL_W + (FULL_W * windowSize) / 2
        );
      }
    } else {
      fail("Not the max value!");
    }
  };

  const fail = (msg) => {
    setFailMessage(msg);
    setGameState("scoring");
    setTimeout(() => setGameState("failed"), 1000);
  };

  const handleMove = (e) => {
    if (viewport.isPinching) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    if (isDraggingBracket.current) {
      e.preventDefault(); // Stop scroll
      const diff = Math.round(
        (cx - dragStartBracketX.current) / (FULL_W * viewport.zoom)
      );
      setBracketPos(
        Math.max(
          0,
          Math.min(levelData.length - 1, bracketStartRef.current + diff)
        )
      );
      bracketPosRef.current = Math.max(
        0,
        Math.min(levelData.length - 1, bracketStartRef.current + diff)
      );
    } else {
      viewport.doDrag(e);
    }
  };

  const handleUp = () => {
    if (isDraggingBracket.current) {
      isDraggingBracket.current = false;
      if (bracketPosRef.current + 1 === windowSize) setGameState("playing");
      else fail(`Selected ${bracketPosRef.current + 1}, needed ${windowSize}`);
    }
    viewport.endDrag();
  };

  const handleBracketDown = (e) => {
    e.stopPropagation();
    isDraggingBracket.current = true;
    dragStartBracketX.current = e.touches ? e.touches[0].clientX : e.clientX;
    bracketStartRef.current = bracketPosRef.current;
  };

  if (gameState === "level-select")
    return (
      <LevelSelector
        title="Sliding Window"
        maxLevel={maxLevel}
        totalLevels={20}
        bestTimes={getBestTimes(history)}
        onSelectLevel={launchLevel}
        onBack={onExit}
      />
    );
  const formatTime = (ms) => (ms / 1000).toFixed(2);

  return (
    <div
      className={`w-full h-screen bg-slate-950 overflow-hidden text-white select-none ${
        viewport.isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onMouseDown={viewport.startDrag}
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
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur px-6 py-3 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto">
          <h2 className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-1">
            SLIDING WINDOW
          </h2>
          <div className="text-xl font-bold flex items-center gap-4">
            {gameState === "setup" ? (
              <span>
                Select{" "}
                <span className="text-emerald-400 text-2xl">{windowSize}</span>{" "}
                nodes
              </span>
            ) : (
              <span className="text-emerald-400 animate-pulse">FIND MAX</span>
            )}
            {(gameState === "setup" ||
              gameState === "playing" ||
              gameState === "scoring") && (
              <div className="flex items-center gap-2 text-slate-400 font-mono border-l border-slate-700 pl-4 ml-2">
                <Timer size={16} /> {formatTime(elapsedTime)}s
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onExit}
          className="pointer-events-auto p-3 bg-slate-800 rounded-full hover:bg-rose-500 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => viewport.applyZoom(0.2)}
          className="p-3 bg-slate-800 rounded-full text-cyan-400 border border-slate-600"
        >
          <ZoomIn />
        </button>
        <button
          onClick={() => viewport.applyZoom(-0.2)}
          className="p-3 bg-slate-800 rounded-full text-slate-400 border border-slate-600"
        >
          <ZoomOut />
        </button>
      </div>

      <div
        className="flex-1 flex items-center relative will-change-transform origin-left"
        style={{
          transform: `translate(${viewport.pan.x}px, ${viewport.pan.y}px) scale(${viewport.zoom})`,
          transition:
            viewport.isDragging || isDraggingBracket.current
              ? "none"
              : "transform 0.3s ease-out",
          height: "100%",
        }}
      >
        <div
          className="flex gap-4 py-20 relative"
          style={{ paddingLeft: PADDING }}
        >
          {gameState === "setup" && (
            <>
              <div
                className="absolute top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none"
                style={{ left: 15 }}
              >
                <BracketLeftSVG />
              </div>
              <div
                onMouseDown={handleBracketDown}
                onTouchStart={handleBracketDown}
                className="absolute top-1/2 -translate-y-1/2 text-cyan-400 cursor-ew-resize z-50"
                style={{ left: PADDING + bracketPos * FULL_W + NODE_WIDTH + 5 }}
              >
                <BracketRightSVG />
                <div className="absolute top-1/2 -translate-y-1/2 -right-8 w-8 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/50 animate-pulse">
                  <GripVertical size={16} />
                </div>
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 h-24 bg-cyan-500/10 border-y border-cyan-500/30 pointer-events-none"
                style={{
                  left: PADDING - 10,
                  width: bracketPos * FULL_W + NODE_WIDTH + 20,
                }}
              />
            </>
          )}
          {gameState === "playing" && (
            <div
              className="absolute top-1/2 -translate-y-1/2 h-32 border-4 border-emerald-500 rounded-xl transition-all duration-300 ease-out shadow-[0_0_30px_rgba(16,185,129,0.4)] pointer-events-none z-10"
              style={{
                left: PADDING + windowPos * FULL_W - 8,
                width: windowSize * FULL_W - NODE_GAP + 16,
              }}
            />
          )}
          {levelData.map((val, idx) => {
            let bg = "bg-slate-900 border-slate-700 text-slate-500";
            if (gameState === "setup" && idx <= bracketPos)
              bg = "bg-cyan-900/50 border-cyan-500 text-white";
            else if (
              gameState === "playing" &&
              idx >= windowPos &&
              idx < windowPos + windowSize
            )
              bg = "bg-slate-800 border-slate-500 text-white";
            return (
              <div
                key={idx}
                onClick={() => handleNodeClick(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 flex items-center justify-center text-xl font-black ${bg} hover:scale-105 active:scale-95 transition-transform`}
              >
                {val}
              </div>
            );
          })}
        </div>
      </div>
      {(gameState === "levelComplete" || gameState === "failed") && (
        <VictoryModal
          state={gameState}
          failReason={gameState === "failed" ? "Wrong jump!" : ""}
          time={formatTime(elapsedTime)}
          onAction={
            gameState === "failed"
              ? () => launchLevel(level) // Retry same level
              : () => launchLevel(level + 1) // Move to next level
          }
          isNext={gameState === "levelComplete"}
        />
      )}
    </div>
  );
};

export default SlidingWindowGame;
