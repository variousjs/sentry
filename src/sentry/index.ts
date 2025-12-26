import * as Sentry from '@sentry/browser'
import freezeChecker from './ui-freeze'
import { defaultWhiteScreenChecker, ignoreErrors } from './config'
import apiEvent from './api'
import unhandledEvent from './unhandledrejection'
import errorEvent from './error'

export * from '@sentry/browser'
export type { BizError } from './biz'
export { default as captureBizException } from './biz'
export { default as reportTTI } from './tti'

declare global {
  interface Window {
    sentry_unhandledErrors?: Array<PromiseRejectionEvent>
    sentry_errorErrors?: Array<ErrorEvent>
    sentry_captureUnhandled?: (event: PromiseRejectionEvent) => void
    sentry_captureError?: (event: ErrorEvent) => void
  }
}

export const init = (option: Sentry.BrowserOptions & {
  whiteScreenChecker?: () => boolean,
  dsn: string,
}) => {
  const { whiteScreenChecker = defaultWhiteScreenChecker } = option

  Sentry.init({
    ...option,
    integrations: (integrations) => integrations
      .concat(option.integrations || [], [
        Sentry.httpClientIntegration({
          failedRequestStatusCodes: [[400, 599]],
        }),
      ])
      .filter((integration) => integration.name !== 'GlobalHandlers'),
    ignoreErrors: (option.ignoreErrors || []).concat(ignoreErrors),
    tracesSampleRate: 1.0,
    async beforeSend(e, h) {
      const event = await option.beforeSend?.(e, h) || e
      if (!event) {
        return null
      }

      return apiEvent(event)
    },
  })

  freezeChecker(option)

  window.sentry_captureUnhandled = unhandledEvent
  window.sentry_captureError = (e) => errorEvent(e, whiteScreenChecker)

  window.sentry_unhandledErrors?.forEach(window.sentry_captureUnhandled)
  window.sentry_errorErrors?.forEach(window.sentry_captureError)
}
