export default {
  namespace:"controller",
  state:{
    mainVisible: true
  },
  effects:{

  },
  reducers:{
    updateMainVisible(state, { payload }){
      return {...state, ...payload }
    }
  }
}
