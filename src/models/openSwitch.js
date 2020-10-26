import { BASIC } from "../services/config";
let isMobile = BASIC.getUrlParam.isMobile === "1";
export default {
  namespace: "openswitch",
  state: {
    // 是否显示手机端的页面
    isShowMobile: false,
    // 是否显示规划图编辑
    isShowPlanPicEdit: false,
    // 是否显示元素的text名称
    showFeatureName: true,
    // 是否隐藏左侧面板
    openPanel: true,

    isShowMap: true,
    isShowBasemapGallery: isMobile ? false : true, // 是否显示底图切换
    isShowRightTools: isMobile ? false : true, // 是否显示右侧面板
    isShowLeftToolBar: isMobile ? false : true, // 是否显示左侧面板
    isShowPhotoSwipe: isMobile ? false : true, // 是否显示照片编辑
    isInvalidToolBar: false, // 是否让左边工具条点击失效
  },
  effects: {},
  reducers: {
    updateDatas(state, { payload, desc }) {
      return { ...state, ...payload };
    },
  },
};
