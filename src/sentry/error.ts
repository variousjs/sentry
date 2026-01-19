import * as Sentry from '@sentry/browser'

export default (
  event: ErrorEvent,
  whiteScreenChecker: () => boolean,
) => {
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
      Sentry.captureException(new Error('resourceError'))
    })

    return
  }

  const isError = event.error instanceof Error
  const level = whiteScreenChecker()
    ? 'fatal'
    : (isError ? 'error' : 'warning')

  Sentry.withScope((scope) => {
    scope.setLevel(level)
    scope.setTag('errorType', 'error')
    scope.setTag('errorName', event.error?.name)
    Sentry.captureException(event.error || event.message)
  })
}
