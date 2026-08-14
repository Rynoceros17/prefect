/** Firestore rejects `undefined` anywhere in a document — omit those fields. */
export function sanitizeForFirestore<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item)) as T
  }

  const result: Record<string, unknown> = {}
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (entry === undefined) continue
    result[key] = sanitizeForFirestore(entry)
  }
  return result as T
}
