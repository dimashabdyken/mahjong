<script setup lang="ts">
import type { SavedGameRecord } from '~/composables/useProfileStats'
import { formatTime } from '~/utils/mahjong/scoring'

defineProps<{
  games: SavedGameRecord[]
}>()

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value))

const formatMode = (mode: string) => mode.charAt(0).toUpperCase() + mode.slice(1)
</script>

<template>
  <div class="panel min-w-0 overflow-hidden">
    <div class="border-b border-ink/10 px-5 py-3 dark:border-porcelain/10">
      <p class="text-sm font-semibold text-jade">Recent games</p>
    </div>

    <div v-if="!games.length" class="p-5 text-center">
      <h2 class="text-xl font-semibold">No saved clears yet</h2>
      <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60 dark:text-porcelain/60">
        Finish a classic or daily board to start building your profile.
      </p>
      <div class="mt-4 flex flex-wrap justify-center gap-3">
        <NuxtLink
          class="button-primary px-4 py-2.5"
          to="/play"
        >
          Play Classic
        </NuxtLink>
        <NuxtLink
          class="button-secondary px-4 py-2.5"
          to="/daily"
        >
          Try Daily Challenge
        </NuxtLink>
      </div>
    </div>

    <div v-else class="min-w-0">
      <div class="divide-y divide-ink/10 md:hidden dark:divide-porcelain/10">
        <div
          v-for="game in games"
          :key="game.id"
          class="grid gap-2.5 px-5 py-3"
        >
          <div class="flex items-center justify-between gap-4">
            <p class="font-semibold">{{ formatMode(game.mode) }}</p>
            <p class="text-sm text-ink/60 dark:text-porcelain/60">{{ formatDate(game.created_at) }}</p>
          </div>
          <dl class="grid grid-cols-2 gap-x-5 gap-y-1.5 text-sm">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink/55 dark:text-porcelain/55">Score</dt>
              <dd class="font-semibold">{{ game.score }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink/55 dark:text-porcelain/55">Time</dt>
              <dd class="font-semibold">{{ formatTime(game.duration_seconds) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink/55 dark:text-porcelain/55">Moves</dt>
              <dd class="font-semibold">{{ game.moves_count }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink/55 dark:text-porcelain/55">Challenge</dt>
              <dd class="font-semibold">{{ game.challenge_date || 'Classic' }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="hidden overflow-x-auto md:block">
      <table class="w-full min-w-[44rem] table-fixed text-left text-sm">
        <thead class="border-b border-ink/10 text-xs font-semibold text-ink/50 dark:border-porcelain/10 dark:text-porcelain/50">
          <tr>
            <th class="px-5 py-2">Mode</th>
            <th class="px-4 py-2">Score</th>
            <th class="px-4 py-2">Time</th>
            <th class="px-4 py-2">Moves</th>
            <th class="px-4 py-2">Challenge</th>
            <th class="px-5 py-2">Saved</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ink/10 dark:divide-porcelain/10">
          <tr
            v-for="game in games"
            :key="game.id"
            class="transition hover:bg-mist/70 dark:hover:bg-porcelain/10"
          >
            <td class="px-5 py-2.5 font-semibold">{{ formatMode(game.mode) }}</td>
            <td class="px-4 py-2.5">{{ game.score }}</td>
            <td class="px-4 py-2.5">{{ formatTime(game.duration_seconds) }}</td>
            <td class="px-4 py-2.5">{{ game.moves_count }}</td>
            <td class="px-4 py-2.5 text-ink/60 dark:text-porcelain/60">
              {{ game.challenge_date || 'Classic' }}
            </td>
            <td class="px-5 py-2.5 text-ink/60 dark:text-porcelain/60">
              {{ formatDate(game.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>
</template>
