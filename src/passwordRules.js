export const RULES = [
  { id: 'len', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'lower', label: 'A lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { id: 'upper', label: 'An uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'num', label: 'A number (0-9)', test: (p) => /[0-9]/.test(p) },
  { id: 'sym', label: 'A special character (. , \\ ! @ # $ ...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export const LEVELS = [
  { label: 'Too short', color: '#d93025' },
  { label: 'Very weak', color: '#d93025' },
  { label: 'Weak', color: '#ef6c00' },
  { label: 'Fair', color: '#e6b800' },
  { label: 'Good', color: '#7cb342' },
  { label: 'Strong', color: '#2e7d32' },
]

export function checkPassword(password) {
  const results = RULES.map((r) => ({ ...r, ok: r.test(password) }))
  const score = results.filter((r) => r.ok).length
  const strong = score === RULES.length
  const level = password ? LEVELS[score] : { label: '', color: '#e4dccf' }
  return { results, score, strong, level }
}