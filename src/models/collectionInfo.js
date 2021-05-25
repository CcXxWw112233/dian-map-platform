/**
 * 采集数据的redux统一管理常量
 */
export const CollectionInfoModel = {
  /** 命名空间
   * @default string 'collectioninfo'
   * @param {any[]} collectionGroups 分组列表
  */
  namespace: 'collectioninfo',
  /** 变量空间 */
  state: {
    /** 分组列表 */
    collectionGroups: [],
  },
  /** 更新state */
  reducers: {
    /** 更新state中的所有数据 */
    updateDatas: 'updateDatas'
  }
}

export default {
  namespace: CollectionInfoModel.namespace,
  state: {
    ...CollectionInfoModel.state
  },
  effects: {},
  reducers: {
    [CollectionInfoModel.reducers.updateDatas] (state, { payload }) {
      return {...state, ...payload}
    }
  }
}
