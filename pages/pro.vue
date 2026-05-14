<script setup lang="ts">
import {
  formatDemoCardNumber,
  formatDemoExpiry,
  validateDemoCard,
  type DemoCardErrors
} from '~/utils/demoCheckout'

const plan = useProfilePlan()
const isPro = plan.isPro
const planLoading = plan.loading
const planLoaded = plan.loaded
const saving = plan.saving
const planError = plan.error
const checkoutOpen = ref(false)
const checkoutSuccess = ref(false)
const checkoutErrors = ref<DemoCardErrors>({})
const checkoutSubmitted = ref(false)
const checkingPlan = computed(() => planLoading.value && !planLoaded.value && !isPro.value)
const showFreeProPage = computed(() => planLoaded.value && !isPro.value)
const showActiveProPage = computed(() => isPro.value)
const touchedFields = reactive<Record<keyof DemoCardErrors, boolean>>({
  name: false,
  cardNumber: false,
  expiry: false,
  cvc: false
})
const checkoutDraft = reactive({
  name: '',
  cardNumber: '',
  expiry: '',
  cvc: ''
})

const freeFeatures = [
  'Classic Mahjong',
  'Daily Challenge',
  'Basic leaderboards',
  'Limited AI Coach'
]

const proFeatures = [
  'Deeper AI Coach',
  'Premium tile skins',
  'Cultural tile themes',
  'Advanced progress insights',
  'Focus sessions'
]

const activeProFeatures = [
  {
    title: 'Deeper AI Coach',
    text: 'Use deeper move analysis while playing.',
    action: 'Try AI Coach',
    to: '/play'
  },
  {
    title: 'Cultural tile themes',
    text: 'Premium tile themes and board layouts are unlocked.',
    action: 'Customize board',
    to: '/play'
  },
  {
    title: 'Progress insights',
    text: 'Review your performance patterns from your profile.',
    action: 'View profile',
    to: '/profile'
  },
  {
    title: 'Focus sessions',
    text: 'Use timed focus sessions while playing.',
    action: 'Start focus',
    to: '/play'
  }
]

const proQuickActions = [
  { label: 'Open Play', to: '/play', primary: true },
  { label: 'View profile', to: '/profile', primary: false },
  { label: 'Leaderboards', to: '/leaderboards', primary: false }
]

const unlockedBenefits = [
  { label: 'Advanced AI Coach', value: 'Enabled' },
  { label: 'Premium themes', value: 'Unlocked' },
  { label: 'Progress insights', value: 'Active' },
  { label: 'Focus sessions', value: 'Available' }
]

const proHowToUse = [
  'Use AI Coach on Play for stronger move analysis.',
  'Choose premium tile themes and layouts in Board setup.',
  'Check Profile for progress insights.',
  'Start Focus sessions from the Play page.'
]

const resetCheckout = () => {
  checkoutDraft.name = ''
  checkoutDraft.cardNumber = ''
  checkoutDraft.expiry = ''
  checkoutDraft.cvc = ''
  checkoutErrors.value = {}
  checkoutSubmitted.value = false
  touchedFields.name = false
  touchedFields.cardNumber = false
  touchedFields.expiry = false
  touchedFields.cvc = false
}

const openDemoCheckout = () => {
  if (isPro.value) {
    checkoutOpen.value = false
    return
  }

  checkoutSuccess.value = false
  resetCheckout()
  checkoutOpen.value = true
}

const closeDemoCheckout = () => {
  resetCheckout()
  checkoutOpen.value = false
}

const updateCardNumber = (event: Event) => {
  touchedFields.cardNumber = true
  checkoutDraft.cardNumber = formatDemoCardNumber(
    (event.target as HTMLInputElement).value
  )
}

const updateExpiry = (event: Event) => {
  touchedFields.expiry = true
  checkoutDraft.expiry = formatDemoExpiry((event.target as HTMLInputElement).value)
}

const updateCvc = (event: Event) => {
  touchedFields.cvc = true
  checkoutDraft.cvc = (event.target as HTMLInputElement).value
    .replace(/\D/g, '')
    .slice(0, 3)
}

const touchField = (field: keyof DemoCardErrors) => {
  touchedFields[field] = true
}

const shouldShowError = (field: keyof DemoCardErrors) =>
  Boolean(checkoutErrors.value[field] && (checkoutSubmitted.value || touchedFields[field]))

