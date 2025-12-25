### HTML Script

```html
<script>
window.sentry_ttiStartTime = +new Date()
window.sentry_unhandledErrors = []
window.sentry_errorErrors = []

window.addEventListener('unhandledrejection', (event) => {
  if (window.sentry_captureUnhandled) {
    window.sentry_captureUnhandled(event)
  } else {
    window.sentry_unhandledErrors.push(event)
  }
})
window.addEventListener('error', (event) => {
  if (window.sentry_captureError) {
    window.sentry_captureError(event)
  } else {
    window.sentry_errorErrors.push(event)
  }
}, true)
</script>
```
