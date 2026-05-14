import type { MahjongTile } from './types'
import { tilesMatch } from './rules'

export type CoachRiskLevel = 'low' | 'medium' | 'high'
export type CoachBoardOpenness = 'Low' | 'Medium' | 'High'
export type CoachMoveQuality = 'Strong' | 'Good' | 'Safe'

export type MoveExplanation = {
  message: string
  riskLevel: CoachRiskLevel
  unlockedTiles: number
  futureLegalPairs: number
}

export type CoachSuggestion = MoveExplanation & {
  pair: [MahjongTile, MahjongTile] | null
  availableLegalPairs: number
  title: string
}

export type ProCoachMove = MoveExplanation & {
  pair: [MahjongTile, MahjongTile]
  title: string
  quality: CoachMoveQuality
  reason: string
}

export type ProCoachAnalysis = {
  legalPairs: number
  tilesLeft: number
  boardOpenness: CoachBoardOpenness
  riskLevel: CoachRiskLevel
  recommended: ProCoachMove | null
  secondary: ProCoachMove | null
}

export interface CoachProvider {
  suggestMove(board: MahjongTile[]): CoachSuggestion
  explainMove(
    board: MahjongTile[],
    pair: [MahjongTile, MahjongTile]
  ): MoveExplanation
}

type RankedPair = {
  pair: [MahjongTile, MahjongTile]
  unlockedTiles: number
  futureLegalPairs: number
  legalPairsBefore: number
  activeTilesCount: number
  layerScore: number
  edgeScore: number
  score: number
}

type BoardLookup = {
  activeTiles: MahjongTile[]
  activeIds: Set<string>
  tilesByPosition: Map<string, MahjongTile[]>
  rowXs: Map<string, Set<number>>
}

const positionKey = (tile: MahjongTile) =>
  `${tile.position.x}:${tile.position.y}`

const rowKey = (tile: MahjongTile) =>
  `${tile.position.y}:${tile.position.z}`

const createLookup = (
  board: MahjongTile[],
  removedIds: ReadonlySet<string> = new Set()
): BoardLookup => {
  const activeTiles = board.filter(
    (tile) => !tile.removed && !removedIds.has(tile.id)
  )
  const tilesByPosition = new Map<string, MahjongTile[]>()
  const rowXs = new Map<string, Set<number>>()

  for (const tile of activeTiles) {
    const positionTiles = tilesByPosition.get(positionKey(tile)) || []
    positionTiles.push(tile)
    tilesByPosition.set(positionKey(tile), positionTiles)

    const xs = rowXs.get(rowKey(tile)) || new Set<number>()
    xs.add(tile.position.x)
    rowXs.set(rowKey(tile), xs)
  }

  return {
    activeTiles,
    activeIds: new Set(activeTiles.map((tile) => tile.id)),
    tilesByPosition,
    rowXs
  }
}

const isTileFreeInLookup = (tile: MahjongTile, lookup: BoardLookup) => {
  const stackedTiles = lookup.tilesByPosition.get(positionKey(tile)) || []
  const hasTileAbove = stackedTiles.some(
    (candidate) => candidate.id !== tile.id && candidate.position.z > tile.position.z
  )

  if (hasTileAbove) {
    return false
  }

  const xs = lookup.rowXs.get(rowKey(tile))
  if (!xs) {
    return false
  }

  return !xs.has(tile.position.x - 1) || !xs.has(tile.position.x + 1)
}

const findLegalPairsInLookup = (lookup: BoardLookup) => {
  const freeTiles = lookup.activeTiles.filter((tile) =>
    isTileFreeInLookup(tile, lookup)
  )
  const pairs: Array<[MahjongTile, MahjongTile]> = []

  for (let outer = 0; outer < freeTiles.length; outer += 1) {
    for (let inner = outer + 1; inner < freeTiles.length; inner += 1) {
      if (tilesMatch(freeTiles[outer], freeTiles[inner])) {
        pairs.push([freeTiles[outer], freeTiles[inner]])
      }
    }
  }

  return pairs
}

const activeBlockedTiles = (lookup: BoardLookup) =>
  lookup.activeTiles.filter((tile) => !isTileFreeInLookup(tile, lookup))

const countUnlockedTiles = (
  blockedBefore: MahjongTile[],
  simulatedLookup: BoardLookup
) => {
  return blockedBefore.filter((tile) => {
    if (!simulatedLookup.activeIds.has(tile.id)) {
      return false
    }

    return isTileFreeInLookup(tile, simulatedLookup)
  }).length
}

