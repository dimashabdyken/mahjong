type ScoreInput = {
  movesCount: number
  hintsUsed: number
  shufflesUsed: number
  undoCount: number
  elapsedSeconds: number
}

export const calculateScore = ({
  movesCount,
  hintsUsed,
  shufflesUsed,
  undoCount,
  elapsedSeconds
}: ScoreInput) =>
  Math.max(
    0,
    movesCount * 100 -
      hintsUsed * 10 -
      shufflesUsed * 25 -
      undoCount * 15 -
      Math.floor(elapsedSeconds / 10)
  )

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}
