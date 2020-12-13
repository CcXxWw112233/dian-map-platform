export default {
  namespace:"collectionDetail",
  state:{
    selectData: null,
    collections:[],
    showCollectionsModal: false,
    zIndex:10,
    type:'view',
    isImg: true,
    small: false,
    selectPoi: "",
    selectedFeature: null
  },
  effects:{

  },
  reducers:{
    updateDatas(state,{ payload }){
      return {...state, ...payload}
    }
  }
}
