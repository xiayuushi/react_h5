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
            <CustomLink label='首页' to='/layout/home'  iconClass='icon-home1' />
            <CustomLink label="找房" to="/layout/houselist"  iconClass="icon-ziyuan" />
            <CustomLink label="资讯" to="/layout/info"  iconClass="icon-zixun" />
            <CustomLink label="我的" to="/layout/user"  iconClass="icon-wode" />

            {/* 以下是之前的Link标签 */}
            {/* <li className='active'>
              <Link to='/layout/home' className='iconfont icon-home1'></Link>
              <h4>首页</h4>
            </li>
            <li>
              <Link
                to='/layout/houselist'
                className='iconfont icon-ziyuan'
              ></Link>
              <h4>找房</h4>
            </li>
            <li>
              <Link to='/layout/info' className='iconfont icon-zixun'></Link>
              <h4>资讯</h4>
            </li>
            <li>
              <Link to='/layout/user' className='iconfont icon-wode'></Link>
              <h4>我的</h4>
            </li> */}
          </ul>
        </footer>
      </div>
    )
  }
}

export default Layout
