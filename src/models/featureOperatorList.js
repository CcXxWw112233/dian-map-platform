export default {
  namespace: "featureOperatorList",
  state: {
    featureOperatorList: [],
  },
  effects: {
  },
  reducers: {
    updateList(state, { payload }) {
      return { ...state, ...payload };
    },
    deleteItem(state, { payload }) {

    }
  },
};
