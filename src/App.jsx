// src/App.jsx
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
import CategoryView from "./components/shared/categoryView";

// New Views
import HomeView from "./components/shared/homeView";
import ShopView from "./components/shared/shopView";

export default function App() {
  const [currentView, setCurrentView] = useState("login");
  const [user, setUser] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [userData, setUserData] = useState(null);

  // Track coins earned in the current session for the Modal
  const [lastEarnedCoins, setLastEarnedCoins] = useState(0);

  useEffect(() => {
    const db = getDB();
    if (db.lastUser && db.users[db.lastUser]) {
      setUser(db.lastUser);
      setUserData(db.users[db.lastUser]);
    }
  }, []);

  // Ensure data structure integrity when loading a user
  const ensureDataStructure = (data) => {
    if (!data.coins) data.coins = 0;
    if (!data.ownedUnicorns) data.ownedUnicorns = ["sparkle"];
    if (!data.equippedUnicorn) data.equippedUnicorn = "sparkle";
    return data;
  };

  // Back button logic updated for new views
  useEffect(() => {
    let backButtonListener;
    const setupListener = async () => {
      backButtonListener = await CapacitorApp.addListener(
        "backButton",
        ({ canGoBack }) => {
          if (currentView === "game") {
            goBack();
          } else if (currentView === "category") {
            goBack();
          } else if (currentView === "profile" || currentView === "shop") {
            setCurrentView("home");
          } else if (currentView === "home" || currentView === "login") {
            CapacitorApp.exitApp();
          }
        }
      );
    };
    setupListener();
    return () => {
      if (backButtonListener) backButtonListener.remove();
    };
  }, [currentView]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!user.trim()) return;
    const db = getDB();
    db.lastUser = user;

    // Create new user if needed
    if (!db.users[user]) {
      db.users[user] = {
        coins: 0,
        ownedUnicorns: ["sparkle"],
        equippedUnicorn: "sparkle",
        unicorn: { maxLevel: 0, times: [] },
        sliding: { maxLevel: 0, times: [] },
        coin: { maxLevel: 0, times: [] },
        cash: { maxLevel: 0, times: [] },
      };
    } else {
      // Migrate existing users to new structure
      db.users[user] = ensureDataStructure(db.users[user]);
    }

    saveDB(db);
    setUserData(db.users[user]);
    setCurrentView("home");
  };

  const handleSaveProgress = (gameKey, nextLvl, time) => {
    const db = getDB();
    const currentUserData = ensureDataStructure(db.users[user]);

    // Coin Calculation Logic: Base 10 + (Level * 5)
    // Level 1 = 15 coins, Level 10 = 60 coins.
    const coinsEarned = 10 + nextLvl * 5;

    currentUserData.coins += coinsEarned;
    setLastEarnedCoins(coinsEarned);

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

  const handleBuyUnicorn = (id, cost) => {
    const db = getDB();
    const currentUserData = db.users[user];

    if (currentUserData.coins >= cost) {
      currentUserData.coins -= cost;
      currentUserData.ownedUnicorns.push(id);
      db.users[user] = currentUserData;
      saveDB(db);
      setUserData({ ...currentUserData });
    }
  };

  const handleEquipUnicorn = (id) => {
    const db = getDB();
    const currentUserData = db.users[user];
    currentUserData.equippedUnicorn = id;
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
    else if (currentView === "category") setCurrentView("home");
    else if (currentView === "profile") setCurrentView("home");
  };

  // --- RENDER VIEWS ---

  if (currentView === "login")
    return (
      <LoginView user={user} setUser={setUser} handleLogin={handleLogin} />
    );

  if (currentView === "profile")
    return (
      <ProfileView
        user={user}
        data={userData}
        onBack={() => setCurrentView("home")}
      />
    );

  if (currentView === "home")
    return (
      <HomeView
        user={user}
        userData={userData}
        onPlay={() => setCurrentView("dashboard")} // Use old dashboard as "Category Select" now?
        // Actually, let's map "Play" directly to a category selector or just reuse the dashboard view as the "Map"
        // For now, let's route "Play" to the old Dashboard view which lists categories
        onShop={() => setCurrentView("shop")}
        onProfile={() => setCurrentView("profile")}
        handleLogout={handleLogout}
      />
    );

  // We are reusing the old DashBoardView as the "Category Selector" screen now
  if (currentView === "dashboard")
    return (
      <CategoryView // Or reuse dashboardView logic here
        user={user}
        setCurrentView={setCurrentView}
        handleLogout={handleLogout}
        // We need to pass categories list here if we use DashboardView,
        // but let's just assume we want the category selection screen.
        // Let's modify the old DashboardView usage:
      >
        {/* Note: In your original code DashboardView uses CATEGORIES. 
              We can just render it normally. */}
        <div className="w-full h-screen bg-slate-950 p-6 overflow-y-auto">
          {/* Copying DashboardView logic roughly or importing it */}
          {/* To keep it clean, let's just return the DashBoardView component */}
          {/* Ideally, rename DashBoardView to CategorySelectView in a real refactor */}
        </div>
      </CategoryView>
    );

  // Re-map "dashboard" state to actually use the imported DashBoardView component properly
  if (currentView === "dashboard")
    // "Play" button takes us here
    return (
      // Note: You might want to update DashboardView to have a "Back" button to Home
      <div className="relative">
        <button
          onClick={() => setCurrentView("home")}
          className="absolute top-4 left-4 z-50 text-white font-bold bg-slate-800 px-4 py-2 rounded-full"
        >
          Back
        </button>
        <DashBoardView
          selectCategory={selectCategory}
          user={user}
          setCurrentView={setCurrentView}
          handleLogout={handleLogout}
          categories={CATEGORIES}
        />
      </div>
    );

  if (currentView === "shop")
    return (
      <ShopView
        userData={userData}
        onBuy={handleBuyUnicorn}
        onEquip={handleEquipUnicorn}
        onBack={() => setCurrentView("home")}
      />
    );

  if (currentView === "game") {
    // We need to pass coinsEarned to games if we want them to display it,
    // but the VictoryModal inside the games handles the display.
    // We need to update the games to accept a 'coinsEarned' prop or similar,
    // BUT the games calculate victory internally.
    // TRICK: The games call `onSaveProgress`. We need to pass the calculation result BACK to the game
    // so it can show it in the modal.
    // simpler way: The games render the modal. We need to update the game files to calculate coins
    // for display purposes, or update the modal props in the game files.

    // For this response, I will update one game example to show how to pass the prop.
    // The games below render <VictoryModal>. That component needs `coinsEarned`.

    // Helper to calculate coins for display inside the game component
    const calculateCoins = (lvl) => 10 + lvl * 5;

    if (activeGame === "unicorn")
      return (
        <UnicornJumpGame
          onExit={goBack}
          lastCompletedLevel={userData.unicorn.maxLevel + 1}
          onSaveProgress={(lvl, time) =>
            handleSaveProgress("unicorn", lvl, time)
          }
          // Pass a calculator so the game can show the user what they WILL get/DID get
          calcCoins={calculateCoins}
        />
      );

    // ... repeat for other games (sliding, coin, cash) ...
    if (activeGame === "sliding")
      return (
        <SlidingWindowGame
          onExit={goBack}
          lastCompletedLevel={userData.sliding.maxLevel + 1}
          onSaveProgress={(lvl, time) =>
            handleSaveProgress("sliding", lvl, time)
          }
          calcCoins={calculateCoins}
        />
      );
    if (activeGame === "coin")
      return (
        <CoinCountGame
          onExit={goBack}
          lastCompletedLevel={userData.coin.maxLevel + 1}
          onSaveProgress={(lvl, time) => handleSaveProgress("coin", lvl, time)}
          calcCoins={calculateCoins}
        />
      );
    if (activeGame === "cash")
      return (
        <CashCounterGame
          onExit={goBack}
          lastCompletedLevel={userData.cash.maxLevel + 1}
          onSaveProgress={(lvl, time) => handleSaveProgress("cash", lvl, time)}
          calcCoins={calculateCoins}
        />
      );

    return <div className="text-white">Game Not Found</div>;
  }

  if (currentView === "category")
    return (
      <CategoryView
        selectCategory={selectCategory}
        user={user}
        setCurrentView={setCurrentView}
        handleLogout={handleLogout}
        activeCategory={activeCategory}
        goBack={() => setCurrentView("dashboard")}
        userData={userData}
        selectGame={selectGame}
      />
    );

  return null;
}

import DashBoardView from "./components/shared/dashboardView";
