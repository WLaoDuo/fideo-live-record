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
  let response = (
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
  
  let modelId ="false"


  if ( response.status==200 ) {
    if(response.data.messages.length > 0) {
      modelId = response.data.messages[0].modelId
    } else {
      // console.log(response.data.messages.length,response.data)
      modelId= 'OffLine' //{"messages":[]}无数据，代表主播下线，直播间未开播
      return { code: 0}
    }
  }
///////////////////////////// get_M3u8(modelId) /////////////////////////////////////////////////////////////////////

  console.log(modelName,"modelID:",modelId)

  response = (
    await request(`https://edge-hls.doppiocdn.com/hls/${modelId}/master/${modelId}_auto.m3u8?playlistType=lowLatency`, {
      method: 'get',
      proxy, //edge-hls.doppiocdn.com可以直接访问，不必挂代理
      headers: {
        // cookie,
        // 'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'User-Agent': DESKTOP_USER_AGENT ,
      }
    })
  )
  
  const scriptReg = /(https:\/\/[\w\-\.]+\/hls\/[\d]+\/[\d\_p]+\.m3u8\?playlistType=lowLatency)/
  const matches = response.data.match(scriptReg)
  if (response.status==200 && matches && matches.length > 0) {
    let url=matches[0]
    console.log(modelName,"m3u8:",url)

//////////////////////////// test_m3u8(m3u8) ///////////////////////////////////////////////////////////////////////////////
    response = (
      await request(url, {
        method: 'get',
        proxy,
        headers: {
          // cookie,
          // 'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'User-Agent': DESKTOP_USER_AGENT ,
        }
      })
    )
    console.log(modelName,"response 3:",response.status)
    if (response.status==200){
      return {
        code: SUCCESS_CODE,
        liveUrls: [url]
      }
    }
    if (response.status==403){ //m3u8 403主播开启私人票房，普通用户看不见，=下线状态，得进入 《监控》状态
      return{ code:0 }
    }
  }
}

export const getStripchatLiveUrlsPlugin = captureError(baseGetStripchatLiveUrlsPlugin)
