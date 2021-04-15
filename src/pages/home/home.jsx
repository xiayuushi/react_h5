import React, { Component } from 'react'
import './home.css'

// 导入withRouter高阶组件
// 让仅嵌入到当前Home组件却不参与路由的子组件SearchBar组件可以使用编程式导航跳转路由
import { Link, withRouter } from 'react-router-dom'

import { Carousel } from 'antd-mobile'
import { BASEURL } from '../../utils/base_url'

import store from '../../store'
import Switchcity from '../../components/switchcity/switchcity'

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
        <Link to='/layout/houselist'>
          <i className='iconfont icon-zufang1'></i>
        </Link>
        <h4>整租</h4>
      </li>
      <li>
        <Link to='/layout/houselist'>
          <i className='iconfont icon-usergroup'></i>
        </Link>
        <h4>合租</h4>
      </li>
      <li>
        <Link to='/map'>
          <i className='iconfont icon-ic-maplocation-o'></i>
        </Link>
        <h4>地图找房</h4>
      </li>
      <li>
        <Link to='/rent'>
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
      currentCity: ''
    }
  }

  componentDidMount () {
    let sessionCurrentCityInfo = JSON.parse(
      sessionStorage.getItem('currentCityInfo')
    )

    // 判断缓存中是否有当前定位城市的数据，有则从缓存取，无则调接口请求获取
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
    return (
      <div className='search_bar'>
        <Switchcity />
        <i
          className='iconfont icon-ic-maplocation-o tomap'
          onClick={() => this.props.history.push('/map')}
        ></i>
      </div>
    )
  }
}

// 使用高阶组件让当前不参与路由跳转的组件也能够使用编程式导航跳转路由
const WithSearchBar = withRouter(SearchBar)
class Home extends Component {
  render () {
    return (
      <div>
        {/* 使用高阶组件生成的新组件替代之前的SearchBar组件 */}
        <WithSearchBar />
        <Slide />
        <Menu />
        <Group />
        <News />
      </div>
    )
  }
}

export default Home
