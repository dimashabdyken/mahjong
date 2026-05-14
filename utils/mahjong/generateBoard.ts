import { DEFAULT_LAYOUT_ID, getMahjongLayout } from './layouts'
import { findLegalPairs, isTileFree } from './rules'
import type { BoardDifficulty, LayoutPosition, MahjongTile } from './types'

type TileDefinition = {
  group: string
  family: string
  symbol: string
  copies: number
}

const numberSymbols = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

export const TILE_DEFINITIONS: TileDefinition[] = [
  ...numberSymbols.map((symbol, index) => ({
    group: `bamboo-${index + 1}`,
    family: 'bamboo',
    symbol,
    copies: 4
  })),
  ...numberSymbols.map((symbol, index) => ({
    group: `character-${index + 1}`,
    family: 'character',
    symbol,
    copies: 4
  })),
  ...numberSymbols.map((symbol, index) => ({
    group: `dot-${index + 1}`,
    family: 'dot',
    symbol,
    copies: 4
  })),
  { group: 'wind-east', family: 'wind', symbol: '東', copies: 4 },
  { group: 'wind-south', family: 'wind', symbol: '南', copies: 4 },
  { group: 'wind-west', family: 'wind', symbol: '西', copies: 4 },
  { group: 'wind-north', family: 'wind', symbol: '北', copies: 4 },
  { group: 'dragon-red', family: 'dragon', symbol: '中', copies: 4 },
  { group: 'dragon-green', family: 'dragon', symbol: '發', copies: 4 },
  { group: 'dragon-white', family: 'dragon', symbol: '白', copies: 4 },
  { group: 'flower-plum', family: 'flower', symbol: '梅', copies: 1 },
  { group: 'flower-orchid', family: 'flower', symbol: '蘭', copies: 1 },
  { group: 'flower-chrysanthemum', family: 'flower', symbol: '菊', copies: 1 },
  { group: 'flower-bamboo', family: 'flower', symbol: '竹', copies: 1 },
  { group: 'season-spring', family: 'season', symbol: '春', copies: 1 },
  { group: 'season-summer', family: 'season', symbol: '夏', copies: 1 },
  { group: 'season-autumn', family: 'season', symbol: '秋', copies: 1 },
  { group: 'season-winter', family: 'season', symbol: '冬', copies: 1 }
]

const TILE_LOOKUP = new Map(TILE_DEFINITIONS.map((definition) => [definition.group, definition]))

const createCanonicalTileGroups = () =>
  TILE_DEFINITIONS.flatMap((definition) =>
    Array.from({ length: definition.copies }, () => definition.group)
  )

export const CANONICAL_TILE_COUNT = createCanonicalTileGroups().length

export const symbolLabel = (group: string) => TILE_LOOKUP.get(group)?.symbol || group

export const tileFamily = (group: string) => TILE_LOOKUP.get(group)?.family || 'unknown'

