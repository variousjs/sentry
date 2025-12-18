const checker = (dsn: string) => {
  const workerCode = `
  let url = ''
  let lastActiveTime = ''
  let memory = {}

  let status = 'alive'
  let isReport = false

  const heartbeat = () => {
    setTimeout(() => {
      if (status === 'dead') {
        if (!isReport) {
          console.log(url, lastActiveTime, memory, 'dead')
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
      status = 'alive'
      isReport = false
    }
  }
  `

  const blob = new Blob([workerCode], { type: 'application/javascript' })
  const blobUrl = URL.createObjectURL(blob)
  const worker = new Worker(blobUrl)

  let count = 1

  worker.onmessage = (e) => {
    const { data } = e
    const {
      jsHeapSizeLimit = 0,
      totalJSHeapSize = 0,
      usedJSHeapSize = 0,
    } = performance.memory || {}

    count++

    if (data.type === 'heartbeat') {
      if (count % 5 === 0) {
        return
      }

      worker.postMessage({
        type: 'heartbeat',
        time: new Date().toLocaleString(),
        url: window.location.href,
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
