export default {
  namespace: "permission",
  state: {
    globalPermission: null,
    projectPermission: null
  },
  effects: {},
  reducers: {
    updateDatas(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