const hashSeed = (seed: string) => {
  let hash = 2166136261

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

export const createSeededRandom = (seed: string) => {
  let value = hashSeed(seed)

  return () => {
    value += 0x6d2b79f5
    let next = value
    next = Math.imul(next ^ (next >>> 15), next | 1)
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61)
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

export const shuffleArray = <T>(items: T[], seed: string) => {
  const random = createSeededRandom(seed)
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = current
  }

  return copy
}

const DIFFICULTY_TARGETS: Record<BoardDifficulty, { min: number, max: number }> = {
  easy: { min: 18, max: 25 },
  medium: { min: 10, max: 18 },
  hard: { min: 5, max: 12 }
}

const DIFFICULTY_PAIR_GROUPS: Record<BoardDifficulty, { fourOfAKind: number, pairs: number }> = {
  easy: { fourOfAKind: 4, pairs: 0 },
  medium: { fourOfAKind: 2, pairs: 1 },
  hard: { fourOfAKind: 0, pairs: 5 }
}

const sortLayout = (positions: LayoutPosition[]) => [...positions].sort((a, b) => {
  if (b.z !== a.z) {
    return b.z - a.z
  }

  if (a.y !== b.y) {
    return a.y - b.y
  }

  return a.x - b.x
})

type GenerateBoardOptions = {
  seed: string
  difficulty?: BoardDifficulty
  layoutId?: string
}

type CandidateBoard = {
  tiles: MahjongTile[]
  openingPairs: number
  distanceFromTarget: number
}

const normalizeOptions = (input: string | GenerateBoardOptions = 'classic-focus'): Required<GenerateBoardOptions> => {
  if (typeof input === 'string') {
    return { seed: input, difficulty: 'medium', layoutId: DEFAULT_LAYOUT_ID }
  }

  return {
    seed: input.seed,
    difficulty: input.difficulty || 'medium',
    layoutId: input.layoutId || DEFAULT_LAYOUT_ID
  }
}

const pullGroup = (groups: string[], group: string) => {
  const index = groups.indexOf(group)

  if (index === -1) {
    return null
  }

  return groups.splice(index, 1)[0]
}

const pullMany = (groups: string[], group: string, count: number) =>
  Array.from({ length: count }, () => pullGroup(groups, group))
    .filter((pulled): pulled is string => Boolean(pulled))

const createTile = (position: LayoutPosition, group: string): MahjongTile => ({
  id: position.id,
  symbol: symbolLabel(group),
  group,
  family: tileFamily(group),
  position: { x: position.x, y: position.y, z: position.z },
  removed: false
})

const createBoard = (positions: LayoutPosition[], groups: string[]) =>
  positions.map((position, index) => createTile(position, groups[index] as string))

const createGeometryBoard = (positions: LayoutPosition[]) =>
  positions.map((position) => createTile(position, 'geometry-placeholder'))

const getOpeningIndexes = (positions: LayoutPosition[]) => {
  const geometryBoard = createGeometryBoard(positions)

  return geometryBoard
    .map((tile, index) => ({ index, tile }))
    .filter(({ tile }) => isTileFree(tile, geometryBoard))
    .map(({ index }) => index)
}

const matchingPairCount = (tiles: MahjongTile[]) => findLegalPairs(tiles).length

const targetDistance = (count: number, difficulty: BoardDifficulty) => {
  const target = DIFFICULTY_TARGETS[difficulty]

  if (count >= target.min && count <= target.max) {
    return 0
  }

  const midpoint = (target.min + target.max) / 2
  return Math.abs(count - midpoint)
}

const selectGroupsForDifficulty = (
  groups: string[],
  difficulty: BoardDifficulty,
  seed: string
) => {
  const selectedGroups: string[] = []
  const normalGroups = shuffleArray(
    TILE_DEFINITIONS
      .filter((definition) => definition.copies === 4)
      .map((definition) => definition.group),
    `${seed}-difficulty-groups`
  )
  const config = DIFFICULTY_PAIR_GROUPS[difficulty]
  let groupCursor = 0

  for (let index = 0; index < config.fourOfAKind; index += 1) {
    const group = normalGroups[groupCursor]
    groupCursor += 1
    selectedGroups.push(...pullMany(groups, group, 4))
  }

  for (let index = 0; index < config.pairs; index += 1) {
    const group = normalGroups[groupCursor]
    groupCursor += 1
    selectedGroups.push(...pullMany(groups, group, 2))
  }

  return selectedGroups
}

const pullSingleOpeners = (
  groups: string[],
  slotsToFill: number,
  seed: string,
  reservedGroups: Set<string>
) => {
  const singles: string[] = []
  const candidates = shuffleArray([...new Set(groups)], `${seed}-single-openers`)
    .filter((group) => !reservedGroups.has(group) && tileFamily(group) !== 'flower' && tileFamily(group) !== 'season')

  for (const group of candidates) {
    if (singles.length >= slotsToFill) {
      break
    }

    const pulled = pullGroup(groups, group)

    if (pulled) {
      singles.push(pulled)
    }
  }

  return singles
}

const arrangeGroupsByDifficulty = (
  positions: LayoutPosition[],
  seed: string,
  difficulty: BoardDifficulty
) => {
  const groups = createCanonicalTileGroups()
  const openingIndexes = shuffleArray(getOpeningIndexes(positions), `${seed}-opening-slots`)
  const openingGroups = selectGroupsForDifficulty(groups, difficulty, seed)
  const reservedGroups = new Set(openingGroups)
  const singleOpeners = pullSingleOpeners(
    groups,
    Math.max(0, openingIndexes.length - openingGroups.length),
    seed,
    reservedGroups
  )
  const shuffledOpeningGroups = shuffleArray(
    [...openingGroups, ...singleOpeners],
    `${seed}-opening-groups`
  )
  const arrangedGroups = Array<string>(positions.length)

  openingIndexes.forEach((positionIndex, index) => {
    const group = shuffledOpeningGroups[index]

    if (group) {
      arrangedGroups[positionIndex] = group
    }
  })

  const remainingGroups = shuffleArray(groups, `${seed}-remaining-groups`)
  let remainingIndex = 0

  for (let index = 0; index < arrangedGroups.length; index += 1) {
    if (!arrangedGroups[index]) {
      arrangedGroups[index] = remainingGroups[remainingIndex] as string
      remainingIndex += 1
    }
  }

  return arrangedGroups
}

const createCandidateBoard = (
  positions: LayoutPosition[],
  seed: string,
  difficulty: BoardDifficulty
): CandidateBoard => {
  const groups = arrangeGroupsByDifficulty(positions, seed, difficulty)
  const tiles = createBoard(positions, groups)
  const openingPairs = matchingPairCount(tiles)

  return {
    tiles,
    openingPairs,
    distanceFromTarget: targetDistance(openingPairs, difficulty)
  }
}

export const generateBoard = (input: string | GenerateBoardOptions = 'classic-focus'): MahjongTile[] => {
  const { seed, difficulty, layoutId } = normalizeOptions(input)
  const layout = getMahjongLayout(layoutId)
  const positions = sortLayout(layout.coordinates)

  if (positions.length !== CANONICAL_TILE_COUNT) {
    throw new Error(`Mahjong layout "${layout.name}" must contain exactly ${CANONICAL_TILE_COUNT} positions.`)
  }

  let bestCandidate: CandidateBoard | null = null

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidateSeed = attempt === 0 ? seed : `${seed}-attempt-${attempt}`
    const candidate = createCandidateBoard(positions, candidateSeed, difficulty)

    if (!bestCandidate || candidate.distanceFromTarget < bestCandidate.distanceFromTarget) {
      bestCandidate = candidate
    }

    if (candidate.distanceFromTarget === 0) {
      return candidate.tiles
    }
  }

  return bestCandidate?.tiles || createCandidateBoard(positions, seed, difficulty).tiles
}
