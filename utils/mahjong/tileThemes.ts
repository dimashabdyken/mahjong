export type TileThemeId =
  | 'classic'
  | 'jade'
  | 'imperial'
  | 'porcelain'
  | 'sakura'

export type TileThemeDefinition = {
  id: TileThemeId
  name: string
  isProOnly: boolean
}

export const TILE_THEMES: TileThemeDefinition[] = [
  { id: 'classic', name: 'Classic tiles', isProOnly: false },
  { id: 'jade', name: 'Jade tiles', isProOnly: true },
  { id: 'imperial', name: 'Imperial red', isProOnly: true },
  { id: 'porcelain', name: 'Porcelain blue', isProOnly: true },
  { id: 'sakura', name: 'Sakura', isProOnly: true }
]

export const DEFAULT_TILE_THEME_ID: TileThemeId = 'classic'

export const getTileTheme = (themeId: string = DEFAULT_TILE_THEME_ID) =>
  TILE_THEMES.find((theme) => theme.id === themeId) || TILE_THEMES[0]

export const isTileThemeId = (themeId: string): themeId is TileThemeId =>
  TILE_THEMES.some((theme) => theme.id === themeId)
