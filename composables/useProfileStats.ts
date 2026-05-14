import { getLocalDateKey } from '~/utils/date'
import { friendlyError } from '~/utils/errors'

export type ProfileRecord = {
  nickname: string
  city: string
  avatar_url: string | null
  is_pro: boolean
  created_at: string
  updated_at: string
}

export type SavedGameRecord = {
  id: string
  mode: 'classic' | 'daily'
  challenge_date: string | null
  score: number
  duration_seconds: number
  moves_count: number
  hints_used: number
  shuffles_used: number
  undo_count: number
  completed_at: string
  created_at: string
}

export type ProfileStats = {
  gamesPlayed: number
  completedGames: number
  classicGames: number
  dailyGames: number
  bestScore: number
  bestTime: number | null
  averageTime: number | null
  totalMoves: number
  totalHintsUsed: number
  totalShufflesUsed: number
  totalUndoCount: number
  currentDailyStreak: number
  longestDailyStreak: number
}

const toDate = (dateKey: string) => new Date(`${dateKey}T00:00:00`)

const addDays = (dateKey: string, days: number) => {
  const date = toDate(dateKey)
  date.setDate(date.getDate() + days)
  return getLocalDateKey(date)
}

const computeDailyStreaks = (games: SavedGameRecord[]) => {
  const dailyDates = [
    ...new Set(
      games
        .filter((game) => game.mode === 'daily' && game.challenge_date)
        .map((game) => game.challenge_date as string)
    )
  ].sort()

  if (!dailyDates.length) {
    return {
      currentDailyStreak: 0,
      longestDailyStreak: 0
    }
  }

  let longestDailyStreak = 1
  let runningStreak = 1

  for (let index = 1; index < dailyDates.length; index += 1) {
    if (dailyDates[index] === addDays(dailyDates[index - 1], 1)) {
      runningStreak += 1
    } else {
      runningStreak = 1
    }

    longestDailyStreak = Math.max(longestDailyStreak, runningStreak)
  }

  const dateSet = new Set(dailyDates)
  const today = getLocalDateKey()
  const yesterday = addDays(today, -1)
  let cursor = dateSet.has(today) ? today : dateSet.has(yesterday) ? yesterday : ''
  let currentDailyStreak = 0

  while (cursor && dateSet.has(cursor)) {
    currentDailyStreak += 1
    cursor = addDays(cursor, -1)
  }

  return {
    currentDailyStreak,
    longestDailyStreak
  }
}

const computeStats = (games: SavedGameRecord[]): ProfileStats => {
  const completedGames = games
  const totalDuration = completedGames.reduce(
    (sum, game) => sum + game.duration_seconds,
    0
  )
  const streaks = computeDailyStreaks(completedGames)

  return {
    gamesPlayed: completedGames.length,
    completedGames: completedGames.length,
    classicGames: completedGames.filter((game) => game.mode === 'classic').length,
    dailyGames: completedGames.filter((game) => game.mode === 'daily').length,
    bestScore: completedGames.length
      ? Math.max(...completedGames.map((game) => game.score))
      : 0,
    bestTime: completedGames.length
      ? Math.min(...completedGames.map((game) => game.duration_seconds))
      : null,
    averageTime: completedGames.length
      ? Math.round(totalDuration / completedGames.length)
      : null,
    totalMoves: completedGames.reduce((sum, game) => sum + game.moves_count, 0),
    totalHintsUsed: completedGames.reduce((sum, game) => sum + game.hints_used, 0),
    totalShufflesUsed: completedGames.reduce(
      (sum, game) => sum + game.shuffles_used,
      0
    ),
    totalUndoCount: completedGames.reduce((sum, game) => sum + game.undo_count, 0),
    currentDailyStreak: streaks.currentDailyStreak,
    longestDailyStreak: streaks.longestDailyStreak
  }
}

export const useProfileStats = () => {
  const supabase = useSupabase()
  const { user, refreshUser, ensureProfile } = useAuth()
  const profile = ref<ProfileRecord | null>(null)
  const games = ref<SavedGameRecord[]>([])
  const stats = computed(() => computeStats(games.value))
  const loading = ref(false)
  const savingProfile = ref(false)
  const error = ref('')
  const profileSaveMessage = ref('')
  const recentGames = computed(() => games.value.slice(0, 5))

  const fetchDashboard = async () => {
    loading.value = true
    error.value = ''
    profileSaveMessage.value = ''

    if (!user.value) {
      await refreshUser()
    }

    if (!user.value) {
      loading.value = false
      error.value = 'You need to log in to view your profile.'
      return
    }

    await ensureProfile()

    const [{ data: profileData, error: profileError }, { data: gamesData, error: gamesError }] =
      await Promise.all([
        supabase
          .from('profiles')
          .select('nickname, city, avatar_url, is_pro, created_at, updated_at')
          .eq('id', user.value.id)
          .single(),
        supabase
          .from('games')
          .select('id, mode, challenge_date, score, duration_seconds, moves_count, hints_used, shuffles_used, undo_count, completed_at, created_at')
          .eq('user_id', user.value.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
      ])

    loading.value = false

    if (profileError) {
      error.value = friendlyError(profileError.message, 'Could not load your profile.')
      return
    }

    if (gamesError) {
      error.value = friendlyError(gamesError.message, 'Could not load your saved games.')
      return
    }

    profile.value = profileData as ProfileRecord
    games.value = (gamesData || []) as SavedGameRecord[]
  }

  const updateProfile = async (payload: {
    nickname: string
    city: string
    avatar_url?: string | null
  }) => {
    if (!user.value) {
      await refreshUser()
    }

    if (!user.value) {
      error.value = 'You need to log in to update your profile.'
      return
    }

    savingProfile.value = true
    error.value = ''
    profileSaveMessage.value = ''

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        nickname: payload.nickname.trim() || 'Focused Player',
        city: payload.city.trim() || 'Almaty',
        avatar_url: payload.avatar_url?.trim() || null
      })
      .eq('id', user.value.id)
      .select('nickname, city, avatar_url, is_pro, created_at, updated_at')
      .single()

    savingProfile.value = false

    if (updateError) {
      error.value = friendlyError(updateError.message, 'Could not update your profile.')
      return
    }

    profile.value = data as ProfileRecord
    profileSaveMessage.value = 'Profile updated.'
  }

  return {
    profile,
    games,
    recentGames,
    stats,
    loading,
    savingProfile,
    error,
    profileSaveMessage,
    fetchDashboard,
    updateProfile
  }
}
