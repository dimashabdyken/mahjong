<script setup lang="ts">
import type { LeaderboardEntry } from '~/composables/useLeaderboards'
import { formatTime } from '~/utils/mahjong/scoring'

defineProps<{
  entries: LeaderboardEntry[]
  loading: boolean
  error: string
  emptyTitle: string
  emptyMessage: string
}>()

const formatDate = (value: string | null) => {
  if (!value) {
    return 'Classic'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value))
}

const displayDate = (entry: LeaderboardEntry) =>
  entry.mode === 'daily' && entry.challenge_date
    ? formatDate(entry.challenge_date)
    : formatDate(entry.created_at)

const formatMode = (mode: string) => mode.charAt(0).toUpperCase() + mode.slice(1)
</script>

<template>
  <div class="panel min-w-0 overflow-hidden">
    <div v-if="loading" class="p-4">
      <div class="mb-3 flex items-center justify-between gap-4">
        <div class="h-4 w-32 rounded bg-ink/10 dark:bg-porcelain/10" />
        <div class="h-4 w-20 rounded bg-ink/5 dark:bg-porcelain/10" />
      </div>
      <div class="space-y-2">
        <div
          v-for="item in 5"
          :key="item"
          class="grid grid-cols-[3rem_1fr_5rem] items-center gap-3 rounded-lg border border-ink/5 bg-rice/50 px-4 py-3 dark:border-porcelain/10 dark:bg-porcelain/5"
        >
          <div class="h-4 rounded bg-ink/10 dark:bg-porcelain/10" />
          <div class="h-4 rounded bg-ink/5 dark:bg-porcelain/10" />
          <div class="h-4 rounded bg-ink/10 dark:bg-porcelain/10" />
        </div>
      </div>
    </div>

    <div v-else-if="error" class="p-8">
      <p class="text-sm font-semibold text-ember">Could not load leaderboard.</p>
      <p class="mt-2 text-sm text-ink/60 dark:text-porcelain/60">{{ error }}</p>
    </div>

    <div v-else-if="!entries.length" class="px-6 py-10 text-center">
      <div class="mx-auto flex size-12 items-center justify-center rounded-lg border border-jade/20 bg-rice text-xl font-semibold text-jade shadow-sm shadow-ink/5">
        一
      </div>
      <h2 class="mt-4 text-2xl font-semibold text-ink dark:text-porcelain">{{ emptyTitle }}</h2>
      <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/60 dark:text-porcelain/60">
        {{ emptyMessage }}
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
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

    <div v-else class="min-w-0 overflow-x-auto">
      <div class="flex min-w-[700px] items-center justify-between gap-4 border-b border-ink/10 bg-rice/45 px-5 py-3 dark:border-porcelain/10 dark:bg-porcelain/5">
        <p class="text-sm font-semibold text-ink dark:text-porcelain">Ranking board</p>
        <p class="text-xs font-semibold text-ink/50 dark:text-porcelain/50">Score first, time breaks ties</p>
      </div>
      <table class="w-full min-w-[700px] text-left text-sm">
        <thead class="border-b border-ink/10 text-xs font-semibold uppercase tracking-[0.08em] text-ink/45 dark:border-porcelain/10 dark:text-porcelain/45">
          <tr>
            <th class="px-5 py-3">Rank</th>
            <th class="px-5 py-3">Nickname</th>
            <th class="px-5 py-3">City</th>
            <th class="px-5 py-3">Score</th>
            <th class="px-5 py-3">Time</th>
            <th class="px-5 py-3">Mode / date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ink/10 dark:divide-porcelain/10">
          <tr
            v-for="(entry, index) in entries"
            :key="`${entry.nickname}-${entry.city}-${entry.score}-${entry.created_at}-${index}`"
            class="transition hover:bg-mist/70 dark:hover:bg-porcelain/10"
            :class="index < 3 ? 'bg-rice/45 dark:bg-porcelain/[0.03]' : ''"
          >
            <td class="px-5 py-4">
              <span
                class="inline-flex min-w-10 items-center justify-center rounded-md border px-2.5 py-1 text-sm font-semibold"
                :class="index < 3
                  ? 'border-jade/25 bg-porcelain text-lacquer shadow-sm shadow-ink/5 dark:border-jade/30 dark:bg-porcelain dark:text-lacquer'
                  : 'border-ink/10 bg-porcelain/60 text-ink/65 dark:border-porcelain/10 dark:bg-porcelain/10 dark:text-porcelain/65'"
              >
                #{{ index + 1 }}
              </span>
            </td>
            <td class="px-5 py-4 font-semibold text-ink dark:text-porcelain">{{ entry.nickname }}</td>
            <td class="px-5 py-4 text-ink/60 dark:text-porcelain/60">{{ entry.city }}</td>
            <td class="px-5 py-4 font-semibold tabular-nums text-ink dark:text-porcelain">{{ entry.score }}</td>
            <td class="px-5 py-4">{{ formatTime(entry.duration_seconds) }}</td>
            <td class="px-5 py-4">
              <div class="flex flex-col gap-1">
                <span class="text-sm font-semibold text-ink/75 dark:text-porcelain/75">
                  {{ formatMode(entry.mode) }}
                </span>
                <span class="text-xs text-ink/50 dark:text-porcelain/50">
                  {{ displayDate(entry) }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
