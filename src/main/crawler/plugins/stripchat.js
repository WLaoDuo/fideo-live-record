import debug from 'debug'

import { DESKTOP_USER_AGENT, request } from '../base-request.js'
import { captureError } from '../capture-error.js'

import { SUCCESS_CODE } from '../../../code'

const log = debug('fideo-crawler-stripchat')

function getmodelIdByUrl(url) {
  return new URL(url).pathname.split('/')[1]
}



async function baseGetStripchatLiveUrlsPlugin(roomUrl, others = {}) {
  const modelName = getmodelIdByUrl(roomUrl)
  const { proxy, cookie } = others

  log('modelName:', modelName, 'cookie:', cookie, 'proxy:', proxy)
  
//////////////// get_modelId(name) ////////////////////////////////////////////////////////////
  const response1 = (
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
  )
  console.log(response1.status)
  let modelId ="false"

  if ( response1.status==200 ) {
    if(response1.data.messages.length > 2) {
      modelId = response1.data.messages[0].modelId
    } else {
      console.log(response1.data)
      modelId= 'OffLine'
      return { code: 0}
    }
  } else {
    return {code:CRAWLER_ERROR_CODE.INVALID_URL}
  }
//////////////////////////////////////////////////////////////////////////////////////////////////







  console.log("modelID:",modelId)

  const response2 = (
    await request(`https://edge-hls.doppiocdn.com/hls/${modelId}/master/${modelId}_auto.m3u8?playlistType=lowLatency`, {
      method: 'get',
      proxy,
      headers: {
        // cookie,
        // 'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'User-Agent': DESKTOP_USER_AGENT ,
      }
    })
  )
  
  // console.log(response2.data,response2.status)
  const scriptReg = /(https:\/\/[\w\-\.]+\/hls\/[\d]+\/[\d\_p]+\.m3u8\?playlistType=lowLatency)/
  const matches = response2.data.match(scriptReg)
  if (response2.status==200 && matches && matches.length > 0) {
    const url=matches[0]
    console.log(url)

    return {
      code: SUCCESS_CODE,
      liveUrls: [url]
    }
  }else{
    return {
      code:0
    }
  }

  
}

export const getStripchatLiveUrlsPlugin = captureError(baseGetStripchatLiveUrlsPlugin)
