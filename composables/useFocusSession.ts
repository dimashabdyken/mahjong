const FOCUS_DURATIONS = [10, 15, 25] as const

export type FocusDuration = typeof FOCUS_DURATIONS[number]

export const useFocusSession = () => {
  const selectedDuration = ref<FocusDuration>(15)
  const remainingSeconds = ref(0)
  const completed = ref(false)
  const timerId = ref<ReturnType<typeof setInterval> | null>(null)

  const isFocusActive = computed(() => remainingSeconds.value > 0)
  const formattedTime = computed(() => {
    const minutes = Math.floor(remainingSeconds.value / 60)
    const seconds = remainingSeconds.value % 60

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  const clearTimer = () => {
    if (timerId.value) {
      clearInterval(timerId.value)
      timerId.value = null
    }
  }

  const stopFocusSession = () => {
    clearTimer()
    remainingSeconds.value = 0
  }

  const startFocusSession = () => {
    clearTimer()
    completed.value = false
    remainingSeconds.value = selectedDuration.value * 60

    timerId.value = setInterval(() => {
      remainingSeconds.value = Math.max(0, remainingSeconds.value - 1)

      if (remainingSeconds.value === 0) {
        completed.value = true
        clearTimer()
      }
    }, 1000)
  }

  onBeforeUnmount(clearTimer)

  return {
    durations: FOCUS_DURATIONS,
    selectedDuration,
    remainingSeconds,
    isFocusActive,
    completed,
    formattedTime,
    startFocusSession,
    stopFocusSession
  }
}
