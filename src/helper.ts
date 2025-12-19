// fetch 支持 timeout 配置，使用 abortController 方式
export const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 5000) => {
  const controller = new AbortController()
  const signal = controller.signal

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  return fetch(url, {
    ...options,
    signal,
  }).finally(() => {
    clearTimeout(timeoutId)
  })
}
