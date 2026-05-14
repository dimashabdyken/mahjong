<script setup lang="ts">
import type { ProfileStats } from '~/composables/useProfileStats'
import { formatTime } from '~/utils/mahjong/scoring'

const props = defineProps<{
  stats: ProfileStats
}>()

const primaryItems = computed(() => [
  { label: 'Games played', value: props.stats.gamesPlayed },
  { label: 'Best score', value: props.stats.bestScore },
  {
    label: 'Best time',
    value: props.stats.bestTime === null ? '—' : formatTime(props.stats.bestTime)
  },
  { label: 'Daily streak', value: props.stats.currentDailyStreak }
])
</script>

<template>
  <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <div
      v-for="item in primaryItems"
      :key="item.label"
      class="panel px-4 py-3.5"
    >
      <p class="text-sm font-semibold text-ink/55 dark:text-porcelain/55">
        {{ item.label }}
      </p>
      <p class="mt-2 text-2xl font-semibold leading-none text-ink dark:text-porcelain">{{ item.value }}</p>
    </div>
  </section>
</template>
