import type { GameMode } from '~/utils/mahjong/types'
import { friendlyError } from '~/utils/errors'

export type LeaderboardEntry = {
  nickname: string
  city: string
  score: number
  duration_seconds: number
  mode: GameMode
  challenge_date: string | null
  created_at: string
}

type LeaderboardFilters = {
  mode?: GameMode | null
  city?: string | null
  challengeDate?: string | null
  limit?: number
}

export const useLeaderboards = () => {
  const supabase = useSupabase()
  const entries = ref<LeaderboardEntry[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchLeaderboard = async ({
    mode = null,
    city = null,
    challengeDate = null,
    limit = 50
  }: LeaderboardFilters = {}) => {
    loading.value = true
    error.value = ''

    try {
      const { data, error: rpcError } = await supabase.rpc('get_leaderboard_entries', {
        p_mode: mode,
        p_city: city,
        p_challenge_date: challengeDate,
        p_limit: limit
      })

      if (rpcError) {
        console.error('Leaderboard RPC failed', rpcError)
        entries.value = []
        error.value = friendlyError(rpcError.message, 'Could not load leaderboard.')
        return
      }

      entries.value = (data || []) as LeaderboardEntry[]
    } catch (fetchError) {
      console.error('Leaderboard fetch failed', fetchError)
      entries.value = []
      error.value = friendlyError(
        fetchError instanceof Error ? fetchError.message : '',
        'Could not load leaderboard.'
      )
    } finally {
      loading.value = false
    }
  }

  return {
    entries,
    loading,
    error,
    fetchLeaderboard
  }
}
