export default {
  namespace: "areaSearch",
  state: {
    // 下拉框状态
    provinceOptions: [],
    cityOptions: [],
    districtOptions: [],
    townOptions: [],
    villageOptions: [],
    // 选中的区划代码
    provinceCode: null,
    cityCode: null,
    districtCode: null,
    townCode: null,
    villageCode: null,
    // 下拉框禁用状态
    cityDisabled: true,
    districtDisabled: true,
    townDisabled: true,
    villageDisabled: true,
    okDisabled: true,
    locationName: "中国", 
    adcode: ""
  },
  effects: {},
  reducers: {
    update(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
