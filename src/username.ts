/* Username availability check: pure, no network. Plug in your own `taken` lookup. */

export type UsernameReason = 'empty' | 'too-short' | 'too-long' | 'invalid-chars' | 'bad-edge' | 'repeated' | 'reserved' | 'numeric' | 'taken' | 'available'

export interface UsernameResult {
  /** Normalized name (trimmed, lowercased, leading @ removed). */
  name: string
  available: boolean
  reason: UsernameReason
  /** Human-readable explanation, safe to show. */
  message: string
  /** Close alternatives when the name is taken or reserved. */
  suggestions: string[]
}

export interface UsernameOptions {
  min?: number
  max?: number
  /** Names nobody may take (admin, api, …). Merged with the built-in list. */
  reserved?: string[]
  /** Already registered names, or a function that says so. Defaults to a deterministic demo set. */
  taken?: string[] | ((name: string) => boolean)
}

export const RESERVED_NAMES = ['admin', 'root', 'support', 'help', 'api', 'www', 'mail', 'about', 'docs', 'login', 'signup', 'settings', 'billing', 'security', 'system', 'null', 'undefined', 'livatar', 'official', 'staff', 'moderator', 'me', 'you']
const DEMO_TAKEN = ['ada', 'alice', 'bob', 'nuhman', 'nuhmanpk', 'john', 'jane', 'test', 'user', 'demo', 'guest', 'hello', 'sam', 'max', 'neo']

const norm = (s: string) => s.trim().replace(/^@/, '').toLowerCase()

/**
 * Validate a username and say why it is (not) available.
 *
 *   checkUsername('ada')  // { available: false, reason: 'taken', message: '@ada is already taken', suggestions: [...] }
 */
export function checkUsername(input: string, opts: UsernameOptions = {}): UsernameResult {
  const { min = 3, max = 20 } = opts
  const name = norm(input)
  const res = (reason: UsernameReason, message: string, suggestions: string[] = []): UsernameResult => ({ name, available: reason === 'available', reason, message, suggestions })
  if (!name) return res('empty', 'Type a username to check it')
  if (name.length < min) return res('too-short', `Too short: use at least ${min} characters (${name.length} so far)`)
  if (name.length > max) return res('too-long', `Too long: ${max} characters at most (you have ${name.length})`)
  if (!/^[a-z0-9._-]+$/.test(name)) return res('invalid-chars', `Only letters, numbers, dots, dashes and underscores (found “${[...new Set(name.replace(/[a-z0-9._-]/g, ''))].join('')}”)`)
  if (/^[._-]|[._-]$/.test(name)) return res('bad-edge', 'Cannot start or end with a dot, dash or underscore')
  if (/[._-]{2}/.test(name)) return res('repeated', 'No two dots, dashes or underscores in a row')
  if (/^\d+$/.test(name)) return res('numeric', 'Cannot be only numbers, add a letter')
  const sug = (): string[] => {
    const out: string[] = []
    for (const s of [`${name}1`, `${name}_`, `the-${name}`, `${name}.dev`, `${name}${(name.length * 7) % 90 + 10}`]) {
      const n = s.slice(0, max)
      if (!isTaken(n) && !isReserved(n) && /^[a-z0-9]/.test(n) && /[a-z0-9]$/.test(n)) out.push(n)
    }
    return out.slice(0, 3)
  }
  const resv = new Set([...RESERVED_NAMES, ...(opts.reserved ?? []).map(norm)])
  const isReserved = (n: string) => resv.has(n)
  const isTaken = (n: string) => (typeof opts.taken === 'function' ? opts.taken(n) : (opts.taken ? opts.taken.map(norm) : DEMO_TAKEN).includes(n))
  if (isReserved(name)) return res('reserved', `@${name} is reserved for the system`, sug())
  if (isTaken(name)) return res('taken', `@${name} is already taken`, sug())
  return res('available', `@${name} is available`)
}
