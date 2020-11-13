import { BASIC } from "./config";
import { request } from "./index";
import checkResponse from "./checkResponse";
import { getSession } from "utils/sessionManage";
const getBase64OrgId = () => {
  const urlParam = BASIC.getUrlParam;
  const obj = { orgId: urlParam.orgId };
  let str = JSON.stringify(obj);
  // str = encodeURI(str);
  const base64 = btoa(str);
  return base64;
};
const getBase64 = (id) => {
  const urlParam = BASIC.getUrlParam;
  const obj = { orgId: urlParam.orgId, boardId: id };
  let str = JSON.stringify(obj);
  // str = encodeURI(str);
  const base64 = btoa(str);
  return base64;
};
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
    const base64 = getBase64OrgId();
    let response = await request("DELETE", `/map/board/${id}`, data, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 修改踏勘项目名称
  EDIT_BOARD_NAME: async (id, data) => {
    const base64 = getBase64(id);
    let response = await request("PUT", `/map/board/${id}`, data, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
  // 添加踏勘项目
  ADD_BOARD: async (data) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "POST",
      "/map/board",
      {
        org_id: BASIC.getUrlParam.orgId,
        ...data,
      },
      {
        BaseInfo: base64,
      }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 获取项目详情中的区域列表
  GET_AREA_LIST: async (data) => {
    let base64 = "";
    if (data.board_id) {
      base64 = getBase64(data.board_id);
    } else {
      let res = await getSession("ScoutingItemId");
      let board_id = res.data;
      base64 = getBase64(board_id);
    }
    let response = await request("GET", "/map/area_type/list", data, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
  // 新增区域分类
  ADD_AREA_BOARD: async (data) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("POST", "/map/area_type", data, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 修改区域信息
  EDIT_AREA_MESSAGE: async (id, data) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("PUT", `/map/area_type/${id}`, data, {
      BaseInfo: base64,
    });
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
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id || data.board_id);
    let response = await request("POST", "/map/collection", data, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 获取采集列表
  GET_COLLECTION_LIST: async (data) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("GET", "/map/collection/list", data, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 组合一个采集数据
  MERGE_COLLECTION: async (data) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("POST", "/map/collection/group", data, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 解除一个元素的组合
  CANCEL_COLLECTION_MERGE: async (data) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("DELETE", "/map/collection/group", data, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 排序采集数据
  SORT_COLLECTION_DATA: async (data) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("POST", `/map/collection/sort`, data, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 删除一条采集数据
  DELETE_COLLECTION: async (id) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request(
      "DELETE",
      `/map/collection/${id}`,
      {},
      {
        BaseInfo: base64,
      }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 修改一条采集数据
  EDIT_COLLECTION: async (data) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let newData = { area_type_id: data.area_type_id, id: data.id };
    let response = await request("PUT", "/map/collection", newData, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 删除一条分组数据
  DELETE_AREA: async (id, board_id) => {
    let res = await getSession("ScoutingItemId");
    board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request(
      "DELETE",
      `/map/area_type/${id}`,
      {},
      {
        BaseInfo: base64,
      }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 修改分组名称
  EDIT_AREA_NAME: async (id, data, board_id) => {
    let res = await getSession("ScoutingItemId");
    board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("PUT", `/map/area_type/${id}`, data, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 获取规划图数据
  GET_PLAN_PIC: async (id) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request(
      "GET",
      `/map/ght/${id}`,
      {},
      {
        BaseInfo: base64,
      }
    );
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
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("PUT", `/map/ght/${id}/extent`, data, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  // 获取下载地址
  GET_DOWNLOAD_URL: async (id) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request(
      "POST",
      `/map/file/download/${id}`,
      {},
      {
        BaseInfo: base64,
      }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
  // 发起会议
  METTING_START: async (data) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request(
      "POST",
      "/map/board/meeting",
      {
        ...data,
        _organization_id: BASIC.getUrlParam.orgId,
      },
      {
        BaseInfo: base64,
      }
    );
    return checkResponse(response);
  },
  // 获取项目成员数据
  GET_BOARD_USERS: async (data) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("GET", "/map/board/user", data, {
      BaseInfo: base64,
    });
    return checkResponse(response);
  },

  // 公共数据引用删除
  DEL_PUBLICDATA_TREE: async (collectionId, publicDataIds) => {
    let data = {
      collection_id: collectionId,
      poi_ids: publicDataIds,
    };
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("DELETE", "/map/public/poi/board", data, {
      BaseInfo: base64,
    });
    return checkResponse(response);
  },

  // 公共数据引用移动分组
  MOVE_PUBLICDATA_TREE: async (collectionId, targetGroupId, publicDataIds) => {
    const data = {
      collection_id: collectionId,
      target_area_type_id: targetGroupId,
      poi_ids: publicDataIds,
    };
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("PUT", "/map/public/poi/board/move", data, {
      BaseInfo: base64,
    });
    return checkResponse(response);
  },

  MOVE_PUBLICDATA_TREE2: async (data) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("PUT", "/map/collection", data, {
      BaseInfo: base64,
    });
    return checkResponse(response);
  },

  // 公共数据引用复制分组
  COPY_PUBLICDATA_TREE: async (collectionId, targetGroupId, publicDataIds) => {
    const data = {
      collection_id: collectionId,
      target_area_type_id: targetGroupId,
      poi_ids: publicDataIds,
    };
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("PUT", "/map/public/poi/board/copy", data, {
      BaseInfo: base64,
    });
    return checkResponse(response);
  },
  COPY_PUBLICDATA_TREE2: async (collectionId, targetGroupId) => {
    const data = {
      id: collectionId,
      target_area_type_id: targetGroupId,
    };
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("PUT", "/map/collection/copy", data, {
      BaseInfo: base64,
    });
    return checkResponse(response);
  },

  GET_AREACENTERPOINT_LIST: async (
    min_lon,
    max_lon,
    min_lat,
    max_lat,
    level
  ) => {
    const param = {
      min_lon: min_lon,
      max_lon: max_lon,
      min_lat: min_lat,
      max_lat: max_lat,
      level: level,
    };
    let response = await request("GET", "/map/area/center_point/list", param);
    return checkResponse(response);
  },
};
