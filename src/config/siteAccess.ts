/** Site access password from environment — not stored in source code. */
export const SITE_PASSWORD = import.meta.env.VITE_SITE_PASSWORD ?? ''

export function isSitePasswordRequired(): boolean {
  return SITE_PASSWORD.length > 0
}
