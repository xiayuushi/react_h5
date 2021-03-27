const defaultData = {}

const reducer = (state = defaultData, action) => {
  if (action.type === 'store_CurrentCityInfo') {
    return action.value
  }
  return state
}

export default reducer
