import React, { Component } from 'react'
import './map.css'

import store from '../../store'
import { BASEURL } from '../../utils/base_url'
import { Toast } from 'antd-mobile'
import Toptitle from '../../components/toptitle/toptitle'

// 从window取出BMap对象，以便在当前组件全局使用
const BMap = window.BMap

class Map extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentCityInfo: store.getState(),
      sClass: 'houseList',
      houseList: []
    }
  }

  componentDidMount () {
    // 获取当前定位城市与对应的value
    let currentCity = this.state.currentCityInfo.label
    let currentCityId = this.state.currentCityInfo.value

    // 设置百度地图中心点point的初始缩放级别
    this.scaleLevel = 12

    // 注意：在调用地图实例化API时，传入容器盒子id属性值不需要带'#'
    this.map = new BMap.Map('container')

    // 移动地图时，关闭（第三级覆盖物标注）下方信息面板
    this.map.addEventListener('movestart', () => {
      this.setState({
        sClass: 'houseList'
      })
    })

    // 创建地址解析器实例
    var myGeo = new BMap.Geocoder()

    // 将地址解析结果显示在地图上，并调整地图视野
    myGeo.getPoint(
      currentCity,
      point => {
        if (point) {
          // 地图控件
          this.map.addControl(new BMap.NavigationControl())
          this.map.addControl(new BMap.ScaleControl())

          // 调用封装的函数生成地图标注
          this.fnAddOverlay(point, currentCityId, this.scaleLevel)
        }
      },
      currentCity
    )
  }

  // 封装生成地图标注的函数
  fnAddOverlay = async (point, id, scaleLevel) => {
    // 当前组件地图有三个级别：第一与第二级别样式类似，但缩放比例不同；第三级别样式、偏移量与缩放比例都不同
    if (scaleLevel) {
      this.scaleLevel = 12 // 第一缩放级别
    } else if (this.scaleLevel === 12) {
      this.scaleLevel = 14 // 第二缩放级别
    } else {
      this.scaleLevel = 16 // 第三缩放级别
    }

    // 根据缩放级别,显示不同的地图标注
    // 第三缩放级别的地图标注与之前的不同
    if (this.scaleLevel !== 16) {
      this.map.centerAndZoom(point, this.scaleLevel)
      Toast.loading('正在加载...')

      // 获取房源信息
      let res = await this.$request({
        url: `/area/map?id=${id}`
      })

      // 遍历服务器数据，生成地图标注
      res.body.forEach(item => {
        // 服务器返回的经纬度数据转成百度地图的中心坐标点
        let point = new BMap.Point(item.coord.longitude, item.coord.latitude)

        // 覆盖物标注对象
        let opts = {
          position: point, // 指定文本标注所在的地理位置
          offset: new BMap.Size(-35, -35) // 设置文本偏移量
        }

        // 创建文本标注对象
        let label = new BMap.Label(
          `<div class='map_label01'>${item.label}<br/>${item.count}套</div>`,
          opts
        )

        // 自定义文本标注样式
        label.setStyle({
          border: '0px',
          backgroundColor: 'transparent'
        })

        // 根据上面的参数生成地图覆盖物(标注)
        this.map.addOverlay(label)

        Toast.hide()

        // 给覆盖物标注添加点击事件(事件监听)
        label.addEventListener('click', () => {
          this.fnRefreshOverlay(point, item.value)
        })
      })
    } else {
      this.map.centerAndZoom(point, this.scaleLevel)

      Toast.loading('正在加载...')

      let res = await this.$request({
        url: `/area/map?id=${id}`
      })

      res.body.forEach(item => {
        let point = new BMap.Point(item.coord.longitude, item.coord.latitude)

        let opts = {
          position: point,
          offset: new BMap.Size(-60, -15) // 这里文本偏移量与第一、第二缩放级别不同
        }

        // 创建文本标注对象，这里与第一、第二缩放级别稍有不同
        let label = new BMap.Label(
          `<div class='map_label02'>${item.label}&nbsp;&nbsp;${item.count}套</div>`,
          opts
        )

        label.setStyle({
          border: '0px',
          backgroundColor: 'transparent'
        })

        this.map.addOverlay(label)

        Toast.hide()

        label.addEventListener('click', e => {
          let moveX, moveY
          // 防止代码出错做的平稳退化
          try {
            // 光标坐标位置
            let { clientX, clientY } = e.changedTouches[0]
            // 计算光标移动到屏幕中心点的坐标
            moveX = window.innerWidth / 2 - clientX
            moveY = window.innerHeight / 4 - clientY
          } catch (error) {
            // 光标坐标位置
            let { clientX, clientY } = e
            // 计算光标移动到屏幕中心点的坐标
            moveX = window.innerWidth / 2 - clientX
            moveY = window.innerHeight / 4 - clientY
          }
          this.fnShowHouseList(item.value, { moveX, moveY })
        })
      })
    }
  }
  // 点击第三级标注展开租房信息
  fnShowHouseList = async (value, obj) => {
    // 点击标注时，当前标注移动到（地图可视区的）屏幕中心点
    this.map.panBy(obj.moveX, obj.moveY)

    Toast.loading('加载中...')
    let res = await this.$request({
      url: `/houses?cityId=${value}`
    })
    Toast.hide()

    this.setState({
      sClass: 'houseList houseListShow',
      houseList: res.body.list
    })
  }
  // 封装方法加载子级覆盖物标注(删除之前存在的覆盖物、重新生成)
  fnRefreshOverlay = (point, id) => {
    // 删除之前存在的地图标注(使用定时器异步包裹清除覆盖物的代码,否则删除过快会报错)
    setTimeout(() => {
      this.map.clearOverlays()
    }, 0)

    // 递归调用生成标注的fnAddOverlay方法(重新生成子级标注)
    this.fnAddOverlay(point, id)
  }

  render () {
    let { sClass, houseList } = this.state
    return (
      <div>
        {/* 顶部 */}
        <Toptitle title='地图找房' history={this.props.history} />
        {/* 地图 */}
        <div className='map_com'>
          <div id='container' style={{ width: '100%', height: '100%' }}></div>
        </div>
        {/* 房屋信息列表 */}
        <div className={sClass}>
          <div className='titleWrap'>
            <h1 className='listTitle'>房屋列表</h1>
            <a className='titleMore' href='/house/list'>
              更多房源
            </a>
          </div>
          {houseList.map(item => (
            <div
              className='houseItems'
              key={item.houseCode}
              onClick={() =>
                this.props.history.push(`/detail/${item.houseCode}`)
              }
            >
              <div className='house'>
                <div className='imgWrap'>
                  <img
                    className='img'
                    src={`${BASEURL}${item.houseImg}`}
                    alt={item.title}
                  />
                </div>
                <div className='content'>
                  <h3 className='title'>{item.title}</h3>
                  <div className='desc'>{item.desc}</div>
                  <div>
                    {item.tags.map((v, i) => (
                      <span className={`tag tag${i}`} key={v}>
                        {v}
                      </span>
                    ))}
                  </div>
                  <div className='price'>
                    <span className='priceNum'>{item.price}</span> 元/月
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default Map
