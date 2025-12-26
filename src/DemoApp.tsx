import React, { lazy, useEffect, useState } from 'react'
import { fetchWithTimeout } from './helper'
import * as Sentry from './sentry'

const Part = lazy(() => import('./part'))

const DemoApp: React.FC = () => {
  const [state, setState] = useState<any>()

  useEffect(() => {
    setTimeout(() => {
      Sentry.setUser({
        id: '123456',
        email: 'user@example.com',
      })
    }, 1000)

    setTimeout(() => {
      Sentry.reportTTI()
    }, 2000)
    return () => {
      Sentry.setUser(null)
    }
  }, [])

  const handleCaptureException = async () => {
    // setState({})
    // fetchWithTimeout('https://tools-httpstatus.pickup-services.com/502', {}, 1000)
    //   .then((res) => res.json())
    //   .then((json) => console.log(json))
    //   .catch((err) => console.log(err))

    // const xhr = new XMLHttpRequest()
    // xhr.open('GET', 'https://tools-httpstatus.pickup-services.com/400')
    // xhr.send()

    // Sentry.captureBizException({
    //   path: '/api/400',
    //   code: 1123,
    //   message: 'unauthorized err',
    //   extras: {
    //     userId: '123456',
    //   },
    // })
    throw new Error('Unhandled Error')
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {
        state ? <p>{state.p.d}</p> : null
      }
      {/* <img src="https://tools-httpstatus.pickup-services.com/400" alt="400" /> */}
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
