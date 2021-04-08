import React, { Component } from 'react'
import './houselist.css'

import { withRouter } from 'react-router-dom'
import { PickerView, Toast } from 'antd-mobile'
import { List, AutoSizer, InfiniteLoader } from 'react-virtualized'

import store from '../../store'
import { BASEURL } from '../../utils/base_url'

import notFound from '../../asstes/images/not-found.png'

// 导入抽取的公共组件
import Switchcity from '../../components/switchcity/switchcity'

// 头部搜索组件
class Topbar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentCity: store.getState().label,
      switchCity: 'city_wrap'
    }
  }

  render () {
    return (
      <div>
        <div className='list_title'>
          <span
            className='back iconfont icon-prev'
            onClick={() => this.props.history.goBack()}
          ></span>
          <Switchcity />
          <i
            className='iconfont icon-ic-maplocation-o tomap'
            onClick={() => this.props.history.push('/map')}
          ></i>
        </div>
      </div>
    )
  }
}
// 筛选组件
class Filter extends Component {
  constructor (props) {
    super(props)
    this.state = {
      // 整个选项卡面板
      filterList: [
        {
          title: '区域',
          type: 'area'
        },
        {
          title: '方式',
          type: 'mode'
        },
        {
          title: '租金',
          type: 'price'
        },
        {
          title: '筛选',
          type: 'more'
        }
      ],
      // 前三个选项卡（级联选择器PickerView）
      isSlide: false,
      // 最后一个选项卡（非PickerView组件）
      isTag: false,
      // 当前类名（与房源信息中的type数据关联）
      currentClass: '',
      // 当前定位城市信息
      currentCityInfo: store.getState(),
      // 服务器返回的所有选项卡的数据源
      allFilterData: {},
      // 当前级联选择器选项卡的渲染数据（三个PickerView组件中 被选中的那一个的数据）
      selectedPickerViewData: [],
      // 级联选择器列数（当前页面中不同的PickerView列数不一样）
      PickerViewCols: 1,
      // 选项卡选中的值 设置初始值 方便后续设置布尔值添加高亮效果
      allFilterVal: {
        area: ['area', 'null'],
        mode: ['null'],
        price: ['null'],
        more: []
      },
      // 选项卡是否高亮显示
      allFilterLightHeight: {
        area: false,
        mode: false,
        price: false,
        more: false
      },
      // 最后一个选项卡的渲染数据整合
      tagsFilterData: []
    }
    // 订阅store修改
    this.unsubscribe = store.subscribe(this.fnStoreChange)
  }
  // store通知组件更新数据
  fnStoreChange = () => {
    this.setState(
      {
        // 重新获取当前定位城市信息
        currentCityInfo: store.getState()
      },
      () => {
        this.fnGetFilterData()
        // 重置筛选数据以及选项卡高亮状态
        this.setState({
          allFilterVal: {
            area: ['area', 'null'],
            mode: ['null'],
            price: ['null'],
            more: []
          },
          allFilterLightHeight: {
            area: false,
            mode: false,
            price: false,
            more: false
          }
        })
      }
    )
  }
  // 弹框显示
  fnShowPop = type => {
    // 点击前三个列表选项 弹出.slide面板弹框 否则弹出.tags面板弹框
    // 同时显示PickerView级联选择器的面板
    // 使用currentClass记录当前的点击项
    // 使用selectedPickerViewData来存储不同面板的级联选择器不同的数据源
    let selectedPickerViewData = []
    let PickerViewCols = 1
    // 使用tagsFilterData来存储整合后的最后一个选项卡的数据
    let tagsFilterData = {}
    // 所有选项卡的数据
    let {
      area, // 区域
      characteristic, // 租房特征
      floor, // 楼层
      oriented, // 朝向
      price, // 价格
      rentType, // 租房限制
      roomType, // 房间户型
      subway // 地铁
    } = this.state.allFilterData
    if (type !== 'more') {
      // 不同的type类型 对应级联选择器数据data属性的数据不同 cols列数不同
      if (type === 'area') {
        selectedPickerViewData = [area, subway]
        PickerViewCols = 3
      }
      if (type === 'mode') {
        selectedPickerViewData = rentType
      }
      if (type === 'price') {
        selectedPickerViewData = price
      }
      this.setState({
        isSlide: true,
        isTag: false,
        currentClass: type,
        selectedPickerViewData,
        PickerViewCols
      })
    } else {
      // 最后一个选项卡不是PickerView
      // 且根据页面情况，需要整合数据才能方便渲染
      tagsFilterData = [
        {
          title: '户型',
          data: roomType
        },
        {
          title: '朝向',
          data: oriented
        },
        {
          title: '楼层',
          data: floor
        },
        {
          title: '房屋亮点',
          data: characteristic
        }
      ]

      this.setState({
        isSlide: false,
        isTag: true,
        tagsFilterData
      })
    }
  }
  // 弹框隐藏
  fnHidePop = () => {
    this.setState({
      isSlide: false,
      isTag: false,
      currentClass: ''
    })
  }

