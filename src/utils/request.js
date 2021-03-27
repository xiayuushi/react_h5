import axios from 'axios'
import { BASEURL } from './base_url'

// axios实例
const instance = axios.create({
  baseURL: BASEURL
})

// 请求拦截器
instance.interceptors.request.use(
  function (config) {
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
