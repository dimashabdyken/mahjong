<script setup lang="ts">
import type { ProfileStats, SavedGameRecord } from '~/composables/useProfileStats'
import { formatTime } from '~/utils/mahjong/scoring'

const props = defineProps<{
  stats: ProfileStats
  games: SavedGameRecord[]
  pro: boolean
}>()

const completedGames = computed(() => props.stats.completedGames)
const gamesPlayed = computed(() => props.stats.gamesPlayed)
const hasGames = computed(() => completedGames.value > 0)

const completionRate = computed(() => {
  if (!gamesPlayed.value) {
    return null
  }

  return Math.round((completedGames.value / gamesPlayed.value) * 100)
})

const averageMoves = computed(() => {
  if (!completedGames.value) {
    return null
  }

  return Math.round(props.stats.totalMoves / completedGames.value)
})

const averageHints = computed(() => {
  if (!completedGames.value) {
    return null
  }

  return props.stats.totalHintsUsed / completedGames.value
})

const averageShuffles = computed(() => {
  if (!completedGames.value) {
    return null
  }

  return props.stats.totalShufflesUsed / completedGames.value
})

const averageUndos = computed(() => {
  if (!completedGames.value) {
    return null
  }

  return props.stats.totalUndoCount / completedGames.value
})

const formatDecimal = (value: number | null) =>
  value === null ? '—' : value.toFixed(value >= 10 ? 0 : 1)

const mainInsights = computed(() => [
  {
    label: 'Completion rate',
    value: completionRate.value === null ? '—' : `${completionRate.value}%`,
    detail: `${completedGames.value} completed / ${gamesPlayed.value} played`
  },
  {
    label: 'Average moves',
    value: averageMoves.value === null ? '—' : averageMoves.value,
    detail: hasGames.value ? `${props.stats.totalMoves} total moves` : 'Not enough data yet'
  },
  {
    label: 'Average time',
    value: props.stats.averageTime === null ? '—' : formatTime(props.stats.averageTime),
    detail: props.stats.bestTime === null ? 'Best time unavailable' : `Best ${formatTime(props.stats.bestTime)}`
  },
  {
    label: 'Hint usage',
    value: formatDecimal(averageHints.value),
    detail: hasGames.value ? 'Hints per completed game' : 'Not enough data yet'
  }
])

const summaryItems = computed(() => [
  { label: 'Best score', value: hasGames.value ? props.stats.bestScore : '—' },
  { label: 'Best time', value: props.stats.bestTime === null ? '—' : formatTime(props.stats.bestTime) },
  { label: 'Daily streak', value: props.stats.currentDailyStreak },
  { label: 'Recent games', value: props.games.length }
])

const recentMoveTrend = computed(() => {
  if (props.games.length < 6) {
    return 'Play a few more saved boards to compare recent move counts.'
  }

  const recent = props.games.slice(0, 3)
  const previous = props.games.slice(3, 6)
  const average = (games: SavedGameRecord[]) =>
    games.reduce((sum, game) => sum + game.moves_count, 0) / games.length
  const recentAverage = average(recent)
  const previousAverage = average(previous)

  if (recentAverage <= previousAverage * 0.92) {
    return 'Your recent move count is improving.'
  }

  if (recentAverage >= previousAverage * 1.08) {
    return 'Your recent move count is running higher than before.'
  }

  return 'Your recent move count is stable.'
})

const hintStyle = computed(() => {
  if (averageHints.value === null) {
    return 'Play a few boards to reveal hint habits.'
  }

  if (averageHints.value <= 0.25) {
    return 'You use hints rarely.'
  }

  if (averageHints.value <= 1) {
    return 'You use hints moderately.'
  }

  return 'You lean on hints often.'
})

const dailyStyle = computed(() => {
  if (props.stats.currentDailyStreak >= 3) {
    return 'Your daily rhythm is strong.'
  }

  if (props.stats.longestDailyStreak > props.stats.currentDailyStreak) {
    return 'Your best streak shows consistency is within reach.'
  }

  return 'Daily streaks build with regular clears.'
})

const resourceLine = computed(() => {
  if (!hasGames.value) {
    return 'Shuffle and undo patterns will appear after saved clears.'
  }

  return `${formatDecimal(averageShuffles.value)} shuffles · ${formatDecimal(averageUndos.value)} undos per game`
})
</script>

<template>
  <section v-if="!pro" class="panel p-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-jade">Progress insights</p>
        <p class="mt-2 text-sm leading-6 text-ink/62 dark:text-porcelain/62">
          Progress insights are available with Pro.
        </p>
      </div>
      <NuxtLink class="button-premium w-full px-4 py-2.5 sm:w-auto" to="/pro">
        Upgrade to Pro
      </NuxtLink>
    </div>
  </section>

  <section v-else class="panel p-4">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-jade">Progress insights</p>
        <h2 class="mt-1 text-xl font-semibold text-ink dark:text-porcelain">Performance patterns</h2>
      </div>
      <p class="text-sm font-medium text-ink/55 dark:text-porcelain/55">
        Based on saved completed games
      </p>
    </div>

    <div v-if="!hasGames" class="mt-4 rounded-lg border border-ink/10 bg-rice/80 p-4 text-sm leading-6 text-ink/62 dark:border-porcelain/10 dark:bg-porcelain/5 dark:text-porcelain/62">
      Play a few boards to unlock meaningful insights.
    </div>

    <template v-else>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="item in mainInsights"
          :key="item.label"
          class="rounded-lg border border-ink/10 bg-rice/70 px-3.5 py-3 dark:border-porcelain/10 dark:bg-porcelain/5"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45 dark:text-porcelain/45">
            {{ item.label }}
          </p>
          <p class="mt-2 text-2xl font-semibold leading-none text-ink dark:text-porcelain">
            {{ item.value }}
          </p>
          <p class="mt-2 text-xs font-medium text-ink/55 dark:text-porcelain/55">
            {{ item.detail }}
          </p>
        </div>
      </div>

      <div class="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div class="rounded-lg border border-ink/10 bg-white/55 p-3.5 dark:border-porcelain/10 dark:bg-porcelain/5">
          <p class="text-sm font-semibold text-ink dark:text-porcelain">Playing style</p>
          <ul class="mt-2.5 grid gap-2 text-sm leading-6 text-ink/62 dark:text-porcelain/62">
            <li>{{ hintStyle }}</li>
            <li>{{ recentMoveTrend }}</li>
            <li>{{ dailyStyle }}</li>
            <li>{{ resourceLine }}</li>
          </ul>
        </div>

        <div class="rounded-lg border border-ink/10 bg-white/55 p-3.5 dark:border-porcelain/10 dark:bg-porcelain/5">
          <p class="text-sm font-semibold text-ink dark:text-porcelain">Performance summary</p>
          <dl class="mt-2.5 grid gap-2 text-sm">
            <div
              v-for="item in summaryItems"
              :key="item.label"
              class="flex items-center justify-between gap-4 border-b border-ink/10 pb-2 last:border-b-0 dark:border-porcelain/10"
            >
              <dt class="text-ink/55 dark:text-porcelain/55">{{ item.label }}</dt>
              <dd class="font-semibold text-ink dark:text-porcelain">{{ item.value }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </template>
  </section>
</template>
