import config from '@/config.js'
import http from '@/request.js'
//调用setConfig对请求配置进行合并
const defaultConfig = {
    baseUrl: config.baseUrl
}
http.setConfig(defaultConfig)

export default http

