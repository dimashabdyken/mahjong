const protectedRoutes = ['/profile']
const guestOnlyRoutes = ['/login', '/register']

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }

  const { user, refreshUser } = useAuth()

  if (!user.value) {
    await refreshUser()
  }

  if (protectedRoutes.some((path) => to.path.startsWith(path)) && !user.value) {
    return navigateTo('/login')
  }

  if (guestOnlyRoutes.includes(to.path) && user.value) {
    return navigateTo('/profile')
  }
})
