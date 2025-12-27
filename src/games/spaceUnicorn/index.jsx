import React, { useState, useEffect, useRef } from "react";
import VictoryModal from "../../components/shared/victoryModal";
import GlobalHeader from "../../components/shared/globalHeader";
import GameWorld from "./gameWorld";
import { Timer } from "lucide-react";

const WORD_LISTS = {
  easy: ["cat", "dog", "sun", "fun", "run", "hot", "pot", "top", "hop", "pop"],
  medium: [
    "cloud",
    "happy",
    "beach",
    "music",
    "dance",
    "flash",
    "storm",
    "boost",
    "power",
    "magic",
    "spell",
    "glory",
    "swift",
  ],
  hard: [
    "rainbow",
    "sparkle",
    "unicorn",
    "adventure",
    "fantastic",
    "brilliant",
    "wonderful",
    "mysterious",
    "spectacular",
    "magnificent",
  ],
};

const SpaceUnicornGame = ({
  onExit,
  lastCompletedLevel = 0,
  onSaveProgress,
  calcCoins,
  coins,
  onHome,
  unicornImage,
}) => {
  const [gameState, setGameState] = useState("playing");
  const [level, setLevel] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [words, setWords] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [wordsDestroyed, setWordsDestroyed] = useState(0);
  const [targetWords, setTargetWords] = useState(0);
  const [projectiles, setProjectiles] = useState([]);
  const [lives, setLives] = useState(3);

  const inputRef = useRef(null);
  const startTimeRef = useRef(0);
  const nextWordIdRef = useRef(0);
  const spawnIntervalRef = useRef(null);

  // Timer
  useEffect(() => {
    let interval = null;
    if (gameState === "playing") {
      startTimeRef.current = Date.now() - elapsedTime;
      interval = setInterval(
        () => setElapsedTime(Date.now() - startTimeRef.current),
        50
      );
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Focus input
  useEffect(() => {
    if (gameState === "playing" && inputRef.current) inputRef.current.focus();
  }, [gameState]);

  // Launch first level
  useEffect(() => {
    let startLvl = lastCompletedLevel || 1;
    launchLevel(startLvl);
  }, []);

  const getWordList = (lvl) => {
    if (lvl <= 3) return WORD_LISTS.easy;
    if (lvl <= 8) return WORD_LISTS.medium;
    return WORD_LISTS.hard;
  };

  const getFallSpeed = (lvl) => 0.1 + lvl * 0.02;

  const getSpawnInterval = (lvl) => Math.max(1500, 3000 - lvl * 150);

  const launchLevel = (lvl) => {
    const target = 1 + Math.floor(lvl * 1.5);
    setLevel(lvl);
    setWords([]);
    setCurrentInput("");
    setWordsDestroyed(0);
    setTargetWords(target);
    setProjectiles([]);
    setLives(3);
    setGameState("playing");
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    nextWordIdRef.current = 0;

    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    spawnIntervalRef.current = setInterval(
      () => spawnWord(lvl),
      getSpawnInterval(lvl)
    );
    spawnWord(lvl);
  };

  const spawnWord = (lvl) => {
    const wordList = getWordList(lvl);
    const text = wordList[Math.floor(Math.random() * wordList.length)];
    const x = 15 + Math.random() * 70;

    setWords((prev) => [
      ...prev,
      {
        id: nextWordIdRef.current++,
        text,
        x,
        y: 0,
        speed: getFallSpeed(lvl),
        destroyed: false,
      },
    ]);
  };

  // Animate falling words
  useEffect(() => {
    if (gameState !== "playing") return;

    const animate = () => {
      setWords((prev) =>
        prev.map((w) => {
          if (w.destroyed) return w;
          const newY = w.y + w.speed;
          if (newY > 85) {
            setLives((l) => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameState("failed");
                if (spawnIntervalRef.current)
                  clearInterval(spawnIntervalRef.current);
              }
              return newLives;
            });
            return { ...w, destroyed: true };
          }
          return { ...w, y: newY };
        })
      );
      if (gameState === "playing") requestAnimationFrame(animate);
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [gameState]);

  // Input handling
  const handleInputChange = (e) => {
    if (gameState !== "playing") return;
    const input = e.target.value.toLowerCase().trim();
    setCurrentInput(input);

    const matchedWord = words.find((w) => !w.destroyed && w.text === input);
    if (matchedWord) destroyWord(matchedWord);
  };

  const destroyWord = (word) => {
    // Launch unicorn projectile
    const projectileId = Date.now() + Math.random();
    setProjectiles((prev) => [
      ...prev,
      { id: projectileId, target: { x: word.x, y: word.y }, status: "flying" },
    ]);

    // Mark word destroyed
    setWords((prev) =>
      prev.map((w) => (w.id === word.id ? { ...w, destroyed: true } : w))
    );

    setCurrentInput("");

    // Impact
    setTimeout(() => {
      setProjectiles((prev) =>
        prev.map((p) => (p.id === projectileId ? { ...p, status: "hit" } : p))
      );
      const newDestroyed = wordsDestroyed + 1;
      setWordsDestroyed(newDestroyed);

      if (newDestroyed >= targetWords) {
        if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
        onSaveProgress(level, elapsedTime / 1000);
        setGameState("scoring");
        setTimeout(() => setGameState("levelComplete"), 1000);
      }
    }, 500);

    // Cleanup projectile
    setTimeout(() => {
      setProjectiles((prev) => prev.filter((p) => p.id !== projectileId));
    }, 900);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") setCurrentInput("");
  };

  const formatTime = (ms) => (ms / 1000).toFixed(2);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 overflow-hidden text-white select-none relative">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-30 pointer-events-none">
        <div className="pointer-events-auto">
          <GlobalHeader
            coins={coins}
            onBack={onExit}
            isSubScreen
            onHome={onHome}
          />
        </div>
      </div>

      {/* HUD */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-none w-full justify-center px-4"
        style={{ top: "max(2.25rem, calc(2rem + env(safe-area-inset-top)))" }}
      >
        <div className="bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl pointer-events-auto flex items-center gap-2">
          <div>
            <div className="text-cyan-400 text-[8px] font-bold tracking-widest uppercase leading-none mb-0.5">
              SPACE UNICORN
            </div>
            <div className="text-sm font-bold flex items-center gap-2 leading-none text-white">
              <span>Lvl {level}</span>
              <div className="flex items-center gap-1 text-slate-400 font-mono border-l border-slate-700 pl-2 ml-0.5">
                <Timer size={12} />{" "}
                <span className="text-xs">{formatTime(elapsedTime)}s</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`text-lg ${i < lives ? "" : "opacity-20"}`}
              >
                ❤️
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game World */}
      <GameWorld
        nodePositions={words.map((w) => ({ x: w.x, y: w.y }))}
        currentIndex={null}
        unicornImage={unicornImage}
        projectiles={projectiles}
      />

      {/* Input */}
      {gameState === "playing" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-30">
          <div className="bg-slate-900/90 backdrop-blur border-2 border-cyan-500/50 rounded-2xl p-4 shadow-2xl">
            <div className="text-center mb-3">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                Type to Fire
              </div>
              <div className="text-xl font-black text-white">
                {wordsDestroyed} / {targetWords}
              </div>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type words..."
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-4 py-2 text-white text-center text-lg font-bold placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
            />

            <div className="text-center text-slate-500 text-[10px] mt-2">
              Press ESC to clear • Don't let words reach the bottom!
            </div>
          </div>
        </div>
      )}

      {/* Victory / Fail */}
      {(gameState === "levelComplete" || gameState === "failed") && (
        <VictoryModal
          state={gameState}
          failReason={gameState === "failed" ? "Words reached the bottom!" : ""}
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

export default SpaceUnicornGame;
