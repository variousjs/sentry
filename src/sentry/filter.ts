import { ErrorEvent } from '@sentry/browser'

const reportedErrors: { traceId: string, values: string, url: string }[] = []

export default (e: ErrorEvent) => {
  const { contexts, exception, request } = e
  const { trace_id: traceId } = contexts?.trace || {}
  const { values } = exception || {}

  if (!exception || !traceId || !values) {
    return e
  }

  const valuesStr = values.map((v) => v.value).join(',')
  const { url = '' } = request || {}

  if (
    reportedErrors.find((item) =>
      item.traceId === traceId && item.values === valuesStr && item.url === url
    )
  ) {
    return null
  }

  reportedErrors.push({ traceId, values: valuesStr, url })
  return e
}
