export type TilePosition = {
  x: number
  y: number
  z: number
}

export type MahjongTile = {
  id: string
  symbol: string
  group: string
  family: string
  position: TilePosition
  removed: boolean
}

export type LayoutPosition = TilePosition & {
  id: string
}

export type RemovedPair = {
  first: MahjongTile
  second: MahjongTile
}

export type GameMode = 'classic' | 'daily'

export type BoardDifficulty = 'easy' | 'medium' | 'hard'
