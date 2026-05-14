export const friendlyError = (
  message: string | undefined,
  fallback = 'Something went wrong. Please try again.'
) => {
  if (!message) {
    return fallback
  }

  const lower = message.toLowerCase()

  if (lower.includes('invalid login credentials')) {
    return 'Email or password is incorrect.'
  }

  if (lower.includes('already registered') || lower.includes('already exists')) {
    return 'An account with this email already exists.'
  }

  if (lower.includes('row-level security') || lower.includes('permission denied')) {
    return 'You do not have permission to perform this action.'
  }

  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Network request failed. Check your connection and try again.'
  }

  if (lower.includes('jwt') || lower.includes('session')) {
    return 'Your session expired. Please log in again.'
  }

  return message.length > 140 ? fallback : message
}
