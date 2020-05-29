export default {
  namespace:"scoutingProject",
  state:{
    projectList: [],
    cb: null
  },
  effects:{

  },
  reducers:{
    updateList(state, { payload }){
      return {...state, ...payload }
    }
  }
}
