import * as Sentry from '@sentry/browser'
import freezeChecker from './ui-freeze'

export * from '@sentry/browser'

const defaultWhiteScreenChecker = () => {
  return document.querySelector('#root')?.innerHTML === '' ||
    document.querySelector('#app')?.innerHTML === ''
}

export const init = (option: Sentry.BrowserOptions & {
  whiteScreenChecker?: () => boolean,
  dsn: string,
}) => {
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
      const [{ mechanism }] = exception?.values || []
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
      scope.setTag('errorType', 'unhandledrejection')
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
      Sentry.captureException(event.error || event.message)
    })
  }, true)
}
