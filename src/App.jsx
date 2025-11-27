import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCcw, Trophy, AlertTriangle, CheckCircle, Timer, 
  Hand, MousePointer2, ZoomIn, ZoomOut, User, LogOut, 
  LayoutGrid, Calculator, Type, Rocket, ArrowLeft, X, 
  Lock, Maximize, GripVertical, Coins, DollarSign, Banknote
} from 'lucide-react';

// ==========================================
// GAME ENGINE: CORE HOOKS
// ==========================================
const useGameViewport = (initialZoom = 1) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const stateRef = useRef({ zoom: initialZoom, pan: { x: 0, y: 0 }, isDragging: false, start: { x: 0, y: 0 } });

  useEffect(() => {
    stateRef.current.zoom = zoom;
    stateRef.current.pan = pan;
    stateRef.current.isDragging = isDragging;
  }, [zoom, pan, isDragging]);

  const applyZoom = (delta, centerPoint = { x: window.innerWidth / 2, y: window.innerHeight / 2 }) => {
    const currentZoom = stateRef.current.zoom;
    const newZoom = Math.max(0.2, Math.min(2.0, currentZoom + delta));
    if (newZoom === currentZoom) return;
    const worldFocusX = (centerPoint.x - stateRef.current.pan.x) / currentZoom;
    const newPanX = centerPoint.x - (worldFocusX * newZoom);
    setZoom(newZoom);
    setPan(prev => ({ ...prev, x: newPanX }));
  };

  const startDrag = (e) => {
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    setIsDragging(true);
    stateRef.current.start = { x: cx, panX: stateRef.current.pan.x };
  };

  const doDrag = (e) => {
    if (!stateRef.current.isDragging) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = cx - stateRef.current.start.x;
    setPan(prev => ({ ...prev, x: stateRef.current.start.panX + delta }));
  };

  const endDrag = () => setIsDragging(false);

  const centerOn = (worldX) => {
    const screenCenter = window.innerWidth / 2;
    const newPanX = screenCenter - (worldX * stateRef.current.zoom);
    setPan(prev => ({ ...prev, x: newPanX }));
  };

  return { zoom, pan, isDragging, startDrag, doDrag, endDrag, applyZoom, centerOn, setZoom, setPan };
};

// ==========================================
// PERSISTENCE HELPER
// ==========================================
const DB_KEY = 'algo_arcade_v21'; 

const getDB = () => {
  const stored = localStorage.getItem(DB_KEY);
  if (!stored) return { users: {}, lastUser: '' };
  return JSON.parse(stored);
};

const saveDB = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const getBestTimes = (timesArray) => {
  const bests = {};
  if (!timesArray) return bests;
  timesArray.forEach(entry => {
    if (!bests[entry.level] || entry.time < bests[entry.level]) {
      bests[entry.level] = entry.time;
    }
  });
  return bests;
};

// ==========================================
// ASSETS
// ==========================================

const UnicornSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 65 L20 85 M40 65 L40 85 M60 65 L60 85 M80 65 L80 85" stroke="#f472b6" strokeWidth="4" />
    <path d="M20 65 Q 20 40 40 40 L 70 40 Q 90 40 90 60 L 90 65 L 20 65 Z" fill="#fff" stroke="#f472b6" strokeWidth="3" />
    <path d="M70 40 L 70 25 Q 70 10 90 15 L 95 25 Q 90 40 70 40" fill="#fff" stroke="#f472b6" strokeWidth="3" />
    <path d="M85 15 L 95 0 L 92 18" fill="#facc15" stroke="#eab308" />
    <path d="M20 45 Q 0 45 5 70" stroke="#a855f7" strokeWidth="4" />
    <path d="M70 25 Q 60 25 65 45" stroke="#3b82f6" strokeWidth="4" />
    <circle cx="85" cy="25" r="2" fill="#000" />
  </svg>
);

// REALISTIC COIN IMAGES
const COIN_ASSETS = {
  penny: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/US_One_Cent_Obv.png/240px-US_One_Cent_Obv.png",
  nickel: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/US_Nickel_2013_Obv.png/240px-US_Nickel_2013_Obv.png",
  dime: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Dime_Obverse_13.png/240px-Dime_Obverse_13.png",
  quarter: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/2006_Quarter_Proof.png/240px-2006_Quarter_Proof.png"
};

