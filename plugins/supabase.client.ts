import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const supabaseUrl =
    String(config.public.supabaseUrl || '').trim() || 'https://placeholder.supabase.co'
  const supabaseAnonKey =
    String(config.public.supabaseAnonKey || '').trim() || 'placeholder-anon-key'

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
