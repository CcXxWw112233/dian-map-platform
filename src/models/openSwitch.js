import { BASIC } from '../services/config'
let isMobile = BASIC.getUrlParam.isMobile === "1";
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
        // 是否显示右上角的工具
        toolBars: isMobile ? false: true,
        // 是否显示底部的工具
        bottomTools: isMobile ? false: true,
        //显示搜索工具条
        searchTools: isMobile ? false: true,
        // 是否显示手机端的页面
        isShowMobile: false,
        // 是否显示规划图编辑
        isShowPlanPicEdit: false,
        // 是否显示右侧的工具
        isShowTempPlot: isMobile ? false: true,
        // 是否显示元素的text名称
        showFeatureName:true,
    },
    effects:{

    },
    reducers:{
        updateDatas(state,{payload,desc}){
            return {...state, ...payload}
        }
    }
}