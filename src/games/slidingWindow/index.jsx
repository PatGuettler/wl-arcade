import React, { useState, useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, GripVertical } from "lucide-react";
import { useGameViewport } from "../../hooks/gameViewport";
import VictoryModal from "../../components/shared/victoryModal";
import GlobalHeader from "../../components/shared/globalHeader";
import GameHUD from "../../components/shared/gameHUD";
import { useGameSystem } from "../../components/shared/useGameSystem";
import {
  BracketLeftSVG,
  BracketRightSVG,
} from "../../components/assets/gameAssets";

const SlidingWindowGame = ({
  onExit,
  lastCompletedLevel = 0,
  onSaveProgress,
  calcCoins,
  coins,
  onSpendCoins,
  onHome,
}) => {
  const viewport = useGameViewport(1);
  const {
    gameState,
    setGameState,
    level,
    elapsedTime,
    showHint,
    movesMade,
    startGame,
    registerMove,
    buyHint,
    completeLevel,
    failLevel,
    hintCost,
  } = useGameSystem({
    initialLevel: lastCompletedLevel,
    onSaveProgress,
    onSpendCoins,
  });

  const [levelData, setLevelData] = useState([]);
  const [windowSize, setWindowSize] = useState(3);
  const [windowPos, setWindowPos] = useState(0);
  const [bracketPos, setBracketPos] = useState(0);
  const bracketPosRef = useRef(0);
  const isDraggingBracket = useRef(false);
  const dragStartBracketX = useRef(0);
  const bracketStartRef = useRef(0);

  const NODE_WIDTH = 50;
  const NODE_GAP = 16;
  const FULL_W = 96;
  const PADDING = 40;

  const formatTime = (ms) => (ms / 1000).toFixed(2);

  useEffect(() => {
    let startLvl = lastCompletedLevel;
    if (startLvl === 0) startLvl = 1;
    launchLevel(startLvl);
  }, []);

  const launchLevel = (lvl) => {
    const len = 15 + (lvl > 5 ? 5 : 0);
    const min = lvl > 5 ? -100 : 0;
    const max = lvl > 2 ? 100 : 20;
    const data = Array.from(
      { length: len },
      () => Math.floor(Math.random() * (max - min + 1)) + min
    );

    setLevelData(data);
    setWindowSize(Math.floor(Math.random() * 3) + 3);
    setWindowPos(0);
    setBracketPos(0);
    bracketPosRef.current = 0;

    viewport.setZoom(1);
    viewport.setPan({ x: 0, y: 0 });

    setGameState("setup");
    startGame(lvl);
  };

  const startPlaying = () => {
    setGameState("playing");
  };

  const getCurrentWindowIndices = () => {
    return Array.from({ length: windowSize }, (_, i) => windowPos + i);
  };

  const getMaxIndexInWindow = () => {
    const indices = getCurrentWindowIndices();
    let maxVal = -Infinity;
    let maxIdx = -1;
    indices.forEach((i) => {
      if (levelData[i] > maxVal) {
        maxVal = levelData[i];
        maxIdx = i;
      }
    });
    return maxIdx;
  };

  const handleNodeClick = (idx) => {
    if (gameState !== "playing") return;
    const winIndices = getCurrentWindowIndices();
    if (!winIndices.includes(idx)) return failLevel("Clicked outside window!");

    const maxIdx = getMaxIndexInWindow();

    if (idx === maxIdx) {
      registerMove(true);
      if (windowPos + windowSize >= levelData.length) {
        completeLevel();
      } else {
        setWindowPos((p) => p + 1);
      }
    } else {
      failLevel("Not the max value!");
    }
  };

  const handleMove = (e) => {
    if (viewport.isPinching) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    if (isDraggingBracket.current) {
      e.preventDefault();
      const diff = Math.round(
        (cx - dragStartBracketX.current) / (FULL_W * viewport.zoom)
      );
      const newPos = Math.max(
        0,
        Math.min(levelData.length - 1, bracketStartRef.current + diff)
      );
      setBracketPos(newPos);
      bracketPosRef.current = newPos;
    } else {
      viewport.doDrag(e);
    }
  };

  const handleUp = () => {
    if (isDraggingBracket.current) {
      isDraggingBracket.current = false;
      if (bracketPosRef.current + 1 === windowSize) {
        startPlaying();
      } else {
        failLevel(
          `Selected ${bracketPosRef.current + 1}, needed ${windowSize}`
        );
      }
    }
    viewport.endDrag();
  };

  const handleBracketDown = (e) => {
    e.stopPropagation();
    isDraggingBracket.current = true;
    dragStartBracketX.current = e.touches ? e.touches[0].clientX : e.clientX;
    bracketStartRef.current = bracketPosRef.current;
  };

  return (
    <div
      className="w-full h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 overflow-hidden text-white select-none relative"
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
      style={{ cursor: viewport.isDragging ? "grabbing" : "grab" }}
    >
      <div className="absolute top-0 left-0 w-full z-30 pointer-events-none">
        <div className="pointer-events-auto">
          <GlobalHeader
            coins={coins}
            onBack={onExit}
            isSubScreen={true}
            onHome={onHome}
          />
        </div>
      </div>

      <GameHUD
        title={
          gameState === "setup" ? `SELECT ${windowSize}` : "Sliding Window"
        }
        level={level}
        elapsedTime={elapsedTime}
        gameState={gameState === "setup" ? "playing" : gameState}
        coins={coins}
        onBuyHint={buyHint}
        showHint={showHint}
        hintCost={hintCost}
        isFreeHint={level === 1 && movesMade < 2}
      />

      <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => viewport.applyZoom(0.2)}
          className="p-3 bg-slate-800 rounded-full text-cyan-400 border border-slate-600 hover:bg-slate-700"
        >
          <ZoomIn />
        </button>
        <button
          onClick={() => viewport.applyZoom(-0.2)}
          className="p-3 bg-slate-800 rounded-full text-slate-400 border border-slate-600 hover:bg-slate-700"
        >
          <ZoomOut />
        </button>
      </div>

      <div
        className="flex-1 flex items-center relative will-change-transform origin-left h-full"
        style={{
          transform: `translate(${viewport.pan.x}px, ${viewport.pan.y}px) scale(${viewport.zoom})`,
          transition:
            viewport.isDragging || isDraggingBracket.current
              ? "none"
              : "transform 0.3s ease-out",
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

            const isMax = idx === getMaxIndexInWindow();
            const isInWindow = idx >= windowPos && idx < windowPos + windowSize;

            if (gameState === "playing" && isInWindow) {
              if (showHint && isMax) {
                bg =
                  "bg-yellow-500/20 border-yellow-400 text-white animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.5)]";
              } else {
                bg = "bg-slate-800 border-slate-500 text-white";
              }
            } else if (gameState === "setup" && idx <= bracketPos) {
              bg = "bg-cyan-900/50 border-cyan-500 text-white";
            }

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
          failReason={gameState === "failed" ? "Wrong node!" : ""}
          time={formatTime(elapsedTime)}
          coinsEarned={
            gameState === "levelComplete" && calcCoins ? calcCoins(level) : 0
          }
          onAction={
            gameState === "failed"
              ? () => launchLevel(level)
              : () => launchLevel(level + 1)
          }
          isNext={gameState === "levelComplete"}
        />
      )}
    </div>
  );
};

export default SlidingWindowGame;
