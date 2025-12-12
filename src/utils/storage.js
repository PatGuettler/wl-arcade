const DB_KEY = "wl_arcade_x.x.x"; //need to put the version in dynamically

export const UNICORNS = [
  {
    id: "sparkle",
    name: "Sparkle",
    price: 0,
    desc: "The classic pink companion.",
  },
  {
    id: "rainbow",
    name: "Rainbow Dash",
    price: 500,
    desc: "Leaves a trail of colors.",
  },
  {
    id: "star",
    name: "Stardust",
    price: 1200,
    desc: "Shines brighter than the sun.",
  },
  {
    id: "cloud",
    name: "Nimbus",
    price: 2500,
    desc: "Float above the competition.",
  },
  {
    id: "dream",
    name: "Dreamer",
    price: 5000,
    desc: "Straight out of a fantasy.",
  },
  { id: "magic", name: "Mystic", price: 10000, desc: "Pure magical energy." },
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
