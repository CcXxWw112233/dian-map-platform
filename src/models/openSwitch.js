export default {
    namespace:"openswitch",
    state:{
        slideSwitch:true,
        baseMapSwitch: false,
    },
    effects:{

    },
    reducers:{
        updateDatas(state,{payload,desc}){
            return {...state, ...payload}
        }
    }
}