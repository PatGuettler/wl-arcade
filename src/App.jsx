import React, { useState, useEffect } from 'react';
import { User, LogOut, Calculator, Type, Rocket, ArrowLeft} from 'lucide-react';

import { getDB, saveDB } from './utils/storage';
import UnicornJumpGame from './games/unicornJump';
import SlidingWindowGame from './games/slidingWindow';
import CoinCountGame from './games/coinCount';
import CashCounterGame from './games/cashCounter';
import ProfileView from './components/shared/profileView';

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
      db.users[user] = { 
        unicorn: { maxLevel: 1, times: [] }, 
        sliding: { maxLevel: 1, times: [] }, 
        coin: { maxLevel: 1, times: [] }, 
        cash: { maxLevel: 1, times: [] } 
      };
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