  // 查询当前城市的房源信息
  fnGetFilterData = async () => {
    let { currentCityInfo } = this.state

    // 使用缓存优化组件渲染：缓存有，取缓存数据，否则调接口请求
    let haoke_filter_data = localStorage.getItem(
      `haoke_filter_data_${currentCityInfo.value}`
    )
    // 当前组件房源信息
    let allFilterData = {}

    if (haoke_filter_data) {
      allFilterData = JSON.parse(haoke_filter_data)
    } else {
      let res = await this.$request({
        url: `/houses/condition?id=${currentCityInfo.value}`
      })
      if (res.status === 200) {
        allFilterData = res.body
        // 存储当前房源信息到localStorage 以便优化组件渲染速度
        localStorage.setItem(
          `haoke_filter_data_${currentCityInfo.value}`,
          JSON.stringify(allFilterData)
        )
        this.setState(
          {
            allFilterData
          },
          () => {
            // 从所有过滤数据中拿出最后那个选项卡所需要的过滤数据
            let {
              roomType,
              oriented,
              floor,
              characteristic
            } = this.state.allFilterData
            this.setState({
              // 拼接成适合列表渲染的数组
              tagsFilterData: [
                { title: '户型', data: roomType },
                { title: '朝向', data: oriented },
                { title: '楼层', data: floor },
                { title: '房屋亮点', data: characteristic }
              ]
            })
          }
        )
      }
    }
  }

  // 存储前三个选项卡（PickerView级联选择器）选中的值
  onChange = v => {
    this.setState(
      state => {
        // 浅拷贝地址引用
        let _allFilterVal = state.allFilterVal
        _allFilterVal[state.currentClass] = v
        return {
          allFilterVal: _allFilterVal
        }
      },
      () => {
        this.isLightHeight()
      }
    )
  }

  // 存储最后一个选项卡选中的值
  selsectedTag = v => {
    let newTagsFilterVal = []
    // 数组之前不存在 选中的项 就将选中的项加入数组
    if (!this.state.allFilterVal.more.includes(v)) {
      newTagsFilterVal = [...this.state.allFilterVal.more, v]
    } else {
      // 否则就从数组中剔除
      newTagsFilterVal = [...this.state.allFilterVal.more].filter(
        item => item !== v
      )
    }
    this.setState(
      state => {
        state.allFilterVal.more = newTagsFilterVal
        return {
          allFilterVal: state.allFilterVal
        }
      },
      () => {
        this.isLightHeight()
      }
    )
  }

  // 选项卡是否高亮显示
  isLightHeight = () => {
    this.setState(state => {
      let { allFilterVal, allFilterLightHeight } = state

      // 通过选项卡的初始值去判断是否高亮：如果被选中的值不是原始初始值 则高亮显示
      if (allFilterVal.area[0] !== 'area' || allFilterVal.area[1] !== 'null') {
        // 注意：此处如果是 && 则 'area'选项一律不会高亮
        allFilterLightHeight.area = true
      } else {
        allFilterLightHeight.area = false
      }

      if (allFilterVal.mode[0] !== 'null') {
        allFilterLightHeight.mode = true
      } else {
        allFilterLightHeight.mode = false
      }

      if (allFilterVal.price[0] !== 'null') {
        allFilterLightHeight.price = true
      } else {
        allFilterLightHeight.price = false
      }

      if (allFilterVal.more.length !== 0) {
        allFilterLightHeight.more = true
      } else {
        allFilterLightHeight.more = false
      }

      return {
        allFilterLightHeight
      }
    })
  }