const submitDemoCheckout = async () => {
  checkoutSubmitted.value = true
  const result = validateDemoCard(checkoutDraft)
  checkoutErrors.value = result.errors

  if (!result.valid) {
    return
  }

  const activated = await plan.activatePro()
  resetCheckout()

  if (activated) {
    checkoutOpen.value = false
    checkoutSuccess.value = true
  }
}

onMounted(plan.fetchPlan)

watch(isPro, (active) => {
  if (active) {
    checkoutOpen.value = false
  }
})
</script>

<template>
  <section class="page-shell">
    <div v-if="!showActiveProPage" class="max-w-3xl min-w-0">
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="page-title">Mahjong Focus Arena Pro</h1>
      </div>
      <p
        v-if="checkingPlan"
        class="mt-4 max-w-2xl text-base leading-7 text-ink/65 dark:text-porcelain/65"
      >
        Checking your Pro status.
      </p>
      <p
        v-else-if="showFreeProPage"
        class="mt-4 max-w-2xl text-base leading-7 text-ink/65 dark:text-porcelain/65"
      >
        Unlock cultural tile themes, premium tile skins, deeper AI Coach, and advanced progress insights.
      </p>
      <div
        v-else
        class="soft-panel mt-5 max-w-xl p-4 text-sm font-semibold leading-6 text-jade"
      >
        Your account has Pro enabled.
      </div>

      <div
        v-if="checkingPlan"
        class="mt-6 grid gap-3 sm:flex sm:flex-wrap"
      >
        <div
          class="h-[3.25rem] w-36 rounded-lg bg-ink/10 dark:bg-porcelain/10"
          aria-hidden="true"
        />
      </div>
      <div
        v-else-if="showFreeProPage"
        class="mt-6 grid gap-3 sm:flex sm:flex-wrap"
      >
        <button
          class="button-premium shadow-sm shadow-ink/10"
          type="button"
          @click="openDemoCheckout"
        >
          Upgrade to Pro
        </button>
        <NuxtLink
          class="button-secondary"
          to="/play"
        >
          Keep playing free
        </NuxtLink>
      </div>

      <div
        v-if="checkoutSuccess"
        class="soft-panel mt-5 max-w-xl p-4 text-sm font-semibold leading-6 text-jade"
      >
        Pro activated.
      </div>

      <div
        v-if="planError"
        class="mt-5 max-w-xl rounded-lg border border-ember/20 bg-ember/10 p-4 text-sm font-semibold leading-6 text-ember"
      >
        {{ planError }}
      </div>
    </div>

    <div v-else class="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-stretch">
      <div class="flex flex-col rounded-lg border border-lacquer/20 bg-rice p-5 shadow-soft dark:border-porcelain/12 dark:bg-porcelain/10 sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="page-title">Your Pro is active</h1>
              <span class="rounded-md border border-jade/25 bg-mist px-3 py-1 text-sm font-semibold text-jade dark:bg-porcelain/10">
                Pro active
              </span>
            </div>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-ink/65 dark:text-porcelain/65 sm:text-base">
              Advanced coaching, premium themes, and progress insights are unlocked.
            </p>
          </div>
        </div>

        <div class="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <NuxtLink
            v-for="action in proQuickActions"
            :key="action.to"
            :class="action.primary ? 'button-primary' : 'button-secondary'"
            :to="action.to"
          >
            {{ action.label }}
          </NuxtLink>
        </div>
      </div>

      <div class="min-w-0 rounded-lg border border-ink/10 bg-white/70 p-5 shadow-sm shadow-ink/5 dark:border-porcelain/10 dark:bg-porcelain/[0.05]">
        <h2 class="text-lg font-semibold">Unlocked benefits</h2>
        <div class="mt-4 grid gap-3">
          <div
            v-for="benefit in unlockedBenefits"
            :key="benefit.label"
            class="flex flex-col gap-1.5 border-b border-ink/10 pb-3 last:border-b-0 last:pb-0 dark:border-porcelain/10 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <span class="text-sm font-medium text-ink/65 dark:text-porcelain/65">{{ benefit.label }}</span>
            <span class="rounded-md bg-mist px-2.5 py-1 text-xs font-semibold text-jade dark:bg-porcelain/10">
              {{ benefit.value }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showFreeProPage"
      class="mt-8 grid min-w-0 gap-4 lg:grid-cols-2"
    >
      <div class="rounded-lg border border-ink/10 bg-white/70 p-5 shadow-sm shadow-ink/5 motion-safe:transition motion-safe:duration-150 motion-safe:ease-out hover:border-ink/15 hover:shadow-soft dark:border-porcelain/10 dark:bg-porcelain/[0.04]">
        <div class="flex flex-wrap items-baseline justify-between gap-4">
          <h2 class="text-2xl font-semibold">Free</h2>
          <p class="text-lg font-semibold">$0</p>
        </div>
        <ul class="mt-5 space-y-3 text-sm text-ink/65 dark:text-porcelain/65">
          <li v-for="feature in freeFeatures" :key="feature" class="flex gap-3">
            <span class="mt-2 h-1.5 w-1.5 rounded-lg bg-moss" />
            <span>{{ feature }}</span>
          </li>
        </ul>
      </div>

      <div class="rounded-lg border border-lacquer/35 bg-rice p-5 shadow-soft motion-safe:transition motion-safe:duration-150 motion-safe:ease-out hover:border-lacquer/50 hover:shadow-tile dark:border-porcelain/20 dark:bg-porcelain/10">
        <div class="flex flex-wrap items-baseline justify-between gap-4">
          <h2 class="text-2xl font-semibold">Pro</h2>
          <p class="text-lg font-semibold">$6/mo</p>
        </div>
        <ul class="mt-5 space-y-3 text-sm text-ink/75 dark:text-porcelain/75">
          <li v-for="feature in proFeatures" :key="feature" class="flex gap-3">
            <span class="mt-2 h-1.5 w-1.5 rounded-lg bg-jade" />
            <span>{{ feature }}</span>
          </li>
        </ul>
        <button
          class="button-premium mt-6 w-full"
          type="button"
          @click="openDemoCheckout"
        >
          Upgrade to Pro
        </button>
      </div>
    </div>

    <div v-if="!checkingPlan" class="mt-6">
      <h2 class="text-2xl font-semibold">{{ showActiveProPage ? 'Pro tools' : 'What Pro unlocks' }}</h2>
      <div v-if="showFreeProPage" class="mt-4">
        <ProFeatureGrid />
      </div>
      <div
        v-else
        class="mt-4 grid gap-4 md:grid-cols-2"
      >
        <article
          v-for="feature in activeProFeatures"
          :key="feature.title"
          class="flex min-h-[12rem] flex-col rounded-lg border border-ink/10 bg-rice/70 p-5 shadow-sm shadow-ink/5 dark:border-porcelain/10 dark:bg-porcelain/[0.05]"
        >
          <div class="flex items-start justify-between gap-3">
            <h3 class="font-semibold">{{ feature.title }}</h3>
            <span class="rounded-md border border-jade/25 bg-mist px-2 py-1 text-xs font-semibold text-jade dark:bg-porcelain/10">
              Active
            </span>
          </div>
          <p class="mt-3 min-h-[3rem] text-sm leading-6 text-ink/65 dark:text-porcelain/65">
            {{ feature.text }}
          </p>
          <NuxtLink
            v-if="feature.to"
            class="button-secondary mt-auto inline-flex px-3 py-2 text-sm"
            :to="feature.to"
          >
            {{ feature.action }}
          </NuxtLink>
        </article>
      </div>
    </div>

    <div
      v-if="showActiveProPage"
      class="mt-6 rounded-lg border border-ink/10 bg-white/70 p-4 shadow-sm shadow-ink/5 dark:border-porcelain/10 dark:bg-porcelain/[0.05] sm:p-5"
    >
      <h2 class="text-lg font-semibold">How to use Pro</h2>
      <ul class="mt-3 grid gap-3 text-sm leading-5 text-ink/65 dark:text-porcelain/65 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="item in proHowToUse"
          :key="item"
          class="rounded-lg bg-mist px-3.5 py-2.5 dark:bg-porcelain/10"
        >
          {{ item }}
        </li>
      </ul>
    </div>

    <div
      v-if="checkoutOpen && !isPro"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/28 px-3 py-4 backdrop-blur-[2px] dark:bg-ink/55 sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-checkout-title"
    >
      <form
        class="max-h-full w-full max-w-[34rem] overflow-y-auto rounded-lg border border-ink/10 bg-porcelain p-5 shadow-[0_18px_48px_oklch(21%_0.028_154_/_0.18)] dark:border-porcelain/12 dark:bg-ink sm:p-7"
        @submit.prevent="submitDemoCheckout"
      >
        <div class="relative pr-12">
          <div>
            <h2 id="demo-checkout-title" class="text-2xl font-semibold text-ink dark:text-porcelain">Activate Pro</h2>
          </div>
          <button
            aria-label="Close demo checkout"
            class="focus-ring absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg border border-ink/10 bg-rice/70 text-xl leading-none text-ink/60 transition hover:border-ink/15 hover:bg-mist hover:text-ink dark:border-porcelain/10 dark:bg-porcelain/10 dark:text-porcelain/65 dark:hover:bg-porcelain/15 dark:hover:text-porcelain"
            type="button"
            @click="closeDemoCheckout"
          >
            ×
          </button>
        </div>

        <p
          v-if="planError"
          class="mt-4 rounded-lg border border-ember/20 bg-ember/10 px-3.5 py-3 text-sm font-semibold text-ember"
        >
          {{ planError }}
        </p>

        <div class="mt-6 grid gap-5">
          <label class="block text-sm font-medium" for="card-name">
            Cardholder name
            <input
              id="card-name"
              v-model="checkoutDraft.name"
              autocomplete="off"
              class="focus-ring mt-2 w-full rounded-lg border border-ink/10 bg-rice/80 px-3.5 py-3 text-ink shadow-sm shadow-ink/5 dark:border-porcelain/10 dark:bg-porcelain/5 dark:text-porcelain"
              type="text"
              @blur="touchField('name')"
            >
            <span v-if="shouldShowError('name')" class="mt-1.5 block text-sm font-semibold text-ember">
              {{ checkoutErrors.name }}
            </span>
          </label>

          <label class="block text-sm font-medium" for="card-number">
            Card number
            <input
              id="card-number"
              :value="checkoutDraft.cardNumber"
              autocomplete="off"
              class="focus-ring mt-2 w-full rounded-lg border border-ink/10 bg-rice/80 px-3.5 py-3 text-ink shadow-sm shadow-ink/5 dark:border-porcelain/10 dark:bg-porcelain/5 dark:text-porcelain"
              inputmode="numeric"
              maxlength="19"
              placeholder="1234 5678 9012 3456"
              type="text"
              @blur="touchField('cardNumber')"
              @input="updateCardNumber"
            >
            <span v-if="shouldShowError('cardNumber')" class="mt-1.5 block text-sm font-semibold text-ember">
              {{ checkoutErrors.cardNumber }}
            </span>
          </label>

          <div class="grid gap-5 sm:grid-cols-2">
            <label class="block text-sm font-medium" for="card-expiry">
              Expiry
              <input
                id="card-expiry"
                :value="checkoutDraft.expiry"
                autocomplete="off"
                class="focus-ring mt-2 w-full rounded-lg border border-ink/10 bg-rice/80 px-3.5 py-3 text-ink shadow-sm shadow-ink/5 dark:border-porcelain/10 dark:bg-porcelain/5 dark:text-porcelain"
                inputmode="numeric"
                maxlength="5"
                placeholder="MM/YY"
                type="text"
                @blur="touchField('expiry')"
                @input="updateExpiry"
              >
              <span v-if="shouldShowError('expiry')" class="mt-1.5 block text-sm font-semibold text-ember">
                {{ checkoutErrors.expiry }}
              </span>
            </label>

            <label class="block text-sm font-medium" for="card-cvc">
              CVC
              <input
                id="card-cvc"
                :value="checkoutDraft.cvc"
                autocomplete="off"
                class="focus-ring mt-2 w-full rounded-lg border border-ink/10 bg-rice/80 px-3.5 py-3 text-ink shadow-sm shadow-ink/5 dark:border-porcelain/10 dark:bg-porcelain/5 dark:text-porcelain"
                inputmode="numeric"
                maxlength="3"
                type="text"
                @blur="touchField('cvc')"
                @input="updateCvc"
              >
              <span v-if="shouldShowError('cvc')" class="mt-1.5 block text-sm font-semibold text-ember">
                {{ checkoutErrors.cvc }}
              </span>
            </label>
          </div>
        </div>

        <button
          class="button-premium mt-7 w-full py-3.5"
          :disabled="saving"
          type="submit"
        >
          {{ saving ? 'Activating...' : 'Activate Pro' }}
        </button>
      </form>
    </div>
  </section>
</template>
