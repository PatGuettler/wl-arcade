/**
 * Handles the logic for moving to the next level or triggering victory.
 * @param {number}   currentLevel - The level the user just finished
 * @param {number}   maxLevels - The total number of levels (e.g., 15 or 20)
 * @param {function} setGameState - The state setter for the game mode
 * @param {function} launchLevelFn - The function that initializes a specific level
 */
export const handleNextLevel = (currentLevel, maxLevels, setGameState, launchLevelFn) => {
  if (currentLevel >= maxLevels) {
    setGameState('victory');
  } else {
    launchLevelFn(currentLevel + 1);
  }
};