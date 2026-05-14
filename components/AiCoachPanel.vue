<script setup lang="ts">
import type { MahjongTile } from '~/utils/mahjong/types'
import {
  RuleBasedCoachProvider,
  type CoachSuggestion,
  type ProCoachAnalysis
} from '~/utils/mahjong/aiCoach'

const props = defineProps<{
  tiles: MahjongTile[]
  boardStateSignature: string
  legalPairsCount: number
  remainingTiles: number
  helperText?: string
  hideDescription?: boolean
  hideProPrompt?: boolean
  pro?: boolean
}>()

const emit = defineEmits<{
  showPair: [tileIds: string[]]
}>()

const provider = new RuleBasedCoachProvider()
const suggestion = ref<CoachSuggestion | null>(null)
const proAnalysis = ref<ProCoachAnalysis | null>(null)
const analyzing = ref(false)
const coachAnalysisCache = new Map<string, CoachSuggestion | ProCoachAnalysis>()

const riskClass = computed(() => {
  const riskLevel = props.pro ? proAnalysis.value?.riskLevel : suggestion.value?.riskLevel

  if (!riskLevel) {
    return 'border-ink/20 text-ink/60 dark:border-porcelain/20 dark:text-porcelain/60'
  }

  const classes = {
    low: 'border-jade/30 text-jade',
    medium: 'border-ember/30 text-ember',
    high: 'border-ember/50 text-ember'
  }

  return classes[riskLevel]
})

const boardOpenness = computed(() => {
  if (props.legalPairsCount <= 5) {
    return 'Low'
  }

  if (props.legalPairsCount <= 14) {
    return 'Medium'
  }

  return 'High'
})

const visibleRisk = computed(() => {
  if (proAnalysis.value) {
    return proAnalysis.value.riskLevel
  }

  return suggestion.value?.riskLevel || '—'
})

const formatPair = (pair?: [MahjongTile, MahjongTile] | null) => {
  if (!pair) {
    return 'No pair'
  }

  return `${pair[0].symbol} ${pair[1].symbol}`
}

const compactReason = (reason: string) => {
  const cleaned = reason.replace(/^(Strong|Good|Safe) option:\s*/, '')
  return cleaned.length > 92 ? `${cleaned.slice(0, 89).trim()}...` : cleaned
}

const coachCacheKey = () =>
  `${props.pro ? 'pro' : 'basic'}:${props.boardStateSignature}`

const runWhenResponsive = () =>
  new Promise<void>((resolve) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }

    window.requestAnimationFrame(() => resolve())
  })

const invalidateCoachCache = (_reason: string) => {
  suggestion.value = null
  proAnalysis.value = null
  coachAnalysisCache.clear()
}

const applyAnalysis = (analysis: CoachSuggestion | ProCoachAnalysis) => {
  if (props.pro) {
    const nextAnalysis = analysis as ProCoachAnalysis
    proAnalysis.value = nextAnalysis

    if (nextAnalysis.recommended?.pair) {
      emit('showPair', [
        nextAnalysis.recommended.pair[0].id,
        nextAnalysis.recommended.pair[1].id
      ])
    }

    return
  }

  const nextSuggestion = analysis as CoachSuggestion
  suggestion.value = nextSuggestion

  if (nextSuggestion.pair) {
    emit('showPair', [nextSuggestion.pair[0].id, nextSuggestion.pair[1].id])
  }
}

const analyzeBoard = async () => {
  if (analyzing.value) {
    return
  }

  const cacheKey = coachCacheKey()
  const cached = coachAnalysisCache.get(cacheKey)

  if (cached) {
    applyAnalysis(cached)
    return
  }

  analyzing.value = true

  try {
    await nextTick()
    await runWhenResponsive()

    const analysis = props.pro
      ? provider.analyzeBoard(props.tiles)
      : provider.suggestMove(props.tiles)

    coachAnalysisCache.set(cacheKey, analysis)
    applyAnalysis(analysis)
  } finally {
    analyzing.value = false
  }
}

watch(() => props.boardStateSignature, () => {
  invalidateCoachCache('board-state')
})

watch(() => props.pro, () => {
  invalidateCoachCache('coach-mode')
})

</script>

