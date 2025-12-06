import React, { useState, useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";

import { getDB, saveDB } from "./utils/storage";
import UnicornJumpGame from "./games/unicornJump";
import SlidingWindowGame from "./games/slidingWindow";
import CoinCountGame from "./games/coinCount";
import CashCounterGame from "./games/cashCounter";
import ProfileView from "./components/shared/profileView";
import { CATEGORIES } from "./games/gameConfig";
import LoginView from "./components/shared/loginView";
import DashBoardView from "./components/shared/dashboardView";
import CategoryView from "./components/shared/categoryView";

export default function App() {
  const [currentView, setCurrentView] = useState("login");
  const [user, setUser] = useState("");
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

  // Handle Android back button
  useEffect(() => {
    const backButtonListener = CapacitorApp.addListener(
      "backButton",
      ({ canGoBack }) => {
        // Handle navigation based on current view
        if (currentView === "game") {
          goBack();
        } else if (currentView === "category") {
          goBack();
        } else if (currentView === "profile") {
          goBack();
        } else if (currentView === "dashboard") {
          // On dashboard, exit the app
          CapacitorApp.exitApp();
        } else if (currentView === "login") {
          // On login screen, exit the app
          CapacitorApp.exitApp();
        }
      }
    );

    // Cleanup listener on unmount
    return () => {
      backButtonListener.remove();
    };
  }, [currentView]); // Re-register when currentView changes

  //@TODO: this needs to be cleaned up
  const handleLogin = (e) => {
    e.preventDefault();
    if (!user.trim()) return;
    const db = getDB();
    db.lastUser = user;
    if (!db.users[user]) {
      db.users[user] = {
        unicorn: { maxLevel: 0, times: [] },
        sliding: { maxLevel: 0, times: [] },
        coin: { maxLevel: 0, times: [] },
        cash: { maxLevel: 0, times: [] },
      };
    }

    saveDB(db);
    setUserData(db.users[user]);
    setCurrentView("dashboard");
  };

  const handleSaveProgress = (gameKey, nextLvl, time) => {
    console.log(`saving ${gameKey} ; ${nextLvl}`);
    const db = getDB();
    const currentUserData = db.users[user];
    if (nextLvl > currentUserData[gameKey].maxLevel)
      currentUserData[gameKey].maxLevel = nextLvl;
    currentUserData[gameKey].times.push({
      level: nextLvl,
      time,
      date: Date.now(),
    });
    db.users[user] = currentUserData;
    saveDB(db);
    setUserData({ ...currentUserData });
  };

  const handleLogout = () => {
    setUser("");
    setUserData(null);
    setCurrentView("login");
  };

  const selectCategory = (catId) => {
    setActiveCategory(catId);
    setCurrentView("category");
  };
  const selectGame = (gameId) => {
    setActiveGame(gameId);
    setCurrentView("game");
  };
  const goBack = () => {
    if (currentView === "game") setCurrentView("category");
    else if (currentView === "category") setCurrentView("dashboard");
    else if (currentView === "profile") setCurrentView("dashboard");
  };

  if (currentView === "login")
    return (
      <LoginView user={user} setUser={setUser} handleLogin={handleLogin} />
    );
  if (currentView === "profile")
    return <ProfileView user={user} data={userData} onBack={goBack} />;
  if (currentView === "game") {
    if (activeGame === "unicorn")
      return (
        <UnicornJumpGame
          onExit={goBack}
          lastCompletedLevel={userData.unicorn.maxLevel + 1} //auto move the user on to the next level
          onSaveProgress={(lvl, time) =>
            handleSaveProgress("unicorn", lvl, time)
          }
        />
      );
    if (activeGame === "sliding")
      return (
        <SlidingWindowGame
          onExit={goBack}
          lastCompletedLevel={userData.sliding.maxLevel + 1} //auto move the user on to the next level
          onSaveProgress={(lvl, time) =>
            handleSaveProgress("sliding", lvl, time)
          }
        />
      );
    if (activeGame === "coin")
      return (
        <CoinCountGame
          onExit={goBack}
          lastCompletedLevel={userData.coin.maxLevel + 1} //auto move the user on to the next level
          onSaveProgress={(lvl, time) => handleSaveProgress("coin", lvl, time)}
        />
      );
    if (activeGame === "cash")
      return (
        <CashCounterGame
          onExit={goBack}
          lastCompletedLevel={userData.cash.maxLevel + 1} //auto move the user on to the next level
          onSaveProgress={(lvl, time) => handleSaveProgress("cash", lvl, time)}
        />
      );
    return <div className="text-white">Game Not Found</div>;
  }

  if (currentView === "dashboard")
    return (
      <DashBoardView
        selectCategory={selectCategory}
        user={user}
        setCurrentView={setCurrentView}
        handleLogout={handleLogout}
        categories={CATEGORIES}
      />
    );
  if (currentView === "category")
    return (
      <CategoryView
        selectCategory={selectCategory}
        user={user}
        setCurrentView={setCurrentView}
        handleLogout={handleLogout}
        activeCategory={activeCategory}
        goBack={goBack}
        userData={userData}
        selectGame={selectGame}
      />
    );

  return null;
}
