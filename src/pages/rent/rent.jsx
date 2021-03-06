import React, { Component } from 'react'
import './rent.css'
import Toptitle from '../../components/toptitle/toptitle'
import {
  Picker,
  List,
  InputItem,
  ImagePicker,
  TextareaItem,
  Toast
} from 'antd-mobile'
import store from '../../store'

// 级联选择器数据
// 房屋类型
const roomTypeData = [
  { label: '一室', value: 'ROOM|d4a692e4-a177-37fd' },
  { label: '二室', value: 'ROOM|d1a00384-5801-d5cd' },
  { label: '三室', value: 'ROOM|20903ae0-c7bc-f2e2' },
  { label: '四室', value: 'ROOM|ce2a5daa-811d-2f49' },
  { label: '四室+', value: 'ROOM|2731c38c-5b19-ff7f' }
]

// 朝向：
const orientedData = [
  { label: '东', value: 'ORIEN|141b98bf-1ad0-11e3' },
  { label: '西', value: 'ORIEN|103fb3aa-e8b4-de0e' },
  { label: '南', value: 'ORIEN|61e99445-e95e-7f37' },
  { label: '北', value: 'ORIEN|caa6f80b-b764-c2df' },
  { label: '东南', value: 'ORIEN|dfb1b36b-e0d1-0977' },
  { label: '东北', value: 'ORIEN|67ac2205-7e0f-c057' },
  { label: '西南', value: 'ORIEN|2354e89e-3918-9cef' },
  { label: '西北', value: 'ORIEN|80795f1a-e32f-feb9' }
]

// 楼层
const floorData = [
  { label: '高楼层', value: 'FLOOR|1' },
  { label: '中楼层', value: 'FLOOR|2' },
  { label: '低楼层', value: 'FLOOR|3' }
]

// 房屋配置
const oSupport = [
  { key: '衣柜', sClass: 'iconfont icon-yigui' },
  { key: '洗衣机', sClass: 'iconfont icon-xiyiji' },
  { key: '空调', sClass: 'iconfont icon-kongtiao' },
  { key: '天然气', sClass: 'iconfont icon-tianranqi' },
  { key: '冰箱', sClass: 'iconfont icon-bingxiang' },
  { key: '电视', sClass: 'iconfont icon-dianshi' },
  { key: '热水器', sClass: 'iconfont icon-reshuiqi' },
  { key: '沙发', sClass: 'iconfont icon-shafa' },
  { key: '暖气', sClass: 'iconfont icon-nuanqi' },
  { key: '宽带', sClass: 'iconfont icon-_huabanfuben' }
]

