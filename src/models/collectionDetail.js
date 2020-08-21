export default {
  namespace:"collectionDetail",
  state:{
    selectData: null,
    collections:[],
    showCollectionsModal: false,
    zIndex:10
  },
  effects:{

  },
  reducers:{
    updateDatas(state,{ payload }){
      return {...state, ...payload}
    }
  }
}
