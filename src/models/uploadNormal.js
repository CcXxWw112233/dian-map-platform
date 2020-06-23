export default {
    namespace:"uploadNormal",
    state:{
        uploading_file_list:[],
        swich_render_upload:false,
        show_upload_notification:false,
    },
    effects:{
        *updateFileList({ payload },{select,put}){
            let list = payload.data;
            let { uploading_file_list } = yield select(({uploadNormal: {uploading_file_list}}) => ({uploading_file_list}));

            let arr = [];
            list && list.forEach(item => {
                let file = uploading_file_list.find(f => f.uid === item.uid);
                if(!file){
                    arr.push(item);
                }
                else {
                    item = file;
                    arr.push(item);
                }
            })
            // 保存
            yield put({
                type:"updateDatas",
                payload:{
                    show_upload_notification:true,
                    uploading_file_list: arr
                }
            })
        },
        *uploadSuccess({ payload },{select,put}){
            let { uploading_file_list } = yield select(({uploadNormal: {uploading_file_list}}) => ({uploading_file_list}));
            let arr = uploading_file_list.filter(item => item.uid !== payload.uid);
            yield put({
                type:"updateDatas",
                payload:{
                    uploading_file_list: arr,
                    show_upload_notification: arr.length ? true: false  
                }
            })
        }
    },
    reducers:{
        updateDatas(state,{payload}){
            return {...state, ...payload}
        }
    }
}