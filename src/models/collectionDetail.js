export default {
  namespace:"collectionDetail",
  state:{
    selectData: null,
  },
  effects:{

  },
  reducers:{
    updateDatas(state,{ payload }){
      return {selectData: payload.selectData}
    }
  }
}
