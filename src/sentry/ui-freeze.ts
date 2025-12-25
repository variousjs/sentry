import * as Sentry from '@sentry/browser'

declare global {
  interface Performance {
    memory?: {
      jsHeapSizeLimit: number
      totalJSHeapSize: number
      usedJSHeapSize: number
    }
  }
}

const checker = (option: Sentry.BrowserOptions & { dsn: string }) => {
  const url = new URL(option.dsn)
  const projectId = url.pathname.slice(1)
  const ingestUrl = `https://${url.host}/api/${projectId}/envelope/?sentry_key=${url.username}`

  const workerCode = `
const ingestUrl = '${ingestUrl}'

let url = ''
let lastActiveTime = ''
let memory = {}
let user = {}

let status = 'alive'
let isReport = false

function generateEventId() {
  return crypto.randomUUID().replace(/-/g, '')
}

const report = async () => {
  const eventId = generateEventId()
  const envelopeHeader = {
    event_id: eventId,
    sent_at: new Date().toISOString(),
  }
  const itemHeader = {
    type: 'event',
    content_type: 'application/json',
  }
  const eventPayload = {
    event_id: eventId,
    timestamp: new Date().toISOString(),
    platform: 'javascript',
    level: 'fatal',
    exception: {
      values: [{
        type: 'UI Freeze',
        error: 'UI Freeze',
      }]
    },
    extra: {
      memory,
    },
    user,
    environment: ${option.environment},
    release: ${option.release},
    tags: {
      url,
      time: lastActiveTime,
    },
  }
  const envelope = [envelopeHeader, itemHeader, eventPayload].map((item) => JSON.stringify(item)).join('\\n')

  try {
    await fetch(ingestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope'
      },
      body: envelope,
      keepalive: true,
      mode: 'cors',
      credentials: 'omit'
    })
  } catch (e) {
    console.error('Sentry report failed:', e)
  }
}

const heartbeat = () => {
  setTimeout(() => {
    if (status === 'dead') {
      if (!isReport) {
        report()
      }
      isReport = true
    }
    self.postMessage({ type: 'heartbeat' })
    status = 'dead'
    heartbeat()
  }, 5000)
}

heartbeat()

self.onmessage = (e) => {
  const { data } = e
  if (data.type === 'heartbeat') {
    url = data.url
    lastActiveTime = data.time
    memory = data.memory
    user = data.user
    status = 'alive'
    isReport = false
  }
}
  `

  const blob = new Blob([workerCode], { type: 'application/javascript' })
  const blobUrl = URL.createObjectURL(blob)
  const worker = new Worker(blobUrl)

  worker.onmessage = (e) => {
    const { data } = e
    const user = Sentry.getIsolationScope().getUser()
    const {
      jsHeapSizeLimit = 0,
      totalJSHeapSize = 0,
      usedJSHeapSize = 0,
    } = performance.memory || {}

    if (data.type === 'heartbeat') {
      worker.postMessage({
        type: 'heartbeat',
        time: new Date().toISOString(),
        url: window.location.href,
        user,
        memory: {
          jsHeapSizeLimit: Math.round(jsHeapSizeLimit / 1024 / 1024),
          totalJSHeapSize: Math.round(totalJSHeapSize / 1024 / 1024),
          usedJSHeapSize: Math.round(usedJSHeapSize / 1024 / 1024),
        },
      })
    }
  }
}

export default checker
