export default {
  namespace: "publicMapData",
  state: {
    dataItemStateList: [
      { indeterminate: false, checkAll: false, checkedList: [] },
      { indeterminate: false, checkAll: false, checkedList: [] },
      { indeterminate: false, checkAll: false, checkedList: [] },
      { indeterminate: false, checkAll: false, checkedList: [] },
      { indeterminate: false, checkAll: false, checkedList: [] },
      { indeterminate: false, checkAll: false, checkedList: [] },
      { indeterminate: false, checkAll: false, checkedList: [] },
    ],
  },
  effects: {
    *updateSateByIndex({ payload }, { put, select }) {
      const { state, index } = payload;
      let { dataItemStateList: old_dataItemStateList } = yield select(
        (_) => _.publicMapData
      );
      let dataItemStateList = JSON.parse(JSON.stringify(old_dataItemStateList));
      dataItemStateList[index] = state;
      yield put({
        type: "updateDataItemStateList",
        payload: {
          dataItemStateList
        },
      });
    },
  },
  reducers: {
    updateDataItemStateList(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
