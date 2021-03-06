import React, { Component } from 'react'
import './detail.css'
import avatar_img from '../../asstes/images/avatar.png'
import { Carousel, Toast } from 'antd-mobile'
import { BASEURL } from '../../utils/base_url'
import { Link } from 'react-router-dom'

// 从window对象中取出BMap对象
const BMap = window.BMap
// 自定义数据对应不同的iconfont
const support_icon = {
  电视: 'icon-dianshi',
  热水器: 'icon-reshuiqi',
  冰箱: 'icon-bingxiang',
  天然气: 'icon-tianranqi',
  空调: 'icon-kongtiao',
  沙发: 'icon-shafa',
  暖气: 'icon-nuanqi',
  宽带: 'icon-_huabanfuben',
  衣柜: 'icon-yigui',
  洗衣机: 'icon-xiyiji'
}

class Detail extends Component {
  state = {
    houseDetail: {
      // 对于需要遍历并渲染到页面的服务器数组数据
      // 必须赋初始值，否则会报错 xxx is undefined
      houseImg: [],
      tags: [],
      oriented: [],
      supporting: []
    },
    // 是否已将房屋添加收藏
    isHouseFavourite: false
  }
  componentDidMount () {
    this.fnGetHouseDetail()
    this.fnCheckFavourite()
  }

  // 获取当前房源详情
  fnGetHouseDetail = async () => {
    let id = this.props.match.params.key
    let res = await this.$request({
      url: `/houses/${id}`
    })
    this.setState(
      {
        houseDetail: res.body
      },
      () => {
        let { longitude, latitude } = this.state.houseDetail.coord
        let map = new BMap.Map('container')
        let point = new BMap.Point(longitude, latitude)
        map.centerAndZoom(point, 22)
        // 开启鼠标滚轮缩放
        map.enableScrollWheelZoom(true)
        // 创建标记并显示
        map.addOverlay(new BMap.Marker(point))
      }
    )
  }

  // 查看当前房源是否收藏
  fnCheckFavourite = async () => {
    let id = this.props.match.params.key
    let res = await this.$request({
      url: `/user/favorites/${id}`
    })
    let { status, body } = res
    if (status === 200) {
      this.setState({
        isHouseFavourite: body.isFavorite
      })
    }
  }

  // 添加收藏
  addCollect = async () => {
    let id = this.props.match.params.key
    let res = await this.$request({
      url: `/user/favorites/${id}`,
      method: 'post'
    })
    let { status } = res
    if (status === 200) {
      Toast.success('收藏成功！', 1, () => {
        // 再查看一次是否收藏，因为收藏与否是与房源id相关
        // 因此重新查看当前房源是否已被收藏即可，无需我们手动将state中的isHouseFavourite进行更改
        this.fnCheckFavourite()
      })
    } else {
      // 游客也有权限查看房屋详情页面，但是收藏必须先登录
      Toast.fail('请先登录后再操作！', 1)
    }
  }

  // 取消当前房源的收藏
  removeCollect = async () => {
    // 从路由中获取房源id
    let id = this.props.match.params.key
    let res = await this.$request({
      url: `/user/favorites/${id}`,
      method: 'delete'
    })
    let { status } = res
    if (status === 200) {
      Toast.success('已取消收藏！', 1, () => {
        this.fnCheckFavourite()
      })
    }
  }
  render () {
    let { houseDetail, isHouseFavourite } = this.state
    return (
      <div>
        <span
          className='detail_back iconfont icon-prev'
          onClick={() => this.props.history.goBack()}
        ></span>

        <div className='detail_slide_con'>
          {houseDetail.houseImg.length > 0 && (
            <Carousel autoplay={true} infinite>
              {houseDetail.houseImg.map(item => (
                <Link
                  key={item}
                  to='/xxx'
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    height: '10.375rem'
                  }}
                >
                  <img
                    src={BASEURL + item}
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

        <div className='detail_info'>
          <div className='detail_more'>
            <h3>{houseDetail.title}</h3>
            <div className='detail_tag'>
              {houseDetail.tags.map((v, i) => (
                <span className={'tag tag' + i} key={i}>
                  {v}
                </span>
              ))}
            </div>
          </div>

          <ul className='detail_more more2'>
            <li>
              <span>
                {houseDetail.price}
                <em>/月</em>
              </span>
              <b>租金</b>
            </li>
            <li>
              <span>{houseDetail.roomType}</span>
              <b>房型</b>
            </li>
            <li>
              <span>{houseDetail.size}平米</span>
              <b>面积</b>
            </li>
          </ul>
          <ul className='detail_more more3'>
            <li>
              <em>装修：</em>精装
            </li>
            <li>
              <em>楼层：</em>
              {houseDetail.floor}
            </li>
            <li>
              <em>朝向：</em>
              {houseDetail.oriented.join(' ')}
            </li>
            <li>
              <em>类型：</em>普通住宅
            </li>
          </ul>
        </div>

        <div className='detail_info'>
          <h4 className='detail_common_title'>{houseDetail.community}</h4>
          <div className='map_con'>
            <div id='container' style={{ width: '100%', height: '100%' }}></div>
          </div>

          <h3 className='detail_common_title'>房屋配套</h3>
          <ul className='support_list'>
            {houseDetail.supporting.map((v, i) => (
              <li key={i}>
                <i className={'iconfont ' + support_icon[v]}></i>
                <b>{v}</b>
              </li>
            ))}
          </ul>
        </div>

        <div className='detail_info'>
          <h3 className='detail_common_title'>房屋概况</h3>
          <div className='landlord '>
            <div className='lorder'>
              <img src={avatar_img} alt='' />
              <div className='lorder_name'>
                <b>王女士</b>
                <span>
                  <i className='iconfont icon-renzheng'></i> <b>已认证房主</b>
                </span>
              </div>
            </div>
            <span className='send_info'>发消息</span>
          </div>
          <p className='detail_text'>{houseDetail.description}</p>
        </div>

        <ul className='down_btns'>
          {/* 根据收藏情况进行互斥条件渲染 */}
          {isHouseFavourite ? (
            <li className='collected' onClick={this.removeCollect}>
              <i className='iconfont icon-shoucang'></i> 已收藏
            </li>
          ) : (
            <li className='collect' onClick={this.addCollect}>
              <i className='iconfont icon-shoucang'></i> 收藏
            </li>
          )}

          <li>在线咨询</li>
          <li className='active'>
            <a href='tel:400-618-4000'>电话预约</a>
          </li>
        </ul>
      </div>
    )
  }
}

export default Detail
