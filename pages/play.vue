<script setup lang="ts">
import {
  DEFAULT_LAYOUT_ID,
  MAHJONG_LAYOUTS,
  getMahjongLayout,
  isMahjongLayoutId,
  type MahjongLayoutId
} from '~/utils/mahjong/layouts'
import {
  DEFAULT_TILE_THEME_ID,
  TILE_THEMES,
  getTileTheme,
  isTileThemeId,
  type TileThemeId
} from '~/utils/mahjong/tileThemes'
import type { BoardDifficulty } from '~/utils/mahjong/types'

const difficulties: Array<{ value: BoardDifficulty, label: string, description: string }> = [
  { value: 'easy', label: 'Easy', description: 'More opening pairs' },
  { value: 'medium', label: 'Medium', description: 'Balanced board' },
  { value: 'hard', label: 'Hard', description: 'Fewer obvious pairs' }
]

const classicLayoutStorageKey = 'mahjong:classic-layout-id'
const tileThemeStorageKey = 'mahjong:tile-theme-id'
const selectedLayoutId = ref<MahjongLayoutId>(DEFAULT_LAYOUT_ID)
const selectedTileThemeId = ref<TileThemeId>(DEFAULT_TILE_THEME_ID)
const setupOpen = ref(false)
const game = useMahjongGame('classic-medium', {
  difficulty: 'medium',
  layoutId: selectedLayoutId.value,
  seedFactory: (difficulty) => `classic-${selectedLayoutId.value}-${difficulty}`
})
const { user, refreshUser } = useAuth()
const plan = useProfilePlan()
const gameResults = useGameResults()
const isAuthenticated = computed(() => Boolean(user.value))
const selectedLayout = computed(() => getMahjongLayout(selectedLayoutId.value))
const selectedTileTheme = computed(() => getTileTheme(selectedTileThemeId.value))
const layoutOptions = computed(() => MAHJONG_LAYOUTS)
const tileThemeOptions = computed(() => TILE_THEMES)
const canUseLayout = (layoutId: string) => {
  const layout = getMahjongLayout(layoutId)

  return !layout.isProOnly || plan.isPro.value
}
const canUseTileTheme = (themeId: string) => {
  const theme = getTileTheme(themeId)

  return !theme.isProOnly || plan.isPro.value
}
const gameHasStarted = computed(() =>
  !game.won.value &&
  (game.movesCount.value > 0 ||
    game.hintsUsed.value > 0 ||
    game.shufflesUsed.value > 0 ||
    game.undoCount.value > 0)
)

onMounted(async () => {
  if (!user.value) {
    await refreshUser()
  }

  await plan.fetchPlan()

  const storedLayoutId = localStorage.getItem(classicLayoutStorageKey)

  if (storedLayoutId && isMahjongLayoutId(storedLayoutId)) {
    if (!canUseLayout(storedLayoutId)) {
      localStorage.setItem(classicLayoutStorageKey, DEFAULT_LAYOUT_ID)
    } else {
      selectedLayoutId.value = storedLayoutId
      game.restart(undefined, storedLayoutId)
    }
  }

  const storedThemeId = localStorage.getItem(tileThemeStorageKey)

  if (!storedThemeId || !isTileThemeId(storedThemeId)) {
    return
  }

  if (!canUseTileTheme(storedThemeId)) {
    selectedTileThemeId.value = DEFAULT_TILE_THEME_ID
    localStorage.setItem(tileThemeStorageKey, DEFAULT_TILE_THEME_ID)
    return
  }

  selectedTileThemeId.value = storedThemeId
})

const saveClassicResult = async () => {
  await gameResults.saveGameResult({
    mode: 'classic',
    challenge_date: null,
    board_seed: game.boardSeed.value,
    score: game.score.value,
    duration_seconds: Math.max(1, game.elapsedSeconds.value),
    moves_count: game.movesCount.value,
    hints_used: game.hintsUsed.value,
    shuffles_used: game.shufflesUsed.value,
    undo_count: game.undoCount.value,
    completed_at: game.completedAt.value || new Date().toISOString()
  })
}

const restartGame = () => {
  game.restart()
  gameResults.resetSaveState()
}

const changeDifficulty = (difficulty: BoardDifficulty) => {
  if (game.difficulty.value === difficulty) {
    return
  }

  game.restart(difficulty)
  gameResults.resetSaveState()
}

