/**
 * Calculates attendance percentage.
 * Present + Late count toward "attended" classes (configurable via countLateAsPresent).
 */
const calcPercentage = (present, total, countLateAsPresent = 0) => {
  const attended = present + countLateAsPresent;
  if (!total || total <= 0) return 0;
  return Math.round((attended / total) * 10000) / 100; // 2 decimal places
};

module.exports = calcPercentage;
