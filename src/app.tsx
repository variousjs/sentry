import React from 'react'
import ReactDOM from 'react-dom/client'
import DemoApp from './DemoApp'
import * as Sentry from './sentry'

Sentry.init({
  sendDefaultPii: true,
  dsn: 'https://67759098e35c090949a86376135ebc2a@o4510468650762240.ingest.us.sentry.io/4510479671033856',
})

function throwUnhandledError() {
  // throw new Error('Unhandled Error')
  throwUnhandledError()

  // const start = Date.now();
  // // 执行大量计算
  // while(Date.now() - start < 20000) { // 卡死10秒
  //   // 密集计算
  //   for(let i = 0; i < 1000000; i++) {
  //     Math.sqrt(i) * Math.random();
  //   }
  // }
}

// setTimeout(() => {
  throwUnhandledError()
// }, 6000)

// 渲染 React 应用
ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <DemoApp />
  </React.StrictMode>
)
