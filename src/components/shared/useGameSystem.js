import { useState, useEffect, useRef } from "react";

export const useGameSystem = ({
  initialLevel = 1,
  onSaveProgress,
  onSpendCoins,
  hintCost = 5,
  maxLevelMovesForFreeHints = 2, // Level 1: First 2 moves are free hints
}) => {
  const [gameState, setGameState] = useState("playing");
  const [level, setLevel] = useState(initialLevel);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [movesMade, setMovesMade] = useState(0);
  const [hintUsedThisMove, setHintUsedThisMove] = useState(false);

  const startTimeRef = useRef(0);

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (gameState === "playing") {
      startTimeRef.current = Date.now() - elapsedTime; // Resume correctly
      interval = setInterval(
        () => setElapsedTime(Date.now() - startTimeRef.current),
        50
      );
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const startGame = (lvl) => {
    setLevel(lvl);
    setElapsedTime(0);
    setMovesMade(0);
    setHintUsedThisMove(false);
    setGameState("playing");
    startTimeRef.current = Date.now();

    // Auto-show hint on level 1
    if (lvl === 1) {
      setShowHint(true);
    } else {
      setShowHint(false);
    }
  };

  const registerMove = (isValid) => {
    if (gameState !== "playing") return;

    // Hide hint after any move
    setShowHint(false);
    setHintUsedThisMove(false);

    // Increment moves for tutorial/hint logic
    const newMoveCount = movesMade + 1;
    setMovesMade(newMoveCount);

    // Auto-show hint on level 1 for first 2 moves
    if (level === 1 && newMoveCount < maxLevelMovesForFreeHints && isValid) {
      // Small delay so hint doesn't show immediately
      setTimeout(() => {
        setShowHint(true);
      }, 300);
    }
  };

  const buyHint = () => {
    if (showHint || gameState !== "playing" || hintUsedThisMove) return;

    // Check if we are in the "free hint" window (e.g. level 1, first 2 moves)
    const isFree = level === 1 && movesMade < maxLevelMovesForFreeHints;

    if (isFree) {
      setShowHint(true);
      setHintUsedThisMove(true);
      return;
    }

    // Try to spend coins for hint
    if (onSpendCoins(hintCost)) {
      setShowHint(true);
      setHintUsedThisMove(true);
    }
  };

  const completeLevel = () => {
    const finalTime = elapsedTime / 1000;
    onSaveProgress(level, finalTime);
    setGameState("scoring");
    setTimeout(() => setGameState("levelComplete"), 1000);
  };

  const failLevel = (reason) => {
    setShowHint(false);
    setGameState("failed");
  };

  return {
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
  };
};
