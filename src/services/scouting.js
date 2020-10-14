import { BASIC } from "./config";
import { request } from "./index";
import checkResponse from "./checkResponse";
export default {
  ...BASIC,
  // 获取项目列表
  GET_SCOUTING_LIST: async (orgId, data, header = {}) => {
    let response = await request("GET", `/map/${orgId}/project`, data, header);
    // 检查数据是否正常
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 删除踏勘项目
  REMOVE_BOARD: async (id, data) => {
    let response = await request("DELETE", `/map/board/${id}`, data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 修改踏勘项目名称
  EDIT_BOARD_NAME: async (id, data) => {
    let response = await request("PUT", `/map/board/${id}`, data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
  // 添加踏勘项目
  ADD_BOARD: async (data) => {
    let response = await request("POST", "/map/board", {
      org_id: BASIC.getUrlParam.orgId,
      ...data,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 获取项目详情中的区域列表
  GET_AREA_LIST: async (data) => {
    let response = await request("GET", "/map/area_type/list", data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
  // 新增区域分类
  ADD_AREA_BOARD: async (data) => {
    let response = await request("POST", "/map/area_type", data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 修改区域信息
  EDIT_AREA_MESSAGE: async (id, data) => {
    let response = await request("PUT", `/map/area_type/${id}`, data);
    return checkResponse(response);
  },
  // 文件上传
  UPLOAD_FILE: async (data) => {
    let response = await request("POST", "/map/file/upload", data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 新增一条采集数据
  ADD_COLLECTION: async (data) => {
    let response = await request("POST", "/map/collection", data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 获取采集列表
  GET_COLLECTION_LIST: async (data) => {
    let response = await request("GET", "/map/collection/list", data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 组合一个采集数据
  MERGE_COLLECTION: async (data) => {
    let response = await request("POST", "/map/collection/group", data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 解除一个元素的组合
  CANCEL_COLLECTION_MERGE: async (data) => {
    let response = await request("DELETE", "/map/collection/group", data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 排序采集数据
  SORT_COLLECTION_DATA: async (data) => {
    let response = await request("POST", `/map/collection/sort`, data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 删除一条采集数据
  DELETE_COLLECTION: async (id) => {
    let response = await request("DELETE", `/map/collection/${id}`, {});
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 修改一条采集数据
  EDIT_COLLECTION: async (data) => {
    let response = await request("PUT", "/map/collection", data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 删除一条分组数据
  DELETE_AREA: async (id) => {
    let response = await request("DELETE", `/map/area_type/${id}`);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 修改分组名称
  EDIT_AREA_NAME: async (id, data) => {
    let response = await request("PUT", `/map/area_type/${id}`, data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 获取规划图数据
  GET_PLAN_PIC: async (id) => {
    let response = await request("GET", `/map/ght/${id}`, {});
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 规划图接口
  PLAN_IMG_URL: (id) => {
    return `/api/map/ght/${id}/image`;
  },
  // 保存修改的规划图
  SAVE_EDIT_PLAN_IMG: async (id, data) => {
    let response = await request("PUT", `/map/ght/${id}/extent`, data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 获取下载地址
  GET_DOWNLOAD_URL: async (id) => {
    let response = await request("POST", `/map/file/download/${id}`, {});
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 发起会议
  METTING_START: async (data) => {
    let response = await request("POST", "/map/board/meeting", {
      ...data,
      _organization_id: BASIC.getUrlParam.orgId,
    });
    return checkResponse(response);
  },
  // 获取项目成员数据
  GET_BOARD_USERS: async (data) => {
    let response = await request("GET", "/map/board/user", data);
    return checkResponse(response);
  },

  // 公共数据引用删除
  DEL_PUBLICDATA_TREE: async (collectionId, publicDataIds) => {
    let data = {
      collection_id: collectionId,
      poi_ids: publicDataIds,
    };
    let response = await request("DELETE", "/map/public/poi/board", data);
    return checkResponse(response);
  },

  // 公共数据引用移动分组
  MOVE_PUBLICDATA_TREE: async (collectionId, targetGroupId, publicDataIds) => {
    const data = {
      collection_id: collectionId,
      target_area_type_id: targetGroupId,
      poi_ids: publicDataIds,
    };
    let response = await request("PUT", "/map/public/poi/board/move", data);
    return checkResponse(response);
  },

  MOVE_PUBLICDATA_TREE2: async (data) => {
    let response = await request("PUT", "/map/collection", data);
    return checkResponse(response);
  },

  // 公共数据引用复制分组
  COPY_PUBLICDATA_TREE: async (collectionId, targetGroupId, publicDataIds) => {
    const data = {
      collection_id: collectionId,
      target_area_type_id: targetGroupId,
      poi_ids: publicDataIds,
    };
    let response = await request("PUT", "/map/public/poi/board/copy", data);
    return checkResponse(response);
  },
  COPY_PUBLICDATA_TREE2: async (collectionId, targetGroupId) => {
    const data = {
      id: collectionId,
      target_area_type_id: targetGroupId,
    };
    let response = await request("PUT", "/map/collection/copy", data);
    return checkResponse(response);
  },
};
