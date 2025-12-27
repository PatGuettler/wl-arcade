import React, { useState, useEffect, useRef } from "react";
import VictoryModal from "../../components/shared/victoryModal";
import GlobalHeader from "../../components/shared/globalHeader";
import GameHUD from "../../components/shared/gameHUD";
import { useGameSystem } from "../../components/shared/useGameSystem";
import { UnicornAvatar } from "../../components/assets/gameAssets";

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

const UnicornSpellGame = ({
  onExit,
  lastCompletedLevel = 0,
  onSaveProgress,
  calcCoins,
  coins,
  onSpendCoins,
  onHome,
  unicornImage,
}) => {
  const {
    gameState,
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

  const [words, setWords] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [wordsCollected, setWordsCollected] = useState(0);
  const [targetWords, setTargetWords] = useState(0);
  const [unicornPos, setUnicornPos] = useState({ x: 50, y: 80 });
  const [collectingWord, setCollectingWord] = useState(null);
  const inputRef = useRef(null);

  const formatTime = (ms) => (ms / 1000).toFixed(2);

  useEffect(() => {
    let startLvl = lastCompletedLevel;
    if (startLvl === 0) startLvl = 1;
    launchLevel(startLvl);
  }, []);

  // Keep input focused
  useEffect(() => {
    if (gameState === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, words]);

  const getWordList = (lvl) => {
    if (lvl <= 3) return WORD_LISTS.easy;
    if (lvl <= 8) return WORD_LISTS.medium;
    return WORD_LISTS.hard;
  };

  const generateWords = (lvl) => {
    const wordList = getWordList(lvl);
    const count = Math.min(5 + lvl, 15);
    const selected = [];

    for (let i = 0; i < count; i++) {
      const word = wordList[Math.floor(Math.random() * wordList.length)];
      const x = 10 + Math.random() * 80;
      const y = 10 + Math.random() * 60;

      selected.push({
        id: `${word}-${i}`,
        text: word,
        x,
        y,
        collected: false,
      });
    }

    return selected;
  };

  const launchLevel = (lvl) => {
    const newWords = generateWords(lvl);
    setWords(newWords);
    setCurrentInput("");
    setWordsCollected(0);
    setTargetWords(newWords.length);
    setUnicornPos({ x: 50, y: 80 });
    setCollectingWord(null);
    startGame(lvl);
  };

  const handleInputChange = (e) => {
    if (gameState !== "playing") return;

    const input = e.target.value.toLowerCase().trim();
    setCurrentInput(input);

    // Check if input matches any word
    const matchedWord = words.find((w) => !w.collected && w.text === input);

    if (matchedWord) {
      collectWord(matchedWord);
    }
  };

  const collectWord = (word) => {
    // Animate unicorn to word
    setCollectingWord(word.id);
    setUnicornPos({ x: word.x, y: word.y });

    setTimeout(() => {
      setWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, collected: true } : w))
      );

      const newCollected = wordsCollected + 1;
      setWordsCollected(newCollected);
      setCurrentInput("");
      setCollectingWord(null);

      registerMove(true);

      // Return unicorn to bottom
      setTimeout(() => {
        setUnicornPos({ x: 50, y: 80 });
      }, 300);

      // Check if level complete
      if (newCollected >= targetWords) {
        completeLevel();
      }
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setCurrentInput("");
    }
  };

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

      <GameHUD
        title="Unicorn Spell"
        level={level}
        elapsedTime={elapsedTime}
        gameState={gameState}
        coins={coins}
        onBuyHint={buyHint}
        showHint={showHint}
        hintCost={hintCost}
        isFreeHint={level === 1 && movesMade < 2}
      />

      {/* Game World */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Floating Words */}
        {words.map((word) => (
          <div
            key={word.id}
            className={`absolute transition-all duration-500 ${
              word.collected ? "opacity-0 scale-0" : "opacity-100 scale-100"
            } ${collectingWord === word.id ? "z-30" : "z-10"}`}
            style={{
              left: `${word.x}%`,
              top: `${word.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={`px-4 py-2 rounded-xl font-bold text-lg backdrop-blur border-2 shadow-xl ${
                showHint &&
                !word.collected &&
                words.filter((w) => !w.collected)[0]?.id === word.id
                  ? "bg-yellow-500/30 border-yellow-400 text-white animate-pulse"
                  : "bg-slate-900/80 border-cyan-500/50 text-cyan-400"
              }`}
            >
              {word.text}
            </div>
          </div>
        ))}

        {/* Unicorn */}
        <div
          className="absolute w-20 h-20 transition-all duration-500 ease-out z-20 drop-shadow-2xl"
          style={{
            left: `${unicornPos.x}%`,
            top: `${unicornPos.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <UnicornAvatar image={unicornImage} className="w-full h-full" />

          {collectingWord && (
            <div className="absolute inset-0 animate-ping">
              <div className="w-full h-full rounded-full bg-cyan-400/50" />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      {gameState === "playing" && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-30">
          <div className="bg-slate-900/90 backdrop-blur border-2 border-cyan-500/50 rounded-2xl p-6 shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                Type the words
              </div>
              <div className="text-2xl font-black text-white">
                {wordsCollected} / {targetWords}
              </div>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type here..."
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-4 py-3 text-white text-center text-xl font-bold placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
            />

            <div className="text-center text-slate-500 text-xs mt-2">
              Press ESC to clear
            </div>
          </div>
        </div>
      )}

      {(gameState === "levelComplete" || gameState === "failed") && (
        <VictoryModal
          state={gameState}
          failReason={gameState === "failed" ? "Time ran out!" : ""}
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

export default UnicornSpellGame;
