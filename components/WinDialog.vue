<script setup lang="ts">
import { formatTime } from '~/utils/mahjong/scoring'

defineProps<{
  open: boolean
  score: number
  elapsedSeconds: number
  movesCount: number
  hintsUsed: number
  shufflesUsed: number
  undoCount: number
  authenticated: boolean
  saving: boolean
  saved: boolean
  saveError: string
  saveLabel?: string
  savedMessage?: string
  authenticatedMessage?: string
  unauthenticatedMessage?: string
  saveDisabled?: boolean
  saveDisabledReason?: string
  scoreBreakdown?: {
    label: string
    value: string | number
    tone?: 'bonus' | 'penalty' | 'neutral'
  }[]
}>()

const emit = defineEmits<{
  restart: []
  save: []
}>()
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 px-3 py-4 backdrop-blur-sm sm:px-4"
  >
    <div class="max-h-full w-full max-w-lg overflow-y-auto rounded-lg bg-porcelain p-5 text-ink shadow-soft sm:p-6">
      <p class="text-sm font-semibold text-jade">Board cleared</p>
      <h2 class="mt-3 text-2xl font-semibold sm:text-3xl">Focus session complete</h2>
      <div class="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
        <div class="rounded-lg bg-mist p-4">
          <p class="text-xs font-semibold text-ink/50">Score</p>
          <p class="mt-2 text-2xl font-semibold">{{ score }}</p>
        </div>
        <div class="rounded-lg bg-mist p-4">
          <p class="text-xs font-semibold text-ink/50">Time</p>
          <p class="mt-2 text-2xl font-semibold">{{ formatTime(elapsedSeconds) }}</p>
        </div>
        <div class="rounded-lg bg-mist p-4">
          <p class="text-xs font-semibold text-ink/50">Moves</p>
          <p class="mt-2 text-2xl font-semibold">{{ movesCount }}</p>
        </div>
        <div class="rounded-lg bg-mist p-4">
          <p class="text-xs font-semibold text-ink/50">Hints</p>
          <p class="mt-2 text-2xl font-semibold">{{ hintsUsed }}</p>
        </div>
        <div class="rounded-lg bg-mist p-4">
          <p class="text-xs font-semibold text-ink/50">Shuffles</p>
          <p class="mt-2 text-2xl font-semibold">{{ shufflesUsed }}</p>
        </div>
        <div class="rounded-lg bg-mist p-4">
          <p class="text-xs font-semibold text-ink/50">Undos</p>
          <p class="mt-2 text-2xl font-semibold">{{ undoCount }}</p>
        </div>
      </div>

      <div
        v-if="scoreBreakdown?.length"
        class="mt-4 rounded-lg border border-ink/10 bg-mist p-4"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
          Score breakdown
        </p>
        <dl class="mt-3 grid gap-2 text-sm">
          <div
            v-for="item in scoreBreakdown"
            :key="item.label"
            class="flex items-center justify-between gap-3"
          >
            <dt class="text-ink/60">{{ item.label }}</dt>
            <dd
              class="font-semibold tabular-nums"
              :class="{
                'text-jade': item.tone === 'bonus',
                'text-ember': item.tone === 'penalty',
                'text-ink': !item.tone || item.tone === 'neutral'
              }"
            >
              {{ item.value }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="mt-6 rounded-lg bg-mist p-4">
        <template v-if="authenticated">
          <p v-if="saved" class="text-sm font-semibold text-jade">
            {{ savedMessage || 'Result saved successfully.' }}
          </p>
          <p v-else-if="saveDisabled && saveDisabledReason" class="text-sm font-semibold text-ink/70">
            {{ saveDisabledReason }}
          </p>
          <p v-else-if="saveError" class="text-sm font-semibold text-ember">
            Save failed: {{ saveError }}
          </p>
          <p v-else class="text-sm text-ink/60">
            {{ authenticatedMessage || 'Save this completed classic game to your Supabase profile.' }}
          </p>
        </template>
        <template v-else>
          <p class="text-sm text-ink/60">
            {{ unauthenticatedMessage || 'Log in to save your score and appear on leaderboards.' }}
          </p>
          <NuxtLink
            class="button-secondary mt-3 px-4 py-2"
            to="/login"
          >
            Login to save
          </NuxtLink>
        </template>
      </div>

      <button
        v-if="authenticated"
        class="button-primary mt-4 w-full"
        :disabled="saving || saved || saveDisabled"
        type="button"
        @click="emit('save')"
      >
        {{ saved ? 'Saved' : saving ? 'Saving...' : saveLabel || 'Save result' }}
      </button>

      <button
        class="button-secondary mt-3 w-full"
        type="button"
        @click="emit('restart')"
      >
        Play another board
      </button>
    </div>
  </div>
</template>
