import React, { Component } from 'react'
import './home.css'

import { Link } from 'react-router-dom'

// 导入 ant-design-mobile 轮播图组件
import { Carousel } from 'antd-mobile'

// 请求回来的轮播图需要拼接基地址
import { BASEURL } from '../../utils/base_url'

// 导入redux进行数据共享
import store from '../../store'

// 导入城市组件
import City from '../city/city'

// 轮播图组件
class Slide extends Component {
  // state的简写形式：直接给state赋值，而不是直接字面量声明state对象
  // 此时可以不需要写constructor也不需要在state前加"this."
  state = {
    // 轮播图数据
    carouselData: []
  }

  // 请求轮播图数据
  requestSlide = async () => {
    let res = await this.$request({
      url: '/home/swiper'
    })
    if (res.status === 200) {
      this.setState({
        carouselData: res.body
      })
    }
  }
  componentDidMount () {
    this.requestSlide()
  }
  render () {
    let { carouselData } = this.state
    return (
      <div className='slide_con'>
        {/* 条件渲染：数据没有回来之前不渲染，防止出现"卡顿"效果 */}
        {carouselData.length > 0 && (
          <Carousel autoplay={true} infinite>
            {carouselData.map(item => (
              <Link
                key={item.id}
                to='/xxx'
                style={{
                  display: 'inline-block',
                  width: '100%',
                  height: '10.6rem'
                }}
              >
                <img
                  src={BASEURL + item.imgSrc}
                  alt=''
                  style={{ width: '100%', verticalAlign: 'top' }}
                  onLoad={() => {
                    window.dispatchEvent(new Event('resize'))
                    this.setState({ imgHeight: 'auto' })
                  }}
                />
              </Link>
            ))}
          </Carousel>
        )}
      </div>
    )
  }
}
// 菜单组件
function Menu () {
  return (
    <ul className='menu_con'>
      <li>
        <Link to='/layout/home/xxx'>
          <i className='iconfont icon-zufang1'></i>
        </Link>
        <h4>整租</h4>
      </li>
      <li>
        <Link to='/layout/home/xxx'>
          <i className='iconfont icon-usergroup'></i>
        </Link>
        <h4>合租</h4>
      </li>
      <li>
        <Link to='/layout/home/xxx'>
          <i className='iconfont icon-ic-maplocation-o'></i>
        </Link>
        <h4>地图找房</h4>
      </li>
      <li>
        <Link to='/layout/home/xxx'>
          <i className='iconfont icon-zufang'></i>
        </Link>
        <h4>去出租</h4>
      </li>
    </ul>
  )
}
// 租房小组组件
class Group extends Component {
  state = {
    groupData: []
  }
  // 请求租房小组的数据
  requestGroupData = async () => {
    let res = await this.$request({
      url: '/home/groups?area=AREA%7C88cff55c-aaa4-e2e0'
    })
    if (res.status === 200) {
      this.setState({
        groupData: res.body
      })
    }
  }
  componentDidMount () {
    this.requestGroupData()
  }
  render () {
    let { groupData } = this.state
    return (
      <div className='model2'>
        <div className='title_con'>
          <h3>租房小组</h3>
          <Link to='/xxx' className='iconfont icon-next'></Link>
        </div>
        <ul className='house_list'>
          {groupData.map(item => (
            <li key={item.id}>
              <p className='fl'>{item.title}</p>
              <img src={BASEURL + item.imgSrc} alt='' className='fr' />
              <span className='fl'>{item.desc}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

// 新闻资讯组件
class News extends Component {
  state = {
    newsData: []
  }
  // 请求新闻资讯的数据
  requestNews = async () => {
    let res = await this.$request({
      url: '/home/news?area=AREA%7C88cff55c-aaa4-e2e0'
    })
    if (res.status === 200) {
      this.setState({
        newsData: res.body
      })
    }
  }
  componentDidMount () {
    this.requestNews()
  }
  render () {
    let { newsData } = this.state
    return (
      <div className='model mb120'>
        <div className='title_con'>
          <h3>最新资讯</h3>
          <Link to='/xxx' className='iconfont icon-next'></Link>
        </div>
        <ul className='list'>
          {newsData.map(item => (
            <li key={item.id}>
              <Link to='/xxx'>
                <img src={BASEURL + item.imgSrc} alt='' />
              </Link>
              <div className='detail_list'>
                <h4>{item.title}</h4>
                <div className='detail'>
                  <span>{item.from}</span>
                  <em>{item.date}</em>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

// 搜索栏组件
class SearchBar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentCity: '',
      switchCity: 'city_wrap'
    }
    // 订阅redux中store修改，同步组件数据
    this.unsubscribe = store.subscribe(this.fnStoreChange)
  }
  // store修改后，组件再次更新数据
  fnStoreChange = () => {
    this.setState({
      currentCity: store.getState().label
    })
  }
  // 切换城市列表（父传子：弹出 + 子传父：关闭） 
  fnSwitchCityList = (switchCity) => {
    this.setState({
      switchCity
    })
  }

  componentDidMount () {
    // 判断缓存中是否有当前定位城市的数据，有则从缓存取，无则调接口请求获取
    let sessionCurrentCityInfo = JSON.parse(
      sessionStorage.getItem('currentCityInfo')
    )
    if (sessionCurrentCityInfo) {
      this.setState({
        currentCity: sessionCurrentCityInfo.label
      })
      store.dispatch({
        type: 'store_CurrentCityInfo',
        value: sessionCurrentCityInfo
      })
    } else {
      // 在public/index.html中导入了百度地图API后，BMap对象就会挂载到window对象中
      // 必须这样子取值才不会在组件中报错：BMap is not defined
      let BMap = window.BMap

      // 百度地图IP定位当前城市
      let myCity = new BMap.LocalCity()

      myCity.get(async result => {
        console.log(this)

        let cityName = result.name

        // 获取定位城市后发请求，验证当前城市是否在公司业务范围之内
        let res = await this.$request({
          url: `/area/info?name=${cityName}`
        })
        if (res.status === 200) {
          this.setState({
            currentCity: res.body.label
          })
          // 存储到sessionStorage，以便后续优化组件读取速度
          sessionStorage.setItem('currentCityInfo', JSON.stringify(res.body))
          // 考虑到当前定位城市数据可能会在多个组件中使用，存入到Redux中方便组件间传输
          store.dispatch({
            type: 'store_CurrentCityInfo',
            value: res.body
          })
        }
      })
    }
  }
  render () {
    let { currentCity, switchCity } = this.state
    return (
      <div className='search_bar'>
        <div className='search_con'>
          <span className='city' onClick={()=>this.fnSwitchCityList('city_wrap slideUp')}>
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
        <i className='iconfont icon-ic-maplocation-o tomap'></i>
      </div>
    )
  }
  componentWillUnmount () {
    // 组件销毁之前取消store订阅
    this.unsubscribe()
  }
}

class Home extends Component {
  render () {
    return (
      <div>
        <SearchBar />
        <Slide />
        <Menu />
        <Group />
        <News />
      </div>
    )
  }
}

export default Home
