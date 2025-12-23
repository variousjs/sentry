import * as Sentry from '@sentry/browser'

export default (event: PromiseRejectionEvent) => {
  Sentry.withScope((scope) => {
    scope.setLevel('warning')
    scope.setTag('errorType', 'unhandledError')
    scope.setTag('errorName', event.reason?.name)
    Sentry.captureException(event.reason)
  })
}
