export default {
  namespace:"maps",
  state:{
    mapMain: null,
    mapView: null
  },
  effects:{

  },
  reducers:{
    updateDatas(state, { payload }){
      return {...state, ...payload }
    }
  }
}