// REALISTIC BILL IMAGES
const BILL_ASSETS = {
  1: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/US_one_dollar_bill%2C_obverse%2C_series_2009.jpg/640px-US_one_dollar_bill%2C_obverse%2C_series_2009.jpg",
  5: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/US_%245_Series_2006_Obverse.jpg/640px-US_%245_Series_2006_Obverse.jpg",
  10: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/US10dollarbill-Series_2004A.jpg/640px-US10dollarbill-Series_2004A.jpg",
  20: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/US_%2420_Series_2006_Obverse.jpg/640px-US_%2420_Series_2006_Obverse.jpg",
  50: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/US_%2450_Series_2006_Obverse.jpg/640px-US_%2450_Series_2006_Obverse.jpg",
  100: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/US_%24100_Series_2009_Obverse.jpg/640px-US_%24100_Series_2009_Obverse.jpg"
};

const Coin = ({ type, onClick, disabled }) => {
  const size = type === 'quarter' ? 100 : type === 'nickel' ? 85 : type === 'penny' ? 75 : 70;
  return (
    <button onClick={onClick} disabled={disabled} className={`transition-transform ${disabled ? 'opacity-50' : 'hover:scale-110 active:scale-95 cursor-pointer'}`}>
      <img src={COIN_ASSETS[type]} alt={type} style={{ width: size, height: size }} className="drop-shadow-xl object-contain" />
    </button>
  );
};

const Bill = ({ value, onClick, disabled }) => {
  return (
    <button onClick={onClick} disabled={disabled} className={`transition-transform ${disabled ? 'opacity-50' : 'hover:scale-105 active:scale-95 cursor-pointer'}`}>
      <img src={BILL_ASSETS[value]} alt={`$${value}`} className="w-40 drop-shadow-xl rounded-md" />
    </button>
  );
};

const BracketLeftSVG = () => (<svg viewBox="0 0 30 120" width="25" height="120" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><path d="M25 5 L5 5 L5 115 L25 115" /></svg>);
const BracketRightSVG = () => (<svg viewBox="0 0 30 120" width="25" height="120" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><path d="M5 5 L25 5 L25 115 L5 115" /></svg>);

