export default {
  namespace:"controller",
  state:{
    // list 列表页， loading 加载详情页 detail 详情页
    mainVisible: 'loading',
    lastPageState: "list",
  },
  effects:{

  },
  reducers:{
    updateMainVisible(state, { payload }){
      return {...state, ...payload }
    }
  }
}
