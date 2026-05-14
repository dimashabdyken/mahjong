<script setup lang="ts">
const { signUp } = useAuth()
const formatError = friendlyError

const email = ref('')
const password = ref('')
const nickname = ref('')
const city = ref('Almaty')
const errorMessage = ref('')
const pending = ref(false)

const submit = async () => {
  errorMessage.value = ''
  pending.value = true

  try {
    await signUp(email.value, password.value, {
      nickname: nickname.value,
      city: city.value
    })
  } catch (error) {
    errorMessage.value = formatError(
      error instanceof Error ? error.message : '',
      'Registration failed.'
    )
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section class="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-lg items-center px-3 py-8 sm:px-4 sm:py-12">
    <form class="panel w-full p-5 sm:p-10" @submit.prevent="submit">
      <h2 class="text-2xl font-semibold">Create your arena profile</h2>
      <p class="mt-2 text-sm leading-6 text-ink/60 dark:text-porcelain/60">
        Join Daily Challenge, save clears, and appear on city leaderboards.
      </p>

      <label class="mt-6 block text-sm font-medium" for="nickname">Nickname</label>
      <input
        id="nickname"
        v-model="nickname"
        class="focus-ring mt-2 w-full rounded-lg border border-ink/15 bg-rice px-4 py-3.5 text-ink transition placeholder:text-ink/35 hover:border-ink/25 dark:border-porcelain/15 dark:bg-ink dark:text-porcelain dark:placeholder:text-porcelain/35 dark:hover:border-porcelain/25"
        required
        type="text"
      >

      <label class="mt-4 block text-sm font-medium" for="city">City</label>
      <input
        id="city"
        v-model="city"
        class="focus-ring mt-2 w-full rounded-lg border border-ink/15 bg-rice px-4 py-3.5 text-ink transition placeholder:text-ink/35 hover:border-ink/25 dark:border-porcelain/15 dark:bg-ink dark:text-porcelain dark:placeholder:text-porcelain/35 dark:hover:border-porcelain/25"
        required
        type="text"
      >

      <label class="mt-4 block text-sm font-medium" for="email">Email</label>
      <input
        id="email"
        v-model="email"
        class="focus-ring mt-2 w-full rounded-lg border border-ink/15 bg-rice px-4 py-3.5 text-ink transition placeholder:text-ink/35 hover:border-ink/25 dark:border-porcelain/15 dark:bg-ink dark:text-porcelain dark:placeholder:text-porcelain/35 dark:hover:border-porcelain/25"
        required
        type="email"
      >

      <label class="mt-4 block text-sm font-medium" for="password">Password</label>
      <input
        id="password"
        v-model="password"
        class="focus-ring mt-2 w-full rounded-lg border border-ink/15 bg-rice px-4 py-3.5 text-ink transition placeholder:text-ink/35 hover:border-ink/25 dark:border-porcelain/15 dark:bg-ink dark:text-porcelain dark:placeholder:text-porcelain/35 dark:hover:border-porcelain/25"
        minlength="6"
        required
        type="password"
      >

      <p v-if="errorMessage" class="mt-4 rounded-lg border border-ember/20 bg-ember/10 px-4 py-3 text-sm font-medium text-ember">
        {{ errorMessage }}
      </p>

      <button
        class="button-primary mt-6 w-full py-3.5"
        :disabled="pending"
        type="submit"
      >
        {{ pending ? 'Creating account...' : 'Register' }}
      </button>

      <p class="mt-5 text-center text-sm text-ink/60 dark:text-porcelain/60">
        Already registered?
        <NuxtLink class="font-semibold text-jade hover:text-moss" to="/login">Login</NuxtLink>
      </p>
    </form>
  </section>
</template>