// ==========================================
// COMPONENTS
// ==========================================
const LevelSelector = ({ title, maxLevel, totalLevels, onSelectLevel, onBack, bestTimes }) => (
  <div className="w-full h-full bg-slate-950 p-6 overflow-y-auto animate-fade-in">
    <div className="max-w-md mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={18} /> Back
      </button>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white mb-2">{title}</h1>
        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">Select a Level</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: totalLevels }, (_, i) => {
          const lvl = i + 1;
          const locked = lvl > maxLevel;
          const completed = lvl < maxLevel;
          return (
            <button key={lvl} disabled={locked} onClick={() => onSelectLevel(lvl)}
              className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition-all ${locked ? 'bg-slate-900 border-slate-800 text-slate-700' : 'bg-slate-800 border-emerald-500 text-emerald-400 hover:scale-105'}`}
            >
              {locked ? <Lock size={20} /> : <><span className="text-2xl font-black">{lvl}</span>{bestTimes[lvl] && <span className="text-[10px] font-mono mt-1 text-slate-400">{bestTimes[lvl].toFixed(1)}s</span>}{completed && <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />}</>}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

const VictoryModal = ({ state, failReason, time, onAction, isNext }) => (
  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-in fade-in zoom-in">
    <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4">
        {state === 'failed' ? <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" /> : <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />}
        <h2 className="text-4xl font-black text-white mb-2">{state === 'failed' ? 'OOPS!' : state === 'victory' ? 'ALL CLEARED!' : 'COMPLETE!'}</h2>
        <p className="text-slate-400 font-mono mb-8">{state === 'failed' ? failReason : `Time: ${time}s`}</p>
        <button onClick={onAction} className="w-full py-4 bg-white text-slate-900 font-black rounded-xl hover:scale-105 shadow-xl flex items-center justify-center gap-2">
          {state === 'failed' ? <RotateCcw /> : <CheckCircle />} {state === 'failed' ? 'TRY AGAIN' : isNext ? 'NEXT LEVEL' : 'FINISH'}
        </button>
    </div>
  </div>
);

// ==========================================
// GAME 1: UNICORN JUMP
// ==========================================
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
  
  const timerRef = useRef(null);
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

  const handleNextLevel = () => { if (level >= 15) setGameState('victory'); else launchLevel(level + 1); };

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
  const handleWheel = (e) => viewport.applyZoom(e.deltaY * -0.001);

  if (gameState === 'level-select') return <LevelSelector title="Unicorn Jump" maxLevel={maxLevel} totalLevels={15} bestTimes={getBestTimes(history)} onSelectLevel={launchLevel} onBack={onExit} />;
  const formatTime = (ms) => (ms / 1000).toFixed(2);
  const getNodeY = (i) => Math.sin(i * PATH_FREQUENCY) * PATH_AMPLITUDE;

  return (
    <div className={`w-full h-screen bg-slate-950 overflow-hidden text-white select-none ${viewport.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={handleUp} onMouseLeave={handleUp}
      onTouchStart={handleDown} onTouchMove={handleMove} onTouchEnd={handleUp} onWheel={(e)=>viewport.applyZoom(e.deltaY*-0.001)}>
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
      {(gameState === 'failed' || gameState === 'levelComplete' || gameState === 'victory') && <VictoryModal state={gameState} failReason={failReason} time={(elapsedTime/1000).toFixed(2)} onAction={gameState === 'failed' ? () => launchLevel(level) : handleNextLevel} isNext={gameState === 'levelComplete'} />}
    </div>
  );
};

// ==========================================
// GAME 2: SLIDING WINDOW
// ==========================================
const SlidingWindowGame = ({ onExit, maxLevel, onSaveProgress, history }) => {
  const viewport = useGameViewport(1);
  const [gameState, setGameState] = useState('level-select'); 
  const [level, setLevel] = useState(1);
  const [levelData, setLevelData] = useState([]);
  const [windowSize, setWindowSize] = useState(3);
  const [windowPos, setWindowPos] = useState(0);
  const [failMessage, setFailMessage] = useState('');
  const [bracketPos, setBracketPos] = useState(0); 
  const bracketPosRef = useRef(0); 
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  
  const isDraggingBracket = useRef(false);
  const dragStartBracketX = useRef(0);
  const bracketStartRef = useRef(0);
  const startTimeRef = useRef(0);

  const NODE_WIDTH = 80; const NODE_GAP = 16; const FULL_W = 96; const PADDING = 40;

  useEffect(() => {
    if (gameState === 'setup' || gameState === 'playing') {
      startTimeRef.current = Date.now();
      const interval = setInterval(() => setElapsedTime(Date.now() - startTimeRef.current), 50);
      return () => clearInterval(interval);
    }
  }, [gameState, timerKey]);

  const launchLevel = (lvl) => {
    const len = 15 + (lvl > 5 ? 5 : 0);
    const min = lvl > 5 ? -100 : 0;
    const max = lvl > 2 ? 100 : 20;
    const data = Array.from({ length: len }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    setLevel(lvl); setLevelData(data); setWindowSize(Math.floor(Math.random() * 3) + 3);
    setWindowPos(0); setBracketPos(0); setElapsedTime(0); setTimerKey(p=>p+1);
    viewport.setZoom(1); viewport.setPan({x:0,y:0});
    bracketPosRef.current = 0;
    setGameState('setup');
  };

  const handleNodeClick = (idx) => {
    if (gameState !== 'playing') return;
    const winIndices = Array.from({length:windowSize}, (_,i) => windowPos + i);
    if (!winIndices.includes(idx)) return fail("Clicked outside window!");
    
    const maxVal = Math.max(...winIndices.map(i => levelData[i]));
    if (levelData[idx] === maxVal) {
       if (windowPos + windowSize >= levelData.length) {
          onSaveProgress(level + 1, elapsedTime/1000);
          setGameState('scoring');
          setTimeout(() => setGameState(level === 20 ? 'victory' : 'levelComplete'), 500);
       } else {
          setWindowPos(p => p + 1);
          viewport.centerOn(PADDING + ((windowPos + 1) * FULL_W) + (FULL_W * windowSize / 2));
       }
    } else {
       fail("Not the max value!");
    }
  };

  const fail = (msg) => { setFailMessage(msg); setGameState('scoring'); setTimeout(() => setGameState('failed'), 1000); };

  // Combined Input Handlers
  const handleMove = (e) => {
     const cx = e.touches ? e.touches[0].clientX : e.clientX;
     if (isDraggingBracket.current) {
        e.preventDefault(); // Stop scroll
        const diff = Math.round((cx - dragStartBracketX.current) / (FULL_W * viewport.zoom));
        setBracketPos(Math.max(0, Math.min(levelData.length-1, bracketStartRef.current + diff)));
        bracketPosRef.current = Math.max(0, Math.min(levelData.length-1, bracketStartRef.current + diff));
     } else {
        viewport.doDrag(e);
     }
  };

  const handleUp = () => {
    if (isDraggingBracket.current) {
        isDraggingBracket.current = false;
        if (bracketPosRef.current + 1 === windowSize) setGameState('playing'); else fail(`Selected ${bracketPosRef.current+1}, needed ${windowSize}`);
    }
    viewport.endDrag();
  };

  const handleBracketDown = (e) => {
    e.stopPropagation();
    isDraggingBracket.current = true;
    dragStartBracketX.current = e.touches ? e.touches[0].clientX : e.clientX;
    bracketStartRef.current = bracketPosRef.current;
  };

  if (gameState === 'level-select') return <LevelSelector title="Sliding Window" maxLevel={maxLevel} totalLevels={20} bestTimes={getBestTimes(history)} onSelectLevel={launchLevel} onBack={onExit} />;
  const formatTime = (ms) => (ms / 1000).toFixed(2);

  return (
    <div className={`w-full h-screen bg-slate-950 overflow-hidden text-white select-none ${viewport.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={viewport.startDrag} onMouseMove={handleMove} onMouseUp={handleUp} onMouseLeave={handleUp}
      onTouchStart={viewport.startDrag} onTouchMove={handleMove} onTouchEnd={handleUp} onWheel={(e) => viewport.applyZoom(e.deltaY * -0.001)}>
      
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur px-6 py-3 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto">
          <h2 className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-1">SLIDING WINDOW</h2>
          <div className="text-xl font-bold flex items-center gap-4">
             {gameState === 'setup' ? <span>Select <span className="text-emerald-400 text-2xl">{windowSize}</span> nodes</span> : <span className="text-emerald-400 animate-pulse">FIND MAX</span>}
             {(gameState === 'setup' || gameState === 'playing' || gameState === 'scoring') && <div className="flex items-center gap-2 text-slate-400 font-mono border-l border-slate-700 pl-4 ml-2"><Timer size={16} /> {formatTime(elapsedTime)}s</div>}
          </div>
        </div>
        <button onClick={onExit} className="pointer-events-auto p-3 bg-slate-800 rounded-full hover:bg-rose-500 transition-colors"><X size={20} /></button>
      </div>
      <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2 pointer-events-auto"><button onClick={()=>viewport.applyZoom(0.2)} className="p-3 bg-slate-800 rounded-full text-cyan-400 border border-slate-600"><ZoomIn /></button><button onClick={()=>viewport.applyZoom(-0.2)} className="p-3 bg-slate-800 rounded-full text-slate-400 border border-slate-600"><ZoomOut /></button></div>

      <div className="flex-1 flex items-center relative will-change-transform origin-left" style={{ transform: `translate(${viewport.pan.x}px, ${viewport.pan.y}px) scale(${viewport.zoom})`, transition: viewport.isDragging || isDraggingBracket.current ? 'none' : 'transform 0.3s ease-out', height: '100%' }}>
        <div className="flex gap-4 py-20 relative" style={{ paddingLeft: PADDING }}>
           {gameState === 'setup' && (
             <>
               <div className="absolute top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" style={{ left: 15 }}><BracketLeftSVG /></div>
               <div onMouseDown={handleBracketDown} onTouchStart={handleBracketDown} className="absolute top-1/2 -translate-y-1/2 text-cyan-400 cursor-ew-resize z-50" style={{ left: PADDING + (bracketPos * FULL_W) + NODE_WIDTH + 5 }}><BracketRightSVG /><div className="absolute top-1/2 -translate-y-1/2 -right-8 w-8 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/50 animate-pulse"><GripVertical size={16} /></div></div>
               <div className="absolute top-1/2 -translate-y-1/2 h-24 bg-cyan-500/10 border-y border-cyan-500/30 pointer-events-none" style={{ left: PADDING - 10, width: (bracketPos * FULL_W) + NODE_WIDTH + 20 }} />
             </>
           )}
           {gameState === 'playing' && <div className="absolute top-1/2 -translate-y-1/2 h-32 border-4 border-emerald-500 rounded-xl transition-all duration-300 ease-out shadow-[0_0_30px_rgba(16,185,129,0.4)] pointer-events-none z-10" style={{ left: PADDING + (windowPos * FULL_W) - 8, width: windowSize * FULL_W - NODE_GAP + 16 }} />}
           {levelData.map((val, idx) => {
             let bg = "bg-slate-900 border-slate-700 text-slate-500";
             if (gameState === 'setup' && idx <= bracketPos) bg = "bg-cyan-900/50 border-cyan-500 text-white";
             else if (gameState === 'playing' && idx >= windowPos && idx < windowPos + windowSize) bg = "bg-slate-800 border-slate-500 text-white";
             return <div key={idx} onClick={() => handleNodeClick(idx)} className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 flex items-center justify-center text-xl font-black ${bg} hover:scale-105 active:scale-95 transition-transform`}>{val}</div>
           })}
        </div>
      </div>
      {(gameState === 'failed' || gameState === 'levelComplete' || gameState === 'victory') && <VictoryModal state={gameState} failReason={failMessage} time={formatTime(elapsedTime)} onAction={gameState === 'failed' ? () => launchLevel(level) : handleNextLevel} isNext={gameState === 'levelComplete'} />}
    </div>
  );
};

