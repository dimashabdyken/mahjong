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
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
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