const edgeScore = (tile: MahjongTile, lookup: BoardLookup) => {
  const xs = lookup.rowXs.get(rowKey(tile))

  if (!xs?.size) {
    return 0
  }

  const rowPositions = [...xs]

  return tile.position.x === Math.min(...rowPositions) ||
    tile.position.x === Math.max(...rowPositions)
    ? 1
    : 0
}

const rankPair = (
  board: MahjongTile[],
  pair: [MahjongTile, MahjongTile],
  lookup = createLookup(board),
  blockedBefore = activeBlockedTiles(lookup),
  legalPairsBefore = findLegalPairsInLookup(lookup).length
): RankedPair => {
  const removedIds = new Set([pair[0].id, pair[1].id])
  const simulatedLookup = createLookup(board, removedIds)
  const unlockedTiles = countUnlockedTiles(blockedBefore, simulatedLookup)
  const futureLegalPairs = findLegalPairsInLookup(simulatedLookup).length
  const layerScore = pair[0].position.z + pair[1].position.z
  const pairEdgeScore = edgeScore(pair[0], lookup) + edgeScore(pair[1], lookup)

  return {
    pair,
    unlockedTiles,
    futureLegalPairs,
    legalPairsBefore,
    activeTilesCount: lookup.activeTiles.length,
    layerScore,
    edgeScore: pairEdgeScore,
    score: unlockedTiles * 12 + futureLegalPairs * 3 + layerScore * 2 + pairEdgeScore
  }
}

const riskForMove = (ranked: RankedPair): CoachRiskLevel => {
  if (ranked.unlockedTiles >= 2 || ranked.futureLegalPairs >= 3) {
    return 'low'
  }

  if (ranked.unlockedTiles === 1 || ranked.layerScore > 0) {
    return 'medium'
  }

  return 'high'
}

const proRiskForMove = (ranked: RankedPair): CoachRiskLevel => {
  if (ranked.futureLegalPairs <= 4) {
    return 'high'
  }

  if (ranked.futureLegalPairs <= 10) {
    return 'medium'
  }

  return 'low'
}

const boardOpennessForPairs = (legalPairs: number): CoachBoardOpenness => {
  if (legalPairs <= 5) {
    return 'Low'
  }

  if (legalPairs <= 14) {
    return 'Medium'
  }

  return 'High'
}

const moveQualityForRank = (ranked: RankedPair): CoachMoveQuality => {
  if (
    ranked.unlockedTiles >= 4 ||
    ranked.futureLegalPairs >= ranked.legalPairsBefore
  ) {
    return 'Strong'
  }

  if (ranked.unlockedTiles >= 2) {
    return 'Good'
  }

  return 'Safe'
}

const stableIndex = (ranked: RankedPair, variants: string[]) => {
  const seed = ranked.pair
    .map((tile) => tile.id)
    .join('')
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0)

  return seed % variants.length
}

const pickMessage = (ranked: RankedPair, variants: string[]) =>
  variants[stableIndex(ranked, variants)]

const strongUnlockMessages = [
  'Strong tempo move: it unlocks tiles while preserving future matches.',
  'Good move: this pair clears space and opens new follow-up options.',
  'This move opens the structure and gives you more legal pairs afterward.',
  'This is a good clearing move because it opens access around the center.'
]

const openingMessages = [
  'This pair is useful because it frees nearby blocked tiles.',
  'Useful in this position: it reduces blockage and improves mobility.',
  'Solid pair: it removes pressure from a crowded area.',
  'This pair helps keep the board open instead of creating a dead end.'
]

const optionMessages = [
  'A flexible choice. It improves your next set of legal pairs.',
  'This pair keeps future options open and avoids narrowing the board too soon.',
  'Good planning move: it leaves more follow-up choices than you have now.',
  'This move improves mobility, which matters more than clearing any one edge.'
]

const layerMessages = [
  'Prefer this upper-layer pair because it reduces pressure on the tiles below.',
  'This pair removes a blocker from the stack and makes the board easier to read.',
  'A useful vertical move: it clears height before the lower rows get crowded.',
  'This choice lowers the structure without closing off nearby matches.'
]

const edgeMessages = [
  'Good edge cleanup: it removes an exposed pair without disturbing the center.',
  'This pair is not flashy, but it helps simplify the board.',
  'A safe clearing move. It trims the outside and keeps the middle flexible.',
  'This move removes an isolated pair and keeps the board tidy.'
]

const lateGameMessages = [
  'Late-board choice: take the safe pair and keep the remaining matches flexible.',
  'At this stage, this pair is a careful move that avoids closing the board.',
  'Good late move. It keeps options alive while reducing the tile count.',
  'This pair is steady in the endgame because it does not create a dead end.'
]