// ==========================================
// GAME 3: COIN COUNT
// ==========================================
const CoinCountGame = ({ onExit, maxLevel, onSaveProgress, history }) => {
  const bestTimes = getBestTimes(history);
  const TOTAL_LEVELS = 15;
  const [gameState, setGameState] = useState('level-select');
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState(0);
  const [current, setCurrent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(0);

  const formatMoney = (c) => `$${(c/100).toFixed(2)}`;
  const formatTime = (ms) => (ms / 1000).toFixed(2);
  const coins = [{id:'p',v:1,t:'penny'},{id:'n',v:5,t:'nickel'},{id:'d',v:10,t:'dime'},{id:'q',v:25,t:'quarter'}];

  useEffect(() => {
    let interval = null;
    if (gameState === 'playing') {
      startTimeRef.current = Date.now();
      const i = setInterval(() => setElapsed(Date.now() - startTimeRef.current), 50);
      return () => clearInterval(i);
    }
  }, [gameState]);

  const launchLevel = (lvl) => {
    const tgt = lvl <= 3 ? (Math.floor(Math.random()*9)+1)*5 : lvl <= 8 ? Math.floor(Math.random()*100)+25 : Math.floor(Math.random()*400)+100;
    setLevel(lvl); setTarget(tgt); setCurrent(0); setGameState('playing');
  };

  const handleCoin = (v) => {
    if (gameState !== 'playing') return;
    const next = current + v;
    setCurrent(next);
    if (next === target) {
      onSaveProgress(level+1, elapsed/1000);
      setGameState('scoring');
      setTimeout(() => setGameState(level === 15 ? 'victory' : 'levelComplete'), 1000);
    } else if (next > target) {
      setGameState('scoring');
      setTimeout(() => setGameState('failed'), 1000);
    }
  };

  const handleNext = () => { if (level >= 15) setGameState('victory'); else launchLevel(level+1); };
  if (gameState === 'level-select') return <LevelSelector title="Coin Count" maxLevel={maxLevel} totalLevels={15} bestTimes={bestTimes} onSelectLevel={launchLevel} onBack={onExit} />;
  
  const pct = Math.min(100, (current/target)*100);

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col relative font-sans text-white">
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur px-6 py-3 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto">
          <div className="text-cyan-400 text-xs font-bold tracking-widest mb-1">TARGET</div>
          <div className="text-3xl font-black text-emerald-400 flex items-center gap-4">
             {formatMoney(target)}
             <div className="flex items-center gap-2 text-slate-400 text-xl font-mono border-l border-slate-700 pl-4 ml-2"><Timer size={18} /> {(elapsed/1000).toFixed(2)}s</div>
          </div>
        </div>
        <button onClick={()=>setGameState('level-select')} className="pointer-events-auto p-3 bg-slate-800 rounded-full hover:bg-rose-500"><X size={20}/></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        <div className="relative w-64 h-64 flex items-center justify-center">
           <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="10" />
             <circle cx="50" cy="50" r="45" fill="none" stroke={current > target ? "#ef4444" : "#10b981"} strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * pct / 100)} strokeLinecap="round" className="transition-all duration-300 ease-out" />
           </svg>
           <div className="text-center">
             <div className="text-slate-400 text-sm font-bold uppercase mb-1">Current</div>
             <div className={`text-5xl font-black ${current > target ? 'text-rose-500' : 'text-white'}`}>{formatMoney(current)}</div>
           </div>
        </div>
        <div className="grid grid-cols-4 gap-6 w-full max-w-md justify-items-center">
           {coins.map(c => <Coin key={c.id} type={c.t} disabled={gameState!=='playing'} onClick={() => handleCoin(c.v)} />)}
        </div>
      </div>
      {(gameState === 'failed' || gameState === 'levelComplete' || gameState === 'victory') && <VictoryModal state={gameState} failReason="Over limit!" time={(elapsed/1000).toFixed(2)} onAction={gameState === 'failed' ? () => launchLevel(level) : handleNext} isNext={gameState === 'levelComplete'} />}
    </div>
  );
};

