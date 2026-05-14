<script setup lang="ts">
type Tab = {
  id: string
  label: string
}

defineProps<{
  tabs: Tab[]
  activeTab: string
}>()

const emit = defineEmits<{
  'update:activeTab': [tabId: string]
}>()
</script>

<template>
  <div class="flex w-full max-w-full flex-wrap gap-1 rounded-lg border border-ink/10 bg-rice/80 p-1 shadow-sm shadow-ink/5 dark:border-porcelain/10 dark:bg-porcelain/5 dark:shadow-none sm:inline-flex sm:w-auto">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="focus-ring flex-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition sm:flex-none sm:px-4"
      :class="activeTab === tab.id
        ? 'bg-porcelain text-ink shadow-sm ring-1 ring-ink/10 dark:bg-porcelain dark:text-ink'
        : 'text-ink/60 hover:bg-porcelain/60 hover:text-ink dark:text-porcelain/60 dark:hover:bg-porcelain/10 dark:hover:text-porcelain'"
      type="button"
      @click="emit('update:activeTab', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
