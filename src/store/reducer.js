const reducer = (
  // state预设一个值，方便调试
  state = { label: '深圳', value: 'AREA|a6649a11-be98-b150' },
  action
) => {
  if (action.type === 'store_CurrentCityInfo') {
    return action.value
  }
  return state
}

export default reducer
