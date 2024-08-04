import debug from 'debug'

import { DESKTOP_USER_AGENT, request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-stripchat')

function getRoomIdByUrl(url) {
  return new URL(url).pathname.split('/')[1]
}

async function baseGetStripchatLiveUrlsPlugin(roomUrl, others = {}) {
  const modelName = getRoomIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('modelName:', modelName, 'cookie:', cookie, 'proxy:', proxy)

  const response = (
    await request(`https://zh.stripchat.com/api/front/v2/models/username/${modelName}/chat`, {
      method: 'get',
      proxy,
      headers: {
        // cookie,
        // 'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'User-Agent': DESKTOP_USER_AGENT ,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      	"Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
      	"Accept-Encoding": "gzip, deflate",
      	"Upgrade-Insecure-Requests": "1",
      	"Sec-Fetch-Dest": "document",
      	"Sec-Fetch-Mode": "navigate",
      	"Sec-Fetch-Site": "none",
      	"Sec-Fetch-User": "?1",
      	"Te": "trailers"
      	// "Connection": "close"
      }
    })
  ).data

  // const scriptReg = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  // const matches = htmlContent.match(scriptReg)

  const modelID=JSON.parse(data)

  const errMessage=response.errmsg
  
  if (response.data.messages.length > 2) {
    const roomId = response.data.messages[0].modelID
  } else {
    const roomId= 'OffLine'
  }



  const url = `https://edge-hls.doppiocdn.com/hls/${roomId}/master/${roomId}_auto.m3u8?playlistType=lowLatency`
  





  
  return {
    code: SUCCESS_CODE,
    liveUrls: [url]
  }
}

export const getStripchatLiveUrlsPlugin = captureError(baseGetStripchatLiveUrlsPlugin)
