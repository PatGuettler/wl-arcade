import React, { useState, useEffect, useRef } from "react";
import VictoryModal from "../../components/shared/victoryModal";
import GlobalHeader from "../../components/shared/globalHeader";
import GameHUD from "../../components/shared/gameHUD";
import { useGameSystem } from "../../components/shared/useGameSystem";

const MathSwipeGame = ({
  onExit,
  lastCompletedLevel = 0,
  onSaveProgress,
  calcCoins,
  coins,
  onSpendCoins,
  onHome,
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

  const [problem, setProblem] = useState(null);
  const [cards, setCards] = useState([]);
  const [swipingCard, setSwipingCard] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 });
  const [problemsCompleted, setProblemsCompleted] = useState(0);
  const [targetProblems, setTargetProblems] = useState(0);

  const startPosRef = useRef({ x: 0, y: 0 });

  const formatTime = (ms) => (ms / 1000).toFixed(2);

  useEffect(() => {
    let startLvl = lastCompletedLevel;
    if (startLvl === 0) startLvl = 1;
    launchLevel(startLvl);
  }, []);

  const generateProblem = (lvl) => {
    let operation, num1, num2, answer, missingPos, displayStr;

    if (lvl <= 3) {
      // Easy: Addition 0-10
      operation = "+";
      num1 = Math.floor(Math.random() * 8) + 1;
      num2 = Math.floor(Math.random() * 8) + 1;
      answer = num1 + num2;
    } else if (lvl <= 6) {
      // Subtraction 0-10
      operation = "-";
      answer = Math.floor(Math.random() * 8) + 1;
      num2 = Math.floor(Math.random() * answer) + 1;
      num1 = answer + num2;
    } else if (lvl <= 10) {
      // Mixed add/sub, larger numbers
      operation = Math.random() > 0.5 ? "+" : "-";
      if (operation === "+") {
        num1 = Math.floor(Math.random() * 15) + 5;
        num2 = Math.floor(Math.random() * 15) + 5;
        answer = num1 + num2;
      } else {
        answer = Math.floor(Math.random() * 15) + 5;
        num2 = Math.floor(Math.random() * answer) + 1;
        num1 = answer + num2;
      }
    } else {
      // Multiplication and mixed
      const opChoice = Math.random();
      if (opChoice < 0.4) {
        operation = "×";
        num1 = Math.floor(Math.random() * 10) + 2;
        num2 = Math.floor(Math.random() * 10) + 2;
        answer = num1 * num2;
      } else if (opChoice < 0.7) {
        operation = "+";
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * 20) + 10;
        answer = num1 + num2;
      } else {
        operation = "-";
        answer = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * answer) + 1;
        num1 = answer + num2;
      }
    }

    // Randomly choose which position is missing (0=first, 1=second, 2=answer)
    missingPos = Math.floor(Math.random() * 3);

    let correctAnswer;
    if (missingPos === 0) {
      correctAnswer = num1;
      displayStr = `? ${operation} ${num2} = ${answer}`;
    } else if (missingPos === 1) {
      correctAnswer = num2;
      displayStr = `${num1} ${operation} ? = ${answer}`;
    } else {
      correctAnswer = answer;
      displayStr = `${num1} ${operation} ${num2} = ?`;
    }

    // Generate wrong answer (different but close)
    let wrongAnswer;
    do {
      const offset = Math.floor(Math.random() * 6) - 3; // -3 to +3
      wrongAnswer = correctAnswer + (offset === 0 ? 1 : offset);
    } while (wrongAnswer === correctAnswer || wrongAnswer < 0);

    return {
      displayStr,
      correctAnswer,
      wrongAnswer,
      operation,
    };
  };

  const launchLevel = (lvl) => {
    const target = 3 + Math.floor(lvl / 2);
    setProblemsCompleted(0);
    setTargetProblems(target);
    startGame(lvl);
    generateNewProblem(lvl);
  };

  const generateNewProblem = (lvl) => {
    const newProblem = generateProblem(lvl);
    setProblem(newProblem);

    // Randomly position correct card on left or right
    const correctOnLeft = Math.random() > 0.5;
    setCards([
      {
        id: "left",
        value: correctOnLeft
          ? newProblem.correctAnswer
          : newProblem.wrongAnswer,
        isCorrect: correctOnLeft,
      },
      {
        id: "right",
        value: correctOnLeft
          ? newProblem.wrongAnswer
          : newProblem.correctAnswer,
        isCorrect: !correctOnLeft,
      },
    ]);
  };

  const handleSwipeStart = (e, cardId) => {
    if (gameState !== "playing") return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startPosRef.current = { x: clientX, y: clientY };
    setSwipingCard(cardId);
  };

  const handleSwipeMove = (e) => {
    if (!swipingCard || gameState !== "playing") return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - startPosRef.current.x;
    const dy = clientY - startPosRef.current.y;
    setSwipeOffset({ x: dx, y: dy });
  };

  const handleSwipeEnd = () => {
    if (!swipingCard || gameState !== "playing") return;

    const threshold = 80;
    const swipedCard = cards.find((c) => c.id === swipingCard);

    if (
      Math.abs(swipeOffset.x) > threshold ||
      Math.abs(swipeOffset.y) > threshold
    ) {
      // Card was swiped
      registerMove(swipedCard.isCorrect);

      if (swipedCard.isCorrect) {
        // Correct!
        const newCompleted = problemsCompleted + 1;
        setProblemsCompleted(newCompleted);

        if (newCompleted >= targetProblems) {
          completeLevel();
        } else {
          // Generate next problem
          setTimeout(() => generateNewProblem(level), 300);
        }
      } else {
        // Wrong!
        failLevel("Wrong answer!");
      }
    }

    setSwipingCard(null);
    setSwipeOffset({ x: 0, y: 0 });
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex flex-col relative font-sans text-white overflow-hidden">
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
        title="Math Swipe"
        level={level}
        elapsedTime={elapsedTime}
        gameState={gameState}
        coins={coins}
        onBuyHint={buyHint}
        showHint={showHint}
        hintCost={hintCost}
        isFreeHint={level === 1 && movesMade < 2}
      />

      <div className="flex-1 flex flex-col items-center justify-center gap-8 pt-20 pb-8">
        {/* Progress */}
        <div className="bg-slate-900/80 backdrop-blur px-6 py-3 rounded-2xl border border-slate-700 shadow-xl">
          <div className="text-cyan-400 text-xs font-bold tracking-widest mb-1">
            PROGRESS
          </div>
          <div className="text-3xl font-black text-white">
            {problemsCompleted} / {targetProblems}
          </div>
        </div>

        {/* Math Problem */}
        {problem && (
          <div className="bg-slate-900/90 backdrop-blur border-2 border-cyan-500/50 rounded-3xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">
                Solve the equation
              </div>
              <div className="text-5xl font-black text-white tracking-wide">
                {problem.displayStr}
              </div>
            </div>
          </div>
        )}

        {/* Instruction */}
        <div className="text-center text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">
          Swipe the correct answer
        </div>

        {/* Cards */}
        <div className="flex gap-8 px-8 w-full max-w-2xl justify-center">
          {cards.map((card) => {
            const isBeingSwiped = swipingCard === card.id;
            const opacity = isBeingSwiped
              ? Math.max(0.3, 1 - Math.abs(swipeOffset.x) / 200)
              : 1;
            const rotation = isBeingSwiped ? swipeOffset.x * 0.1 : 0;

            return (
              <div
                key={card.id}
                onMouseDown={(e) => handleSwipeStart(e, card.id)}
                onMouseMove={handleSwipeMove}
                onMouseUp={handleSwipeEnd}
                onMouseLeave={handleSwipeEnd}
                onTouchStart={(e) => handleSwipeStart(e, card.id)}
                onTouchMove={handleSwipeMove}
                onTouchEnd={handleSwipeEnd}
                className={`
                  relative w-48 h-64 rounded-3xl cursor-grab active:cursor-grabbing
                  transition-all duration-200
                  ${
                    showHint && card.isCorrect
                      ? "animate-pulse shadow-[0_0_40px_rgba(234,179,8,0.8)] border-4 border-yellow-400"
                      : "border-4 border-slate-700"
                  }
                  ${isBeingSwiped ? "z-50" : "z-10"}
                `}
                style={{
                  transform: isBeingSwiped
                    ? `translate(${swipeOffset.x}px, ${swipeOffset.y}px) rotate(${rotation}deg) scale(1.05)`
                    : "translate(0, 0) rotate(0deg) scale(1)",
                  opacity,
                  background: card.isCorrect
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl font-black text-white drop-shadow-2xl">
                    {card.value}
                  </div>
                </div>

                {showHint && card.isCorrect && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full animate-bounce">
                    THIS ONE!
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center text-slate-500 text-xs mt-4">
          Swipe left, right, up, or down to select
        </div>
      </div>

      {(gameState === "levelComplete" || gameState === "failed") && (
        <VictoryModal
          state={gameState}
          failReason={gameState === "failed" ? "Wrong answer!" : ""}
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

export default MathSwipeGame;
