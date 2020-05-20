export default {
  namespace: "tempPlotting",
  state: {
    panelVisible: false,
    iconVisible: false,
  },
  effects: {},
  reducers: {
    updateVisible(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