class Rent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentCityInfo: store.getState(),
      price: '',
      size: '',
      roomType: [],
      floor: [],
      oriented: [],
      searchKeyWords: '',
      title: '',
      houseImg: [],
      multiple: true,
      // 用于过滤当前选中的图标的数组
      supportList: [],
      description: '',
      toggleClass: 'search_pannel_con',
      communityList: [],
      community: ''
    }
  }

  // input表单双向绑定
  fnOnChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  // InputItem表单的双向数据绑定
  // 考虑到组件中使用到了多个InputItem，因此需要改造其方法便于通用，简化代码量
  fnInputItemChange = (val, key) => {
    this.setState({
      [key]: val
    })
  }

  // Picker组件的双向数据绑定
  // 考虑到组件中使用到了多个Picker，因此需要改造其方法便于通用，简化代码量
  fnPickerChange = (val, key) => {
    this.setState({
      [key]: val
    })
  }

  // 根据关键字搜索小区
  fnQueryKeyWords = async () => {
    let name = this.state.searchKeyWords
    let id = this.state.currentCityInfo.value
    let res = await this.$request({
      url: '/area/community',
      params: {
        name,
        id
      }
    })

    this.setState({
      communityList: res.body
    })
  }

  // 选择小区
  selectedCommunity = v => {
    this.setState(
      {
        searchKeyWords: v.communityName,
        community: v.community
      },
      this.fnOpenPannel()
    )
  }

  // 发布房源
  releaseHouse = async () => {
    // 解构接口参数所需的值
    let {
      title,
      description,
      houseImg,
      oriented,
      supportList,
      price,
      roomType,
      size,
      floor,
      community
    } = this.state

    // 必须发布房源图片才能进行后续接口请求
    if (supportList.length === 0) {
      Toast.info('请先上传房屋图片！')
      return
    }

    // 图片上传接口
    // 调用此接口将 base64格式转成图片路径 /uploads/xxx.jpg
    // 创建FormData对象用于参数拼接
    let fd = new FormData()

    // 拼接参数
    houseImg.map(v => fd.append('file', v.file))

    // 上传房源图片
    let upLoadRes = await this.$request({
      url: '/houses/image',
      method: 'post',
      data: fd
    })

    if (upLoadRes.status === 200) {
      // 将上传的图片数据转成接口所需要的格式
      let houseImg = upLoadRes.body.join('|')

      // 将选中图标与文字转成接口所需要的格式
      let supporting = supportList.join('|')

      // 将参数数据转成符合接口要求的形式
      oriented = oriented[0]
      roomType = roomType[0]
      floor = floor[0]

      // 发布房源
      let res = await this.$request({
        url: '/user/houses',
        method: 'post',
        data: {
          title,
          description,
          houseImg,
          oriented,
          supporting,
          price,
          roomType,
          size,
          floor,
          community
        }
      })

      if (res.status === 200) {
        Toast.success('发布成功！', 2, () => {
          this.props.history.push('/rentlist')
        })
      } else {
        Toast.fail('发布失败，请稍后再试！', 2)
      }
    }
  }

  // ImagePicker图片上传相关方法
  onImagePickerChange = files => {
    this.setState({
      houseImg: files
    })
  }

  // 点击图标添加/移除样式
  toggleSupport = v => {
    this.setState(state => {
      // 复制一份state中的数组
      // let _supportList = JSON.parse(JSON.stringify(state.supportList))
      let _supportList = [...state.supportList]
      // 判断，有则剔除、无则添加
      if (_supportList.includes(v)) {
        _supportList = _supportList.filter(item => item !== v)
      } else {
        _supportList.push(v)
      }
      // 返回数据并重新设置state中的数组
      return {
        supportList: _supportList
      }
    })
  }

  // TextareaItem双向数据绑定
  fnChangeTextareaItem = v => {
    this.setState({
      description: v
    })
  }

  // 切换隐藏面板
  fnOpenPannel = () => {
    this.setState(state => {
      if (state.toggleClass === 'search_pannel_con') {
        return {
          toggleClass: 'search_pannel_con show_pannel'
        }
      } else {
        return {
          toggleClass: 'search_pannel_con'
        }
      }
    })
  }
  render () {
    const {
      price,
      size,
      roomType,
      floor,
      oriented,
      houseImg,
      toggleClass,
      communityList,
      searchKeyWords,
      title,
      multiple,
      supportList,
      description
    } = this.state

    return (
      <div className='rent_con'>
        <Toptitle title='去出租' history={this.props.history} />

        <div className='info_con'>
          <h3 className='title_con'>房源信息</h3>

          <div className='common_con' onClick={this.fnOpenPannel}>
            <span className='sub_title'>小区名称</span>
            <i className='iconfont icon-next fr'></i>
            <span className='community fr'>{searchKeyWords}</span>
          </div>

          <div className='common_con flex_con'>
            <span className='sub_title'>租金</span>
            <input
              type='text'
              placeholder='请输入租金/月'
              value={price}
              name='price'
              onChange={this.fnOnChange}
            />
            <span className='fr'>￥/月</span>
          </div>

          <div className='common_con flex_con'>
            <span className='sub_title'>建筑面积</span>
            <input
              type='text'
              placeholder='请输入租金/月'
              value={size}
              name='size'
              onChange={this.fnOnChange}
            />
            <span className='fr'>㎡</span>
          </div>

          <Picker
            data={roomTypeData}
            title='选择户型'
            cascade={true}
            cols={1}
            extra='请选择'
            value={roomType}
            onChange={val => this.fnPickerChange(val, 'roomType')}
          >
            <List.Item arrow='horizontal'>户型</List.Item>
          </Picker>

          <Picker
            data={floorData}
            title='选择楼层'
            cascade={true}
            cols={1}
            extra='请选择'
            value={floor}
            onChange={val => this.fnPickerChange(val, 'floor')}
          >
            <List.Item arrow='horizontal'>所在楼层</List.Item>
          </Picker>

          <Picker
            data={orientedData}
            title='选择朝向'
            cascade={true}
            cols={1}
            extra='请选择'
            value={oriented}
            onChange={val => this.fnPickerChange(val, 'oriented')}
          >
            <List.Item arrow='horizontal'>朝向</List.Item>
          </Picker>

          <h3 className='sub_title_con'>房屋标题</h3>
          <InputItem
            placeholder='请输入房屋标题'
            value={title}
            onChange={val => this.fnInputItemChange(val, 'title')}
          />

          <h3 className='sub_title_con'>房屋图像</h3>
          <ImagePicker
            files={houseImg}
            onChange={files => this.onImagePickerChange(files)}
            multiple={multiple}
          />

          <h3 className='sub_title_con'>房屋配套</h3>
          <div className='support_list'>
            {oSupport.map((v, i) => (
              <div
                className={
                  supportList.includes(v.key) ? 'icon_con active' : 'icon_con'
                }
                key={i}
                onClick={() => {
                  this.toggleSupport(v.key)
                }}
              >
                <i className={v.sClass}></i>
                <span>{v.key}</span>
              </div>
            ))}
          </div>

          <h3 className='sub_title_con'>房屋描述</h3>
          <div className='textarea_con'>
            <TextareaItem
              value={description}
              rows={5}
              placeholder='请输入房屋描述信息'
              autoHeight
              onChange={val => {
                this.fnChangeTextareaItem(val)
              }}
            />
          </div>
        </div>

        <div className='button_con'>
          <button className='cancel'>取消</button>
          <button className='sure' onClick={this.releaseHouse}>
            确定
          </button>
        </div>

        {/* 隐藏的搜索面板 */}
        <div className={toggleClass}>
          <div className='search_top_con'>
            <InputItem
              placeholder='请输入搜索关键字'
              value={searchKeyWords}
              onChange={val => this.fnInputItemChange(val, 'searchKeyWords')}
            />
            {/* 条件渲染：searchKeyWords有值 则按钮文本显示'确定'、否则显示取消 */}
            {searchKeyWords ? (
              <button className='search_cancel' onClick={this.fnQueryKeyWords}>
                确定
              </button>
            ) : (
              <button className='search_cancel' onClick={this.fnOpenPannel}>
                取消
              </button>
            )}
          </div>

          <ul className='search_list_con'>
            {communityList.map(v => (
              <li key={v.community} onClick={() => this.selectedCommunity(v)}>
                {v.communityName}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
}

export default Rent
