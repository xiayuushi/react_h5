import React, { Component } from 'react'
import './switchcity.css'
import City from '../city/city'
import store from '../../store'

class switchcity extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentCity: store.getState().label,
      switchCity: 'city_wrap'
    }
    // 订阅redux中store修改，同步组件数据
    this.unsubscribe = store.subscribe(this.fnStoreChange)
  }
  componentWillUnmount () {
    // 组件销毁之前取消store订阅
    this.unsubscribe()
  }
  // store修改后，组件再次更新数据
  fnStoreChange = () => {
    this.setState({
      currentCity: store.getState().label
    })
  }
  // 切换城市列表（父传子：弹出 + 子传父：关闭）
  fnSwitchCityList = switchCity => {
    this.setState({
      switchCity
    })
  }
  render () {
    let { currentCity, switchCity } = this.state
    return (
      <div className='search_con'>
        <span
          className='city'
          onClick={() => this.fnSwitchCityList('city_wrap slideUp')}
        >
          {currentCity}
        </span>
        <i className='iconfont icon-xialajiantouxiangxia'></i>
        <span className='village'>
          <i className='iconfont icon-fangdajing'></i> 请输入小区名
        </span>
        <City
          switchCity={switchCity}
          fnSwitchCityList={this.fnSwitchCityList}
        />
      </div>
    )
  }
}

export default switchcity
