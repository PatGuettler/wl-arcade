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