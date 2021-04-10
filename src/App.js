import React, { Component } from 'react'

import { HashRouter, Switch, Route, Redirect } from 'react-router-dom'

import Layout from './pages/layout/layout.jsx'
import Map from './pages/map/map.jsx'
import Detail from './pages/detail/detail.jsx'
import Login from './pages/login/login.jsx'

class App extends Component {
  render () {
    return (
      <HashRouter>
        <Switch>
          <Route path='/layout' component={Layout} />
          <Route path='/map' component={Map} />
          <Route path='/detail/:key' component={Detail} />
          <Route path='/login' component={Login} />
          <Redirect from='/' to='/layout' exact></Redirect>
        </Switch>
      </HashRouter>
    )
  }
}

export default App
