import React, { useState } from 'react'
import { fetchWithTimeout } from './helper'

const DemoApp: React.FC = () => {
  const [state, setState] = useState<any>()

  const handleCaptureException = () => {
    // setState({})
    // fetchWithTimeout('https://dummyjson.com/auth/me', {}, 800)
    //   .then((res) => res.json())
    //   .then((json) => console.log(json))
    //   .catch((err) => console.log(err))

    const testUrls = [
  'https://tools-httpstatus.pickup-services.com/400',  // Bad Request
  'https://tools-httpstatus.pickup-services.com/502',  // Bad Request
];

testUrls.forEach(url => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.send();
});

fetch('https://dummyjson.com/auth/me')
  .then(response => response.json())
  .then(data => console.log(data));
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