  // 整合所有选项卡选中的值allFilterVal以便符合接口文档参数用于请求详细的房源信息
  // 例如：paramsData={area:'xxx',rentType:'xxx',price:'xxx',more:'xxx,yyy'}
  fnSetParams = async () => {
    // 对象在操作时，使用深拷贝切断引用关系
    let _allFilterVal = JSON.parse(JSON.stringify(this.state.allFilterVal))
    let paramsData = {}

    // 接口文档要求area参数是一个字符串（将数组改成字符串：数组中，多个area的值只取最后一个）
    // area第三个值不存在 则对应这两种情况 ['area','null']、['subway','null'] 此时只要取'null'即可 因为有cityid因此area或者subway为null不会报错
    // area第三个值存在 则对应 ['area或者subway','xxx','null']、['area或者subway','xxx','yyy'] 此时前者取'xxx' 后者取'yyy'
    // 因为键有两种情况：area或者subway 因此需要使用中括号语法动态取key 即 area['area'] || area['subway']等同于 area.area || area.subway
    if (_allFilterVal.area[2] === undefined) {
      paramsData[_allFilterVal.area[0]] = 'null'
    } else if (_allFilterVal[2] === 'null') {
      paramsData[_allFilterVal.area[0]] = _allFilterVal.area[1]
    } else {
      paramsData[_allFilterVal.area[0]] = _allFilterVal.area[2]
    }
    // 接口文档要求rentType参数是一个字符串（mode数组只有一个值，直接取数组的值）
    paramsData.rentType = _allFilterVal.mode[0]
    // 接口文档要求price参数是一个字符串（price数组只有一个值，但是需要剔除不需要的部分，因此字符串转成数组，再通过索引取需要的那部分字符串）
    paramsData.price = _allFilterVal.price[0].split('|')[1]
    // 接口文档要求more参数是一个字符串（将more数组转成字符串，数组中，多个参数的值需要转成字符串以逗号分隔进行拼接）
    paramsData.more = _allFilterVal.more.join()
    // console.log(paramsData)

    // 因为当前调用的接口与父组件中调用的接口是同一个，且当前是整合了所有选项卡的条件进行调用
    // 因此可以使用子传父，将当前整合的参数对象传入到父组件中的调用方法中，请求所有符合条件的房源数据
    this.props.fnGetHouses(paramsData)

    // 关闭弹窗
    this.fnHidePop()
  }

  componentDidMount () {
    this.fnGetFilterData()
  }

  componentWillUnmount () {
    this.unsubscribe()
  }

