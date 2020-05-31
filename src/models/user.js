export default {
  namespace:"user",
  state:{
    // 状态
    status: null
  },
  effects:{

  },
  reducers:{
    updateState(state, { payload }){
      return {...state, ...payload }
    }
  }
}