const changeLayout = (layoutId: string, event?: Event) => {
  const resetSelect = () => {
    const target = event?.target as HTMLSelectElement | undefined

    if (target) {
      target.value = selectedLayoutId.value
    }
  }

  if (!isMahjongLayoutId(layoutId) || layoutId === selectedLayoutId.value) {
    resetSelect()
    return
  }

  if (!canUseLayout(layoutId)) {
    resetSelect()
    return
  }

  if (gameHasStarted.value && !window.confirm('Changing layout will restart the board.')) {
    resetSelect()
    return
  }

  selectedLayoutId.value = layoutId
  localStorage.setItem(classicLayoutStorageKey, layoutId)
  game.restart(undefined, layoutId)
  gameResults.resetSaveState()
}

const onLayoutSelect = (event: Event) => {
  const target = event.target as HTMLSelectElement

  changeLayout(target.value, event)
}

const changeTileTheme = (themeId: string, event?: Event) => {
  const resetSelect = () => {
    const target = event?.target as HTMLSelectElement | undefined

    if (target) {
      target.value = selectedTileThemeId.value
    }
  }

  if (!isTileThemeId(themeId) || themeId === selectedTileThemeId.value) {
    resetSelect()
    return
  }

  if (!canUseTileTheme(themeId)) {
    resetSelect()
    return
  }

  selectedTileThemeId.value = themeId
  localStorage.setItem(tileThemeStorageKey, themeId)
}

const onTileThemeSelect = (event: Event) => {
  const target = event.target as HTMLSelectElement

  changeTileTheme(target.value, event)
}
</script>

