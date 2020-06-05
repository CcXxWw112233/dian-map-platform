export default {
  namespace: "modal",
  state: {
    visible: false,
    responseData: null,
    isEdit: false,
    featureName: "", // 名称
    selectName: "",
    featureType: "", // 类型
    strokeColorStyle: "", 
    remarks: "", // 备注
    confirmVidible: false
  },
  effects: {},
  reducers: {
    setVisible(state, { payload }) {
      return { ...state, ...payload };
    },
    updateData(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
