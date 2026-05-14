import type { MahjongTile } from './types'
import { findLegalPairs } from './rules'

export type HintResult = {
  pair: [MahjongTile, MahjongTile] | null
  message: string
}

const stablePairIndex = (
  tiles: MahjongTile[],
  pairs: Array<[MahjongTile, MahjongTile]>
) => {
  const seed = tiles
    .filter((tile) => !tile.removed)
    .map((tile) => tile.id)
    .join('')
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0)

  return seed % pairs.length
}

export const getHint = (
  tiles: MahjongTile[],
  cachedLegalPairs?: Array<[MahjongTile, MahjongTile]>
): HintResult => {
  const legalPairs = cachedLegalPairs || findLegalPairs(tiles)

  if (!legalPairs.length) {
    return {
      pair: null,
      message: 'No legal pairs are available. Shuffle the remaining tiles to continue.'
    }
  }

  const pair = legalPairs[stablePairIndex(tiles, legalPairs)]

  return {
    pair,
    message: 'Hint shown.'
  }
}
