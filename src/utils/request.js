import axios from 'axios'
import { BASEURL } from './base_url'

// axios实例
const instance = axios.create({
  baseURL: BASEURL
})

// 请求拦截器
instance.interceptors.request.use(
  function (config) {
    // 需要在请求头中携带token的请求URL的集合
    const Required_WithToken_URLS = ['/houses/params', '/user', '/user/houses']
    let token = localStorage.getItem('haoke_token')

    // 对于动态路由，需要使用正则判断是否以某个URL请求开头
    let favouriteReg = /^\/user\/favorites\//.test(config.url)

    // 如果已登录，就在发送以下请求时自动添加请求头携带token
    // 如果是动态路由，则以URL接口前缀是否符合需求，符合需求则自动添加请求头携带token
    if (token) {
      if (Required_WithToken_URLS.includes(config.url)) {
        config.headers.authorization = token
      } else if (favouriteReg) {
        config.headers.authorization = token
      }
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  function (response) {
    // 简化一步取值
    return response.data
  },
  function (error) {
    return Promise.reject(error)
  }
)

export default instance
