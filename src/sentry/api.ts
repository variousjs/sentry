import { ErrorEvent } from '@sentry/browser'

export default (event: ErrorEvent) => {
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
}
