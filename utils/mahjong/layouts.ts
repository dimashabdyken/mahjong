import type { LayoutPosition, TilePosition } from './types'

export const TILE_WIDTH = 64
export const TILE_HEIGHT = 82
export const TILE_DEPTH = 6
export const BOARD_PADDING = 14
export const TILE_GAP = 2
export const LAYER_OFFSET_X = 6
export const LAYER_OFFSET_Y = 6
export const TILE_STEP_X = TILE_WIDTH + TILE_GAP
export const TILE_STEP_Y = TILE_HEIGHT + TILE_GAP
export const LAYER_OFFSET = LAYER_OFFSET_X
export const TILE_X_STEP = TILE_STEP_X
export const TILE_Y_STEP = TILE_STEP_Y

export type MahjongLayoutId =
  | 'classic'
  | 'gemini-2600'
  | 'four-pyramids'
  | 'garden'
  | 'grate-2'
  | 'full-vision-2'

export type MahjongLayoutDefinition = {
  id: MahjongLayoutId
  name: string
  tileCount: number
  coordinates: LayoutPosition[]
  isProOnly: boolean
}

type CompactCell = number | [number, number]
type CompactRow = [number, CompactCell | CompactCell[]]
type CompactLayer = [number, CompactRow[]]

type LayoutRow = {
  z: number
  y: number
  xs: number[]
}

const EXPECTED_TILE_COUNT = 144

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index)

const rowToPositions = (layoutId: MahjongLayoutId, { z, y, xs }: LayoutRow) =>
  xs.map((x, index) => ({
    id: `${layoutId}-${z}-${y}-${x}-${index}`,
    x,
    y,
    z
  }))

const classicTurtleRows: LayoutRow[] = [
  { z: 0, y: 0, xs: range(4, 9) },
  { z: 0, y: 1, xs: range(2, 11) },
  { z: 0, y: 2, xs: range(1, 12) },
  { z: 0, y: 3, xs: range(0, 13) },
  { z: 0, y: 4, xs: range(0, 13) },
  { z: 0, y: 5, xs: range(1, 12) },
  { z: 0, y: 6, xs: range(2, 11) },
  { z: 0, y: 7, xs: range(4, 9) },
  { z: 1, y: 1, xs: range(4, 9) },
  { z: 1, y: 2, xs: range(3, 10) },
  { z: 1, y: 3, xs: range(2, 11) },
  { z: 1, y: 4, xs: range(2, 11) },
  { z: 1, y: 5, xs: range(4, 9) },
  { z: 2, y: 2, xs: range(5, 8) },
  { z: 2, y: 3, xs: range(4, 9) },
  { z: 2, y: 4, xs: range(4, 9) },
  { z: 3, y: 3, xs: range(6, 7) },
  { z: 3, y: 4, xs: range(6, 7) }
]

const createClassicPositions = () =>
  classicTurtleRows.flatMap((row) => rowToPositions('classic', row))

