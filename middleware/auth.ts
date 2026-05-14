export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }

  const { user, refreshUser } = useAuth()

  if (!user.value) {
    await refreshUser()
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
