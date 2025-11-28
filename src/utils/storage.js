const DB_KEY = 'wl_arcade_x.x.x'; //need to put the version in dynamically

export const getDB = () => {
  const stored = localStorage.getItem(DB_KEY);
  if (!stored) return { users: {}, lastUser: '' };
  return JSON.parse(stored);
};

export const saveDB = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const getBestTimes = (timesArray) => {
  const bests = {};
  if (!timesArray) return bests;
  timesArray.forEach(entry => {
    if (!bests[entry.level] || entry.time < bests[entry.level]) {
      bests[entry.level] = entry.time;
    }
  });
  return bests;
};