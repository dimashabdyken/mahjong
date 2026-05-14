import type { MahjongTile } from './types'

const activeTiles = (tiles: MahjongTile[]) => tiles.filter((tile) => !tile.removed)

const samePosition = (first: MahjongTile, second: MahjongTile) =>
  first.position.x === second.position.x && first.position.y === second.position.y

const sameRowLayer = (first: MahjongTile, second: MahjongTile) =>
  first.position.y === second.position.y && first.position.z === second.position.z

export const hasTileAbove = (tile: MahjongTile, tiles: MahjongTile[]) =>
  activeTiles(tiles).some(
    (candidate) =>
      candidate.id !== tile.id &&
      candidate.position.z > tile.position.z &&
      samePosition(candidate, tile)
  )

export const isLeftBlocked = (tile: MahjongTile, tiles: MahjongTile[]) =>
  activeTiles(tiles).some(
    (candidate) =>
      candidate.id !== tile.id &&
      sameRowLayer(candidate, tile) &&
      candidate.position.x === tile.position.x - 1
  )

export const isRightBlocked = (tile: MahjongTile, tiles: MahjongTile[]) =>
  activeTiles(tiles).some(
    (candidate) =>
      candidate.id !== tile.id &&
      sameRowLayer(candidate, tile) &&
      candidate.position.x === tile.position.x + 1
  )

export const isTileFree = (tile: MahjongTile, tiles: MahjongTile[]) => {
  if (tile.removed || hasTileAbove(tile, tiles)) {
    return false
  }

  return !isLeftBlocked(tile, tiles) || !isRightBlocked(tile, tiles)
}

export const tilesMatch = (first: MahjongTile, second: MahjongTile) => {
  if (first.id === second.id) {
    return false
  }

  if (first.family === 'flower' || second.family === 'flower') {
    return first.family === 'flower' && second.family === 'flower'
  }

  if (first.family === 'season' || second.family === 'season') {
    return first.family === 'season' && second.family === 'season'
  }

  return first.group === second.group
}

export const canRemovePair = (
  first: MahjongTile,
  second: MahjongTile,
  tiles: MahjongTile[]
) =>
  !first.removed &&
  !second.removed &&
  tilesMatch(first, second) &&
  isTileFree(first, tiles) &&
  isTileFree(second, tiles)

export const findLegalPairs = (tiles: MahjongTile[]) => {
  const freeTiles = activeTiles(tiles).filter((tile) => isTileFree(tile, tiles))
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

export const allTilesRemoved = (tiles: MahjongTile[]) =>
  tiles.every((tile) => tile.removed)
