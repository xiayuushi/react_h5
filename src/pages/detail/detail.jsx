import React, { Component } from 'react'
import './detail.css'
import detail_img from '../../asstes/images/detail.jpg'
import map_img from '../../asstes/images/map.jpg'
import avatar_img from '../../asstes/images/avatar.png'

class Detail extends Component {
  componentDidMount () {
    console.log(this.props.match.params.key)
  }
  render () {
    return (
      <div>
        <span
          className='detail_back iconfont icon-prev'
          onClick={() => this.props.history.goBack()}
        ></span>

        <div className='detail_slide_con'>
          <ul>
            <li>
              <img src={detail_img} alt='' />
            </li>
          </ul>
        </div>

        <div className='detail_info'>
          <div className='detail_more'>
            <h3>中海锦城 3室2厅 3400元</h3>
            <div className='detail_tag'>
              <span className='tag tag0'>近地铁</span>
              <span className='tag tag1'>近地铁</span>
              <span className='tag tag2'>近地铁</span>
            </div>
          </div>

          <ul className='detail_more more2'>
            <li>
              <span>
                3400<em>/月</em>
              </span>
              <b>租金</b>
            </li>
            <li>
              <span>三室</span>
              <b>房型</b>
            </li>
            <li>
              <span>113平米</span>
              <b>面积</b>
            </li>
          </ul>
          <ul className='detail_more more3'>
            <li>
              <em>装修：</em>精装
            </li>
            <li>
              <em>楼层：</em>高楼层
            </li>
            <li>
              <em>朝向：</em>南
            </li>
            <li>
              <em>类型：</em>普通住宅
            </li>
          </ul>
        </div>

        <div className='detail_info'>
          <h4 className='detail_common_title'>银河城春晓苑</h4>
          <div className='map_con'>
            <img src={map_img} alt='' />
          </div>

          <h3 className='detail_common_title'>房屋配套</h3>
          <ul className='support_list'>
            <li>
              <i className='iconfont icon-yigui'></i>
              <b>衣柜</b>
            </li>
            <li>
              <i className='iconfont icon-xiyiji'></i>
              <b>洗衣机</b>
            </li>
            <li>
              <i className='iconfont icon-kongtiao'></i>
              <b>空调</b>
            </li>
            <li>
              <i className='iconfont icon-tianranqi'></i>
              <b>天然气</b>
            </li>
            <li>
              <i className='iconfont icon-bingxiang'></i>
              <b>冰箱</b>
            </li>
            <li>
              <i className='iconfont icon-dianshi'></i>
              <b>电视</b>
            </li>
            <li>
              <i className='iconfont icon-reshuiqi'></i>
              <b>热水器</b>
            </li>
            <li>
              <i className='iconfont icon-shafa'></i>
              <b>沙发</b>
            </li>
            <li>
              <i className='iconfont icon-nuanqi'></i>
              <b>暖气</b>
            </li>
            <li>
              <i className='iconfont icon-_huabanfuben'></i>
              <b>wifi</b>
            </li>
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
          <p className='detail_text'>
            【房源亮点】
            离小区200米就是家家乐超市，504米就是花莲超市，05公里莲塘一中，1.3公里就到维也纳购物广场。
            【交通出行】 出小区234米就是万坊桥头公交站：515路
            429米星港湾花园（新连武路口）公交站：127路；128路；河溪线；128路箭江闸线
            【小区介绍】
            小区建于2001年，70年产权商品房，客厅朝南通阳台，配套设施齐，交通便利。
          </p>
        </div>

        <ul className='down_btns'>
          <li className='collect'>
            <i className='iconfont icon-shoucang'></i> 收藏
          </li>
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
