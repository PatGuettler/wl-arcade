import { useState, useEffect, useRef } from "react";
import { generateLevelData, generateNodePositions } from "./levelUtils";

export const useUnicornGame = (
  initialLevel,
  onSaveProgress,
  onSpendCoins,
  viewport
) => {
  const [gameState, setGameState] = useState("playing");
  const [level, setLevel] = useState(1);
  const [levelData, setLevelData] = useState([]);
  const [visitedIndices, setVisitedIndices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [nodePositions, setNodePositions] = useState([]);
  const [showHint, setShowHint] = useState(false);

  const startTimeRef = useRef(0);
  const HINT_COST = 5;

  // Timer Effect
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

  // Viewport Auto-Pan Effect
  useEffect(() => {
    if (gameState === "playing" && nodePositions[currentIndex]) {
      const pos = nodePositions[currentIndex];
      const targetScreenX = window.innerWidth / 2;
      const targetScreenY = window.innerHeight * 0.35;
      const newPanX = targetScreenX - pos.x * viewport.zoom;
      const newPanY = targetScreenY - pos.y * viewport.zoom;
      viewport.setPan({ x: newPanX, y: newPanY });
    }
  }, [currentIndex, gameState, nodePositions, viewport.zoom, viewport.setPan]);

  const launchLevel = (lvl) => {
    setLevel(lvl);
    const arr = generateLevelData(lvl);
    const positions = generateNodePositions(arr.length);

    setLevelData(arr);
    setNodePositions(positions);
    setCurrentIndex(0);
    setVisitedIndices([0]);
    setShowHint(false);

    // Reset Viewport
    viewport.setZoom(1);
    viewport.setPan({ x: 0, y: window.innerHeight * 0.3 });

    setElapsedTime(0);
    setGameState("playing");
  };

  const handleNodeClick = (idx) => {
    if (viewport.isDragging || gameState !== "playing") return;
    const power = levelData[currentIndex];
    const dist = idx - currentIndex;

    if (dist === power) {
      // Successful Jump
      setCurrentIndex(idx);
      setVisitedIndices((p) => [...p, idx]);
      setShowHint(false);

      // Check Victory
      if (idx === levelData.length) {
        const finalTime = elapsedTime / 1000;
        onSaveProgress(level, finalTime);
        setGameState("scoring");
        setTimeout(() => setGameState("levelComplete"), 1000);
      }
    } else {
      // Fail
      setGameState("failed");
    }
  };

  const buyHint = () => {
    if (showHint) return;
    if (onSpendCoins(HINT_COST)) {
      setShowHint(true);
    }
  };

  return {
    gameState,
    level,
    levelData,
    visitedIndices,
    currentIndex,
    elapsedTime,
    nodePositions,
    showHint,
    launchLevel,
    handleNodeClick,
    buyHint,
    HINT_COST,
  };
};
