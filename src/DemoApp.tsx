import React, { useState } from 'react'
import { fetchWithTimeout } from './helper'

const DemoApp: React.FC = () => {
  const [state, setState] = useState<any>()

  const handleCaptureException = () => {
    // setState({})
    fetchWithTimeout('https://tools-httpstatus.pickup-services.com/502', {}, 1000)
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.log(err))

    // const xhr = new XMLHttpRequest()
    // xhr.open('GET', 'https://tools-httpstatus.pickup-services.com/400')
    // xhr.send()
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {
        state ? <p>{state.p.d}</p> : null
      }
      {/* <img src="https://baidu.com/static/images/logo.svg" /> */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handleCaptureException}
          style={{ marginRight: '10px', padding: '10px 20px', fontSize: '16px' }}
        >
          Capture Exception
        </button>
      </div>
    </div>
  )
}

export default DemoApp