// ==========================================
// GAME 4: CASH COUNTER
// ==========================================
const CashCounterGame = ({ onExit, maxLevel, onSaveProgress, history }) => {
  const bestTimes = getBestTimes(history);
  const [gameState, setGameState] = useState('level-select');
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState(0);
  const [current, setCurrent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(0);
  
  const bills = [1, 5, 10, 20, 50, 100];

  useEffect(() => {
    if (gameState === 'playing') {
      startTimeRef.current = Date.now();
      const i = setInterval(() => setElapsed(Date.now() - startTimeRef.current), 50);
      return () => clearInterval(i);
    }
  }, [gameState]);

  const launchLevel = (lvl) => {
    let tgt = lvl <= 3 ? Math.floor(Math.random()*20)+1 : lvl <= 8 ? Math.floor(Math.random()*80)+20 : Math.floor(Math.random()*900)+100;
    setLevel(lvl); setTarget(tgt); setCurrent(0); setGameState('playing');
  };

  const handleBill = (v) => {
    if (gameState !== 'playing') return;
    const next = current + v;
    setCurrent(next);
    if (next === target) {
      onSaveProgress(level+1, elapsed/1000);
      setGameState('scoring');
      setTimeout(() => setGameState(level === 15 ? 'victory' : 'levelComplete'), 1000);
    } else if (next > target) {
      setGameState('scoring');
      setTimeout(() => setGameState('failed'), 1000);
    }
  };

  const handleNext = () => { if (level >= 15) setGameState('victory'); else launchLevel(level+1); };
  if (gameState === 'level-select') return <LevelSelector title="Cash Counter" maxLevel={maxLevel} totalLevels={15} bestTimes={bestTimes} onSelectLevel={launchLevel} onBack={onExit} />;

  const pct = Math.min(100, (current/target)*100);

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col relative font-sans text-white">
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur px-6 py-3 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto">
          <div className="text-cyan-400 text-xs font-bold tracking-widest mb-1">TARGET</div>
          <div className="text-3xl font-black text-emerald-400 flex items-center gap-4">
             ${target}
             <div className="flex items-center gap-2 text-slate-400 text-xl font-mono border-l border-slate-700 pl-4 ml-2"><Timer size={18} /> {(elapsed/1000).toFixed(2)}s</div>
          </div>
        </div>
        <button onClick={()=>setGameState('level-select')} className="pointer-events-auto p-3 bg-slate-800 rounded-full hover:bg-rose-500"><X size={20}/></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        <div className="relative w-64 h-64 flex items-center justify-center">
           <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="10" />
             <circle cx="50" cy="50" r="45" fill="none" stroke={current > target ? "#ef4444" : "#10b981"} strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * pct / 100)} strokeLinecap="round" className="transition-all duration-300 ease-out" />
           </svg>
           <div className="text-center">
             <div className="text-slate-400 text-sm font-bold uppercase mb-1">Current</div>
             <div className={`text-6xl font-black ${current > target ? 'text-rose-500' : 'text-white'}`}>${current}</div>
           </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md justify-items-center">
           {bills.map(v => <Bill key={v} value={v} disabled={gameState!=='playing'} onClick={() => handleBill(v)} />)}
        </div>
      </div>
      {(gameState === 'failed' || gameState === 'levelComplete' || gameState === 'victory') && <VictoryModal state={gameState} failReason="Over limit!" time={(elapsed/1000).toFixed(2)} onAction={gameState === 'failed' ? () => launchLevel(level) : handleNext} isNext={gameState === 'levelComplete'} />}
    </div>
  );
};

