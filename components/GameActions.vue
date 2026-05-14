<script setup lang="ts">
defineProps<{
  hintsUsed: number
  shufflesUsed: number
  undoCount: number
  canUndo: boolean
}>()

const emit = defineEmits<{
  restart: []
  hint: []
  shuffle: []
  undo: []
}>()
</script>

<template>
  <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
    <button
      class="button-primary min-w-0 px-3 py-2.5 active:translate-y-px sm:min-w-[6.75rem] sm:px-4"
      type="button"
      @click="emit('hint')"
    >
      Hint <span v-if="hintsUsed">({{ hintsUsed }})</span>
    </button>
    <button
      class="button-secondary min-w-0 px-3 py-2.5 sm:px-5 sm:py-3"
      type="button"
      @click="emit('shuffle')"
    >
      Shuffle <span v-if="shufflesUsed">({{ shufflesUsed }})</span>
    </button>
    <button
      class="button-secondary min-w-0 px-3 py-2.5 disabled:cursor-not-allowed disabled:opacity-45 sm:px-5 sm:py-3"
      :disabled="!canUndo"
      type="button"
      @click="emit('undo')"
    >
      Undo <span v-if="undoCount">({{ undoCount }})</span>
    </button>
    <button
      class="focus-ring min-h-11 min-w-0 rounded-lg border border-ember/30 px-3 py-2.5 text-sm font-semibold text-ember transition hover:bg-ember/10 sm:px-5 sm:py-3"
      type="button"
      @click="emit('restart')"
    >
      Restart
    </button>
  </div>
</template>
