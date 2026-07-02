import { DIVISIONS } from "../config/divisions";

export interface IDivisionContext {
  currentDivision: any;
  targetDivision: any;
}

export function computeDivisionContext(currentRating: number): IDivisionContext {
  let currentDivision = DIVISIONS[0];
  let targetDivision = DIVISIONS[1];

  for (let i = 0; i < DIVISIONS.length; i++) {
    if (currentRating >= DIVISIONS[i].minRating && currentRating <= DIVISIONS[i].maxRating) {
      currentDivision = DIVISIONS[i];
      targetDivision = DIVISIONS[Math.min(i + 1, DIVISIONS.length - 1)];
      break;
    }
  }

  if (currentRating > DIVISIONS[DIVISIONS.length - 1].maxRating) {
    currentDivision = DIVISIONS[DIVISIONS.length - 1];
    targetDivision = DIVISIONS[DIVISIONS.length - 1];
  }

  return { currentDivision, targetDivision };
}