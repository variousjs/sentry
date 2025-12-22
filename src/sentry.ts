import * as Sentry from '@sentry/browser'
import freezeChecker from './ui-freeze'

export * from '@sentry/browser'

const defaultWhiteScreenChecker = () => {
  return document.querySelector('#root')?.innerHTML === '' ||
    document.querySelector('#app')?.innerHTML === ''
}

let isTTIReported = false
let ttiStartTime: number | undefined

export const init = (option: Sentry.BrowserOptions & {
  whiteScreenChecker?: () => boolean,
  dsn: string,
}) => {
  ttiStartTime = +new Date()

  Sentry.init({
    ...option,
    integrations: (integrations) => integrations
      .concat(option.integrations || [], [
        Sentry.httpClientIntegration({
          failedRequestStatusCodes: [[400, 599]],
        }),
      ])
      .filter((integration) => integration.name !== 'GlobalHandlers'),
    ignoreErrors: (option.ignoreErrors || []).concat([
      /ResizeObserver loop/i,
      /extension:\/\//i,
      /Script error/i,
      /NotAllowedError/i,
    ]),
    async beforeSend(e, h) {
      const event = await option.beforeSend?.(e, h) || e
      if (!event) {
        return null
      }

      const { contexts, exception } = event
      const [{ mechanism }] = exception?.values || [{}]
      if (!mechanism) {
        return event
      }

      if (['auto.http.client.xhr', 'auto.http.client.fetch'].includes(mechanism.type)) {
        const { status_code = 0 } = contexts?.response || {}
        event.tags = { ...event.tags, status_code, errorType: 'apiError' }

        if (status_code >= 500) {
          return event
        }
        event.level = 'warning'
        return event
      }

      return event
    },
  })

  freezeChecker(option)

  window.addEventListener('unhandledrejection', (event) => {
    Sentry.withScope((scope) => {
      scope.setLevel('warning')
      scope.setTag('errorType', 'unhandledError')
      scope.setTag('errorName', event.reason?.name)
      Sentry.captureException(event.reason)
    })
  })

  window.addEventListener('error', (event) => {
    if (event.error === undefined) {
      // resource get error
      const target = event.target as HTMLImageElement

      Sentry.withScope((scope) => {
        scope.setLevel('warning')
        scope.setTags({
          errorType: 'resourceError',
          tagName: target?.tagName?.toLowerCase(),
          src: target?.src,
        })
        Sentry.captureException('resourceError')
      })

      return
    }

    const checker = option.whiteScreenChecker || defaultWhiteScreenChecker
    const level = checker() ? 'fatal' : 'error'

    Sentry.withScope((scope) => {
      scope.setLevel(level)
      scope.setTag('errorType', 'error')
      scope.setTag('errorName', event.error?.name)
      Sentry.captureException(event.error || event.message)
    })
  }, true)
}

export const captureBizException = (data: {
  path: string,
  code: number | string,
  message: string,
  extras?: Record<string, any>,
  level?: 'error' | 'warning',
}) => {
  Sentry.withScope((scope) => {
    scope.setLevel(data.level || 'error')
    scope.setTag('errorType', 'bizError')
    scope.setTag('apiPath', data.path)
    scope.setExtras(data.extras || {})
    Sentry.captureException(data.message || 'api biz error')
  })
}

export const reportTTI = () => {
  if (!ttiStartTime || isTTIReported) {
    return
  }

  isTTIReported = true

  const fp = performance.getEntriesByName('first-paint')[0]
  const fcp = performance.getEntriesByName('first-contentful-paint')[0]
  const ttiTime = +new Date() - ttiStartTime
  const pageUrl = location.origin + location.pathname

  Sentry.withScope((scope) => {
    scope.setLevel('info')
    scope.setTag('eventType', 'tti')
    scope.setTag('page', pageUrl)
    scope.setTag('time', ttiTime)
    scope.setExtras({ fp: fp.startTime, fcp: fcp.startTime })
    Sentry.captureMessage('tti report')
  })
}
