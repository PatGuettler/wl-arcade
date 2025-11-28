import React, { useState, useEffect } from 'react';

import { getDB, saveDB } from './utils/storage';
import UnicornJumpGame from './games/unicornJump';
import SlidingWindowGame from './games/slidingWindow';
import CoinCountGame from './games/coinCount';
import CashCounterGame from './games/cashCounter';
import ProfileView from './components/shared/profileView';
import { CATEGORIES } from './games/gameConfig';
import LoginView from './components/shared/loginView';
import DashBoardView from './components/shared/dashboardView';
import CategoryView from './components/shared/categoryView';

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

  const selectCategory = (catId) => { setActiveCategory(catId); setCurrentView('category'); };
  const selectGame = (gameId) => { setActiveGame(gameId); setCurrentView('game'); };
  const goBack = () => { 
    if (currentView === 'game') setCurrentView('category'); 
    else if (currentView === 'category') setCurrentView('dashboard'); 
    else if (currentView === 'profile') setCurrentView('dashboard'); 
  };

  if (currentView === 'login') return <LoginView user={user} setUser={setUser} handleLogin={handleLogin} />;
  if (currentView === 'profile') return <ProfileView user={user} data={userData} onBack={goBack} />;
  if (currentView === 'game') {
    if (activeGame === 'unicorn') return <UnicornJumpGame onExit={goBack} maxLevel={userData.unicorn.maxLevel} history={userData.unicorn.times} onSaveProgress={(lvl, time) => handleSaveProgress('unicorn', lvl, time)} />;
    if (activeGame === 'sliding') return <SlidingWindowGame onExit={goBack} maxLevel={userData.sliding.maxLevel} history={userData.sliding.times} onSaveProgress={(lvl, time) => handleSaveProgress('sliding', lvl, time)} />;
    if (activeGame === 'coin') return <CoinCountGame onExit={goBack} maxLevel={userData.coin.maxLevel} history={userData.coin.times} onSaveProgress={(lvl, time) => handleSaveProgress('coin', lvl, time)} />;
    if (activeGame === 'cash') return <CashCounterGame onExit={goBack} maxLevel={userData.cash.maxLevel} history={userData.cash.times} onSaveProgress={(lvl, time) => handleSaveProgress('cash', lvl, time)} />;
    return <div className="text-white">Game Not Found</div>;
  }

  if (currentView === 'dashboard') return (<DashBoardView selectCategory={selectCategory} user={user} setCurrentView={setCurrentView} handleLogout={handleLogout} categories={CATEGORIES} />);
  if (currentView === 'category')  return (<CategoryView selectCategory={selectCategory} user={user} setCurrentView={setCurrentView} handleLogout={handleLogout} activeCategory={activeCategory} goBack={goBack} userData={userData} selectGame={selectGame}/>);
  
  return null;
}
