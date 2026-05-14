<script setup lang="ts">
const { requestPasswordReset } = useAuth()
const formatError = friendlyError

const email = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const pending = ref(false)

const submit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  pending.value = true

  try {
    await requestPasswordReset(email.value)
    successMessage.value = 'Check your email for the reset link.'
  } catch (error) {
    errorMessage.value = formatError(
      error instanceof Error ? error.message : '',
      'Could not send reset link.'
    )
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section class="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-lg items-center px-3 py-8 sm:px-4 sm:py-12">
    <form class="panel w-full p-5 sm:p-10" @submit.prevent="submit">
      <h2 class="text-2xl font-semibold">Reset password</h2>
      <p class="mt-2 text-sm leading-6 text-ink/60 dark:text-porcelain/60">
        Enter your email and we will send a reset link.
      </p>

      <label class="mt-6 block text-sm font-medium" for="reset-email">Email</label>
      <input
        id="reset-email"
        v-model="email"
        autocomplete="email"
        class="focus-ring mt-2 w-full rounded-lg border border-ink/15 bg-rice px-4 py-3.5 text-ink transition placeholder:text-ink/35 hover:border-ink/25 dark:border-porcelain/15 dark:bg-ink dark:text-porcelain dark:placeholder:text-porcelain/35 dark:hover:border-porcelain/25"
        required
        type="email"
      >

      <p v-if="successMessage" class="mt-4 rounded-lg border border-jade/20 bg-mist px-4 py-3 text-sm font-semibold text-jade dark:bg-porcelain/10">
        {{ successMessage }}
      </p>

      <p v-if="errorMessage" class="mt-4 rounded-lg border border-ember/20 bg-ember/10 px-4 py-3 text-sm font-medium text-ember">
        {{ errorMessage }}
      </p>

      <button
        class="button-primary mt-6 w-full py-3.5"
        :disabled="pending"
        type="submit"
      >
        {{ pending ? 'Sending...' : 'Send reset link' }}
      </button>

      <p class="mt-5 text-center text-sm text-ink/60 dark:text-porcelain/60">
        Remembered it?
        <NuxtLink class="font-semibold text-jade hover:text-moss" to="/login">Login</NuxtLink>
      </p>
    </form>
  </section>
</template>
