export default {
    namespace:"editPicture",
    state:{
        editShow: false,
        pictureUrl:"",
        position:{},
        pictureWidth:0,
        pictureHeight:0
    },
    effects:{},
    reducers:{
        updateDatas(state,{payload}){
            return {...state, ...payload}
        }
    }
}