// ==========================================
// COMPONENT: PROFILE VIEW
// ==========================================
const ProfileView = ({ user, data, onBack }) => (
    <div className="w-full h-screen bg-slate-950 p-6 overflow-y-auto animate-fade-in">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors group"><ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard</button>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border-2 border-cyan-500/30"><User size={32} className="text-cyan-400" /></div>
            <div><h2 className="text-2xl font-black text-white">{user}</h2><p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">PRO MEMBER</p></div>
          </div>
        </div>
        <h3 className="text-slate-400 font-bold uppercase text-sm mb-4 pl-2">Game Stats</h3>
        <div className="space-y-4">
           {['unicorn','sliding','coin','cash'].map(g => (
             <div key={g} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                   <h4 className="font-bold text-white capitalize">{g === 'unicorn' ? 'Unicorn Jump' : g === 'sliding' ? 'Sliding Window' : g === 'coin' ? 'Coin Count' : 'Cash Counter'}</h4>
                   <div className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700"><span className="text-slate-400 text-xs">MAX LVL</span> <span className="text-white font-bold ml-1">{data[g]?.maxLevel || 1}</span></div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
);

// ==========================================
// APP SHELL
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState('login'); 
  const [user, setUser] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const db = getDB();
    if (db.lastUser && db.users[db.lastUser]) {
      setUser(db.lastUser);
      setUserData(db.users[db.lastUser]);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!user.trim()) return;
    const db = getDB();
    db.lastUser = user;
    if (!db.users[user]) {
      db.users[user] = { unicorn: { maxLevel: 1, times: [] }, sliding: { maxLevel: 1, times: [] }, coin: { maxLevel: 1, times: [] }, cash: { maxLevel: 1, times: [] } };
    } else {
       if (!db.users[user].coin) db.users[user].coin = { maxLevel: 1, times: [] };
       if (!db.users[user].cash) db.users[user].cash = { maxLevel: 1, times: [] };
    }
    saveDB(db);
    setUserData(db.users[user]);
    setCurrentView('dashboard');
  };

  const handleSaveProgress = (gameKey, nextLvl, time) => {
    const db = getDB();
    const currentUserData = db.users[user];
    if (nextLvl > currentUserData[gameKey].maxLevel) currentUserData[gameKey].maxLevel = nextLvl;
    currentUserData[gameKey].times.push({ level: nextLvl - 1, time, date: Date.now() });
    db.users[user] = currentUserData;
    saveDB(db);
    setUserData({...currentUserData});
  };

  const handleLogout = () => { setUser(''); setUserData(null); setCurrentView('login'); };

  const CATEGORIES = [
    { id: 'number', title: 'Number Games', icon: Calculator, color: 'bg-cyan-500', desc: 'Logic & Arithmetic' },
    { id: 'word', title: 'Word Games', icon: Type, color: 'bg-purple-500', desc: 'Vocab & Spelling' },
    { id: 'future', title: 'Future', icon: Rocket, color: 'bg-emerald-500', desc: 'Experimental' }
  ];

  const GAMES = {
    number: [
      { id: 'unicorn', title: 'Unicorn Jump', icon: '🦄', desc: 'Exact Jump Pathfinding' },
      { id: 'sliding', title: 'Sliding Window', icon: '🪟', desc: 'Array Logic Puzzle' },
      { id: 'coin', title: 'Coin Count', icon: '🪙', desc: 'Cents & Change' },
      { id: 'cash', title: 'Cash Counter', icon: '💵', desc: 'High Value Math' }
    ],
    word: [],
    future: []
  };

  const selectCategory = (catId) => { setActiveCategory(catId); setCurrentView('category'); };
  const selectGame = (gameId) => { setActiveGame(gameId); setCurrentView('game'); };
  const goBack = () => { if (currentView === 'game') setCurrentView('category'); else if (currentView === 'category') setCurrentView('dashboard'); else if (currentView === 'profile') setCurrentView('dashboard'); };

  if (currentView === 'login') return (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
          <div className="text-center mb-10"><div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-slate-700 shadow-inner"><span className="text-4xl">🎮</span></div><h1 className="text-3xl font-black text-white mb-2">ALGO<span className="text-cyan-400">ARCADE</span></h1><p className="text-slate-400 text-sm">Train your brain with code-based games.</p></div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="block text-slate-500 text-xs font-bold uppercase mb-2 ml-1">Username</label><input type="text" value={user} onChange={(e) => setUser(e.target.value)} placeholder="Enter player name..." className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors" autoFocus /></div>
            <button type="submit" disabled={!user.trim()} className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">ENTER ARCADE</button>
          </form>
        </div>
      </div>
  );

  if (currentView === 'profile') return <ProfileView user={user} data={userData} onBack={goBack} />;

  if (currentView === 'game') {
    if (activeGame === 'unicorn') return <UnicornJumpGame onExit={goBack} maxLevel={userData.unicorn.maxLevel} history={userData.unicorn.times} onSaveProgress={(lvl, time) => handleSaveProgress('unicorn', lvl, time)} />;
    if (activeGame === 'sliding') return <SlidingWindowGame onExit={goBack} maxLevel={userData.sliding.maxLevel} history={userData.sliding.times} onSaveProgress={(lvl, time) => handleSaveProgress('sliding', lvl, time)} />;
    if (activeGame === 'coin') return <CoinCountGame onExit={goBack} maxLevel={userData.coin.maxLevel} history={userData.coin.times} onSaveProgress={(lvl, time) => handleSaveProgress('coin', lvl, time)} />;
    if (activeGame === 'cash') return <CashCounterGame onExit={goBack} maxLevel={userData.cash.maxLevel} history={userData.cash.times} onSaveProgress={(lvl, time) => handleSaveProgress('cash', lvl, time)} />;
    return <div className="text-white">Game Not Found</div>;
  }

  const Header = () => (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('profile')}><div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700"><User size={20} className="text-slate-400" /></div><div><div className="text-xs text-slate-500 font-bold uppercase">Welcome back</div><div className="text-white font-bold">{user}</div></div></div>
      <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-white transition-colors"><LogOut size={20} /></button>
    </header>
  );

  if (currentView === 'dashboard') return (
      <div className="w-full h-screen bg-slate-950 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <Header />
          <h2 className="text-2xl font-black text-white mb-6">Game Categories</h2>
          <div className="grid gap-4">
            {CATEGORIES.map(cat => (
              <div key={cat.id} onClick={() => selectCategory(cat.id)} className="group bg-slate-900 border border-slate-800 p-6 rounded-3xl cursor-pointer hover:border-slate-600 hover:bg-slate-800 transition-all active:scale-[0.98] relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 ${cat.color} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-20`} />
                <div className="flex items-center gap-4 relative z-10"><div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center text-slate-900 shadow-lg`}><cat.icon size={28} /></div><div><h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{cat.title}</h3><p className="text-slate-500 text-sm">{cat.desc}</p></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );

  if (currentView === 'category') {
    const category = CATEGORIES.find(c => c.id === activeCategory);
    const gameList = GAMES[activeCategory] || [];
    return (
      <div className="w-full h-screen bg-slate-950 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <Header />
          <button onClick={goBack} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors group"><ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard</button>
          <div className="flex items-center gap-4 mb-8"><div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-slate-900`}><category.icon size={24} /></div><h2 className="text-3xl font-black text-white">{category.title}</h2></div>
          <div className="grid grid-cols-2 gap-4">
            {gameList.length > 0 ? gameList.map(game => (
              <div key={game.id} onClick={() => selectGame(game.id)} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl cursor-pointer hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all active:scale-[0.98] flex flex-col items-center text-center aspect-square justify-center">
                <div className="text-4xl mb-3">{game.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1">{game.title}</h3>
                <div className="mt-2 px-2 py-1 bg-slate-800 rounded text-[10px] text-emerald-400 font-mono border border-slate-700">Max Lvl {userData[game.id]?.maxLevel || 1}</div>
                <p className="text-xs text-slate-500 mt-2">{game.desc}</p>
              </div>
            )) : <div className="col-span-2 py-10 text-center text-slate-600 border border-dashed border-slate-800 rounded-2xl">No games available in this category yet.</div>}
          </div>
        </div>
      </div>
    );
  }
  return null;
}
