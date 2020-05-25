import { BASIC } from '../services/config'
let isMobile = BASIC.getUrlParam.isMobile;
export default {
    namespace:"openswitch",
    state:{
        // 左侧菜单开关
        slideSwitch: isMobile ? false: true,
        // 是否需要显示开关按钮
        showSlideButton:isMobile ? false: true,
        // 右侧图例开关
        lengedSwitch: false,
        // 是否需要显示图例按钮
        showLengedButton:isMobile ? false: true,
    },
    effects:{

    },
    reducers:{
        updateDatas(state,{payload,desc}){
            return {...state, ...payload}
        }
    }
}