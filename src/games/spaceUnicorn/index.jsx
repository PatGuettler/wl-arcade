import React, { useState, useEffect, useRef } from "react";
import VictoryModal from "../../components/shared/victoryModal";
import GlobalHeader from "../../components/shared/globalHeader";
import { UnicornAvatar } from "../../components/assets/gameAssets";
import { Timer } from "lucide-react";

/* ---------------- WORD LISTS ---------------- */
const WORD_LISTS = {
  easy: ["cat", "dog", "sun", "fun", "run", "hot", "pot", "top"],
  medium: ["cloud", "happy", "music", "magic", "storm", "power"],
  hard: ["rainbow", "sparkle", "unicorn", "adventure", "magnificent"],
};

const CANNON_Y = "92%";

/* ================= COMPONENT ================= */
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
  const spawnIntervalRef = useRef(null);
  const nextWordIdRef = useRef(0);

  /* ---------------- UTILS ---------------- */
  const formatTime = (ms) => (ms / 1000).toFixed(2);

  const getWordList = (lvl) =>
    lvl <= 3 ? WORD_LISTS.easy : lvl <= 8 ? WORD_LISTS.medium : WORD_LISTS.hard;

  const getFallSpeed = (lvl) => 0.03 + lvl * 0.01;
  const getSpawnInterval = (lvl) => Math.max(1500, 3000 - lvl * 150);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    launchLevel(lastCompletedLevel || 1);
  }, []);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (gameState !== "playing") return;
    startTimeRef.current = Date.now() - elapsedTime;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTimeRef.current);
    }, 50);

    return () => clearInterval(interval);
  }, [gameState]);

  /* ---------------- INPUT FOCUS ---------------- */
  useEffect(() => {
    if (gameState === "playing") {
      inputRef.current?.focus();
    }
  }, [gameState]);

  /* ---------------- LEVEL ---------------- */
  const launchLevel = (lvl) => {
    setLevel(lvl);
    setWords([]);
    setProjectiles([]);
    setCurrentInput("");
    setWordsDestroyed(0);
    setTargetWords(1 + Math.floor(lvl * 1.5));
    setLives(3);
    setElapsedTime(0);
    setGameState("playing");

    nextWordIdRef.current = 0;

    clearInterval(spawnIntervalRef.current);
    spawnIntervalRef.current = setInterval(
      () => spawnWord(lvl),
      getSpawnInterval(lvl)
    );

    spawnWord(lvl);
  };

  const spawnWord = (lvl) => {
    const list = getWordList(lvl);
    const text = list[Math.floor(Math.random() * list.length)];

    setWords((prev) => [
      ...prev,
      {
        id: nextWordIdRef.current++,
        text,
        x: 15 + Math.random() * 70,
        y: 0,
        speed: getFallSpeed(lvl),
        destroyed: false,
        targeted: false,
      },
    ]);
  };

  /* ---------------- FALLING ---------------- */
  useEffect(() => {
    if (gameState !== "playing") return;

    let raf;
    const animate = () => {
      setWords((prev) =>
        prev.map((w) => {
          if (w.destroyed) return w;

          const y = w.y + w.speed;

          if (y > 85) {
            setLives((l) => {
              const next = l - 1;
              if (next <= 0) {
                clearInterval(spawnIntervalRef.current);
                setGameState("failed");
              }
              return next;
            });
            return { ...w, destroyed: true };
          }

          return { ...w, y };
        })
      );

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [gameState]);

  /* ---------------- INPUT ---------------- */
  const handleInputChange = (e) => {
    if (gameState !== "playing") return;

    const value = e.target.value.toLowerCase().trim();
    setCurrentInput(value);

    const match = words.find(
      (w) => !w.destroyed && !w.targeted && w.text === value
    );

    if (match) fireAtWord(match);
  };

  /* ---------------- FIRE ---------------- */
  const fireAtWord = (word) => {
    setWords((prev) =>
      prev.map((w) => (w.id === word.id ? { ...w, targeted: true } : w))
    );

    setCurrentInput("");

    const projectileId = Date.now() + Math.random();

    setProjectiles((prev) => [
      ...prev,
      {
        id: projectileId,
        target: word,
        status: "flying",
      },
    ]);

    setTimeout(() => impact(word.id, projectileId), 500);
  };

  const impact = (wordId, projectileId) => {
    setWords((prev) =>
      prev.map((w) => (w.id === wordId ? { ...w, destroyed: true } : w))
    );

    setProjectiles((prev) =>
      prev.map((p) =>
        p.id === projectileId ? { ...p, status: "exploding" } : p
      )
    );

    setWordsDestroyed((d) => {
      const next = d + 1;
      if (next >= targetWords) {
        clearInterval(spawnIntervalRef.current);
        onSaveProgress(level, elapsedTime / 1000);
        setGameState("levelComplete");
      }
      return next;
    });

    setTimeout(() => {
      setProjectiles((prev) => prev.filter((p) => p.id !== projectileId));
    }, 300);
  };

  /* ---------------- CLEANUP ---------------- */
  useEffect(() => {
    return () => clearInterval(spawnIntervalRef.current);
  }, []);

  /* ================= RENDER ================= */
  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 overflow-hidden text-white relative select-none">
      {/* ---------- Animation ---------- */}
      <style>{`
        @keyframes flyToTarget {
          from {
            left: 50%;
            top: ${CANNON_Y};
            transform: translate(-50%, -50%) scale(0.6);
          }
          to {
            left: var(--target-x);
            top: var(--target-y);
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>

      <GlobalHeader coins={coins} onBack={onExit} onHome={onHome} isSubScreen />

      {/* ---------- HUD ---------- */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <div className="text-xs text-cyan-400">Lvl {level}</div>
          <div className="flex items-center gap-1 text-sm">
            <Timer size={12} />
            {formatTime(elapsedTime)}s
          </div>
        </div>

        <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={i < lives ? "" : "opacity-20"}>
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* ---------- WORDS ---------- */}
      {words.map((w) => (
        <div
          key={w.id}
          className={`absolute transition-opacity ${
            w.destroyed ? "opacity-0" : "opacity-100"
          }`}
          style={{
            left: `${w.x}%`,
            top: `${w.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="px-4 py-2 bg-slate-900/80 border-2 border-cyan-500 rounded-xl font-bold">
            {w.text}
          </div>
        </div>
      ))}

      {/* ---------- PROJECTILES ---------- */}
      {projectiles.map((p) =>
        p.status === "flying" ? (
          <div
            key={p.id}
            className="absolute w-16 h-16 z-40 pointer-events-none"
            style={{
              animation: "flyToTarget 0.5s ease-out forwards",
              "--target-x": `${p.target.x}%`,
              "--target-y": `${p.target.y}%`,
            }}
          >
            <UnicornAvatar image={unicornImage} className="w-full h-full" />
          </div>
        ) : (
          <div
            key={p.id}
            className="absolute text-6xl z-50 pointer-events-none"
            style={{
              left: `${p.target.x}%`,
              top: `${p.target.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            💥
          </div>
        )
      )}

      {/* ---------- INPUT ---------- */}
      {gameState === "playing" && (
        <input
          ref={inputRef}
          value={currentInput}
          onChange={handleInputChange}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border-2 border-cyan-500 rounded-xl px-4 py-2 text-center font-bold"
          placeholder="Type words..."
        />
      )}

      {(gameState === "levelComplete" || gameState === "failed") && (
        <VictoryModal
          state={gameState}
          time={formatTime(elapsedTime)}
          coinsEarned={calcCoins?.(level) || 0}
          onAction={() =>
            gameState === "failed" ? launchLevel(level) : launchLevel(level + 1)
          }
          isNext={gameState === "levelComplete"}
        />
      )}
    </div>
  );
};

export default SpaceUnicornGame;
