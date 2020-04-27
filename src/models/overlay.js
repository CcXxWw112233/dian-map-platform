export default {
  namespace:"overlay",
  state:{
    childComponet: null,
    show:false
  },
  effects:{
    
  },
  reducers:{
    updateDatas(state,{payload}){
      return {...state, ...payload}
    }
  },
}