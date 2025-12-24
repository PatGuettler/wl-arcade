import React, { useState, useEffect, useRef } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useGameViewport } from "../../hooks/gameViewport";
import VictoryModal from "../../components/shared/victoryModal";
import GlobalHeader from "../../components/shared/globalHeader";
import GameHUD from "../../components/shared/gameHUD";
import { useGameSystem } from "../../components/shared/useGameSystem";
import { UnicornAvatar } from "../../components/assets/gameAssets";
import { OpponentAI } from "./opponentAI";

const SlidingWindowGame = ({
  onExit,
  lastCompletedLevel = 0,
  onSaveProgress,
  calcCoins,
  coins,
  onSpendCoins,
  onHome,
  unicornImage,
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
  const [opponentLevelData, setOpponentLevelData] = useState([]);
  const [windowSize, setWindowSize] = useState(3);
  const [windowPos, setWindowPos] = useState(0);
  const [collectedNodes, setCollectedNodes] = useState([]);
  const [opponentPos, setOpponentPos] = useState(0);
  const [opponentCollectedNodes, setOpponentCollectedNodes] = useState([]);
  const [failReason, setFailReason] = useState("");

  const opponentRef = useRef(null);
  const containerRef = useRef(null);

  const NODE_WIDTH = 80;
  const NODE_GAP = 20;
  const FULL_W = NODE_WIDTH + NODE_GAP;
  const PADDING = 100;
  const ROW_GAP = 200;

  const formatTime = (ms) => (ms / 1000).toFixed(2);

  useEffect(() => {
    let startLvl = lastCompletedLevel;
    if (startLvl === 0) startLvl = 1;
    launchLevel(startLvl);
  }, []);

  // Auto-center viewport on player's window
  useEffect(() => {
    if (gameState === "playing" && containerRef.current) {
      const targetX = PADDING + windowPos * FULL_W + (windowSize * FULL_W) / 2;
      const screenCenterX = window.innerWidth / 2;
      const newPanX = screenCenterX - targetX * viewport.zoom;

      viewport.setPan((prev) => ({ ...prev, x: newPanX }));
    }
  }, [windowPos, gameState, viewport.zoom, windowSize]);

  // Start opponent AI when game state changes to "playing"
  useEffect(() => {
    if (
      gameState === "playing" &&
      opponentRef.current &&
      opponentLevelData.length > 0
    ) {
      // Stop any existing opponent
      opponentRef.current.stop();

      // Reset opponent position
      opponentRef.current.reset();

      // Start opponent after a brief delay
      const timeoutId = setTimeout(() => {
        if (opponentRef.current && gameState === "playing") {
          opponentRef.current.start(
            (newPos) => {
              setOpponentPos(newPos);
              setOpponentCollectedNodes((prev) => [...prev, newPos - 1]);
            },
            () => {
              setFailReason("The rival beat you to the finish!");
              failLevel("The rival beat you!");
            }
          );
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else if (gameState !== "playing" && opponentRef.current) {
      // Stop opponent when not playing
      opponentRef.current.stop();
    }
  }, [gameState, opponentLevelData]);

  const launchLevel = (lvl) => {
    const len = 15 + (lvl > 5 ? 5 : 0);
    const min = lvl > 5 ? -100 : 0;
    const max = lvl > 2 ? 100 : 20;

    // Generate player's data
    const data = Array.from(
      { length: len },
      () => Math.floor(Math.random() * (max - min + 1)) + min
    );

    // Generate opponent's data (different from player's)
    const opponentData = Array.from(
      { length: len },
      () => Math.floor(Math.random() * (max - min + 1)) + min
    );

    const size = Math.min(5, 3 + Math.floor(lvl / 3));

    setLevelData(data);
    setOpponentLevelData(opponentData);
    setWindowSize(size);
    setWindowPos(0);
    setOpponentPos(0);
    setCollectedNodes([]);
    setOpponentCollectedNodes([]);
    setFailReason("");

    viewport.setZoom(1);
    viewport.setPan({ x: 0, y: 0 });

    // Initialize opponent AI
    if (opponentRef.current) {
      opponentRef.current.stop();
    }
    opponentRef.current = new OpponentAI(lvl, size, opponentData);

    // Start the game (this will trigger the useEffect that starts the opponent)
    startGame(lvl);
  };

  // Cleanup opponent on unmount
  useEffect(() => {
    return () => {
      if (opponentRef.current) {
        opponentRef.current.stop();
      }
    };
  }, []);

  const getCurrentWindowIndices = () => {
    return Array.from({ length: windowSize }, (_, i) => windowPos + i);
  };

  const getMaxIndexInWindow = () => {
    const indices = getCurrentWindowIndices();
    let maxVal = -Infinity;
    indices.forEach((i) => {
      if (levelData[i] > maxVal) {
        maxVal = levelData[i];
      }
    });
    return maxVal;
  };

  const isMaxValueInWindow = (idx) => {
    const maxVal = getMaxIndexInWindow();
    return levelData[idx] === maxVal;
  };

  const handleNodeClick = (idx) => {
    if (gameState !== "playing") return;
    const winIndices = getCurrentWindowIndices();
    if (!winIndices.includes(idx)) return;

    // Check if clicked node has the max value (allowing for ties)
    if (isMaxValueInWindow(idx)) {
      registerMove(true);
      setCollectedNodes((prev) => [...prev, idx]);

      if (windowPos + windowSize >= levelData.length) {
        if (opponentRef.current) {
          opponentRef.current.stop();
        }
        completeLevel();
      } else {
        setWindowPos((p) => p + 1);
      }
    } else {
      registerMove(false);
      setFailReason("Wrong node selected!");
      failLevel("Not the max value!");
    }
  };

  const handleMove = (e) => {
    viewport.doDrag(e);
  };

  const handleUp = () => {
    viewport.endDrag();
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
        title="Race the Unicorn!"
        level={level}
        elapsedTime={elapsedTime}
        gameState={gameState}
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
        ref={containerRef}
        className="flex-1 flex items-center justify-center relative will-change-transform origin-center h-full"
        style={{
          transform: `translate(${viewport.pan.x}px, ${viewport.pan.y}px) scale(${viewport.zoom})`,
          transition: viewport.isDragging
            ? "none"
            : "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="relative">
          {/* PLAYER'S ROW (TOP) */}
          <div className="flex gap-5 relative" style={{ paddingLeft: PADDING }}>
            {/* Player's Sliding Window */}
            {gameState === "playing" && (
              <>
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-40 border-4 border-emerald-500 rounded-2xl transition-all duration-500 ease-out shadow-[0_0_40px_rgba(16,185,129,0.5)] pointer-events-none z-10"
                  style={{
                    left: PADDING + windowPos * FULL_W - 10,
                    width: windowSize * FULL_W - NODE_GAP + 20,
                  }}
                />

                {/* Player's Unicorn */}
                <div
                  className="absolute -translate-y-1/2 pointer-events-none z-20 transition-all duration-500 ease-out"
                  style={{
                    left:
                      PADDING +
                      windowPos * FULL_W +
                      (windowSize * FULL_W) / 2 -
                      40,
                    top: "50%",
                    marginTop: "-140px",
                  }}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 animate-bounce drop-shadow-2xl">
                      <UnicornAvatar
                        image={unicornImage}
                        className="w-full h-full"
                      />
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
              const isInWindow =
                idx >= windowPos && idx < windowPos + windowSize;
              const isCollected = collectedNodes.includes(idx);
              const maxVal = getMaxIndexInWindow();
              const isMax = levelData[idx] === maxVal;

              if (isCollected) {
                bg = "bg-emerald-900/50 border-emerald-600 text-emerald-300";
              } else if (gameState === "playing" && isInWindow) {
                if (showHint && isMax) {
                  bg =
                    "bg-yellow-500/30 border-yellow-400 text-white shadow-[0_0_20px_rgba(234,179,8,0.4)] animate-pulse";
                } else if (isMax) {
                  bg =
                    "bg-yellow-500/20 border-yellow-400 text-white shadow-[0_0_20px_rgba(234,179,8,0.3)]";
                } else {
                  bg = "bg-slate-800 border-slate-500 text-white";
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleNodeClick(idx)}
                  className={`flex-shrink-0 rounded-2xl border-4 flex items-center justify-center text-2xl font-black ${bg} hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer relative`}
                  style={{ width: NODE_WIDTH, height: NODE_WIDTH }}
                >
                  {val}
                </div>
              );
            })}
          </div>

          {/* OPPONENT'S ROW (BOTTOM) */}
          <div
            className="flex gap-5 relative"
            style={{ paddingLeft: PADDING, marginTop: ROW_GAP }}
          >
            {/* Opponent's Sliding Window */}
            {gameState === "playing" && (
              <>
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-40 border-4 border-rose-500 rounded-2xl transition-all duration-500 ease-out shadow-[0_0_40px_rgba(239,68,68,0.5)] pointer-events-none z-10"
                  style={{
                    left: PADDING + opponentPos * FULL_W - 10,
                    width: windowSize * FULL_W - NODE_GAP + 20,
                  }}
                />

                {/* Opponent Unicorn */}
                <div
                  className="absolute -translate-y-1/2 pointer-events-none z-20 transition-all duration-500 ease-out"
                  style={{
                    left:
                      PADDING +
                      opponentPos * FULL_W +
                      (windowSize * FULL_W) / 2 -
                      40,
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
            {opponentLevelData.map((val, idx) => {
              let bg = "bg-slate-900 border-slate-700 text-slate-500";
              const isInWindow =
                idx >= opponentPos && idx < opponentPos + windowSize;
              const isCollected = opponentCollectedNodes.includes(idx);

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
        </div>
      </div>

      {(gameState === "levelComplete" || gameState === "failed") && (
        <VictoryModal
          state={gameState}
          failReason={failReason || "Wrong move!"}
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
