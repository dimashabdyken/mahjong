<script setup lang="ts">
import type { ProfileRecord } from '~/composables/useProfileStats'

const props = defineProps<{
  profile: ProfileRecord
  saving: boolean
  message: string
}>()

const emit = defineEmits<{
  save: [payload: { nickname: string; city: string; avatar_url: string | null }]
}>()

const nickname = ref(props.profile.nickname)
const city = ref(props.profile.city)
const avatarUrl = ref(props.profile.avatar_url || '')
const isEditing = ref(false)

watch(
  () => props.profile,
  (profile) => {
    nickname.value = profile.nickname
    city.value = profile.city
    avatarUrl.value = profile.avatar_url || ''
    isEditing.value = false
  }
)

const joinedDate = computed(() =>
  new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(props.profile.created_at))
)

const submit = () => {
  emit('save', {
    nickname: nickname.value,
    city: city.value,
    avatar_url: avatarUrl.value || null
  })
}

const cancelEdit = () => {
  nickname.value = props.profile.nickname
  city.value = props.profile.city
  avatarUrl.value = props.profile.avatar_url || ''
  isEditing.value = false
}
</script>

<template>
  <form
    class="panel p-5 sm:p-6"
    @submit.prevent="submit"
  >
    <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
        <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-ink/10 bg-mist text-xl font-semibold text-ink dark:border-porcelain/10 dark:bg-porcelain/10 dark:text-porcelain">
          <img
            v-if="profile.avatar_url"
            :alt="`${profile.nickname} avatar`"
            class="h-full w-full rounded-lg object-cover"
            :src="profile.avatar_url"
          >
          <span v-else>{{ profile.nickname.slice(0, 2).toUpperCase() }}</span>
        </div>
        <div class="min-w-0">
          <h2 class="text-2xl font-semibold leading-tight text-ink dark:text-porcelain">{{ profile.nickname }}</h2>
          <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-sm font-medium text-ink/62 dark:text-porcelain/62">
            <span>{{ profile.city }}</span>
            <span>{{ profile.is_pro ? 'Pro plan' : 'Free plan' }}</span>
            <span>Joined {{ joinedDate }}</span>
          </div>
        </div>
      </div>

      <div class="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3 lg:justify-end">
        <button
          v-if="!isEditing"
          class="button-secondary px-4 py-2.5"
          type="button"
          @click="isEditing = true"
        >
          Edit profile
        </button>
        <button
          v-else
          class="button-primary"
          :disabled="saving"
          type="submit"
        >
          {{ saving ? 'Saving...' : 'Save profile' }}
        </button>
        <button
          v-if="isEditing"
          class="button-secondary px-4 py-2.5"
          :disabled="saving"
          type="button"
          @click="cancelEdit"
        >
          Cancel
        </button>
        <p v-if="message" class="text-sm font-semibold text-jade">{{ message }}</p>
      </div>
    </div>

    <div v-if="isEditing" class="mt-5 grid gap-3 border-t border-ink/10 pt-5 md:grid-cols-2 dark:border-porcelain/10">
      <label class="block text-sm font-medium" for="nickname">
        Nickname
        <input
          id="nickname"
          v-model="nickname"
          class="focus-ring mt-2 w-full rounded-lg border border-ink/10 bg-rice px-3.5 py-2.5 text-ink dark:border-porcelain/10 dark:bg-ink dark:text-porcelain"
          required
          type="text"
        >
      </label>

      <label class="block text-sm font-medium" for="city">
        City
        <input
          id="city"
          v-model="city"
          class="focus-ring mt-2 w-full rounded-lg border border-ink/10 bg-rice px-3.5 py-2.5 text-ink dark:border-porcelain/10 dark:bg-ink dark:text-porcelain"
          required
          type="text"
        >
      </label>
    </div>
  </form>
</template>
