export default {
  namespace: "modal",
  state: {
    visible: false,
    responseData: null,
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
