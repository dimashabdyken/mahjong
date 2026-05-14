import type { GameMode } from '~/utils/mahjong/types'
import { friendlyError } from '~/utils/errors'

type GameResultPayload = {
  mode: GameMode
  challenge_date: string | null
  board_seed: string
  score: number
  duration_seconds: number
  moves_count: number
  hints_used: number
  shuffles_used: number
  undo_count: number
  completed_at: string
}

export const useGameResults = () => {
  const supabase = useSupabase()
  const { user, refreshUser } = useAuth()
  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')

  const resetSaveState = () => {
    saving.value = false
    saved.value = false
    error.value = ''
  }

  const validatePayload = (payload: GameResultPayload) => {
    if (!['classic', 'daily'].includes(payload.mode)) {
      return 'Game mode must be classic or daily.'
    }

    if (payload.mode === 'daily' && !payload.challenge_date) {
      return 'Daily games require a challenge date.'
    }

    if (payload.duration_seconds <= 0) {
      return 'Duration must be greater than zero.'
    }

    if (payload.score < 0) {
      return 'Score cannot be negative.'
    }

    if (payload.moves_count <= 0) {
      return 'Moves count must be greater than zero.'
    }

    return ''
  }

  const saveGameResult = async (payload: GameResultPayload) => {
    if (saved.value || saving.value) {
      return
    }

    error.value = ''

    if (!user.value) {
      await refreshUser()
    }

    if (!user.value) {
      error.value = 'Log in to save your score and appear on leaderboards.'
      return
    }

    const validationError = validatePayload(payload)
    if (validationError) {
      error.value = validationError
      return
    }

    saving.value = true

    const { error: insertError } = await supabase.from('games').insert({
      user_id: user.value.id,
      mode: payload.mode,
      challenge_date: payload.challenge_date,
      board_seed: payload.board_seed,
      status: 'completed',
      score: payload.score,
      duration_seconds: payload.duration_seconds,
      moves_count: payload.moves_count,
      hints_used: payload.hints_used,
      shuffles_used: payload.shuffles_used,
      undo_count: payload.undo_count,
      completed_at: payload.completed_at
    })

    saving.value = false

    if (insertError) {
      error.value = friendlyError(insertError.message, 'Could not save this result.')
      return
    }

    saved.value = true
  }

  return {
    saving,
    saved,
    error,
    saveGameResult,
    resetSaveState
  }
}
