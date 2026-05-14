<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const dashboard = useProfileStats()
const profile = dashboard.profile
const stats = dashboard.stats
const recentGames = dashboard.recentGames
const loading = dashboard.loading
const error = dashboard.error
const savingProfile = dashboard.savingProfile
const profileSaveMessage = dashboard.profileSaveMessage

onMounted(dashboard.fetchDashboard)
</script>

<template>
  <section class="mx-auto w-full max-w-[76rem] px-3 py-6 sm:px-6 sm:py-8">
    <div class="mb-5">
      <div>
        <h1 class="mt-1.5 text-4xl font-semibold tracking-normal text-ink dark:text-porcelain">Profile</h1>
      </div>
    </div>

    <div
      v-if="loading"
      class="panel p-8"
    >
      <div class="h-6 w-48 rounded-lg bg-ink/10 dark:bg-porcelain/10" />
      <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="item in 8" :key="item" class="h-24 rounded-lg bg-ink/5 dark:bg-porcelain/10" />
      </div>
    </div>

    <div
      v-else-if="error"
      class="rounded-xl border border-ember/20 bg-ember/10 p-6 text-ember"
    >
      <p class="font-semibold">Could not load profile.</p>
      <p class="mt-2 text-sm">{{ error }}</p>
    </div>

    <div v-else-if="profile" class="space-y-5">
      <ProfileCard
        :message="profileSaveMessage"
        :profile="profile"
        :saving="savingProfile"
        @save="dashboard.updateProfile"
      />

      <StatsGrid :stats="stats" />

      <ProfileProgressInsights
        :games="recentGames"
        :pro="profile.is_pro"
        :stats="stats"
      />

      <div class="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-stretch">
        <ProfileMoreStats :stats="stats" />

        <div class="panel flex flex-col p-4">
          <p class="text-sm font-semibold text-jade">
            Daily rhythm
          </p>
          <div class="mt-3 flex items-center justify-between gap-4 border-b border-ink/10 pb-3 dark:border-porcelain/10">
            <p class="text-sm font-medium text-ink/60 dark:text-porcelain/60">Longest streak</p>
            <p class="text-xl font-semibold leading-none">{{ stats.longestDailyStreak }}</p>
          </div>
          <div class="mt-3 grid gap-2 lg:mt-auto">
            <NuxtLink
              class="button-primary px-4 py-2.5"
              to="/daily"
            >
              Continue Daily
            </NuxtLink>
            <NuxtLink
              class="button-secondary px-4 py-2.5"
              to="/play"
            >
              Play Classic
            </NuxtLink>
          </div>
        </div>
      </div>

      <RecentGames :games="recentGames" />
    </div>
  </section>
</template>
