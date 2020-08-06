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

    isShowBasemapGallery: isMobile ? false : true,
    isShowRightTools: isMobile ? false : true,
    isShowLeftToolBar: isMobile ? false : true,
    isShowPhotoSwipe: isMobile ? false : true,
  },
  effects: {},
  reducers: {
    updateDatas(state, { payload, desc }) {
      return { ...state, ...payload };
    },
  },
};
