export type DailySprintScoreInput = {
  elapsedSeconds: number
  movesCount: number
  hintsUsed: number
  shufflesUsed: number
  undoCount: number
}

export type DailySprintScoreBreakdown = {
  clearBonus: number
  speedBonus: number
  moveEfficiencyBonus: number
  hintPenalty: number
  shufflePenalty: number
  total: number
}

const DAILY_CLEAR_BONUS = 6000
const MAX_SPEED_BONUS = 3000
const MAX_MOVE_EFFICIENCY_BONUS = 2000
const CANONICAL_CLEAR_MOVES = 72

export const calculateDailySprintScore = ({
  elapsedSeconds,
  movesCount,
  hintsUsed,
  shufflesUsed,
  undoCount
}: DailySprintScoreInput): DailySprintScoreBreakdown => {
  const effectiveMoves = movesCount + undoCount
  const extraMoves = Math.max(0, effectiveMoves - CANONICAL_CLEAR_MOVES)
  const speedBonus = Math.max(0, MAX_SPEED_BONUS - elapsedSeconds * 5)
  const moveEfficiencyBonus = Math.max(
    0,
    MAX_MOVE_EFFICIENCY_BONUS - extraMoves * 40
  )
  const hintPenalty = hintsUsed * 150
  const shufflePenalty = shufflesUsed * 350
  const total = Math.max(
    0,
    DAILY_CLEAR_BONUS +
      speedBonus +
      moveEfficiencyBonus -
      hintPenalty -
      shufflePenalty
  )

  return {
    clearBonus: DAILY_CLEAR_BONUS,
    speedBonus,
    moveEfficiencyBonus,
    hintPenalty,
    shufflePenalty,
    total
  }
}
