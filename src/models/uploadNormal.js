export default {
    namespace:"uploadNormal",
    state:{
        uploading_file_list:[],
        swich_render_upload:false,
        show_upload_notification:false,
    },
    effects:{

    },
    reducers:{
        updateDatas(state,{payload}){
            return {...state, ...payload}
        }
    }
}