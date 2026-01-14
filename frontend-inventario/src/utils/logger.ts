const isDev = import.meta.env.DEV ?? false

export const debug = (...args: unknown[]) => {
  if (isDev) console.debug(...args)
}
export const info = (...args: unknown[]) => {
  if (isDev) console.info(...args)
}
export const warn = (...args: unknown[]) => {
  if (isDev) console.warn(...args)
}
export const error = (...args: unknown[]) => {
  if (isDev) console.error(...args)
}

export default { debug, info, warn, error }