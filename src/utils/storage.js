const DB_KEY = "wl_arcade_x.x.x";

export const UNICORNS = [
  {
    id: "sparkle",
    name: "Sparkle",
    price: 0,
    desc: "The classic pink companion.",
    style: "bg-pink-950",
    accent: "text-pink-400",
  },
  {
    id: "rainbow",
    name: "Rainbow Dash",
    price: 500,
    desc: "Leaves a trail of colors.",
    style:
      "bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]",
    accent: "text-cyan-400",
  },
  {
    id: "star",
    name: "Stardust",
    price: 1200,
    desc: "Shines brighter than the sun.",
    style: "bg-indigo-950",
    accent: "text-yellow-400",
  },
  {
    id: "cloud",
    name: "Nimbus",
    price: 2500,
    desc: "Float above the competition.",
    style: "bg-sky-950",
    accent: "text-sky-300",
  },
  {
    id: "dream",
    name: "Dreamer",
    price: 5000,
    desc: "Straight out of a fantasy.",
    style: "bg-purple-950",
    accent: "text-purple-400",
  },
  {
    id: "magic",
    name: "Mystic",
    price: 10000,
    desc: "Pure magical energy.",
    style: "bg-emerald-950",
    accent: "text-emerald-400",
  },
];

export const FURNITURE = [
  { id: "lamp", name: "Lava Lamp", price: 150, icon: "💡" },
  { id: "rug", name: "Fluffy Rug", price: 300, icon: "🧶" },
  { id: "plant", name: "Magic Plant", price: 500, icon: "🪴" },
  { id: "chair", name: "Gaming Chair", price: 1200, icon: "💺" },
  { id: "arcade", name: "Mini Arcade", price: 2500, icon: "🕹️" },
  { id: "trophy", name: "Gold Trophy", price: 5000, icon: "🏆" },
];

export const getDB = () => {
  const stored = localStorage.getItem(DB_KEY);
  if (!stored) return { users: {}, lastUser: "" };
  return JSON.parse(stored);
};

export const saveDB = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const getBestTimes = (timesArray) => {
  const bests = {};
  if (!timesArray) return bests;
  timesArray.forEach((entry) => {
    if (!bests[entry.level] || entry.time < bests[entry.level]) {
      bests[entry.level] = entry.time;
    }
  });
  return bests;
};
