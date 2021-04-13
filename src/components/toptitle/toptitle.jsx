import React from 'react'
import './toptitle.css'

let Toptitle = props => {
  return (
    <div className='common_title'>
      <span
        className='back iconfont icon-prev'
        onClick={() => props.history.goBack()}
      ></span>
      <h3>{props.title}</h3>
    </div>
  )
}

export default Toptitle
