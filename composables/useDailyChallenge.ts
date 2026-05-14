import { getLocalDateKey } from '~/utils/date'
import { friendlyError } from '~/utils/errors'
import { calculateDailySprintScore } from '~/utils/mahjong/dailyScoring'

type SubmittedDailyResult = {
  id: string
  score: number
  duration_seconds: number
  moves_count: number
  hints_used: number
  shuffles_used: number
  undo_count: number
  completed_at: string
  created_at: string
}

export const useDailyChallenge = () => {
  const supabase = useSupabase()
  const { user, refreshUser } = useAuth()
  const challengeDate = ref(getLocalDateKey())
  const boardSeed = computed(() => `daily-${challengeDate.value}`)
  const game = useMahjongGame(boardSeed.value, {
    preserveSeedOnRestart: true,
    difficulty: 'medium'
  })
  const gameResults = useGameResults()
  const submittedResult = ref<SubmittedDailyResult | null>(null)
  const checkingSubmission = ref(false)
  const submissionError = ref('')
  const sprintScore = computed(() =>
    calculateDailySprintScore({
      elapsedSeconds: game.elapsedSeconds.value,
      movesCount: game.movesCount.value,
      hintsUsed: game.hintsUsed.value,
      shufflesUsed: game.shufflesUsed.value,
      undoCount: game.undoCount.value
    })
  )

  const isPracticeReplay = computed(() => Boolean(submittedResult.value))
  const canSubmit = computed(() => Boolean(user.value) && !submittedResult.value)

  const checkTodaySubmission = async () => {
    submissionError.value = ''

    if (!user.value) {
      await refreshUser()
    }

    if (!user.value) {
      submittedResult.value = null
      return
    }

    checkingSubmission.value = true

    const { data, error } = await supabase
      .from('games')
      .select('id, score, duration_seconds, moves_count, hints_used, shuffles_used, undo_count, completed_at, created_at')
      .eq('user_id', user.value.id)
      .eq('mode', 'daily')
      .eq('challenge_date', challengeDate.value)
      .eq('status', 'completed')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    checkingSubmission.value = false

    if (error) {
      submissionError.value = friendlyError(error.message, 'Could not check today’s submission.')
      return
    }

    submittedResult.value = data as SubmittedDailyResult | null
  }

  const saveDailyResult = async () => {
    if (submittedResult.value) {
      submissionError.value = 'You already submitted today. Replay is practice only.'
      return
    }

    await gameResults.saveGameResult({
      mode: 'daily',
      challenge_date: challengeDate.value,
      board_seed: boardSeed.value,
      score: sprintScore.value.total,
      duration_seconds: Math.max(1, game.elapsedSeconds.value),
      moves_count: game.movesCount.value,
      hints_used: game.hintsUsed.value,
      shuffles_used: game.shufflesUsed.value,
      undo_count: game.undoCount.value,
      completed_at: game.completedAt.value || new Date().toISOString()
    })

    if (gameResults.saved.value) {
      submittedResult.value = {
        id: 'local-saved',
        score: sprintScore.value.total,
        duration_seconds: Math.max(1, game.elapsedSeconds.value),
        moves_count: game.movesCount.value,
        hints_used: game.hintsUsed.value,
        shuffles_used: game.shufflesUsed.value,
        undo_count: game.undoCount.value,
        completed_at: game.completedAt.value || new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    }
  }

  const restartDaily = () => {
    game.restart()
    gameResults.resetSaveState()
    submissionError.value = ''
  }

  return {
    challengeDate,
    boardSeed,
    game,
    gameResults,
    sprintScore,
    submittedResult,
    checkingSubmission,
    submissionError,
    isPracticeReplay,
    canSubmit,
    checkTodaySubmission,
    saveDailyResult,
    restartDaily
  }
}
