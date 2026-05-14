<script setup lang="ts">
import { formatTime } from '~/utils/mahjong/scoring'

const daily = useDailyChallenge()
const { user, refreshUser } = useAuth()
const isAuthenticated = computed(() => Boolean(user.value))

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric'
  }).format(new Date(`${daily.challengeDate.value}T00:00:00`))
)

const attemptStatus = computed(() => {
  if (daily.checkingSubmission.value) {
    return 'Checking status'
  }

  if (daily.submittedResult.value) {
    return 'Already submitted'
  }

  if (daily.isPracticeReplay.value) {
    return 'Practice replay'
  }

  return 'Official attempt'
})

const saveError = computed(() =>
  daily.gameResults.error.value || daily.submissionError.value
)

const saveDisabledReason = computed(() => {
  if (daily.submittedResult.value) {
    return 'You already submitted today. This replay is practice only.'
  }

  return ''
})

const submittedSummary = computed(() => {
  if (!daily.submittedResult.value) {
    return ''
  }

  const result = daily.submittedResult.value

  return `${result.score} pts · ${formatTime(result.duration_seconds)} · ${result.moves_count} moves`
})

const scoreBreakdown = computed(() => [
  {
    label: 'Clear bonus',
    value: `+${daily.sprintScore.value.clearBonus}`,
    tone: 'bonus' as const
  },
  {
    label: 'Speed bonus',
    value: `+${daily.sprintScore.value.speedBonus}`,
    tone: 'bonus' as const
  },
  {
    label: 'Move efficiency',
    value: `+${daily.sprintScore.value.moveEfficiencyBonus}`,
    tone: 'bonus' as const
  },
  {
    label: 'Hint penalty',
    value: daily.sprintScore.value.hintPenalty
      ? `-${daily.sprintScore.value.hintPenalty}`
      : '0',
    tone: daily.sprintScore.value.hintPenalty ? 'penalty' as const : 'neutral' as const
  },
  {
    label: 'Shuffle penalty',
    value: daily.sprintScore.value.shufflePenalty
      ? `-${daily.sprintScore.value.shufflePenalty}`
      : '0',
    tone: daily.sprintScore.value.shufflePenalty ? 'penalty' as const : 'neutral' as const
  }
])

onMounted(async () => {
  if (!user.value) {
    await refreshUser()
  }

  await daily.checkTodaySubmission()
})
</script>

<template>
  <section class="page-shell">
    <div class="space-y-5">
      <div class="soft-panel min-w-0 p-3 sm:p-4">
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2 text-sm">
              <span class="rounded-md border border-ink/10 bg-porcelain px-2.5 py-1 font-semibold text-ink dark:border-porcelain/10 dark:bg-porcelain dark:text-ink">
                Today · {{ formattedDate }}
              </span>
              <span
                class="rounded-md border px-2.5 py-1 font-semibold"
                :class="daily.submittedResult.value
                  ? 'border-jade/25 text-jade'
                  : 'border-terracotta/25 text-terracotta'"
              >
                {{ attemptStatus }}
              </span>
            </div>

            <h1 class="mt-3 text-2xl font-semibold tracking-tight text-ink dark:text-porcelain">
              Daily Challenge
            </h1>
            <p class="mt-1 max-w-2xl text-sm leading-6 text-ink/65 dark:text-porcelain/65">
              Same board for everyone today. Clear fast, keep moves tight, and save your official result for the daily ranking.
            </p>

            <div
              v-if="submittedSummary"
              class="mt-3 inline-flex max-w-full items-center rounded-lg border border-jade/20 bg-jade/10 px-3 py-2 text-sm font-semibold text-jade"
            >
              Submitted: {{ submittedSummary }}
            </div>
          </div>

          <div class="flex min-w-0 flex-col gap-3 xl:items-end">
            <NuxtLink
              class="button-secondary px-4 py-2.5 text-center"
              to="/leaderboards"
            >
              View Daily Ranking
            </NuxtLink>
            <GameActions
              :can-undo="daily.game.canUndo.value"
              :hints-used="daily.game.hintsUsed.value"
              :shuffles-used="daily.game.shufflesUsed.value"
              :undo-count="daily.game.undoCount.value"
              @hint="daily.game.hint"
              @restart="daily.restartDaily"
              @shuffle="daily.game.shuffleRemaining"
              @undo="daily.game.undo"
            />
          </div>
        </div>

        <div class="mt-4 grid gap-2 border-t border-ink/10 pt-3 text-xs font-semibold text-ink/55 dark:border-porcelain/10 dark:text-porcelain/55 sm:grid-cols-3">
          <div class="rounded-md bg-white/45 px-3 py-2 dark:bg-porcelain/5">
            Faster clears rank better.
          </div>
          <div class="rounded-md bg-white/45 px-3 py-2 dark:bg-porcelain/5">
            Fewer moves help score.
          </div>
          <div class="rounded-md bg-white/45 px-3 py-2 dark:bg-porcelain/5">
            Hint -150 · Shuffle -350.
          </div>
        </div>
      </div>

      <GameHud
        :elapsed-seconds="daily.game.elapsedSeconds.value"
        :legal-moves="daily.game.legalPairs.value.length"
        :moves-count="daily.game.movesCount.value"
        :remaining-tiles="daily.game.remainingTiles.value"
        :score="daily.sprintScore.value.total"
      />

      <div class="soft-panel min-w-0 px-4 py-3 text-sm text-ink/75 dark:text-porcelain/75">
        {{ daily.game.feedbackMessage.value }}
      </div>

      <div class="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div class="min-w-0">
          <MahjongBoard
            :coach-tile-ids="daily.game.coachTileIds.value"
            :hint-tile-ids="daily.game.hintTileIds.value"
            :is-tile-free="daily.game.isTileFree"
            :selected-tile-id="daily.game.selectedTileId.value"
            :tiles="daily.game.tiles.value"
            @select="daily.game.selectTile"
          />
        </div>
        <div class="min-w-0 space-y-3 xl:self-start">
          <AiCoachPanel
            :board-state-signature="daily.game.boardStateSignature.value"
            helper-text="Analyze before choosing a pair."
            hide-description
            hide-pro-prompt
            :legal-pairs-count="daily.game.legalPairs.value.length"
            :remaining-tiles="daily.game.remainingTiles.value"
            :tiles="daily.game.tiles.value"
            @show-pair="daily.game.highlightTiles"
          />
        </div>
      </div>

      <WinDialog
        :authenticated="isAuthenticated"
        authenticated-message="Save today's official Daily Challenge result."
        :elapsed-seconds="daily.game.elapsedSeconds.value"
        :hints-used="daily.game.hintsUsed.value"
        :moves-count="daily.game.movesCount.value"
        :open="daily.game.won.value"
        :save-disabled="Boolean(daily.submittedResult.value)"
        :save-disabled-reason="saveDisabledReason"
        :save-error="saveError"
        save-label="Save daily result"
        saved-message="Daily result saved successfully."
        :saved="daily.gameResults.saved.value"
        :saving="daily.gameResults.saving.value"
        :score="daily.sprintScore.value.total"
        :score-breakdown="scoreBreakdown"
        :shuffles-used="daily.game.shufflesUsed.value"
        :unauthenticated-message="'Log in to save your Daily Challenge result.'"
        :undo-count="daily.game.undoCount.value"
        @restart="daily.restartDaily"
        @save="daily.saveDailyResult"
      />
    </div>
  </section>
</template>