  render () {
    let {
      filterList,
      isSlide,
      isTag,
      currentClass,
      selectedPickerViewData,
      PickerViewCols,
      tagsFilterData,
      allFilterVal,
      allFilterLightHeight
    } = this.state
    return (
      <div>
        <ul className='filter_list'>
          {filterList.map(item => (
            <li
              className={
                (currentClass === item.type ? 'current' : '') +
                (allFilterLightHeight[item.type] ? ' active' : '')
              }
              key={item.type}
              onClick={() => this.fnShowPop(item.type)}
            >
              <span>{item.title}</span>
              <i className='iconfont icon-xialajiantouxiangxia'></i>
            </li>
          ))}
        </ul>
        {/* 弹框1面板及遮罩层 */}
        <div
          className={
            isSlide ? 'slide_pannel pannel_in' : 'slide_pannel pannel_out'
          }
        >
          <div className='slide_comp'>
            {/* PickerView 选择器 */}
            <PickerView
              onChange={this.onChange}
              value={allFilterVal[currentClass]}
              data={selectedPickerViewData}
              cols={PickerViewCols}
            />
          </div>
          <div className='slide_btns'>
            <span onClick={this.fnHidePop}>取消</span>
            <b onClick={this.fnSetParams}>确定</b>
          </div>
        </div>
        <div
          className={isSlide ? 'mask mask_in' : 'mask mask_out'}
          onClick={this.fnHidePop}
        ></div>
        {/* 弹框2面板及遮罩层 */}
        <div
          className={
            isTag ? 'tags_pannel tags_pannel_in' : 'tags_pannel tags_pannel_out'
          }
        >
          <div className='tags_list'>
            {tagsFilterData.map(item => (
              <div key={item.title}>
                <h3>{item.title}</h3>
                <div className='ul_wrap'>
                  <ul>
                    {item.data.map(v => (
                      <li
                        className={
                          allFilterVal.more.includes(v.value) ? 'active' : ''
                        }
                        key={v.value}
                        onClick={() => this.selsectedTag(v.value)}
                      >
                        {v.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className='tags_btns'>
            <span onClick={this.fnHidePop}>取消</span>
            <b onClick={this.fnSetParams}>确定</b>
          </div>
        </div>
        <div
          className={isTag ? 'mask2 mask_in' : 'mask2 mask_out'}
          onClick={this.fnHidePop}
        ></div>
      </div>
    )
  }
}

// 调用withRouter高阶组件生成能够路由跳转的新组件
const WithTopbar = withRouter(Topbar)

class Houselist extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentCityInfo: store.getState(),
      housesList: [],
      housesCount: 0,
      // 服务器数据是否加载完毕
      isFinished: false
    }
    // 订阅redux中store修改
    this.unsubscribe = store.subscribe(this.fnStoreChange)
  }

  fnStoreChange = () => {
    this.setState(
      {
        currentCityInfo: store.getState()
      },
      () => {
        this.fnGetHouses()
      }
    )
  }
  componentDidMount () {
    this.fnGetHouses()
  }
  componentWillUnmount () {
    this.unsubscribe()
  }

  // 请求房源数据(params是子组件传输过来的筛选条件数据)
  fnGetHouses = async params => {
    let { currentCityInfo } = this.state

    Toast.loading('加载中...')
    // 将子组件传输过来的params数据绑定到this中，方便后续react-virtualized的infiniteLoader方法使用
    this.params = params
    let res = await this.$request({
      url: '/houses',
      params: {
        cityId: currentCityInfo.value,
        start: 1,
        end: 20,
        ...params
      }
    })

    Toast.hide()

    this.setState(
      {
        housesList: res.body.list,
        housesCount: res.body.count,
        isFinished: true
      },
      () => {
        // 当筛选条件发生变更后，重新请求服务器数据时，列表渲染数据会重新从第一行开始
        this.list.scrollToRow(0)
      }
    )
  }

  // react-virtualized的List列表
  rowRenderer = ({ key, index, style }) => {
    let houseItem = this.state.housesList[index]
    // debugger

    // 一开始无法获取到服务器返回的数据会报错
    // 解决方法：条件判断服务器数据未返回之前，使用临时的JSX结构进行渲染（常见使用loading文字提示用户等待加载）
    if (!houseItem) {
      return (
        <div className='reload' key={key} style={style}>
          <div>loading....</div>
        </div>
      )
    }

    // 当服务器数据回来之后，就会加载正常渲染的数据，放弃上面临时替代的JSX结构
    return (
      <div className='house_wrap' key={key} style={style}>
        <div className='house_item'>
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

  // react-virtualized的infiniteLoader方法
  // 是否加载当前行(当数据为空时，转成布尔值的false，就停止加载当前行)
  isRowLoaded = ({ index }) => {
    return !!this.state.housesList[index]
  }
  // 是否加载更多行（设置类似分页的起止、重新调用接口请求渲染列表、拼接新旧数组实现无限加载）
  loadMoreRows = ({ startIndex, stopIndex }) => {
    let { currentCityInfo } = this.state
    return this.$request({
      url: '/houses',
      params: {
        cityId: currentCityInfo.value,
        start: startIndex,
        end: stopIndex,
        // params是子组件传输给当前组件的，
        // 在当前组件不使用形参接收，而是通过绑定this再传入到当前方法中也是不错的选择
        ...this.params
      }
    }).then(res => {
      this.setState(state => {
        // 拼接新旧数组，实现数据无限加载
        // 两个扩展运算符展开，如果后面缺少一个扩展运算符会报错：map is not defined..
        let nextPageList = [...state.housesList, ...res.body.list]
        return {
          housesList: nextPageList
        }
      })
    })
  }

  render () {
    let { housesCount, housesList, isFinished } = this.state
    return (
      <div>
        <WithTopbar />
        <Filter fnGetHouses={this.fnGetHouses} />
        <div className='house_list_con'>
          <InfiniteLoader
            isRowLoaded={this.isRowLoaded}
            loadMoreRows={this.loadMoreRows}
            rowCount={housesCount}
          >
            {({ onRowsRendered, registerChild }) => (
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    height={height}
                    rowCount={housesCount}
                    rowHeight={120}
                    rowRenderer={this.rowRenderer}
                    width={width}
                    onRowsRendered={onRowsRendered}
                    ref={list => {
                      // ref属性值传入函数的方式，技能满足组件取DOM又不影响调用InfiniteLoader组件中的registerChild()取DOM
                      // 传入形参list （形参list就是当前组件）
                      // 且将形参list绑定到组件的this.list中 后续可以直接this.list获取到当前List组件的DOM
                      this.list = list
                      // 调用InfiniteLoader组件中的registerChild()传入形参也可以通过该方法获取到当前List组件
                      registerChild(list)
                    }}
                  />
                )}
              </AutoSizer>
            )}
          </InfiniteLoader>
          {housesList.length === 0 && isFinished && (
            <div className='notfound'>
              <img src={notFound} alt='not-found' />
              <p>没有找到房源，请你换个搜索条件吧~</p>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default Houselist
