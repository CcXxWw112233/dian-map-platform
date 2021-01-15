export default {
  namespace: "meetingSubscribe",
  state: {
    hotelNames: [],
    panelVisible: false
  },
  effects: {},
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