const safeMessages = [
  'A safe choice. It does not risk the board and keeps your next moves flexible.',
  'This pair is modest, but it keeps the position stable.',
  'Simple and clean: it removes a pair without making the board tighter.',
  'This is a low-drama move that preserves room for the next match.'
]

const noMoveMessages = [
  'No legal pairs are available. Use shuffle to continue.',
  'The board has no open matching pairs right now. Shuffle is the way forward.',
  'No strong move exists from this position because there are no legal pairs available.'
]

const messageForNoMove = (board: MahjongTile[]) => {
  const seed = board
    .filter((tile) => !tile.removed)
    .map((tile) => tile.id)
    .join('')
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0)

  return noMoveMessages[seed % noMoveMessages.length]
}

const messageForMove = (ranked: RankedPair) => {
  if (ranked.unlockedTiles >= 4) {
    return pickMessage(ranked, strongUnlockMessages)
  }

  if (ranked.unlockedTiles >= 2) {
    return pickMessage(ranked, openingMessages)
  }

  if (ranked.futureLegalPairs > ranked.legalPairsBefore) {
    return pickMessage(ranked, optionMessages)
  }

  if (ranked.activeTilesCount <= 40) {
    return pickMessage(ranked, lateGameMessages)
  }

  if (ranked.layerScore > 0) {
    return pickMessage(ranked, layerMessages)
  }

  if (ranked.edgeScore > 0 && ranked.futureLegalPairs > 0) {
    return pickMessage(ranked, edgeMessages)
  }

  return pickMessage(ranked, safeMessages)
}

const proMoveForRank = (ranked: RankedPair): ProCoachMove => {
  const riskLevel = proRiskForMove(ranked)
  const quality = moveQualityForRank(ranked)
  const message = messageForMove(ranked)

  return {
    pair: ranked.pair,
    title: `${ranked.pair[0].symbol} pair`,
    message,
    reason: `${quality} option: ${message}`,
    riskLevel,
    unlockedTiles: ranked.unlockedTiles,
    futureLegalPairs: ranked.futureLegalPairs,
    quality
  }
}

export class RuleBasedCoachProvider implements CoachProvider {
  analyzeBoard(board: MahjongTile[]): ProCoachAnalysis {
    const lookup = createLookup(board)
    const legalPairs = findLegalPairsInLookup(lookup)

    if (!legalPairs.length) {
      return {
        legalPairs: 0,
        tilesLeft: lookup.activeTiles.length,
        boardOpenness: 'Low',
        riskLevel: 'high',
        recommended: null,
        secondary: null
      }
    }

    const blockedBefore = activeBlockedTiles(lookup)
    const ranked = legalPairs
      .map((pair) => rankPair(board, pair, lookup, blockedBefore, legalPairs.length))
      .sort((first, second) => second.score - first.score)
    const recommended = proMoveForRank(ranked[0])

    return {
      legalPairs: legalPairs.length,
      tilesLeft: lookup.activeTiles.length,
      boardOpenness: boardOpennessForPairs(legalPairs.length),
      riskLevel: recommended.riskLevel,
      recommended,
      secondary: ranked[1] ? proMoveForRank(ranked[1]) : null
    }
  }

  suggestMove(board: MahjongTile[]): CoachSuggestion {
    const lookup = createLookup(board)
    const legalPairs = findLegalPairsInLookup(lookup)

    if (!legalPairs.length) {
      return {
        pair: null,
        availableLegalPairs: 0,
        title: 'No move available',
        message: messageForNoMove(board),
        riskLevel: 'high',
        unlockedTiles: 0,
        futureLegalPairs: 0
      }
    }

    const blockedBefore = activeBlockedTiles(lookup)
    const ranked = legalPairs
      .map((pair) => rankPair(board, pair, lookup, blockedBefore, legalPairs.length))
      .sort((first, second) => second.score - first.score)[0]

    return {
      message: messageForMove(ranked),
      riskLevel: riskForMove(ranked),
      unlockedTiles: ranked.unlockedTiles,
      futureLegalPairs: ranked.futureLegalPairs,
      pair: ranked.pair,
      availableLegalPairs: legalPairs.length,
      title: `${ranked.pair[0].symbol} pair`
    }
  }

  explainMove(
    board: MahjongTile[],
    pair: [MahjongTile, MahjongTile]
  ): MoveExplanation {
    const lookup = createLookup(board)
    const ranked = rankPair(board, pair, lookup, activeBlockedTiles(lookup))

    return {
      message: messageForMove(ranked),
      riskLevel: riskForMove(ranked),
      unlockedTiles: ranked.unlockedTiles,
      futureLegalPairs: ranked.futureLegalPairs
    }
  }
}
