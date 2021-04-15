import React, { Component } from 'react'
import './layout.css'

import Home from '../home/home'
import Houselist from '../houselist/houselist'
import Info from '../info/info'
import User from '../user/user'
import { Route, Link, Redirect, Switch } from 'react-router-dom'

// 自定义路由，让当前所在的路由高亮显示
function CustomLink ({ label, to, iconClass }) {
  return (
    <Route
      path={to}
      children={({ match }) => (
        <li className={match ? 'active' : ''}>
          <Link to={to} className={'iconfont ' + iconClass}></Link>
          <h4>{label}</h4>
        </li>
      )}
    />
  )
}

class Layout extends Component {
  render () {
    return (
      <div>
        <Switch>
          <Route path='/layout/home' component={Home} />
          <Route path='/layout/houselist' component={Houselist} />
          <Route path='/layout/info' component={Info} />
          <Route path='/layout/user' component={User} />
          <Redirect from='/layout' to='/layout/home' exact></Redirect>
        </Switch>
        <footer>
          <ul>
            {/* 使用自定义路由替换之前的Link标签 */}
            <CustomLink label='首页' to='/layout/home' iconClass='icon-home1' />
            <CustomLink
              label='找房'
              to='/layout/houselist'
              iconClass='icon-ziyuan'
            />
            <CustomLink label='资讯' to='/layout/info' iconClass='icon-zixun' />
            <CustomLink label='我的' to='/layout/user' iconClass='icon-wode' />
          </ul>
        </footer>
      </div>
    )
  }
}

export default Layout
