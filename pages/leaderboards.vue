<script setup lang="ts">
import type { GameMode } from '~/utils/mahjong/types'
import { getLocalDateKey } from '~/utils/date'

type LeaderboardTab = 'global' | 'classic' | 'daily' | 'city'

const { entries, loading, error, fetchLeaderboard } = useLeaderboards()
const activeTab = ref<LeaderboardTab>('global')
const selectedCity = ref('Almaty')
const activeTabValue = computed({
  get: () => activeTab.value,
  set: (value: string) => {
    activeTab.value = value as LeaderboardTab
  }
})
let cityFetchTimer: ReturnType<typeof setTimeout> | null = null

const today = getLocalDateKey()

const tabs = [
  { id: 'global', label: 'Global' },
  { id: 'classic', label: 'Classic' },
  { id: 'daily', label: 'Daily' },
  { id: 'city', label: 'Cities' }
]

const fetchActiveLeaderboard = async () => {
  const filters: {
    mode?: GameMode | null
    city?: string | null
    challengeDate?: string | null
    limit: number
  } = {
    mode: null,
    city: null,
    challengeDate: null,
    limit: 50
  }

  if (activeTab.value === 'classic') {
    filters.mode = 'classic'
  }

  if (activeTab.value === 'daily') {
    filters.mode = 'daily'
    filters.challengeDate = today
  }

  if (activeTab.value === 'city') {
    filters.city = selectedCity.value.trim() || 'Almaty'
  }

  await fetchLeaderboard(filters)
}

watch(activeTab, fetchActiveLeaderboard)
watch(selectedCity, () => {
  if (activeTab.value !== 'city') {
    return
  }

  if (cityFetchTimer) {
    clearTimeout(cityFetchTimer)
  }

  cityFetchTimer = setTimeout(fetchActiveLeaderboard, 300)
})

onBeforeUnmount(() => {
  if (cityFetchTimer) {
    clearTimeout(cityFetchTimer)
  }
})

onMounted(async () => {
  await fetchActiveLeaderboard()
})
</script>

<template>
  <section class="page-shell">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="page-title">Leaderboards</h1>
      </div>

      <div class="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:gap-3">
        <NuxtLink
          class="button-primary"
          to="/play"
        >
          Play Classic
        </NuxtLink>
        <NuxtLink
          class="button-secondary"
          to="/daily"
        >
          Try Daily Challenge
        </NuxtLink>
      </div>
    </div>

    <div class="mt-6">
      <LeaderboardTabs
        v-model:active-tab="activeTabValue"
        :tabs="tabs"
      />
    </div>

    <div
      v-if="activeTab === 'city'"
      class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <label class="text-sm font-semibold text-ink/70 dark:text-porcelain/70" for="city">City</label>
      <input
        id="city"
        v-model="selectedCity"
        class="focus-ring w-full rounded-lg border border-ink/10 bg-porcelain px-3 py-3 text-ink dark:border-porcelain/10 dark:bg-ink dark:text-porcelain sm:w-40 sm:py-2"
        placeholder="Almaty"
        type="text"
      >
    </div>

    <div class="mt-4">
      <LeaderboardTable
        empty-message="Complete a board to enter the ranking."
        empty-title="No clears yet"
        :entries="entries"
        :error="error"
        :loading="loading"
      />
    </div>
  </section>
</template>
