export default {
  namespace: "plotting",
  state: {
    type: "",
    layer: null,
    operator: null,
  },
  effects: {},
  reducers: {
    setPotting(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
