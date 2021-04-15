import React, { Component } from 'react'

import { HashRouter, Switch, Route, Redirect } from 'react-router-dom'

import Layout from './pages/layout/layout.jsx'
import Map from './pages/map/map.jsx'
import Detail from './pages/detail/detail.jsx'
import Login from './pages/login/login.jsx'
import Rent from './pages/rent/rent.jsx'
import Rentlist from './pages/rentlist/rentlist.jsx'
import { withRouter } from 'react-router-dom'

const WithRent = withRouter(Rent)
const WithLogin = withRouter(Login)

class App extends Component {
  render () {
    return (
      <HashRouter>
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
      </HashRouter>
    )
  }
}

export default App
