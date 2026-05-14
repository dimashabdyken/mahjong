<script setup lang="ts">
const features = [
  {
    title: 'Deeper AI Coach',
    text: 'Review more board states before choosing.'
  },
  {
    title: 'Cultural tile themes',
    text: 'Play with tile sets inspired by Mahjong traditions.'
  },
  {
    title: 'Progress insights',
    text: 'See progress patterns beyond the basic profile.'
  }
]
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-3">
    <div
      v-for="feature in features"
      :key="feature.title"
      class="rounded-lg border border-ink/10 bg-white/70 p-4 shadow-sm shadow-ink/5 motion-safe:transition motion-safe:duration-150 motion-safe:ease-out hover:border-ink/15 hover:shadow-soft dark:border-porcelain/10 dark:bg-porcelain/[0.04]"
    >
      <h3 class="font-semibold">{{ feature.title }}</h3>
      <p class="mt-2 text-sm leading-5 text-ink/60 dark:text-porcelain/60">
        {{ feature.text }}
      </p>
    </div>
  </div>
</template>
