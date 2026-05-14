<script setup lang="ts">
defineProps<{
  pro: boolean
}>()

const focus = useFocusSession()
</script>

<template>
  <section class="rounded-lg border border-ink/10 bg-white/45 px-3 py-3 dark:border-porcelain/10 dark:bg-porcelain/5">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-ink dark:text-porcelain">Focus session</p>
        <p
          v-if="pro && focus.isFocusActive.value"
          class="mt-1 text-xs font-medium text-jade"
        >
          Focus active · {{ focus.formattedTime.value }} left
        </p>
        <p
          v-else-if="pro && focus.completed.value"
          class="mt-1 text-xs font-medium text-jade"
        >
          Focus session completed
        </p>
        <p
          v-else
          class="mt-1 text-xs font-medium text-ink/55 dark:text-porcelain/55"
        >
          {{ pro ? 'Choose a duration and keep the board moving.' : 'Focus sessions are available with Pro.' }}
        </p>
      </div>

      <div
        v-if="pro"
        class="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto"
      >
        <div
          v-if="!focus.isFocusActive.value"
          class="grid grid-cols-3 gap-1 rounded-md border border-ink/10 bg-rice/60 p-1 dark:border-porcelain/10 dark:bg-porcelain/5 sm:inline-flex sm:flex-wrap"
        >
          <button
            v-for="duration in focus.durations"
            :key="duration"
            class="focus-ring rounded px-2.5 py-1.5 text-xs font-semibold transition"
            :class="focus.selectedDuration.value === duration
              ? 'bg-ink text-porcelain shadow-soft dark:bg-porcelain dark:text-ink'
              : 'text-ink/62 hover:bg-white/80 dark:text-porcelain/62 dark:hover:bg-porcelain/10'"
            type="button"
            @click="focus.selectedDuration.value = duration"
          >
            {{ duration }} min
          </button>
        </div>

        <button
          v-if="focus.isFocusActive.value"
          class="button-secondary w-full px-3 py-2 text-xs sm:w-auto"
          type="button"
          @click="focus.stopFocusSession"
        >
          Stop focus
        </button>
        <button
          v-else
          class="button-primary w-full px-3 py-2 text-xs sm:w-auto"
          type="button"
          @click="focus.startFocusSession"
        >
          Start focus
        </button>
      </div>

      <NuxtLink
        v-else
        class="button-secondary w-full px-3 py-2 text-xs sm:w-auto lg:shrink-0"
        to="/pro"
      >
        View Pro
      </NuxtLink>
    </div>
  </section>
</template>
