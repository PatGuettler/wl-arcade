import React, { useState, useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";

import { getDB, saveDB } from "./utils/storage";
import UnicornJumpGame from "./games/unicornJump";
import SlidingWindowGame from "./games/slidingWindow";
import CoinCountGame from "./games/coinCount";
import CashCounterGame from "./games/cashCounter";
import ProfileView from "./components/shared/profileView";
import HomeView from "./components/shared/homeView";
import ShopView from "./components/shared/shopView";
import { CATEGORIES } from "./games/gameConfig";
import LoginView from "./components/shared/loginView";
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

  const ensureDataStructure = (data) => {
    if (!data) return null;
    if (!data.coins) data.coins = 0;
    if (!data.ownedUnicorns) data.ownedUnicorns = ["sparkle"];
    if (!data.equippedUnicorn) data.equippedUnicorn = "sparkle";
    return data;
  };

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
      db.users[user] = ensureDataStructure(db.users[user]);
    }

    saveDB(db);
    setUserData(db.users[user]);
    setCurrentView("home");
  };

  const handlePlay = () => {
    const targetCategory = CATEGORIES[0].id;

    // 2. Set the category state BEFORE switching views
    setActiveCategory(targetCategory);

    // 3. Navigate to the category view
    setCurrentView("category");
  };

  const handleSaveProgress = (gameKey, nextLvl, time) => {
    const db = getDB();
    const currentUserData = ensureDataStructure(db.users[user]);

    // Calculate coins: 10 base + 5 per level
    const coinsEarned = 10 + nextLvl * 5;
    currentUserData.coins += coinsEarned;

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
    const currentUserData = ensureDataStructure(db.users[user]);

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
    const currentUserData = ensureDataStructure(db.users[user]);
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
    else if (currentView === "profile" || currentView === "shop")
      setCurrentView("home");
  };

  const calculateCoins = (lvl) => 10 + lvl * 5;

  // --- VIEWS ---

  if (currentView === "login")
    return (
      <LoginView user={user} setUser={setUser} handleLogin={handleLogin} />
    );

  if (currentView === "home")
    return (
      <HomeView
        user={user}
        userData={userData || { coins: 0, equippedUnicorn: "sparkle" }} // Fallback to prevent HomeView crash
        onPlay={handlePlay} // Use the new handler here
        onShop={() => setCurrentView("shop")}
        onProfile={() => setCurrentView("profile")}
        handleLogout={handleLogout}
      />
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

  if (currentView === "profile")
    return (
      <ProfileView
        user={user}
        data={userData}
        onBack={() => setCurrentView("home")}
      />
    );

  if (currentView === "game") {
    if (activeGame === "unicorn")
      return (
        <UnicornJumpGame
          onExit={goBack}
          lastCompletedLevel={userData.unicorn.maxLevel + 1}
          onSaveProgress={(lvl, time) =>
            handleSaveProgress("unicorn", lvl, time)
          }
          calcCoins={calculateCoins}
        />
      );
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

  // Categories / Map View
  if (currentView === "category")
    return (
      <CategoryView
        selectCategory={selectCategory}
        user={user}
        setCurrentView={setCurrentView}
        handleLogout={handleLogout}
        activeCategory={activeCategory} // This must be set!
        goBack={goBack}
        userData={userData}
        selectGame={selectGame}
      />
    );

  return null;
}
