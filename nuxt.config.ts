const cleanEnvValue = (value: string | undefined) =>
  String(value || '').trim().split(/\s+/)[0]

export default defineNuxtConfig({
  buildDir: ['build', 'generate'].includes(process.env.npm_lifecycle_event || '')
    ? '.nuxt-build'
    : '.nuxt',
  compatibilityDate: '2024-09-18',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      supabaseUrl: cleanEnvValue(process.env.NUXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: cleanEnvValue(process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY)
    }
  },
  app: {
    head: {
      title: 'Mahjong Focus Arena',
      meta: [
        {
          name: 'description',
          content:
            'A calming premium Mahjong platform for focus, short breaks, and daily challenges.'
        }
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/brand/mahjong-mark.png'
        }
      ]
    }
  }
})
