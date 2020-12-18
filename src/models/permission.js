export default {
  namespace: "permission",
  state: {
    globalPermission: null,
    projectPermission: null,
    projectId: null
  },
  effects: {},
  reducers: {
    updateDatas(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
