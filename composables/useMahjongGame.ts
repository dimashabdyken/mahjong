import { generateBoard, shuffleArray, symbolLabel, tileFamily } from '~/utils/mahjong/generateBoard'
import { DEFAULT_LAYOUT_ID } from '~/utils/mahjong/layouts'
import type { BoardDifficulty, MahjongTile, RemovedPair } from '~/utils/mahjong/types'
import { allTilesRemoved, canRemovePair, findLegalPairs, isTileFree, tilesMatch } from '~/utils/mahjong/rules'
import { calculateScore } from '~/utils/mahjong/scoring'
import { getHint } from '~/utils/mahjong/hints'

type MahjongGameOptions = {
  preserveSeedOnRestart?: boolean
  difficulty?: BoardDifficulty
  layoutId?: string
  seedFactory?: (difficulty: BoardDifficulty) => string
}

export const useMahjongGame = (
  seed = 'classic-focus',
  options: MahjongGameOptions = {}
) => {
  const difficulty = ref<BoardDifficulty>(options.difficulty || 'medium')
  const layoutId = ref(options.layoutId || DEFAULT_LAYOUT_ID)
  const getSeedForDifficulty = (targetDifficulty: BoardDifficulty) =>
    options.preserveSeedOnRestart
      ? seed
      : options.seedFactory?.(targetDifficulty) || seed
  const boardSeed = ref(getSeedForDifficulty(difficulty.value))
  const tiles = ref<MahjongTile[]>(generateBoard({
    seed: boardSeed.value,
    difficulty: difficulty.value,
    layoutId: layoutId.value
  }))
  const selectedTileId = ref<string | null>(null)
  const hintTileIds = ref<string[]>([])
  const coachTileIds = ref<string[]>([])
  const feedbackMessage = ref('Select two free matching tiles.')
  const startedAt = ref(Date.now())
  const elapsedSeconds = ref(0)
  const movesCount = ref(0)
  const hintsUsed = ref(0)
  const shufflesUsed = ref(0)
  const undoCount = ref(0)
  const moveHistory = ref<RemovedPair[]>([])
  const won = ref(false)
  const completedAt = ref<string | null>(null)
  const timerId = ref<ReturnType<typeof setInterval> | null>(null)
  const hintTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

  const score = computed(() =>
    calculateScore({
      movesCount: movesCount.value,
      hintsUsed: hintsUsed.value,
      shufflesUsed: shufflesUsed.value,
      undoCount: undoCount.value,
      elapsedSeconds: elapsedSeconds.value
    })
  )

  const remainingTiles = computed(() =>
    tiles.value.filter((tile) => !tile.removed).length
  )

  const boardStateSignature = computed(() =>
    [
      layoutId.value,
      boardSeed.value,
      movesCount.value,
      shufflesUsed.value,
      undoCount.value,
      tiles.value
        .map((tile) => `${tile.id}:${tile.group}:${tile.removed ? 1 : 0}`)
        .join('|')
    ].join('::')
  )
  const legalPairsCache = shallowRef<{
    signature: string
    pairs: Array<[MahjongTile, MahjongTile]>
  } | null>(null)
  const getCachedLegalPairs = () => {
    const signature = boardStateSignature.value

    if (legalPairsCache.value?.signature === signature) {
      return legalPairsCache.value.pairs
    }

    const pairs = findLegalPairs(tiles.value)
    legalPairsCache.value = { signature, pairs }

    return pairs
  }
  const invalidateCoachCache = (_reason: string) => {
    legalPairsCache.value = null
  }
  const legalPairs = computed(() => getCachedLegalPairs())
  const canUndo = computed(() => moveHistory.value.length > 0)
  const startTimer = () => {
    if (timerId.value) {
      return
    }

    timerId.value = setInterval(() => {
      if (!won.value) {
        elapsedSeconds.value = Math.floor((Date.now() - startedAt.value) / 1000)
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerId.value) {
      clearInterval(timerId.value)
      timerId.value = null
    }
  }

  const clearHintTimeout = () => {
    if (hintTimeoutId.value) {
      clearTimeout(hintTimeoutId.value)
      hintTimeoutId.value = null
    }
  }

  const clearHighlights = () => {
    clearHintTimeout()
    hintTileIds.value = []
    coachTileIds.value = []
  }

  const clearSelection = () => {
    selectedTileId.value = null
  }

  const setFeedback = (message: string) => {
    feedbackMessage.value = message
  }

  const removePair = (first: MahjongTile, second: MahjongTile) => {
    moveHistory.value.push({
      first: { ...first },
      second: { ...second }
    })

    tiles.value = tiles.value.map((tile) =>
      tile.id === first.id || tile.id === second.id
        ? { ...tile, removed: true }
        : tile
    )

    movesCount.value += 1
    invalidateCoachCache('move')
    clearHighlights()
    setFeedback('Nice match. Keep opening the board.')

    if (allTilesRemoved(tiles.value)) {
      won.value = true
      completedAt.value = new Date().toISOString()
      stopTimer()
      setFeedback('Board cleared.')
    }
  }

  const selectTile = (tile: MahjongTile) => {
    startTimer()

    if (tile.removed || won.value) {
      return
    }

    if (!isTileFree(tile, tiles.value)) {
      setFeedback('That tile is blocked. Free tiles need an open side and no tile above.')
      clearHighlights()
      return
    }

    if (selectedTileId.value === tile.id) {
      clearSelection()
      setFeedback('Tile deselected.')
      return
    }

    if (!selectedTileId.value) {
      selectedTileId.value = tile.id
      setFeedback('Choose a matching free tile.')
      return
    }

    const first = tiles.value.find((candidate) => candidate.id === selectedTileId.value)

    if (!first) {
      selectedTileId.value = tile.id
      return
    }

    if (canRemovePair(first, tile, tiles.value)) {
      removePair(first, tile)
      clearSelection()
      return
    }

    selectedTileId.value = tile.id
    clearHighlights()
    setFeedback('Those tiles cannot be removed together. Try a matching free pair.')
  }

  const restart = (nextDifficulty?: BoardDifficulty, nextLayoutId?: string) => {
    difficulty.value = nextDifficulty || difficulty.value
    layoutId.value = nextLayoutId || layoutId.value
    boardSeed.value = getSeedForDifficulty(difficulty.value)
    tiles.value = generateBoard({
      seed: boardSeed.value,
      difficulty: difficulty.value,
      layoutId: layoutId.value
    })
    invalidateCoachCache('restart')
    selectedTileId.value = null
    clearHighlights()
    feedbackMessage.value = 'Fresh board. Select two free matching tiles.'
    startedAt.value = Date.now()
    elapsedSeconds.value = 0
    movesCount.value = 0
    hintsUsed.value = 0
    shufflesUsed.value = 0
    undoCount.value = 0
    moveHistory.value = []
    won.value = false
    completedAt.value = null
    stopTimer()
  }

  const hint = () => {
    startTimer()
    const result = getHint(tiles.value, legalPairs.value)

    hintsUsed.value += 1
    clearHintTimeout()
    hintTileIds.value = result.pair
      ? [result.pair[0].id, result.pair[1].id]
      : []
    hintTimeoutId.value = setTimeout(() => {
      hintTileIds.value = []
      hintTimeoutId.value = null
    }, 2500)
    setFeedback(result.message)
  }

  const highlightTiles = (tileIds: string[]) => {
    clearHintTimeout()
    hintTileIds.value = []
    coachTileIds.value = tileIds
  }

  const shuffleRemaining = () => {
    startTimer()

    const remaining = tiles.value.filter((tile) => !tile.removed)
    const shuffledGroups = shuffleArray(
      remaining.map((tile) => tile.group),
      `shuffle-${Date.now()}-${shufflesUsed.value}`
    )

    let groupIndex = 0
    tiles.value = tiles.value.map((tile) => {
      if (tile.removed) {
        return tile
      }

      const group = shuffledGroups[groupIndex]
      groupIndex += 1

      return {
        ...tile,
        group,
        symbol: symbolLabel(group),
        family: tileFamily(group)
      }
    })

    const pairs = legalPairs.value

    if (!pairs.length) {
      forceOneLegalPair()
      invalidateCoachCache('forced-pair-after-shuffle')
    }

    shufflesUsed.value += 1
    invalidateCoachCache('shuffle')
    selectedTileId.value = null
    clearHighlights()
    setFeedback('Remaining tile symbols were shuffled.')
  }

  const forceOneLegalPair = () => {
    const freeTiles = tiles.value.filter((tile) => !tile.removed && isTileFree(tile, tiles.value))

    if (freeTiles.length < 2) {
      return
    }

    const remaining = tiles.value.filter((candidate) => !candidate.removed)
    const sourcePair = remaining.flatMap((first, firstIndex) =>
      remaining
        .slice(firstIndex + 1)
        .filter((second) => tilesMatch(first, second))
        .map((second) => [first, second] as [MahjongTile, MahjongTile])
    )[0]

    if (!sourcePair) {
      return
    }

    const firstFree = freeTiles[0]
    const secondFree = freeTiles[1]
    const sourceIncludesFirstFree = sourcePair.some((tile) => tile.id === firstFree.id)
    const sourceIncludesSecondFree = sourcePair.some((tile) => tile.id === secondFree.id)
    const swaps = new Map<string, string>()

    if (sourceIncludesFirstFree && sourceIncludesSecondFree) {
      return
    }

    if (sourceIncludesFirstFree) {
      const source = sourcePair.find((tile) => tile.id !== firstFree.id)

      if (!source) {
        return
      }

      swaps.set(secondFree.id, source.group)
      swaps.set(source.id, secondFree.group)
    } else if (sourceIncludesSecondFree) {
      const source = sourcePair.find((tile) => tile.id !== secondFree.id)

      if (!source) {
        return
      }

      swaps.set(firstFree.id, source.group)
      swaps.set(source.id, firstFree.group)
    } else {
      swaps.set(firstFree.id, sourcePair[0].group)
      swaps.set(secondFree.id, sourcePair[1].group)
      swaps.set(sourcePair[0].id, firstFree.group)
      swaps.set(sourcePair[1].id, secondFree.group)
    }

    tiles.value = tiles.value.map((tile) => {
      const nextGroup = swaps.get(tile.id)
      return nextGroup
        ? {
            ...tile,
            group: nextGroup,
            symbol: symbolLabel(nextGroup),
            family: tileFamily(nextGroup)
          }
        : tile
    })
  }

  const undo = () => {
    const lastMove = moveHistory.value.pop()

    if (!lastMove) {
      setFeedback('There is no move to undo.')
      return
    }

    tiles.value = tiles.value.map((tile) => {
      if (tile.id === lastMove.first.id) {
        return { ...lastMove.first, removed: false }
      }

      if (tile.id === lastMove.second.id) {
        return { ...lastMove.second, removed: false }
      }

      return tile
    })

    undoCount.value += 1
    movesCount.value = Math.max(0, movesCount.value - 1)
    invalidateCoachCache('undo')
    won.value = false
    completedAt.value = null
    selectedTileId.value = null
    clearHighlights()
    setFeedback('Last pair restored.')
    startTimer()
  }

  onMounted(startTimer)
  onBeforeUnmount(() => {
    stopTimer()
    clearHintTimeout()
  })

  return {
    tiles,
    boardSeed,
    difficulty,
    layoutId,
    selectedTileId,
    hintTileIds,
    coachTileIds,
    feedbackMessage,
    elapsedSeconds,
    movesCount,
    hintsUsed,
    shufflesUsed,
    undoCount,
    score,
    remainingTiles,
    boardStateSignature,
    legalPairs,
    getCachedLegalPairs,
    invalidateCoachCache,
    canUndo,
    won,
    completedAt,
    selectTile,
    restart,
    hint,
    highlightTiles,
    shuffleRemaining,
    undo,
    isTileFree: (tile: MahjongTile) => isTileFree(tile, tiles.value)
  }
}
