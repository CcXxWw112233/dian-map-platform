export default {
  namespace: "publicDataLink",
  state: {
    publicDataLinkArr: []
  },
  reducers: {
    update (state, { payload }) {
      return { ...state, ...payload }
    }
  }
}