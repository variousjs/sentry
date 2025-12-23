import * as Sentry from '@sentry/browser'

export interface BizError {
  path: string,
  code: number | string,
  message: string,
  extras?: Record<string, any>,
  level?: 'error' | 'warning',
}

export default (data: BizError) => {
  Sentry.withScope((scope) => {
    scope.setLevel(data.level || 'error')
    scope.setTag('errorType', 'bizError')
    scope.setTag('apiPath', data.path)
    scope.setExtras(data.extras || {})
    Sentry.captureException(data.message || 'api biz error')
  })
}
