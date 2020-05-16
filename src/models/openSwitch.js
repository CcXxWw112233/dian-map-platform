export default {
    namespace:"openswitch",
    state:{
        // 左侧菜单开关
        slideSwitch:true,
        // 是否需要显示开关按钮
        showSlideButton:true,
        // 右侧图例开关
        lengedSwitch: false,
        // 是否需要显示图例按钮
        showLengedButton:true
    },
    effects:{

    },
    reducers:{
        updateDatas(state,{payload,desc}){
            return {...state, ...payload}
        }
    }
}