const mahseumMaps: Record<Exclude<MahjongLayoutId, 'classic'>, CompactLayer[]> = {
  'gemini-2600': [[0, [[0, [[0, 3], 8, [12, 6], 26]], [2, [0, [6, 3], [14, 3]]], [4, [[2, 2], [8, 3], [16, 4], 26]], [6, [[12, 2]]], [8, [[12, 2]]], [10, [[2, 2], [8, 3], [16, 4], 26]], [12, [0, [6, 3], [14, 3]]], [14, [[0, 3], 8, [12, 6], 26]]]], [1, [[0, [[0, 3], 8, [12, 6], 26]], [2, [0, [6, 3], [14, 3]]], [4, [[2, 2], [8, 3], [16, 4], 26]], [6, [[12, 2]]], [8, [[12, 2]]], [10, [[2, 2], [8, 3], [16, 4], 26]], [12, [0, [6, 3], [14, 3]]], [14, [[0, 3], 8, [12, 6], 26]]]], [2, [[0, [[0, 3], 26]], [2, [0, 6]], [4, [[2, 2], 12, 26]], [6, [[12, 2]]], [8, [[12, 2]]], [10, [[2, 2], 12, 26]], [12, [0, 6]], [14, [[0, 3], 26]]]]],
  'four-pyramids': [[0, [[0, [[3, 4], [12, 4]]], [1, [0, 21]], [2, [[3, 4], [12, 4]]], [3, [0, 21]], [4, [[3, 4], [12, 4]]], [6, [[3, 4], [12, 4]]], [9, [[3, 4], [12, 4]]], [11, [[3, 4], [12, 4]]], [12, [0, 21]], [13, [[3, 4], [12, 4]]], [14, [0, 21]], [15, [[3, 4], [12, 4]]]]], [1, [[1, [[4, 3], [13, 3]]], [3, [0, [4, 3], [13, 3], 21]], [5, [[4, 3], [13, 3]]], [10, [[4, 3], [13, 3]]], [12, [0, [4, 3], [13, 3], 21]], [14, [[4, 3], [13, 3]]]]], [2, [[2, [[5, 2], [14, 2]]], [4, [0, [5, 2], [14, 2], 21]], [11, [0, [5, 2], [14, 2], 21]], [13, [[5, 2], [14, 2]]]]], [3, [[3, [6, 15]], [5, [0, 21]], [10, [0, 21]], [12, [6, 15]]]], [4, [[6, [0, 21]], [9, [0, 21]]]]],
  garden: [[0, [[0, [[3, 2], [14, 2], [25, 2]]], [1, [0, 8, 11, 19, 22, 30]], [2, [[2, 3], [13, 3], [24, 3]]], [3, [0, 8, 11, 19, 22, 30]], [4, [[2, 3], [13, 3], [24, 3]]], [5, [0, 8, 11, 19, 22, 30]], [7, [[2, 3], [13, 3], [24, 3]]], [9, [0, 8, 11, 19, 22, 30]], [10, [[2, 3], [13, 3], [24, 3]]], [11, [0, 8, 11, 19, 22, 30]], [12, [[2, 3], [13, 3], [24, 3]]], [13, [0, 8, 11, 19, 22, 30]], [14, [[3, 2], [14, 2], [25, 2]]]]], [1, [[0, [4, 15, 26]], [3, [[2, 3], [13, 3], [24, 3]]], [7, [[3, 2], [14, 2], [25, 2]]], [11, [[2, 3], [13, 3], [24, 3]]], [14, [4, 15, 26]]]], [2, [[3, [[3, 2], [14, 2], [25, 2]]], [7, [4, 15, 26]], [11, [[3, 2], [14, 2], [25, 2]]]]], [3, [[3, [4, 15, 26]], [11, [4, 15, 26]]]]],
  'grate-2': [[0, [[0, [[0, 11]]], [2, [[0, 2], 6, 10, 14, [18, 2]]], [4, [[0, 2], 6, 10, 14, [18, 2]]], [6, [[0, 2], 6, 10, 14, [18, 2]]], [8, [[0, 2], 6, 10, 14, [18, 2]]], [10, [[0, 2], 6, 10, 14, [18, 2]]], [12, [[0, 2], 6, 10, 14, [18, 2]]], [14, [[0, 11]]]]], [1, [[0, [[0, 11]]], [2, [[0, 2], 6, 10, 14, [18, 2]]], [4, [[0, 2], 6, 10, 14, [18, 2]]], [6, [[0, 2], 6, 10, 14, [18, 2]]], [8, [[0, 2], 6, 10, 14, [18, 2]]], [10, [[0, 2], 6, 10, 14, [18, 2]]], [12, [[0, 2], 6, 10, 14, [18, 2]]], [14, [[0, 11]]]]], [2, [[0, [[0, 2], 10, [18, 2]]], [2, [0, 20]], [7, [0, 20]], [12, [0, 20]], [14, [[0, 2], 10, [18, 2]]]]]],
  'full-vision-2': [[0, [[0, [[0, 2], [5, 2], [10, 2], [15, 2], [20, 2], [25, 2]]], [2, [[0, 2], [5, 2], [10, 2], [15, 2], [20, 2], [25, 2]]], [4, [[0, 2], [5, 2], [10, 2], [15, 2], [20, 2], [25, 2]]], [6, [[0, 2], [5, 2], [10, 2], [15, 2], [20, 2], [25, 2]]], [9, [[0, 4], [10, 2], [15, 2], [21, 4]]], [11, [[0, 4], [10, 2], [15, 2], [21, 4]]], [14, [[4, 5], [15, 5]]]]], [1, [[1, [1, 6, 11, 16, 21, 26]], [3, [[0, 2], [5, 2], [10, 2], [15, 2], [20, 2], [25, 2]]], [5, [1, 6, 11, 16, 21, 26]], [9, [3, 24]], [10, [1, 5, [10, 2], [15, 2], 22, 26]], [11, [3, 24]]]], [2, [[2, [1, 6, 11, 16, 21, 26]], [4, [1, 6, 11, 16, 21, 26]], [10, [[2, 2], 11, 16, [23, 2]]]]], [3, [[3, [1, 6, 11, 16, 21, 26]], [10, [3, 24]]]]]
}

const expandCompactCells = (cells: CompactCell | CompactCell[]) => {
  const normalizedCells = Array.isArray(cells) ? cells : [cells]
  const xs: number[] = []

  normalizedCells.forEach((cell) => {
    if (Array.isArray(cell)) {
      const [start, count] = cell

      for (let index = 0; index < count; index += 1) {
        xs.push((start + index * 2) / 2)
      }

      return
    }

    xs.push(cell / 2)
  })

  return xs
}

const createMahseumPositions = (
  layoutId: Exclude<MahjongLayoutId, 'classic'>,
  map: CompactLayer[]
) => {
  const positions = map.flatMap(([z, rows]) =>
    rows.flatMap(([y, cells]) =>
      expandCompactCells(cells).map((x) => ({
        x,
        y: y / 2,
        z
      }))
    )
  )
  const minX = Math.min(...positions.map((position) => position.x))
  const minY = Math.min(...positions.map((position) => position.y))

  return positions.map((position, index) => ({
    id: `${layoutId}-${index}`,
    x: position.x - minX,
    y: position.y - minY,
    z: position.z
  }))
}

