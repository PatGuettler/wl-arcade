import React, { useState, useEffect, useRef } from "react";
import VictoryModal from "../../components/shared/victoryModal";
import GlobalHeader from "../../components/shared/globalHeader";
import { UnicornAvatar } from "../../components/assets/gameAssets";
import { Timer } from "lucide-react";

// Word lists by difficulty
const WORD_LISTS = {
  easy: [
    "cat",
    "dog",
    "sun",
    "fun",
    "run",
    "hot",
    "pot",
    "top",
    "hop",
    "pop",
    "yes",
    "red",
    "bed",
    "pen",
    "ten",
  ],
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
  const [unicornFiring, setUnicornFiring] = useState(null);
  const [lives, setLives] = useState(3);

  const inputRef = useRef(null);
  const startTimeRef = useRef(0);
  const nextWordIdRef = useRef(0);
  const spawnIntervalRef = useRef(null);

  const formatTime = (ms) => (ms / 1000).toFixed(2);

  useEffect(() => {
    let startLvl = lastCompletedLevel;
    if (startLvl === 0) startLvl = 1;
    launchLevel(startLvl);
  }, []);

  // Timer Logic
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

  // Keep input focused
  useEffect(() => {
    if (gameState === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  const getWordList = (lvl) => {
    if (lvl <= 3) return WORD_LISTS.easy;
    if (lvl <= 8) return WORD_LISTS.medium;
    return WORD_LISTS.hard;
  };

  const getFallSpeed = (lvl) => {
    // Pixels per frame (60fps) - gets faster each level
    const baseSpeed = 0.0001;
    return baseSpeed + lvl * 0.0001;
  };

  const getSpawnInterval = (lvl) => {
    // Milliseconds between spawns - gets faster
    return Math.max(1500, 3000 - lvl * 150);
  };

  const launchLevel = (lvl) => {
    const target = 1 + Math.floor(lvl * 1.5);

    setLevel(lvl);
    setWords([]);
    setCurrentInput("");
    setWordsDestroyed(0);
    setTargetWords(target);
    setUnicornFiring(null);
    setLives(3);
    setGameState("playing");
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    nextWordIdRef.current = 0;

    // Start spawning words
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
    }

    spawnIntervalRef.current = setInterval(() => {
      spawnWord(lvl);
    }, getSpawnInterval(lvl));

    // Spawn first word immediately
    spawnWord(lvl);
  };

  const spawnWord = (lvl) => {
    const wordList = getWordList(lvl);
    const text = wordList[Math.floor(Math.random() * wordList.length)];
    const x = 15 + Math.random() * 70; // Keep away from edges

    const newWord = {
      id: nextWordIdRef.current++,
      text,
      x,
      y: 0, // Start at top (will be adjusted for safe area)
      speed: getFallSpeed(lvl),
      destroyed: false,
    };

    setWords((prev) => [...prev, newWord]);
  };

  // Animate falling words
  useEffect(() => {
    if (gameState !== "playing") return;

    const animationFrame = requestAnimationFrame(function animate() {
      setWords((prev) => {
        const updated = prev.map((word) => {
          if (word.destroyed) return word;

          const newY = word.y + word.speed;

          // Check if word reached bottom
          if (newY > 85) {
            // Lose a life
            setLives((l) => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameState("failed");
                if (spawnIntervalRef.current) {
                  clearInterval(spawnIntervalRef.current);
                }
              }
              return newLives;
            });

            return { ...word, destroyed: true };
          }

          return { ...word, y: newY };
        });

        // Remove destroyed words after animation
        return updated.filter(
          (w) => !w.destroyed || unicornFiring?.targetId === w.id
        );
      });

      if (gameState === "playing") {
        requestAnimationFrame(animate);
      }
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [gameState]);

  const handleInputChange = (e) => {
    if (gameState !== "playing") return;

    const input = e.target.value.toLowerCase().trim();
    setCurrentInput(input);

    // Check if input matches any active word
    const matchedWord = words.find((w) => !w.destroyed && w.text === input);

    if (matchedWord) {
      destroyWord(matchedWord);
    }
  };

  const destroyWord = (word) => {
    // Launch unicorn
    setUnicornFiring({
      targetId: word.id,
      targetX: word.x,
      targetY: word.y,
      startTime: Date.now(),
    });

    // Mark word as destroyed
    setWords((prev) =>
      prev.map((w) => (w.id === word.id ? { ...w, destroyed: true } : w))
    );

    setCurrentInput("");

    // After animation, update count
    setTimeout(() => {
      const newDestroyed = wordsDestroyed + 1;
      setWordsDestroyed(newDestroyed);
      setUnicornFiring(null);

      // Check if level complete
      if (newDestroyed >= targetWords) {
        if (spawnIntervalRef.current) {
          clearInterval(spawnIntervalRef.current);
        }

        onSaveProgress(level, elapsedTime / 1000);
        setGameState("scoring");
        setTimeout(() => setGameState("levelComplete"), 1000);
      }
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setCurrentInput("");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 overflow-hidden text-white select-none relative">
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

      {/* Game HUD */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-none w-full justify-center px-4"
        style={{
          top: "max(2.25rem, calc(2rem + env(safe-area-inset-top)))",
        }}
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

        {/* Lives Display */}
        <div className="bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`text-lg ${i < lives ? "666" : "opacity-20"}`}
              >
                ❤️
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game World */}
      <div
        className="absolute inset-0"
        style={{ top: "max(5rem, calc(4.5rem + env(safe-area-inset-top)))" }}
      >
        {/* Falling Words */}
        {words.map((word) => (
          <div
            key={word.id}
            className={`absolute transition-opacity duration-300 ${
              word.destroyed ? "opacity-0" : "opacity-100"
            }`}
            style={{
              left: `${word.x}%`,
              top: `${word.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="px-4 py-2 rounded-xl font-bold text-lg backdrop-blur border-2 shadow-xl bg-slate-900/80 border-cyan-500/50 text-cyan-400">
              {word.text}
            </div>
          </div>
        ))}

        {/* Unicorn Projectile */}
        {unicornFiring && (
          <div
            className="absolute w-16 h-16 transition-all duration-500 ease-out z-30 drop-shadow-2xl"
            style={{
              left: `50%`,
              top: `95%`,
              transform: `translate(-50%, -50%)`,
              animation: `flyToTarget 0.5s ease-out forwards`,
              "--target-x": `${unicornFiring.targetX}%`,
              "--target-y": `${unicornFiring.targetY}%`,
            }}
          >
            <UnicornAvatar image={unicornImage} className="w-full h-full" />
            <style>{`
              @keyframes flyToTarget {
                to {
                  left: var(--target-x);
                  top: var(--target-y);
                }
              }
            `}</style>
          </div>
        )}

        {/* Explosion Effect */}
        {unicornFiring && (
          <div
            className="absolute pointer-events-none z-40"
            style={{
              left: `${unicornFiring.targetX}%`,
              top: `${unicornFiring.targetY}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="text-6xl animate-ping">💥</div>
          </div>
        )}
      </div>

      {/* Cannon at Bottom */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20">
        <div className="relative">
          {/* Cannon */}
          <div className="w-24 h-16 bg-gradient-to-b from-slate-700 to-slate-900 rounded-t-full border-4 border-slate-600 shadow-2xl flex items-end justify-center">
            <div className="w-8 h-8 mb-1">
              <UnicornAvatar image={unicornImage} className="w-full h-full" />
            </div>
          </div>
          <div className="w-32 h-4 bg-slate-800 border-2 border-slate-700 rounded-b-lg -mt-1" />
        </div>
      </div>

      {/* Input Area */}
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
