export default {
  namespace: "user",
  state: {
    // 状态
    status: null,
    userInfo: {} //用户信息
  },
  effects: {
    *getUserInfo({ payload }, { put, select, call }) {},
    *logOut({ payload }, { put, select, call }) {},
    *getOrganizations({ payload }, { put, select, call }) {},
    *changeOrganization({ payload }, { put, select, call }) {}
  },
  reducers: {
    updateState(state, { payload }) {
      return { ...state, ...payload };
    }
  }
};
