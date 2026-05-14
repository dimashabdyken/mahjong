import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const supabaseUrl =
    config.public.supabaseUrl || 'https://placeholder.supabase.co'
  const supabaseAnonKey =
    config.public.supabaseAnonKey || 'placeholder-anon-key'

  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    console.warn(
      'Supabase env vars are missing. Auth calls will fail until .env is configured.'
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })

  return {
    provide: {
      supabase
    }
  }
})
