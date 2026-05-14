<script setup lang="ts">
import type { MahjongTile } from '~/utils/mahjong/types'
import {
  getBoardBounds,
  getTilePixelPosition,
  getTileStackOrder,
  TILE_HEIGHT,
  TILE_WIDTH
} from '~/utils/mahjong/layouts'

type BoardBounds = ReturnType<typeof getBoardBounds>

const props = defineProps<{
  tile: MahjongTile
  selected: boolean
  hintHighlighted: boolean
  coachHighlighted: boolean
  free: boolean
  boardBounds: BoardBounds
}>()

const emit = defineEmits<{
  select: [tile: MahjongTile]
}>()

const tileStyle = computed(() => {
  const position = getTilePixelPosition(props.tile.position, props.boardBounds)

  return {
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${TILE_WIDTH}px`,
    height: `${TILE_HEIGHT}px`,
    zIndex: String(getTileStackOrder(props.tile.position))
  }
})

const tileToneClass = computed(() => {
  if (props.tile.family === 'bamboo' || props.tile.group === 'dragon-green') {
    return 'mahjong-tile-symbol--green'
  }

  if (['flower', 'season'].includes(props.tile.family) || props.tile.group === 'dragon-red') {
    return 'mahjong-tile-symbol--red'
  }

  return 'mahjong-tile-symbol--primary'
})

const displaySymbol = computed(() => {
  return props.tile.symbol
})

const displayLabel = computed(() => {
  if (props.tile.family === 'bamboo') {
    return '竹'
  }

  if (props.tile.family === 'character') {
    return '萬'
  }

  if (props.tile.family === 'dot') {
    return '筒'
  }

  if (props.tile.family === 'wind') {
    return '風'
  }

  if (props.tile.family === 'dragon') {
    return '牌'
  }

  if (props.tile.family === 'flower') {
    return '花'
  }

  if (props.tile.family === 'season') {
    return '季'
  }

  return ''
})

const tileBaseClass = computed(() => {
  if (props.selected) {
    return 'mahjong-tile--selected'
  }

  if (props.free) {
    return 'mahjong-tile--free'
  }

  return 'mahjong-tile--blocked'
})

const highlightClasses = computed(() => [
  props.hintHighlighted ? 'mahjong-tile--hinted' : '',
  props.coachHighlighted ? 'mahjong-tile--coach-highlighted' : ''
])
</script>

<template>
  <button
    class="mahjong-tile focus-ring absolute flex flex-col items-center justify-center rounded-[7px] border text-center transition duration-150"
    :class="[
      tileBaseClass,
      highlightClasses,
      tile.removed ? 'pointer-events-none opacity-0' : ''
    ]"
    :style="tileStyle"
    type="button"
    :aria-label="`${tile.group} tile${free ? ', free' : ', blocked'}`"
    @click="emit('select', tile)"
  >
    <span
      class="leading-none"
      :class="[
        tileToneClass,
        selected ? 'mahjong-tile-symbol--selected' : '',
        hintHighlighted ? 'mahjong-tile-symbol--hinted' : '',
        coachHighlighted ? 'mahjong-tile-symbol--coach' : '',
        free
          ? 'text-[1.46rem] font-bold sm:text-[1.56rem]'
          : 'text-[1.25rem] font-semibold sm:text-[1.34rem]'
      ]"
    >
      {{ displaySymbol }}
    </span>
    <span class="sr-only">
      {{ displayLabel }}
    </span>
  </button>
</template>
