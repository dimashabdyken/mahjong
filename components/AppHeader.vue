<script setup lang="ts">
const { user, loading, signOut } = useAuth()
const plan = useProfilePlan()
const route = useRoute()
const signingOut = ref(false)
const mobileNavOpen = ref(false)
type ThemeMode = 'light' | 'dark'
const themeStorageKey = 'mahjong:theme'
const themeMode = ref<ThemeMode>('light')

const navItems = computed(() => [
  { label: 'Play', to: '/play' },
  { label: 'Daily', to: '/daily' },
  { label: 'Leaderboards', to: '/leaderboards' },
  { label: user.value && plan.isPro.value ? 'Pro active' : 'Pro', to: '/pro', premium: true }
])

const isActive = (to: string) => route.path === to
const isDarkTheme = computed(() => themeMode.value === 'dark')

const applyTheme = (theme: ThemeMode) => {
  themeMode.value = theme

  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = theme
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

const setTheme = (theme: ThemeMode) => {
  applyTheme(theme)

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(themeStorageKey, theme)
  }
}

const handleSignOut = async () => {
  if (signingOut.value) {
    return
  }

  signingOut.value = true

  try {
    await signOut()
  } finally {
    signingOut.value = false
  }
}

watch(
  () => route.path,
  () => {
    mobileNavOpen.value = false
  }
)

watch(
  user,
  (currentUser) => {
    if (currentUser && !plan.loaded.value) {
      plan.fetchPlan()
    }
  },
  { immediate: true }
)

