export default {
  namespace:"lengedList",
  state:{
    config: []
  },
  effects:{

  },
  reducers:{
    updateLengedList(state, { payload }){
      return {...state, ...payload }
    }
  }
}
