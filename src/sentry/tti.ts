import * as Sentry from '@sentry/browser'

declare global {
  interface Window {
    sentry_ttiStartTime?: number
  }
}

let isTTIReported = false

export default () => {
  if (!window.sentry_ttiStartTime) {
    console.warn('ttiStartTime is not set')
    return
  }

  if (isTTIReported) {
    return
  }

  isTTIReported = true

  const fp = performance.getEntriesByName('first-paint')[0]
  const fcp = performance.getEntriesByName('first-contentful-paint')[0]
  const ttiTime = +new Date() - window.sentry_ttiStartTime
  const pageUrl = location.origin + location.pathname

  Sentry.startSpan({
    name: 'Entry Page TTI',
    op: 'page.tti',
  }, (span) => {
    span.setAttributes({
      'page.tti': ttiTime,
      'page.url': pageUrl,
      'page.fp': fp.startTime,
      'page.fcp': fcp.startTime,
    })
  })
}
