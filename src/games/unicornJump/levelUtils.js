export const NODE_SPACING_Y = 110;
export const PATH_WIDTH = 150;

export const generateLevelData = (lvl) => {
  const len = 15 + lvl * 5;
  const arr = new Array(len).fill(null);
  let curr = 0;
  let last = 0;
  // Determine max jump distance based on level
  const maxJ = lvl > 5 ? 6 : lvl > 2 ? 4 : 3;

  while (curr < len) {
    let j;
    do {
      j = Math.floor(Math.random() * maxJ) + 1;
    } while (j === last && len - curr > j);

    last = j;
    if (j > len - curr) j = len - curr;
    arr[curr] = j;
    curr += j;
  }

  // Fill null spots with random numbers for visual decoy
  for (let i = 0; i < len; i++) {
    if (arr[i] === null) {
      arr[i] = Math.floor(Math.random() * maxJ) + 1;
    }
  }
  return arr;
};

export const generateNodePositions = (length) => {
  const positions = [];
  for (let i = 0; i <= length; i++) {
    const t = i / length;
    const y = i * NODE_SPACING_Y;
    // Sine wave calculation
    const x =
      window.innerWidth / 6 + Math.sin(t * Math.PI * 3) * (PATH_WIDTH * 1);
    positions.push({ x, y });
  }
  return positions;
};
