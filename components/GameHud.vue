<script setup lang="ts">
import { formatTime } from '~/utils/mahjong/scoring'

defineProps<{
  score: number
  elapsedSeconds: number
  movesCount: number
  remainingTiles: number
  legalMoves: number
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-5">
    <div class="soft-panel min-w-0 p-3 sm:p-4">
      <p class="text-xs font-semibold text-ink/50 dark:text-porcelain/50">
        Score
      </p>
      <p class="mt-2 text-xl font-semibold sm:text-2xl">{{ score }}</p>
    </div>
    <div class="soft-panel min-w-0 p-3 sm:p-4">
      <p class="text-xs font-semibold text-ink/50 dark:text-porcelain/50">
        Time
      </p>
      <p class="mt-2 text-xl font-semibold sm:text-2xl">{{ formatTime(elapsedSeconds) }}</p>
    </div>
    <div class="soft-panel min-w-0 p-3 sm:p-4">
      <p class="text-xs font-semibold text-ink/50 dark:text-porcelain/50">
        Moves
      </p>
      <p class="mt-2 text-xl font-semibold sm:text-2xl">{{ movesCount }}</p>
    </div>
    <div class="soft-panel min-w-0 p-3 sm:p-4">
      <p class="text-xs font-semibold text-ink/50 dark:text-porcelain/50">
        Tiles
      </p>
      <p class="mt-2 text-xl font-semibold sm:text-2xl">{{ remainingTiles }}</p>
    </div>
    <div class="soft-panel min-w-0 p-3 sm:col-span-2 sm:p-4 md:col-span-1">
      <p class="text-xs font-semibold text-ink/50 dark:text-porcelain/50">
        Legal
      </p>
      <p class="mt-2 text-xl font-semibold sm:text-2xl">{{ legalMoves }}</p>
    </div>
  </div>
</template>