const createLayout = (
  id: MahjongLayoutId,
  name: string,
  coordinates: LayoutPosition[],
  isProOnly: boolean
): MahjongLayoutDefinition => {
  const tileCount = coordinates.length

  if (import.meta.dev && tileCount !== EXPECTED_TILE_COUNT) {
    console.warn(`Skipping invalid Mahjong layout "${name}" with ${tileCount} tiles.`)
  }

  return {
    id,
    name,
    tileCount,
    coordinates,
    isProOnly
  }
}

const layoutCandidates: MahjongLayoutDefinition[] = [
  createLayout('classic', 'Classic', createClassicPositions(), false),
  createLayout('gemini-2600', 'Gemini 2600', createMahseumPositions('gemini-2600', mahseumMaps['gemini-2600']), true),
  createLayout('four-pyramids', 'Four Pyramids', createMahseumPositions('four-pyramids', mahseumMaps['four-pyramids']), true),
  createLayout('garden', 'Garden', createMahseumPositions('garden', mahseumMaps.garden), true),
  createLayout('grate-2', 'Grate 2', createMahseumPositions('grate-2', mahseumMaps['grate-2']), true),
  createLayout('full-vision-2', 'Full Vision 2', createMahseumPositions('full-vision-2', mahseumMaps['full-vision-2']), true)
]

export const MAHJONG_LAYOUTS = layoutCandidates.filter(
  (layout) => layout.tileCount === EXPECTED_TILE_COUNT
)

const coordinateSignature = (layout: MahjongLayoutDefinition) =>
  layout.coordinates
    .map((position) => `${position.x}:${position.y}:${position.z}`)
    .sort()
    .join('|')

if (import.meta.dev) {
  const seenSignatures = new Map<string, string>()

  MAHJONG_LAYOUTS.forEach((layout) => {
    const signature = coordinateSignature(layout)
    const duplicateName = seenSignatures.get(signature)

    if (duplicateName) {
      console.warn(`Mahjong layouts "${duplicateName}" and "${layout.name}" share identical coordinates.`)
      return
    }

    seenSignatures.set(signature, layout.name)
  })
}

export const DEFAULT_LAYOUT_ID: MahjongLayoutId = 'classic'
export const FOCUS_CLASSIC_LAYOUT = MAHJONG_LAYOUTS[0].coordinates

export const getMahjongLayout = (layoutId: string = DEFAULT_LAYOUT_ID) =>
  MAHJONG_LAYOUTS.find((layout) => layout.id === layoutId) || MAHJONG_LAYOUTS[0]

export const GEMINI_2600_LAYOUT = getMahjongLayout('gemini-2600').coordinates

export const isMahjongLayoutId = (layoutId: string): layoutId is MahjongLayoutId =>
  MAHJONG_LAYOUTS.some((layout) => layout.id === layoutId)

export const BOARD_COLUMNS = 14
export const BOARD_ROWS = 8
export const BOARD_LAYERS = 3

const tilePixelPosition = (position: TilePosition) => ({
  x: position.x * TILE_STEP_X - position.z * LAYER_OFFSET_X,
  y: position.y * TILE_STEP_Y - position.z * LAYER_OFFSET_Y
})

export const getBoardBounds = (layout: TilePosition[]) => layout.reduce(
  (bounds, position) => {
    const pixel = tilePixelPosition(position)

    return {
      minX: Math.min(bounds.minX, pixel.x),
      minY: Math.min(bounds.minY, pixel.y),
      maxX: Math.max(bounds.maxX, pixel.x + TILE_WIDTH + TILE_DEPTH),
      maxY: Math.max(bounds.maxY, pixel.y + TILE_HEIGHT + TILE_DEPTH)
    }
  },
  {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY
  }
)

const boardBounds = getBoardBounds(FOCUS_CLASSIC_LAYOUT)

export const BOARD_PIXEL_WIDTH = Math.ceil(boardBounds.maxX - boardBounds.minX + BOARD_PADDING * 2)
export const BOARD_PIXEL_HEIGHT = Math.ceil(boardBounds.maxY - boardBounds.minY + BOARD_PADDING * 2)

export const getLayoutPixelMetrics = (layout: TilePosition[]) => {
  const bounds = getBoardBounds(layout)

  return {
    bounds,
    width: Math.ceil(bounds.maxX - bounds.minX + BOARD_PADDING * 2),
    height: Math.ceil(bounds.maxY - bounds.minY + BOARD_PADDING * 2)
  }
}

export const getTilePixelPosition = (position: TilePosition, bounds = boardBounds) => {
  const pixel = tilePixelPosition(position)

  return {
    x: Math.round(pixel.x - bounds.minX + BOARD_PADDING),
    y: Math.round(pixel.y - bounds.minY + BOARD_PADDING)
  }
}

export const getTileStackOrder = (position: TilePosition) =>
  Math.round(position.z * 1000 + position.y * 40 + position.x)
