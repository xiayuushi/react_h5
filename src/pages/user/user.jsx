import React, { Component } from 'react'
import './user.css'
import avatar02 from '../../asstes/images/avatar02.png'
import join from '../../asstes/images/join.png'
import { BASEURL } from '../../utils/base_url'
import { Toast } from 'antd-mobile'

class User extends Component {
  constructor (props) {
    super(props)
    this.state = {
      userInfo: {},
      // 记录是否登录的状态
      isLogin: false
    }
  }

  componentDidMount () {
    this.getUserInfo()
  }

  // 获取用户信息
  getUserInfo = async () => {
    let res = await this.$request({
      url: '/user',
      headers: {
        accept: 'application/json'
      }
    })
    // 请求成功将用户信息存储到localStorage并渲染用户信息
    if (res.status === 200) {
      localStorage.setItem('userInfo', JSON.stringify(res.body))

      this.setState({
        userInfo: res.body,
        isLogin: true
      })
    }
  }

  // 退出登录
  loginout = () => {
    Toast.success('已退出登录！')
    // 清除token
    localStorage.removeItem('haoke_token')
    // 清除并重置用户信息、重置登录状态
    localStorage.removeItem('userInfo')
    this.setState({
      userInfo: {},
      isLogin: false
    })
  }
  render () {
    let { userInfo, isLogin } = this.state
    return (
      <div className='user_wrap'>
        <div className='user_header'>
          {/* 根据用户是否登录，显示不同的按钮，处理不同的逻辑 */}
          {isLogin ? (
            <div className='info_pannel'>
              <img src={BASEURL + userInfo.avatar} alt='' />
              <div className='role'>{userInfo.nickname}</div>
              <span className='gologin' onClick={this.loginout}>
                退出登录
              </span>
            </div>
          ) : (
            <div className='info_pannel'>
              <img src={avatar02} alt='' />
              <div className='role'>游客</div>
              <span
                className='gologin'
                onClick={() => this.props.history.push('/login')}
              >
                去登录
              </span>
            </div>
          )}
        </div>
        <ul className='opt_list'>
          <li>
            <i className='iconfont icon-shoucang'></i>
            <span>我的收藏</span>
          </li>
          <li onClick={() => this.props.history.push('/rentlist')}>
            <i className='iconfont icon-home'></i>
            <span>我的出租</span>
          </li>
          <li>
            <i className='iconfont icon-shijian'></i>
            <span>看房记录</span>
          </li>
          <li>
            <i className='iconfont icon-fangdong'></i>
            <span>成为房主</span>
          </li>
          <li>
            <i className='iconfont icon-wode'></i>
            <span>个人资料</span>
          </li>
          <li>
            <i className='iconfont icon-kefu'></i>
            <span>联系我们</span>
          </li>
        </ul>
        <div className='join'>
          <img src={join} alt='' />
        </div>
      </div>
    )
  }
}

export default User
