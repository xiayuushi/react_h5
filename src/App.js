import React, { Component, Suspense, lazy } from 'react'

import { HashRouter, Switch, Route, Redirect } from 'react-router-dom'

import { withRouter } from 'react-router-dom'

// 首屏必须加载的路由组件必须使用正常导入方式
// 否则会报错：Import in body of module; reorder to top  import/first
import Layout from './pages/layout/layout.jsx'

// 除首屏必须加载的路由组件外，其余路由组件均使用lazy懒加载优化项目（打包）
const Map = lazy(() => import('./pages/map/map'))
const Detail = lazy(() => import('./pages/detail/detail'))
const Login = lazy(() => import('./pages/login/login'))
const Rent = lazy(() => import('./pages/rent/rent'))
const Rentlist = lazy(() => import('./pages/rentlist/rentlist'))

const WithRent = withRouter(Rent)
const WithLogin = withRouter(Login)

class App extends Component {
  render () {
    return (
      <HashRouter>
        <Suspense fallback={<div>...</div>}>
          <Switch>
            <Route path='/layout' component={Layout} />
            <Route path='/map' component={Map} />
            <Route path='/login' component={Login} />
            <Route path='/rentlist' component={Rentlist} />
            {/* 路由拦截，没有登录态不让用户进入Rent组件 */}
            <Route
              path='/rent'
              render={() => {
                let token = localStorage.getItem('haoke_token')
                if (token) {
                  return <WithRent />
                } else {
                  return <WithLogin />
                }
              }}
            />
            <Route path='/detail/:key' component={Detail} />
            <Redirect from='/' to='/layout' exact></Redirect>
          </Switch>
        </Suspense>
      </HashRouter>
    )
  }
}

export default App
