export default {
  namespace:"scoutingDetail",
  state:{
    collections:[],
    board:{},
  },
  effects:{

  },
  reducers:{
    updateDatas(state, {payload}){
      return {...state, ...payload}
    }
  }
}