<template>
  <aside
    class="panel flex flex-col p-4"
    :class="props.pro ? 'gap-3 xl:min-h-[28rem]' : ''"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold">{{ props.pro ? 'AI Coach Pro' : 'AI Coach' }}</h2>
        <p
          v-if="!props.hideDescription"
          class="mt-1.5 text-xs leading-5 text-ink/60 dark:text-porcelain/60"
        >
          Move analysis for this board.
        </p>
      </div>
      <span
        v-if="suggestion || proAnalysis"
        class="rounded-md border px-2 py-1 text-xs font-semibold"
        :class="riskClass"
      >
        {{ props.pro ? visibleRisk : suggestion?.riskLevel }}
      </span>
    </div>

    <div class="grid grid-cols-2 text-sm" :class="props.pro ? 'gap-2' : 'mt-4 gap-2.5'">
      <div class="min-h-16 rounded-lg border border-ink/10 px-3 py-2.5 dark:border-porcelain/10">
        <p class="text-ink/50 dark:text-porcelain/50">Legal pairs</p>
        <p class="mt-1 text-lg font-semibold">{{ props.legalPairsCount }}</p>
      </div>
      <div class="min-h-16 rounded-lg border border-ink/10 px-3 py-2.5 dark:border-porcelain/10">
        <p class="text-ink/50 dark:text-porcelain/50">Tiles left</p>
        <p class="mt-1 text-lg font-semibold">{{ props.remainingTiles }}</p>
      </div>
      <template v-if="props.pro">
        <div class="min-h-16 rounded-lg border border-ink/10 px-3 py-2.5 dark:border-porcelain/10">
          <p class="text-ink/50 dark:text-porcelain/50">Board openness</p>
          <p class="mt-1 text-lg font-semibold">{{ proAnalysis?.boardOpenness || boardOpenness }}</p>
        </div>
        <div class="min-h-16 rounded-lg border border-ink/10 px-3 py-2.5 dark:border-porcelain/10">
          <p class="text-ink/50 dark:text-porcelain/50">Risk level</p>
          <p class="mt-1 text-lg font-semibold capitalize">{{ visibleRisk }}</p>
        </div>
      </template>
    </div>

    <div
      v-if="props.pro"
      class="flex min-h-[12rem] flex-col rounded-lg border border-ink/10 bg-mist p-3.5 shadow-sm shadow-ink/5 dark:border-porcelain/10 dark:bg-porcelain/10"
    >
      <div class="flex items-center justify-between gap-3">
        <p class="font-semibold">Recommended move</p>
        <span
          v-if="proAnalysis?.recommended"
          class="rounded-md bg-rice px-2 py-1 text-xs font-semibold text-jade dark:bg-porcelain/10"
        >
          {{ proAnalysis.recommended.quality }}
        </span>
      </div>

      <template v-if="proAnalysis?.recommended">
        <p class="mt-2 text-2xl font-semibold leading-none">
          {{ formatPair(proAnalysis.recommended.pair) }}
        </p>
        <p class="mt-3 text-xs font-semibold text-ink/55 dark:text-porcelain/55">
          Unlocks {{ proAnalysis.recommended.unlockedTiles }} tiles · After move {{ proAnalysis.recommended.futureLegalPairs }} pairs
        </p>
        <p class="mt-2 text-sm leading-5 text-ink/70 dark:text-porcelain/70">
          {{ proAnalysis.recommended.message }}
        </p>
      </template>
      <template v-else>
        <p class="mt-3 text-sm leading-5 text-ink/55 dark:text-porcelain/55">
          Analyze to see the best move.
        </p>
        <p class="mt-2 text-xs font-semibold text-ink/45 dark:text-porcelain/45">
          Unlocks and follow-up pairs will appear here.
        </p>
      </template>

      <div class="mt-3 border-t border-ink/10 pt-2.5 dark:border-porcelain/10">
        <p class="text-xs font-semibold text-ink/50 dark:text-porcelain/50">Secondary option</p>
        <template v-if="proAnalysis?.recommended">
          <p v-if="proAnalysis.secondary" class="mt-1 text-sm leading-5 text-ink/70 dark:text-porcelain/70">
            <span class="font-semibold text-ink dark:text-porcelain">{{ formatPair(proAnalysis.secondary.pair) }}</span>
            - {{ compactReason(proAnalysis.secondary.reason) }}
          </p>
          <p v-else class="mt-1 text-sm leading-5 text-ink/55 dark:text-porcelain/55">
            No secondary option is available.
          </p>
        </template>
        <p v-else class="mt-1 text-sm leading-5 text-ink/55 dark:text-porcelain/55">
          Secondary option appears after analysis.
        </p>
      </div>
    </div>

    <div v-else class="mt-4 rounded-lg bg-mist p-4 dark:bg-porcelain/10">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-1 opacity-0"
      >
        <div v-if="suggestion" :key="props.boardStateSignature">
          <p class="font-semibold">{{ suggestion.title }}</p>
          <p class="mt-2 text-sm leading-6 text-ink/70 dark:text-porcelain/70">
            {{ suggestion.message }}
          </p>
          <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt class="text-ink/50 dark:text-porcelain/50">Unlocks</dt>
              <dd class="mt-1 font-semibold">{{ suggestion.unlockedTiles }} tiles</dd>
            </div>
            <div>
              <dt class="text-ink/50 dark:text-porcelain/50">After move</dt>
              <dd class="mt-1 font-semibold">{{ suggestion.futureLegalPairs }} pairs</dd>
            </div>
          </dl>
        </div>
        <p v-else key="empty" class="text-sm leading-6 text-ink/70 dark:text-porcelain/70">
          {{ props.helperText || (props.pro ? 'Analyze the board to see Pro move review.' : 'Analyze the board before choosing a pair.') }}
        </p>
      </Transition>
    </div>

    <div class="flex flex-col gap-2" :class="props.pro ? 'mt-auto' : 'mt-4'">
      <button
        class="button-primary px-4 py-2.5 active:translate-y-px"
        :disabled="analyzing"
        type="button"
        @click="analyzeBoard"
      >
        {{ analyzing ? 'Analyzing...' : 'Analyze best move' }}
      </button>
    </div>

    <p
      v-if="!props.hideProPrompt"
      class="mt-4 border-t border-ink/10 pt-4 text-xs text-ink/50 dark:border-porcelain/10 dark:text-porcelain/50"
    >
      Pro adds deeper move review.
    </p>
  </aside>
</template>
