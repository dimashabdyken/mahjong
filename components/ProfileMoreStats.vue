<script setup lang="ts">
import type { ProfileStats } from '~/composables/useProfileStats'
const props = defineProps<{
  stats: ProfileStats
}>()

const items = computed(() => [
  { label: 'Completed', value: props.stats.completedGames },
  { label: 'Classic', value: props.stats.classicGames },
  { label: 'Daily', value: props.stats.dailyGames },
  { label: 'Hints used', value: props.stats.totalHintsUsed },
  { label: 'Shuffles', value: props.stats.totalShufflesUsed },
  { label: 'Undos', value: props.stats.totalUndoCount }
])
</script>

<template>
  <section class="panel p-4">
    <p class="text-sm font-semibold text-jade">More stats</p>

    <dl class="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-1.5 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 dark:border-porcelain/10"
      >
        <dt class="text-sm font-medium text-ink/58 dark:text-porcelain/58">
          {{ item.label }}
        </dt>
        <dd class="text-sm font-semibold text-ink dark:text-porcelain">
          {{ item.value }}
        </dd>
      </div>
    </dl>
  </section>
</template>
