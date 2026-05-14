<script setup lang="ts">
import type { MahjongTile } from '~/utils/mahjong/types'
import { getLayoutPixelMetrics } from '~/utils/mahjong/layouts'
import { DEFAULT_TILE_THEME_ID, type TileThemeId } from '~/utils/mahjong/tileThemes'

const props = defineProps<{
  tiles: MahjongTile[]
  selectedTileId: string | null
  hintTileIds: string[]
  coachTileIds: string[]
  isTileFree: (tile: MahjongTile) => boolean
  tileThemeId?: TileThemeId
}>()

const emit = defineEmits<{
  select: [tile: MahjongTile]
}>()

const viewportRef = ref<HTMLElement | null>(null)
const availableWidth = ref(0)

const sortedTiles = computed(() =>
  [...props.tiles].sort((first, second) => {
    if (first.position.z !== second.position.z) {
      return first.position.z - second.position.z
    }

    if (first.position.y !== second.position.y) {
      return first.position.y - second.position.y
    }

    return first.position.x - second.position.x
  })
)

const boardMetrics = computed(() =>
  getLayoutPixelMetrics(props.tiles.map((tile) => tile.position))
)

const boardScale = computed(() =>
  availableWidth.value > 0
    ? Math.min(1, availableWidth.value / boardMetrics.value.width)
    : 0
)

const boardSizerStyle = computed(() => ({
  width: `${Math.ceil(boardMetrics.value.width * boardScale.value)}px`,
  height: `${Math.ceil(boardMetrics.value.height * boardScale.value)}px`,
  visibility: availableWidth.value > 0 ? 'visible' : 'hidden'
}))

const boardStyle = computed(() => ({
  width: `${boardMetrics.value.width}px`,
  height: `${boardMetrics.value.height}px`,
  transform: `scale(${boardScale.value})`,
  transformOrigin: 'top left'
}))

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!viewportRef.value) {
    return
  }

  const updateAvailableWidth = (entry?: ResizeObserverEntry) => {
    availableWidth.value = entry?.contentRect.width || viewportRef.value?.clientWidth || 0
  }

  updateAvailableWidth()
  resizeObserver = new ResizeObserver(([entry]) => updateAvailableWidth(entry))
  resizeObserver.observe(viewportRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <div
    class="mahjong-table rounded-lg p-2 dark:border-porcelain/10 sm:p-4"
    :data-tile-theme="tileThemeId || DEFAULT_TILE_THEME_ID"
  >
    <div ref="viewportRef" class="mahjong-board-viewport">
      <div class="mahjong-board-sizer" :style="boardSizerStyle">
        <div class="mahjong-board" :style="boardStyle">
          <MahjongTile
            v-for="tile in sortedTiles"
            :key="tile.id"
            :coach-highlighted="coachTileIds.includes(tile.id)"
            :free="isTileFree(tile)"
            :hint-highlighted="hintTileIds.includes(tile.id)"
            :selected="selectedTileId === tile.id"
            :tile="tile"
            :board-bounds="boardMetrics.bounds"
            @select="emit('select', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
