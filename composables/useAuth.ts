import type { User } from '@supabase/supabase-js'

type ProfileDraft = {
  nickname: string
  city: string
}

const userState = () => useState<User | null>('auth:user', () => null)
const loadingState = () => useState<boolean>('auth:loading', () => true)
const signedOutState = () => useState<boolean>('auth:signed-out', () => false)

const getSupabaseStorageKey = () => {
  const config = useRuntimeConfig()
  const supabaseUrl =
    config.public.supabaseUrl || 'https://placeholder.supabase.co'

  return `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
}

const clearStoredSession = () => {
  if (import.meta.server || !window.localStorage) {
    return
  }

  const storageKey = getSupabaseStorageKey()
  const keys = [
    storageKey,
    `${storageKey}-code-verifier`,
    `${storageKey}-user`
  ]

  keys.forEach((key) => window.localStorage.removeItem(key))
}

export const useAuth = () => {
  const supabase = useSupabase()
  const user = userState()
  const loading = loadingState()
  const signedOut = signedOutState()

  const refreshUser = async () => {
    if (signedOut.value) {
      user.value = null
      loading.value = false
      return null
    }

    loading.value = true
    const { data } = await supabase.auth.getUser()
    user.value = data.user
    loading.value = false
    return user.value
  }

  const ensureProfile = async (draft?: Partial<ProfileDraft>) => {
    if (!user.value) {
      return
    }

    const { data: existing, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.value.id)
      .maybeSingle()

    if (selectError) {
      throw selectError
    }

    if (existing) {
      return
    }

    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.value.id,
      nickname: draft?.nickname || user.value.email?.split('@')[0] || 'Focused Player',
      city: draft?.city || 'Almaty'
    })

    if (insertError) {
      throw insertError
    }
  }

  const signIn = async (email: string, password: string) => {
    signedOut.value = false
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      throw error
    }

    await refreshUser()
    await ensureProfile()
    await navigateTo('/profile')
  }

  const signUp = async (
    email: string,
    password: string,
    profile: ProfileDraft
  ) => {
    signedOut.value = false
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      throw error
    }

    await refreshUser()
    await ensureProfile(profile)
    await navigateTo('/profile')
  }

  const requestPasswordReset = async (email: string) => {
    const redirectTo = import.meta.client
      ? `${window.location.origin}/reset-password`
      : undefined

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    })

    if (error) {
      throw error
    }
  }

  const updatePassword = async (password: string) => {
    signedOut.value = false

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    loading.value = true
    signedOut.value = true
    user.value = null
    clearStoredSession()

    try {
      await supabase.auth.signOut({ scope: 'local' })
    } finally {
      clearStoredSession()
      user.value = null
      loading.value = false
    }

    await navigateTo('/')
  }

  return {
    user,
    loading,
    refreshUser,
    ensureProfile,
    signIn,
    signUp,
    requestPasswordReset,
    updatePassword,
    signOut
  }
}
