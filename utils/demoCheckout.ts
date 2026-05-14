export type DemoCardDraft = {
  name: string
  cardNumber: string
  expiry: string
  cvc: string
}

export type DemoCardErrors = Partial<Record<keyof DemoCardDraft, string>>

export const normalizeDemoCardNumber = (value: string) =>
  value.replace(/\D/g, '').slice(0, 16)

export const formatDemoCardNumber = (value: string) =>
  normalizeDemoCardNumber(value).replace(/(\d{4})(?=\d)/g, '$1 ')

export const formatDemoExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4)

  if (digits.length <= 2) {
    return digits
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export const validateDemoCard = (draft: DemoCardDraft) => {
  const errors: DemoCardErrors = {}
  const cardNumber = normalizeDemoCardNumber(draft.cardNumber)
  const expiryMatch = draft.expiry.match(/^(\d{2})\/(\d{2})$/)

  if (draft.name.trim().length < 2) {
    errors.name = 'Enter a name'
  }

  if (cardNumber.length !== 16) {
    errors.cardNumber = 'Enter 16 digits'
  }

  if (!expiryMatch) {
    errors.expiry = 'Use MM/YY'
  } else {
    const month = Number(expiryMatch[1])
    const year = 2000 + Number(expiryMatch[2])
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    if (month < 1 || month > 12) {
      errors.expiry = 'Use MM/YY'
    } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.expiry = 'Use MM/YY'
    }
  }

  if (!/^\d{3}$/.test(draft.cvc)) {
    errors.cvc = 'Enter 3 digits'
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0
  }
}
