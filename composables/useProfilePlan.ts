import { friendlyError } from '~/utils/errors'

export const useProfilePlan = () => {
  const supabase = useSupabase()
  const { user, refreshUser, ensureProfile } = useAuth()
  const isPro = useState<boolean>('profile:is-pro', () => false)
  const loading = useState<boolean>('profile:plan-loading', () => true)
  const loaded = useState<boolean>('profile:plan-loaded', () => false)
  const saving = ref(false)
  const error = ref('')

  const fetchPlan = async () => {
    loading.value = true
    error.value = ''

    try {
      if (!user.value) {
        await refreshUser()
      }

      if (!user.value) {
        isPro.value = false
        return
      }

      await ensureProfile()

      const { data, error: planError } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', user.value.id)
        .maybeSingle()

      if (planError) {
        error.value = friendlyError(planError.message, 'Could not load your plan.')
        return
      }

      isPro.value = Boolean(data?.is_pro)
    } catch (fetchError) {
      error.value = friendlyError(
        fetchError instanceof Error ? fetchError.message : '',
        'Could not load your plan.'
      )
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  const activatePro = async () => {
    saving.value = true
    error.value = ''

    if (!user.value) {
      await refreshUser()
    }

    if (!user.value) {
      saving.value = false
      error.value = 'Log in to activate Pro.'
      return false
    }

    await ensureProfile()

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ is_pro: true })
      .eq('id', user.value.id)
      .select('is_pro')
      .single()

    saving.value = false

    if (updateError) {
      error.value = friendlyError(updateError.message, 'Could not activate Pro.')
      return false
    }

    isPro.value = Boolean(data?.is_pro)
    loaded.value = true
    return isPro.value
  }

  return {
    isPro,
    loading,
    loaded,
    saving,
    error,
    fetchPlan,
    activatePro
  }
}
