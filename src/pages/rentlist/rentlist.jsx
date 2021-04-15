import React, { Component } from 'react'
import Toptitle from '../../components/toptitle/toptitle'
import { AutoSizer, List } from 'react-virtualized'
import { BASEURL } from '../../utils/base_url'

class Rentlist extends Component {
  state = {
    userHousesList: []
  }
  rowRenderer = ({ key, index, style }) => {
    let { userHousesList } = this.state
    let houseItem = userHousesList[index]

    if (!houseItem) {
      return (
        <div className='reload' key={key} style={style}>
          <div>loading....</div>
        </div>
      )
    }

    return (
      <div className='house_wrap' key={key} style={style}>
        <div
          className='house_item'
          onClick={() =>
            this.props.history.push(`/detail/${houseItem.houseCode}`)
          }
        >
          <div className='imgWrap'>
            <img
              className='img'
              src={BASEURL + houseItem.houseImg}
              alt={houseItem.houseImg}
            />
          </div>
          <div className='content'>
            <h3 className='title'>{houseItem.title}</h3>
            <div className='desc'>{houseItem.desc}</div>
            <div>
              {houseItem.tags.map((v, i) => (
                <span className={`tag tag${i}`} key={i}>
                  {v}
                </span>
              ))}
            </div>
            <div className='price'>
              <span className='priceNum'>{houseItem.price}</span> 元/月
            </div>
          </div>
        </div>
      </div>
    )
  }

  componentDidMount () {
    this.fnGetUserHousesList()
  }
  // 查看已发布的房源列表
  fnGetUserHousesList = async () => {
    // 有缓存从缓存取 否则发请求
    let haoke_userhouseslist = localStorage.getItem('haoke_userhouseslist')
    let userRentList = {}
    if (haoke_userhouseslist) {
      userRentList = JSON.parse(haoke_userhouseslist)
    } else {
      let res = await this.$request({
        url: '/user/houses'
      })

      if (res.status === 200) {
        userRentList = res.body
        localStorage.setItem(
          'haoke_userhouseslist',
          JSON.stringify(userRentList)
        )
      }
    }

    // 拿到数据设置给state
    this.setState({
      userHousesList: userRentList
    })
  }
  render () {
    let { userHousesList } = this.state
    return (
      <div>
        <Toptitle title='房源列表' history={this.props.history} />
        <div
          className='rentlist_con_wrap'
          // 使用react-virtualized时生成的行内样式会影响父级样式
          // 必须在父级设置行内样式进行覆盖，否则渲染会出问题
          style={{
            position: 'fixed',
            top: '2.5rem',
            bottom: '0',
            left: '0',
            width: '100%'
          }}
        >
          <AutoSizer>
            {({ width, height }) => (
              <List
                width={width}
                height={height}
                rowCount={userHousesList.length}
                rowHeight={120}
                rowRenderer={this.rowRenderer}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    )
  }
}

export default Rentlist