onMounted(() => {
  const storedTheme = localStorage.getItem(themeStorageKey)
  applyTheme(storedTheme === 'dark' ? 'dark' : 'light')
})
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-ink/10 bg-porcelain/90 backdrop-blur dark:border-porcelain/10 dark:bg-ink/90">
    <div class="mx-auto flex max-w-[76rem] items-center justify-between gap-3 px-3 py-3 sm:gap-5 sm:px-6">
      <NuxtLink
        to="/"
        class="group flex min-w-0 items-center gap-2.5 text-base font-semibold tracking-normal sm:gap-3.5"
      >
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ink/10 bg-rice p-1 shadow-sm dark:border-porcelain/10 dark:bg-porcelain/10 sm:h-[3.25rem] sm:w-[3.25rem]">
          <img
            alt=""
            class="h-full w-full object-contain"
            src="/brand/mahjong-mark.png"
          >
        </span>
        <span class="flex min-w-0 translate-y-0.5 items-center leading-none">
          <img
            alt="Mahjong"
            class="h-7 w-auto max-w-[9.25rem] object-contain sm:h-9 sm:max-w-none"
            src="/brand/mahjong-wordmark.png"
          >
        </span>
      </NuxtLink>

      <nav class="hidden items-center gap-1.5 text-[0.96rem] text-ink/75 dark:text-porcelain/75 md:flex">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="rounded-lg px-3.5 py-2.5 font-semibold transition hover:bg-rice hover:text-ink hover:shadow-sm dark:hover:bg-porcelain/10 dark:hover:text-porcelain"
          :class="[
            isActive(item.to)
              ? 'bg-rice text-ink shadow-sm ring-1 ring-ink/10 dark:bg-porcelain/10 dark:text-porcelain dark:ring-porcelain/10'
              : '',
            item.premium && !isActive(item.to)
              ? 'text-lacquer dark:text-porcelain'
              : ''
          ]"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="flex shrink-0 items-center gap-2">
        <div class="hidden rounded-lg border border-ink/10 bg-rice/70 p-1 shadow-sm shadow-ink/5 dark:border-porcelain/10 dark:bg-porcelain/5 sm:flex">
          <button
            class="focus-ring rounded-md px-2.5 py-1.5 text-xs font-semibold transition"
            :class="!isDarkTheme
              ? 'bg-porcelain text-ink shadow-sm ring-1 ring-ink/10 dark:bg-porcelain dark:text-ink'
              : 'text-ink/60 hover:bg-porcelain/70 hover:text-ink dark:text-porcelain/60 dark:hover:bg-porcelain/10 dark:hover:text-porcelain'"
            type="button"
            @click="setTheme('light')"
          >
            Light
          </button>
          <button
            class="focus-ring rounded-md px-2.5 py-1.5 text-xs font-semibold transition"
            :class="isDarkTheme
              ? 'bg-ink text-porcelain shadow-sm ring-1 ring-porcelain/10 dark:bg-porcelain dark:text-ink'
              : 'text-ink/60 hover:bg-porcelain/70 hover:text-ink dark:text-porcelain/60 dark:hover:bg-porcelain/10 dark:hover:text-porcelain'"
            type="button"
            @click="setTheme('dark')"
          >
            Dark
          </button>
        </div>
        <button
          class="focus-ring flex h-11 w-11 items-center justify-center rounded-lg border border-ink/20 bg-rice/50 text-sm font-semibold text-ink/80 transition hover:border-jade hover:bg-rice hover:text-ink dark:border-porcelain/20 dark:bg-porcelain/5 dark:text-porcelain/80 dark:hover:bg-porcelain/10 dark:hover:text-porcelain md:hidden"
          :aria-expanded="mobileNavOpen"
          aria-label="Toggle navigation"
          type="button"
          @click="mobileNavOpen = !mobileNavOpen"
        >
          Menu
        </button>
        <NuxtLink
          v-if="user"
          to="/profile"
          aria-label="Profile"
          class="hidden h-11 w-11 items-center justify-center rounded-lg border border-ink/20 bg-rice/50 text-ink/80 transition hover:border-jade hover:bg-rice hover:text-ink dark:border-porcelain/20 dark:bg-porcelain/5 dark:text-porcelain/80 dark:hover:bg-porcelain/10 dark:hover:text-porcelain sm:inline-flex"
          title="Profile"
        >
          <img
            alt=""
            aria-hidden="true"
            class="h-6 w-6 object-contain dark:invert"
            src="/icons/square-user.png"
          >
        </NuxtLink>
        <button
          v-if="user"
          aria-label="Logout"
          class="focus-ring flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-lacquer/45 bg-rice/80 text-lacquer shadow-sm transition hover:border-lacquer hover:bg-lacquer/10 hover:shadow-tile disabled:opacity-70 dark:border-lacquer/60 dark:bg-porcelain/10 dark:hover:bg-lacquer/20"
          :disabled="signingOut"
          title="Logout"
          type="button"
          @click="handleSignOut"
        >
          <img
            alt=""
            aria-hidden="true"
            class="h-5 w-5 object-contain [filter:invert(24%)_sepia(70%)_saturate(1890%)_hue-rotate(354deg)_brightness(91%)_contrast(95%)]"
            src="/icons/log-out.png"
          >
        </button>
        <NuxtLink
          v-else-if="!loading"
          to="/login"
          class="focus-ring rounded-lg bg-ink px-[1.125rem] py-2.5 text-[0.95rem] font-semibold text-porcelain transition hover:bg-lacquer dark:bg-porcelain dark:text-ink"
        >
          Login
        </NuxtLink>
        <div
          v-else
          class="h-11 w-[4.75rem] rounded-lg bg-ink/10 dark:bg-porcelain/10"
          aria-hidden="true"
        />
      </div>
    </div>
    <nav
      v-if="mobileNavOpen"
      class="mx-auto grid max-w-[76rem] grid-cols-2 gap-2 border-t border-ink/10 px-3 py-3 text-sm font-semibold text-ink/75 dark:border-porcelain/10 dark:text-porcelain/75 sm:grid-cols-4 sm:px-6 md:hidden"
    >
      <div class="col-span-2 grid grid-cols-2 rounded-lg border border-ink/10 bg-rice/70 p-1 dark:border-porcelain/10 dark:bg-porcelain/5 sm:col-span-4">
        <button
          class="focus-ring rounded-md px-3 py-2.5 text-center text-sm font-semibold transition"
          :class="!isDarkTheme
            ? 'bg-porcelain text-ink shadow-sm ring-1 ring-ink/10 dark:bg-porcelain dark:text-ink'
            : 'text-ink/60 hover:bg-porcelain/70 hover:text-ink dark:text-porcelain/60 dark:hover:bg-porcelain/10 dark:hover:text-porcelain'"
          type="button"
          @click="setTheme('light')"
        >
          Light
        </button>
        <button
          class="focus-ring rounded-md px-3 py-2.5 text-center text-sm font-semibold transition"
          :class="isDarkTheme
            ? 'bg-ink text-porcelain shadow-sm ring-1 ring-porcelain/10 dark:bg-porcelain dark:text-ink'
            : 'text-ink/60 hover:bg-porcelain/70 hover:text-ink dark:text-porcelain/60 dark:hover:bg-porcelain/10 dark:hover:text-porcelain'"
          type="button"
          @click="setTheme('dark')"
        >
          Dark
        </button>
      </div>
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="rounded-lg px-3 py-3 text-center transition hover:bg-rice hover:text-ink dark:hover:bg-porcelain/10 dark:hover:text-porcelain"
        :class="[
          isActive(item.to)
            ? 'bg-rice text-ink shadow-sm ring-1 ring-ink/10 dark:bg-porcelain/10 dark:text-porcelain dark:ring-porcelain/10'
            : '',
          item.premium && !isActive(item.to)
            ? 'text-lacquer dark:text-porcelain'
            : ''
        ]"
      >
        {{ item.label }}
      </NuxtLink>
      <NuxtLink
        v-if="user"
        to="/profile"
        class="rounded-lg px-3 py-3 text-center transition hover:bg-rice hover:text-ink dark:hover:bg-porcelain/10 dark:hover:text-porcelain"
        :class="isActive('/profile')
          ? 'bg-rice text-ink shadow-sm ring-1 ring-ink/10 dark:bg-porcelain/10 dark:text-porcelain dark:ring-porcelain/10'
          : ''"
      >
        Profile
      </NuxtLink>
    </nav>
  </header>
</template>
