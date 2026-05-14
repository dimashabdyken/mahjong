<template>
  <section class="mx-auto w-full max-w-[76rem] px-3 py-4 sm:px-6 sm:py-6">
    <div class="grid min-h-[calc(100vh-128px)] min-w-0 items-center gap-7 lg:grid-cols-[0.96fr_1.18fr] lg:gap-8">
      <div class="max-w-[43rem] min-w-0">
        <h1 class="hero-reveal max-w-[43rem] text-[2.35rem] font-semibold leading-[1.04] text-ink dark:text-porcelain sm:text-[3.15rem] md:text-[3.8rem] lg:text-[4.15rem]">
          Daily Mahjong for focus, strategy, and calm breaks.
        </h1>
        <p class="hero-reveal hero-reveal-delay-1 mt-5 max-w-[37rem] text-lg leading-7 text-ink/70 dark:text-porcelain/70 sm:mt-6 md:text-[1.3rem] md:leading-9">
          Even the smallest bone can complete a great victory.
        </p>

        <div class="hero-reveal hero-reveal-delay-2 mt-7 grid gap-3 sm:flex sm:flex-wrap sm:gap-3.5">
          <NuxtLink
            to="/play"
            class="landing-button button-primary px-8 py-4 text-[1.05rem] font-bold"
          >
            Start playing
          </NuxtLink>
          <NuxtLink
            to="/daily"
            class="landing-button button-secondary px-8 py-4 text-[1.05rem] font-bold"
          >
            Try Daily Challenge
          </NuxtLink>
        </div>
      </div>

      <div class="landing-preview-card preview-reveal panel relative min-w-0 overflow-hidden p-4 sm:p-6 lg:p-8">
        <div class="absolute inset-x-0 top-0 h-1 bg-jade" />
        <div class="flex flex-col gap-3 border-b border-ink/10 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 lg:pb-6 dark:border-porcelain/10">
          <div class="min-w-0">
            <p class="text-[1.2rem] font-semibold text-ink dark:text-porcelain">Today’s board</p>
            <p class="mt-1 text-base text-ink/50 dark:text-porcelain/50">Classic turtle layout, focus pace</p>
          </div>
          <div class="w-max rounded-md border border-jade/30 bg-mist px-[1.125rem] py-3 text-base font-semibold text-jade dark:bg-porcelain/10">
            12 open tiles
          </div>
        </div>

        <div class="mt-5 rounded-lg border border-ink/10 bg-mist/80 p-3 dark:border-porcelain/10 dark:bg-porcelain/10 sm:p-5 lg:p-7">
          <div class="grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3.5 lg:gap-4">
            <div
              v-for="(tile, index) in tiles"
              :key="`${tile.symbol}-${index}`"
              class="preview-tile flex aspect-[3/4] flex-col items-center justify-center rounded-lg border bg-porcelain text-center shadow-tile"
              :class="tile.tone"
            >
              <span class="text-[1.9rem] font-semibold leading-none sm:text-[2.2rem] lg:text-[2.35rem]">{{ tile.symbol }}</span>
              <span class="mt-2.5 text-[0.78rem] font-semibold text-ink/50">{{ tile.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
const tiles = [
  { symbol: '東', label: 'east', tone: 'border-jade/20 text-jade' },
  { symbol: '南', label: 'south', tone: 'border-ink/10 text-ink' },
  { symbol: '西', label: 'west', tone: 'border-lacquer/20 text-lacquer' },
  { symbol: '北', label: 'north', tone: 'border-ink/10 text-ink' },
  { symbol: '竹', label: 'bamboo', tone: 'border-bamboo/25 text-bamboo' },
  { symbol: '梅', label: 'plum', tone: 'border-ember/20 text-ember' },
  { symbol: '春', label: 'spring', tone: 'border-jade/20 text-jade' },
  { symbol: '秋', label: 'autumn', tone: 'border-lacquer/20 text-lacquer' },
  { symbol: '一', label: 'one', tone: 'border-ink/10 text-ink' },
  { symbol: '二', label: 'two', tone: 'border-ink/10 text-ink' },
  { symbol: '三', label: 'three', tone: 'border-ink/10 text-ink' },
  { symbol: '四', label: 'four', tone: 'border-ink/10 text-ink' }
]

</script>

<style scoped>
.hero-reveal {
  animation: hero-fade-up 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero-reveal-delay-1 {
  animation-delay: 80ms;
}

.hero-reveal-delay-2 {
  animation-delay: 150ms;
}

.preview-reveal {
  animation: hero-fade-up 560ms cubic-bezier(0.16, 1, 0.3, 1) 180ms both;
}

.landing-button {
  transition-duration: 180ms;
  transition-property: background-color, border-color, box-shadow, color, transform;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.landing-button:hover,
.landing-button:focus-visible {
  transform: translateY(-1px);
}

.landing-button:hover {
  box-shadow: 0 4px 10px oklch(var(--color-ink) / 0.1);
}

.landing-button:focus-visible {
  box-shadow:
    0 0 0 2px oklch(var(--color-porcelain)),
    0 0 0 4px oklch(var(--color-jade) / 0.72);
}

.landing-preview-card {
  transition:
    border-color 200ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.landing-preview-card:hover {
  border-color: oklch(var(--color-jade) / 0.22);
  box-shadow: 0 7px 18px oklch(var(--color-ink) / 0.12);
  transform: translateY(-1.5px);
}

.preview-tile {
  transition:
    border-color 160ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 160ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
}

.preview-tile:hover {
  border-color: oklch(var(--color-jade) / 0.28);
  box-shadow:
    0 13px 27px oklch(var(--color-ink) / 0.16),
    inset 0 -2px 0 oklch(var(--color-ink) / 0.08);
  transform: translateY(-1.5px);
}

@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-reveal,
  .preview-reveal {
    animation: none;
  }

  .landing-button,
  .landing-preview-card,
  .preview-tile {
    transition-duration: 1ms;
  }

  .landing-button:hover,
  .landing-button:focus-visible,
  .landing-preview-card:hover,
  .preview-tile:hover {
    transform: none;
  }
}
</style>
