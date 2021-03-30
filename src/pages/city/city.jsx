import React, { Component } from 'react'
import './city.css'
import store from '../../store'

import { Toast } from 'antd-mobile'

// 长列表优化组件（react-virtualized可视区加载）
// AutoSizer是高阶组件，用于做List组件在不同设备宽高的自适应
import { AutoSizer, List } from 'react-virtualized'

// 服务器返回的城市列表数据不符合渲染，需对数据进行处理
function formatSourceData (payload) {
  let cityData = {}

  payload.map(item => {
    // 取数组每一项short属性的首字母
    let letter = item.short.slice(0, 1)
    // 对比首字母，存在则将该项加入数组 否则以这个首字母为key生成对应的数据
    letter in cityData
      ? cityData[letter].push(item)
      : (cityData[letter] = [item])
    return cityData
  })
  // 将对象中的属性进行遍历生成数组并排序
  let cityDataKey = Object.keys(cityData).sort()
  return { cityDataKey, cityData }
}
// 处理城市列表的文字
function formatCityDataKey (str) {
  if (str === '#') {
    return '当前定位'
  } else if (str === 'hot') {
    return '热门城市'
  } else {
    return str.toUpperCase()
  }
}

class City extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentCityInfo: store.getState(),
      cityData: {},
      cityDataKey: [],
      currentIndex: 10
    }
    // 订阅redux中store的更新
    this.unsubscribe = store.subscribe(this.fnStoreChange)
    // 创建ref对象取react-virtualized中List组件的DOM，以便使用List组件的方法
    this.virListRef = React.createRef()
  }
  // 请求城市列表
  requestCityList = async () => {
    let all_city_list
    // 缓存有：从缓存中取数据
    if (localStorage.getItem('all_city_list')) {
      all_city_list = JSON.parse(localStorage.getItem('all_city_list'))
    } else {
      // 缓存无：调接口发请求拿数据
      let res = await this.$request({
        url: '/area/city?level=1'
      })
      // 存储到LocalStorage中，优化组件加载速度
      all_city_list = res.body
      localStorage.setItem('all_city_list', JSON.stringify(all_city_list))
    }
    // 调用封装的方法处理服务器返回的源数据，生成符合渲染的新数据
    let { cityData, cityDataKey } = formatSourceData(all_city_list)


    // 请求热门城市数据
    let hot_city_list
    if (localStorage.getItem('hot_city_list')) {
      hot_city_list = JSON.parse(localStorage.getItem('hot_city_list'))
    } else {
      let res_hot = await this.$request({
        url: '/area/hot'
      })
      hot_city_list = res_hot.body
      localStorage.setItem('hot_city_list', JSON.stringify(hot_city_list))
    }

    // 将热门城市添加到新数据中
    cityData['hot'] = hot_city_list
    cityDataKey.unshift('hot')

    // 将当前定位城市(以数组形式)添加到新数据中
    cityData['#'] = [this.state.currentCityInfo]
    cityDataKey.unshift('#')

    // 整合所有数据设置给this.state，方便后续对城市列表渲染
    this.setState({
      cityData,
      cityDataKey
    })
  }

  // 实现订阅方法，更新组件数据
  fnStoreChange = () => {
    this.setState(
      {
        currentCityInfo: store.getState()
      },
      // this.setState()第二参数是一个回调，在第一参数操作完毕后会执行
      // 可用于及时更新共享在redux中state中后续添加的内容
      () => {
        this.setState(state => {
          let _cityData = state.cityData
          _cityData['#'] = [state.currentCityInfo]
          return {
            cityData: _cityData
          }
        })
      }
    )
  }

  // 通过此方法实现react-virtualized中长列表List组件可视化渲染
  rowRenderer = ({ key, index, style }) => {
    // 通过传入的index拿到cityDataKey中的字母，获取到cityData对象中该字母对应的数组，以便下一步遍历
    let letter = this.state.cityDataKey[index]
    let list = this.state.cityData[letter]
    // 这里放置之前被遍历元素的内部循环体，即遍历的map方法return的结构
    return (
      <div className='city_group' key={key} style={style}>
        <h4>{formatCityDataKey(letter)}</h4>
        <ul>
          {list.map(v => (
            <li key={v.value} onClick={() => this.fnSelectedCurrentCity(v)}>
              {v.label}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // 动态计算react-virtualized中长列表List组件rowHeight的高度
  // 注意：传参方法必须是 {index } 而不是index，官网文档属性要求的
  countRowHeight = ({ index }) => {
    let letter = this.state.cityDataKey[index]
    let listLength = this.state.cityData[letter].length
    // .city_group h4的line-height为40px （內减盒模型无需担心撑大的问题）
    // .city_group ul li的line-height为58px （（內减盒模型无需担心撑大的问题）
    return 40 + 58 * listLength
  }

  // react-virtualized中长列表List组件滚动时触发的回调
  // 注意：文档传入参数必须是 {startIndex}，react-virtualized文档属性要求的
  onRowsRendered = ({ startIndex }) => {
    this.setState({
      currentIndex: startIndex
    })
  }

  // 选中右侧城市名首字母缩写时触发
  fnSelected = index => {
    // 调用react-virtualized中长列表List组件内置的scrollToRow滚动到对应index的那一行
    this.virListRef.current.scrollToRow(index)
  }

  // 选择城市列表请求数据
  fnSelectedCurrentCity = async v => {
    if (v.value === this.state.currentCityInfo.value) {
      Toast.info('当前城市已选择', 2)
      return
    }
    // 请求接口
    let res = await this.$request({
      url: `/area/info?name=${v.label}`
    })

    if (res.status === 200) {
      // 当前选择城市与服务器返回的城市名不一致，说明当前选择城市并未展开业务
      if (res.body.label !== v.label) {
        Toast.info('当前选择城市并无此业务', 2)
        return
      }
      // 提交同步到redux
      store.dispatch({
        type: 'store_CurrentCityInfo',
        value: res.body
      })

      // 将当前选择存储到sessionStorage（替换之前Home页面的存储内容，方便后续操作数据）
      sessionStorage.setItem('currentCityInfo', JSON.stringify(res.body))
    }
    // 关闭列表
    this.props.fnSwitchCityList('city_wrap')
  }

  componentDidMount () {
    this.requestCityList()
  }

  componentWillUnmount () {
    // 组件销毁前取消store订阅
    this.unsubscribe()
  }

  render () {
    let { cityDataKey, currentIndex } = this.state
    return (
      <div className={this.props.switchCity}>
        <div className='city_title'>
          {/* 遵循单向数据流的规则，传入一个方法用于修改父组件中的数据 */}
          <span
            className='shutoff iconfont icon-shut'
            onClick={() => this.props.fnSwitchCityList('city_wrap')}
          ></span>
          <h3>选择城市</h3>
        </div>

        <div className='group_con'>
          {/* 使用react-virtualized中的AutoSizer组件children属性定义函数做List组件宽高自适应 */}
          {/* 使用react-virtualized中的可视化加载组件List组件 替换之前的列表渲染 */}
          <AutoSizer>
            {({ width, height }) => (
              <List
                width={width}
                height={height}
                rowCount={cityDataKey.length}
                // rowHeight属性：因是适应不同的移动端设备，因此需要定义方法动态计算高度
                rowHeight={this.countRowHeight}
                // rowRenderer属性：定义List组件会重复调用这个方法多次实现遍历
                rowRenderer={this.rowRenderer}
                // onRowsRendered属性：定义List组件上下滑动时触发的回调
                onRowsRendered={this.onRowsRendered}
                // scrollToAlignment属性：定义滚动时对应行的对齐方式
                scrollToAlignment='start'
                ref={this.virListRef}
              />
            )}
          </AutoSizer>
        </div>
        <ul className='city_index'>
          {cityDataKey.map((item, index) => (
            <li
              key={item}
              className={currentIndex === index ? 'active' : ''}
              onClick={() => this.fnSelected(index)}
            >
              <span>{item === 'hot' ? '热' : item.toUpperCase()}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

export default City
