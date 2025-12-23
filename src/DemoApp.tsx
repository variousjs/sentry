import React, { useState, lazy } from 'react'
import { fetchWithTimeout } from './helper'
import { captureBizException, reportTTI } from './sentry'

const Part = lazy(() => import('./part'))

const DemoApp: React.FC = () => {
  const [state, setState] = useState<any>()

  const handleCaptureException = () => {
    // setState({})
    // fetchWithTimeout('https://tools-httpstatus.pickup-services.com/502', {}, 1000)
    //   .then((res) => res.json())
    //   .then((json) => console.log(json))
    //   .catch((err) => console.log(err))

    // const xhr = new XMLHttpRequest()
    // xhr.open('GET', 'https://tools-httpstatus.pickup-services.com/400')
    // xhr.send()

    // captureBizException({
    //   path: '/api/400',
    //   code: 1123,
    //   message: 'unauthorized err',
    //   extras: {
    //     userId: '123456',
    //   },
    // })

    reportTTI()
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {
        state ? <p>{state.p.d}</p> : null
      }
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handleCaptureException}
          style={{ marginRight: '10px', padding: '10px 20px', fontSize: '16px' }}
        >
          Capture Exception
        </button>
      </div>
      <Part />
    </div>
  )
}

export default DemoApp
