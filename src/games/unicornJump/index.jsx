import React, { useState, useEffect, useRef } from 'react';
import { Timer, X, ZoomIn, ZoomOut, CheckCircle } from 'lucide-react';
import { useGameViewport } from '../../hooks/gameViewport';
import { getBestTimes } from '../../utils/storage';
import LevelSelector from '../../components/shared/levelSelector';
import VictoryModal from '../../components/shared/victoryModal';
import { UnicornSVG } from '../../components/assets/gameAssets';
import { handleNextLevel } from '../../utils/levelMap';

const UnicornJumpGame = ({ onExit, maxLevel, onSaveProgress, history }) => {
  const viewport = useGameViewport(1);
  const [gameState, setGameState] = useState('level-select'); 
  const [level, setLevel] = useState(1);
  const [levelData, setLevelData] = useState([]);
  const [visitedIndices, setVisitedIndices] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [failReason, setFailReason] = useState('');
  const [timerKey, setTimerKey] = useState(0); 
  
  const startTimeRef = useRef(0);
  
  const NODE_SPACING = 140;
  const PATH_AMPLITUDE = 120;
  const PATH_FREQUENCY = 0.3;

  useEffect(() => {
    let interval = null;
    if (gameState === 'playing') {
      startTimeRef.current = Date.now();
      interval = setInterval(() => setElapsedTime(Date.now() - startTimeRef.current), 50);
    }
    return () => clearInterval(interval);
  }, [gameState, timerKey]);

  const launchLevel = (lvl) => {
    const len = 15 + (lvl * 5);
    const arr = new Array(len).fill(null);
    let curr = 0, last = 0, maxJ = lvl > 5 ? 6 : lvl > 2 ? 4 : 3, trapP = lvl > 5 ? 0.4 : lvl > 2 ? 0.2 : 0;
    while (curr < len) {
      let j; do { j = Math.floor(Math.random() * maxJ) + 1; } while (j === last && (len-curr) > j);
      last = j; if (j > len-curr) j = len-curr;
      arr[curr] = j; curr += j;
    }
    for (let i=0; i<len; i++) if (arr[i]===null) arr[i] = Math.random() < trapP ? -(Math.floor(Math.random()*3)+1) : Math.floor(Math.random()*maxJ)+1;

    setLevel(lvl); setLevelData(arr); setCurrentIndex(0); setVisitedIndices([0]);
    viewport.setZoom(1); viewport.setPan({x: window.innerWidth*0.25, y:0});
    setTimerKey(p=>p+1); setGameState('playing');
  };

  // Auto-Center Camera
  useEffect(() => {
    if (gameState === 'playing') {
      viewport.centerOn(currentIndex * NODE_SPACING);
    }
  }, [currentIndex, gameState]);

  const handleNodeClick = (idx) => {
    if (viewport.isDragging || gameState !== 'playing') return;
    const power = levelData[currentIndex];
    const dist = idx - currentIndex;
    if (dist === power) {
      setCurrentIndex(idx); setVisitedIndices(p => [...p, idx]);
      if (idx === levelData.length) {
        onSaveProgress(level + 1, elapsedTime/1000);
        setGameState('scoring'); 
        setTimeout(() => setGameState(level === 15 ? 'victory' : 'levelComplete'), 1000);
      }
    } else {
      setFailReason("Wrong jump!");
      setGameState('scoring');
      setTimeout(() => setGameState('failed'), 500);
    }
  };

  // Input Wrappers
  const handleDown = (e) => viewport.startDrag(e);
  const handleMove = (e) => viewport.doDrag(e);
  const handleUp = () => viewport.endDrag();

  if (gameState === 'level-select') return <LevelSelector title="Unicorn Jump" maxLevel={maxLevel} totalLevels={15} bestTimes={getBestTimes(history)} onSelectLevel={launchLevel} onBack={onExit} />;
  const formatTime = (ms) => (ms / 1000).toFixed(2);

  return (
    <div className={`w-full h-screen bg-slate-950 overflow-hidden text-white select-none ${viewport.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={handleUp} onMouseLeave={handleUp}
      onTouchStart={(e) => { viewport.touchStart(e); viewport.startDrag(e); }}
      onTouchMove={(e) => { viewport.touchMove(e); handleMove(e); }}
      onTouchEnd={(e) => { viewport.touchEnd(e); handleUp(e); }}onWheel={(e)=>viewport.applyZoom(e.deltaY*-0.001)}>
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between pointer-events-none">
         <div className="bg-slate-900/80 backdrop-blur px-6 py-3 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto"><div className="text-cyan-400 text-xs font-bold tracking-widest mb-1">UNICORN JUMP</div><div className="text-xl font-bold flex items-center gap-4"><span>Lvl {level}</span><div className="flex items-center gap-2 text-slate-400 font-mono border-l border-slate-700 pl-4 ml-2"><Timer size={16} /> {formatTime(elapsedTime)}s</div></div></div>
         <button onClick={() => setGameState('level-select')} className="pointer-events-auto p-3 bg-slate-800 rounded-full hover:bg-rose-500 transition-colors"><X size={20} /></button>
      </div>
      <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2 pointer-events-auto"><button onClick={()=>viewport.applyZoom(0.1)} className="p-3 bg-slate-800 rounded-full text-cyan-400 border border-slate-600"><ZoomIn /></button><button onClick={()=>viewport.applyZoom(-0.1)} className="p-3 bg-slate-800 rounded-full text-slate-400 border border-slate-600"><ZoomOut /></button></div>
      <div className="absolute inset-0 flex items-center origin-left will-change-transform" style={{ transform: `translate(${viewport.pan.x}px, ${viewport.pan.y}px) scale(${viewport.zoom})`, transition: viewport.isDragging ? 'none' : 'transform 0.3s ease-out' }}>
        <div className="relative h-full flex items-center">
           <svg className="absolute top-0 left-0 w-[90000px] h-full overflow-visible pointer-events-none">
              <defs><linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ef4444" /><stop offset="20%" stopColor="#f97316" /><stop offset="40%" stopColor="#eab308" /><stop offset="60%" stopColor="#22c55e" /><stop offset="80%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs>
              <path d={levelData.map((_,i) => `${i===0?'M':'L'} ${i*NODE_SPACING} ${window.innerHeight/2 + Math.sin(i*PATH_FREQUENCY)*PATH_AMPLITUDE}`).join(' ') + ` L ${levelData.length*NODE_SPACING} ${window.innerHeight/2 + Math.sin(levelData.length*PATH_FREQUENCY)*PATH_AMPLITUDE}`} fill="none" stroke="#1e293b" strokeWidth="6" />
              <path d={visitedIndices.map(i => `${i===0?'M':'L'} ${i*NODE_SPACING} ${window.innerHeight/2 + Math.sin(i*PATH_FREQUENCY)*PATH_AMPLITUDE}`).join(' ')} fill="none" stroke="url(#rainbowGradient)" strokeWidth="8" className="drop-shadow-lg" />
           </svg>
           {levelData.map((val, idx) => {
              const x = idx * NODE_SPACING; const y = Math.sin(idx * PATH_FREQUENCY) * PATH_AMPLITUDE; 
              const isCurrent = idx === currentIndex; const isVisited = visitedIndices.includes(idx);
              let baseClasses = "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:scale-105";
              if (isVisited && !isCurrent) baseClasses = "bg-emerald-900 border-emerald-500 text-emerald-400 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]";
              else if (isCurrent) baseClasses = "bg-cyan-500 border-white text-slate-900 ring-4 ring-cyan-500/30 scale-110 z-20";
              return (
                <div key={idx} onClick={() => handleNodeClick(idx)} 
                     className={`absolute flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 text-xl font-black transition-transform ${baseClasses}`}
                     style={{ left: x - 32, top: `calc(50% + ${y}px - 32px)` }}>
                  <span className="relative z-10 drop-shadow-md">{val}</span>
                  {isVisited && !isCurrent && <div className="absolute text-3xl animate-pulse drop-shadow-md select-none pointer-events-none z-40 opacity-80" style={{ marginTop: '-40px' }}>🌈</div>}
                </div>
              );
           })}
           <div className="absolute pointer-events-none z-30 w-20 h-20 transition-all duration-500 ease-in-out filter drop-shadow-2xl" style={{ left: currentIndex * NODE_SPACING - 40, top: `calc(50% + ${Math.sin(currentIndex*PATH_FREQUENCY)*PATH_AMPLITUDE}px - 90px)` }}><UnicornSVG /></div>
           {(() => {
               const lastIdx = levelData.length; const x = lastIdx * NODE_SPACING; const y = Math.sin(lastIdx * PATH_FREQUENCY) * PATH_AMPLITUDE; const isVisited = visitedIndices.includes(lastIdx);
               return (<div onClick={() => handleNodeClick(lastIdx)} className={`absolute flex items-center justify-center w-16 h-16 rounded-full border-4 transition-transform z-10 cursor-pointer ${isVisited ? 'bg-emerald-500 border-emerald-300 scale-110 shadow-[0_0_50px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-slate-900 border-slate-700 opacity-60 hover:opacity-100 hover:scale-105 hover:border-emerald-500/50'}`} style={{ left: x - 32, top: `calc(50% + ${y}px - 32px)` }}><CheckCircle className={`w-8 h-8 pointer-events-none ${isVisited ? 'text-white' : 'text-slate-600'}`} /><span className="absolute -bottom-8 text-xs font-bold tracking-widest text-emerald-600 pointer-events-none">GOAL</span></div>)
           })()}
        </div>
      </div>
      {(gameState === 'failed' || gameState === 'levelComplete' || gameState === 'victory') && <VictoryModal state={gameState} failReason={failReason} time={(elapsedTime/1000).toFixed(2)} 
        onAction={gameState === 'failed' 
          ? () => launchLevel(level) 
          : () => handleNextLevel(level, 15, setGameState, launchLevel)
        } isNext={gameState === 'levelComplete'} />}
    </div>
  );
};

export default UnicornJumpGame;