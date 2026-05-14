<script setup lang="ts">
defineProps<{
  compact?: boolean
}>()

const plan = useProfilePlan()

onMounted(() => {
  plan.fetchPlan()
})
</script>

<template>
  <div
    v-if="plan.loaded.value && !plan.isPro.value"
    class="rounded-lg border border-lacquer/15 bg-rice/60 text-sm dark:border-porcelain/10 dark:bg-porcelain/5"
    :class="compact ? '' : 'p-3 sm:p-5'"
  >
    <template v-if="compact">
      <NuxtLink
        class="block px-3 py-2.5 text-sm font-semibold text-ink/70 transition hover:text-ink dark:text-porcelain/70 dark:hover:text-porcelain"
        to="/pro"
      >
        Upgrade to Pro
      </NuxtLink>
    </template>
    <template v-else>
      <h3 class="font-semibold">Upgrade to Pro</h3>
      <p class="mt-1.5 leading-5 text-ink/60 dark:text-porcelain/60">
        Unlock deeper AI Coach, progress insights, and cultural tile themes.
      </p>
      <NuxtLink
        class="button-secondary mt-3 px-3 py-2 text-sm"
        to="/pro"
      >
        View Pro
      </NuxtLink>
    </template>
  </div>
</template>
