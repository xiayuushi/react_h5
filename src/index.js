import React, { Component } from 'react'
import ReactDOM from 'react-dom'

// 顶级组件
import App from './App'

// 样式重置
import './asstes/css/reset.css'
// 自动获取屏幕尺寸设置根节点字体大小，方便后续使用rem单位
import './asstes/js/set_root'
// 字体图标
import './asstes/css/iconfont.css'

// react-redux优化redux的使用
import { Provider } from 'react-redux'
// redux数据
import store from './store'
// antd-mobile UI库
import 'antd-mobile/dist/antd-mobile.css'
// axios实例
import request from './utils/request'
// 将封装好的axios实例绑定到组件Component的原型上，以便在全局使用
Component.prototype.$request = request

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