<template>
  <section class="page-shell">
    <div class="space-y-5">
      <div>
        <h1 class="page-title">Mahjong Solitaire</h1>
      </div>

      <div class="soft-panel min-w-0 p-3 sm:p-4">
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div class="min-w-0">
            <div class="inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-ink/10 bg-white/45 p-1 dark:border-porcelain/10 dark:bg-porcelain/5">
              <button
                v-for="difficulty in difficulties"
                :key="difficulty.value"
                class="focus-ring rounded-md px-3 py-2 text-left text-sm font-semibold transition"
                :class="game.difficulty.value === difficulty.value
                  ? 'bg-ink text-porcelain shadow-soft dark:bg-porcelain dark:text-ink'
                  : 'text-ink/65 hover:bg-white/70 dark:text-porcelain/65 dark:hover:bg-porcelain/10'"
                type="button"
                :title="difficulty.description"
                @click="changeDifficulty(difficulty.value)"
              >
                {{ difficulty.label }}
              </button>
            </div>
          </div>

          <div class="flex min-w-0 justify-start lg:justify-end">
            <GameActions
              :can-undo="game.canUndo.value"
              :hints-used="game.hintsUsed.value"
              :shuffles-used="game.shufflesUsed.value"
              :undo-count="game.undoCount.value"
              @hint="game.hint"
              @restart="restartGame"
              @shuffle="game.shuffleRemaining"
              @undo="game.undo"
            />
          </div>
        </div>

        <div class="mt-3 rounded-lg border border-ink/10 bg-white/45 px-3 py-3 dark:border-porcelain/10 dark:bg-porcelain/5">
          <button
            class="flex w-full items-center justify-between gap-3 text-left"
            type="button"
            @click="setupOpen = !setupOpen"
          >
            <span class="min-w-0">
              <span class="block text-sm font-semibold text-ink dark:text-porcelain">Board setup</span>
              <span class="block truncate text-xs text-ink/60 dark:text-porcelain/60">
                {{ selectedLayout.name }} layout · {{ selectedTileTheme.name }}
              </span>
            </span>
            <span class="shrink-0 rounded-md border border-ink/10 bg-rice/80 px-2 py-1 text-xs font-semibold text-ink/65 dark:border-porcelain/10 dark:bg-porcelain/10 dark:text-porcelain/65">
              {{ setupOpen ? 'Close' : 'Customize' }}
            </span>
          </button>

          <div
            v-if="setupOpen"
            class="mt-3 grid gap-3 border-t border-ink/10 pt-3 dark:border-porcelain/10 lg:grid-cols-[1fr_1fr]"
          >
            <label class="space-y-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50 dark:text-porcelain/50">
              <span>Tile theme</span>
              <select
                class="focus-ring w-full rounded-md border border-ink/10 bg-white/80 px-3 py-2 text-sm font-semibold normal-case tracking-normal text-ink shadow-soft dark:border-porcelain/10 dark:bg-porcelain/10 dark:text-porcelain"
                :value="selectedTileThemeId"
                @change="onTileThemeSelect"
              >
                <option
                  v-for="theme in tileThemeOptions"
                  :key="theme.id"
                  :disabled="!canUseTileTheme(theme.id)"
                  :value="theme.id"
                >
                  {{ theme.name }}{{ theme.isProOnly && !plan.isPro.value ? ' · Pro' : '' }}
                </option>
              </select>
              <span
                v-if="!plan.isPro.value"
                class="block text-xs font-medium normal-case tracking-normal text-ink/55 dark:text-porcelain/55"
              >
                Premium themes unlock with
                <NuxtLink class="font-semibold text-terracotta hover:underline" to="/pro">
                  Pro
                </NuxtLink>.
              </span>
            </label>

            <label class="space-y-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50 dark:text-porcelain/50">
              <span>Board layout</span>
              <select
                class="focus-ring w-full rounded-md border border-ink/10 bg-white/80 px-3 py-2 text-sm font-semibold normal-case tracking-normal text-ink shadow-soft dark:border-porcelain/10 dark:bg-porcelain/10 dark:text-porcelain"
                :value="selectedLayoutId"
                @change="onLayoutSelect"
              >
                <option
                  v-for="layout in layoutOptions"
                  :key="layout.id"
                  :disabled="!canUseLayout(layout.id)"
                  :value="layout.id"
                >
                  {{ layout.name }}{{ layout.isProOnly && !plan.isPro.value ? ' · Pro' : '' }}
                </option>
              </select>
              <span
                v-if="!plan.isPro.value"
                class="block text-xs font-medium normal-case tracking-normal text-ink/55 dark:text-porcelain/55"
              >
                Pro layouts unlock with
                <NuxtLink class="font-semibold text-terracotta hover:underline" to="/pro">
                  Pro
                </NuxtLink>.
              </span>
            </label>
          </div>
        </div>

        <FocusSessionControl
          class="mt-3"
          :pro="plan.isPro.value"
        />
      </div>

      <GameHud
        :elapsed-seconds="game.elapsedSeconds.value"
        :legal-moves="game.legalPairs.value.length"
        :moves-count="game.movesCount.value"
        :remaining-tiles="game.remainingTiles.value"
        :score="game.score.value"
      />

      <div class="soft-panel min-w-0 px-4 py-3 text-sm text-ink/75 dark:text-porcelain/75">
        {{ game.feedbackMessage.value }}
      </div>

      <div
        class="grid min-w-0 gap-4 xl:items-start"
        :class="plan.isPro.value ? 'xl:grid-cols-[minmax(0,1fr)_340px]' : 'xl:grid-cols-[minmax(0,1fr)_320px]'"
      >
        <div class="min-w-0">
          <MahjongBoard
            :coach-tile-ids="game.coachTileIds.value"
            :hint-tile-ids="game.hintTileIds.value"
            :is-tile-free="game.isTileFree"
            :selected-tile-id="game.selectedTileId.value"
            :tile-theme-id="selectedTileThemeId"
            :tiles="game.tiles.value"
            @select="game.selectTile"
          />
        </div>
        <div class="min-w-0 space-y-3 xl:self-start">
          <AiCoachPanel
            :board-state-signature="game.boardStateSignature.value"
            :hide-pro-prompt="plan.isPro.value"
            :legal-pairs-count="game.legalPairs.value.length"
            :pro="plan.isPro.value"
            :remaining-tiles="game.remainingTiles.value"
            :tiles="game.tiles.value"
            @show-pair="game.highlightTiles"
          />
          <UpgradeCard compact />
        </div>
      </div>

      <WinDialog
        :authenticated="isAuthenticated"
        :elapsed-seconds="game.elapsedSeconds.value"
        :hints-used="game.hintsUsed.value"
        :moves-count="game.movesCount.value"
        :open="game.won.value"
        :save-error="gameResults.error.value"
        :saved="gameResults.saved.value"
        :saving="gameResults.saving.value"
        :score="game.score.value"
        :shuffles-used="game.shufflesUsed.value"
        :undo-count="game.undoCount.value"
        @restart="restartGame"
        @save="saveClassicResult"
        />
    </div>
  </section>
</template>
