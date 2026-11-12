export function normalizeContactPhone(phone: string) {
  return phone.trim().split('@', 1)[0].split(':', 1)[0]
}

export function contactDisplayName(name: string, phone: string) {
  const normalizedName = name.trim()
  return normalizedName && !normalizedName.startsWith('Cliente ')
    ? normalizedName
    : normalizeContactPhone(phone)
}

export function contactInitials(name: string, phone: string) {
  const displayName = contactDisplayName(name, phone)
  return (
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '??'
  )
}
