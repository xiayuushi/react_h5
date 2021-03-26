import React, { Component } from 'react'

import { HashRouter, Switch, Route, Redirect } from 'react-router-dom'

import Layout from './pages/layout/layout.jsx'

class App extends Component {
  render () {
    return (
      <HashRouter>
        <Switch>
          <Route path='/layout' component={Layout} />
          <Redirect from='/' to='/layout' exact></Redirect>
        </Switch>
      </HashRouter>
    )
  }
}

export default App
