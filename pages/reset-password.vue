<script setup lang="ts">
const { updatePassword, signOut } = useAuth()
const supabase = useSupabase()
const route = useRoute()
const formatError = friendlyError

const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const checkingSession = ref(true)
const hasRecoverySession = ref(false)
const pending = ref(false)

const validatePassword = () => {
  if (!password.value) {
    return 'Password is required.'
  }

  if (password.value.length < 6) {
    return 'Password must be at least 6 characters.'
  }

  if (password.value !== confirmPassword.value) {
    return 'Passwords must match.'
  }

  return ''
}

const checkRecoverySession = async () => {
  checkingSession.value = true
  errorMessage.value = ''

  try {
    if (typeof route.query.code === 'string') {
      await supabase.auth.exchangeCodeForSession(route.query.code)
      await navigateTo('/reset-password', { replace: true })
    }

    const { data } = await supabase.auth.getSession()
    hasRecoverySession.value = Boolean(data.session)
  } catch (error) {
    errorMessage.value = formatError(
      error instanceof Error ? error.message : '',
      'Reset link could not be verified.'
    )
    hasRecoverySession.value = false
  } finally {
    checkingSession.value = false
  }
}

const submit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  const validationError = validatePassword()

  if (validationError) {
    errorMessage.value = validationError
    return
  }

  pending.value = true

  try {
    await updatePassword(password.value)
    password.value = ''
    confirmPassword.value = ''
    successMessage.value = 'Password updated.'
    await signOut()
    await navigateTo('/login')
  } catch (error) {
    errorMessage.value = formatError(
      error instanceof Error ? error.message : '',
      'Could not update password.'
    )
  } finally {
    pending.value = false
  }
}

onMounted(checkRecoverySession)
</script>

<template>
  <section class="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-lg items-center px-3 py-8 sm:px-4 sm:py-12">
    <div class="panel w-full p-5 sm:p-10">
      <h2 class="text-2xl font-semibold">Set new password</h2>

      <div v-if="checkingSession" class="mt-6">
        <div class="h-5 w-44 rounded-lg bg-ink/10 dark:bg-porcelain/10" />
        <div class="mt-4 h-12 rounded-lg bg-ink/5 dark:bg-porcelain/10" />
      </div>

      <form v-else-if="hasRecoverySession" class="mt-6" @submit.prevent="submit">
        <label class="block text-sm font-medium" for="new-password">New password</label>
        <input
          id="new-password"
          v-model="password"
          autocomplete="new-password"
          class="focus-ring mt-2 w-full rounded-lg border border-ink/15 bg-rice px-4 py-3.5 text-ink transition placeholder:text-ink/35 hover:border-ink/25 dark:border-porcelain/15 dark:bg-ink dark:text-porcelain dark:placeholder:text-porcelain/35 dark:hover:border-porcelain/25"
          minlength="6"
          required
          type="password"
        >

        <label class="mt-4 block text-sm font-medium" for="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          v-model="confirmPassword"
          autocomplete="new-password"
          class="focus-ring mt-2 w-full rounded-lg border border-ink/15 bg-rice px-4 py-3.5 text-ink transition placeholder:text-ink/35 hover:border-ink/25 dark:border-porcelain/15 dark:bg-ink dark:text-porcelain dark:placeholder:text-porcelain/35 dark:hover:border-porcelain/25"
          minlength="6"
          required
          type="password"
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
          {{ pending ? 'Updating...' : 'Update password' }}
        </button>
      </form>

      <div v-else class="mt-6">
        <p class="rounded-lg border border-ember/20 bg-ember/10 px-4 py-3 text-sm font-medium leading-6 text-ember">
          Reset link is missing or expired. Request a new reset link.
        </p>
        <NuxtLink class="button-primary mt-5 w-full py-3.5" to="/forgot-password">
          Send reset link
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
