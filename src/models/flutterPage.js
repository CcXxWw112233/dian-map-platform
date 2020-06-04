export default {
    namespace:"flutterPage",
    state:{
        // home -- addproject -- other
        type:"home"
    },
    effects:{

    },
    reducers:{
        updateDatas(state,{payload}){
            return {...state, ...payload }
        }
    }
}