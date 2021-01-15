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
export default {
  ...BASIC,

  // 获取一条项目计划详情
  getPlanDetail: async (id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      "/map/board/task",
      { id: id },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 创建一条项目计划
  createBoardTask: async (board_id, group_id, name, parent_id) => {
    const param = {
      board_id: board_id,
      group_id: group_id,
      name: name,
      parent_id: parent_id,
    };
    const base64 = getBase64OrgId();
    let response = await request("POST", "/map/board/task", param, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 更新一条项目计划
  updateBoardTask: async (end_time, id, name, clear_end_time) => {
    const param = {
      end_time: end_time,
      id: id,
      name: name,
      clear_end_time: clear_end_time,
    };
    const base64 = getBase64OrgId();
    let response = await request("PUT", "/map/board/task", param, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 删除一条项目计划
  deleteBoardTask: async (id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "DELETE",
      `/map/board/task?id=${id}`,
      {},
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 完成计划
  finishBoardTask: async (id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      "/map/board/task/complete",
      { id: id },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 取消完成计划
  cancelBoardTask: async (id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      "/map/board/task/complete/cancel",
      { id: id },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 获取我的计划列表（未分组数据）
  getBoardTaskDefaultList: async (board_id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      "/map/board/task/list",
      { board_id: board_id },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 上传通用接口
  uploadFileCommon: async (file) => {
    let formData = new FormData();
    formData.append("file", file);
    const base64 = getBase64OrgId();
    let response = await request("POST", "/map/file/upload", formData, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  uploadProjetFile: async (board_id, file_name, resource_id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "POST",
      "/map/board/file",
      { board_id: board_id, file_name: file_name, resource_id: resource_id },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 删除项目文件
  deleteBoardFile: async (id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "DELETE",
      `/map/board/file?id=${id}`,
      {},
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 获取项目文件列表
  getBoardFileList: async (board_id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      "/map/board/file/list",
      { board_id: board_id },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 创建一个项目计划分组
  createBoardTaskGroup: async (board_id, name) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "POST",
      "/map/board/task/group",
      { board_id: board_id, name: name },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 更新一个项目计划分组
  updateBoardTaskGroup: async (id, name) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "PUT",
      "/map/board/task/group",
      { id: id, name: name },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 删除一个项目计划分组
  deleteBoardTaskGroup: async (group_id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "DELETE",
      `/map/board/task/group?group_id=${group_id}`,
      {},
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 获取项目计划分组列表
  getBoardTaskGroupList: async (board_id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      "/map/board/task/group/list",
      { board_id: board_id },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 文件统一下载
  downLoadFile: async (id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "POST",
      `/map/file/download/${id}`,
      {},
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 收藏一条任务
  collectFavoriteTask: async (task_id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "POST",
      "/map/task/favorite",
      { task_id: task_id },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 取消收藏
  cancelFavoriteTask: async (task_id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "DELETE",
      "/map/task/favorite",
      { task_id: task_id },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 创建一条提醒
  createTaskRemind: async (remind_time, task_id, user_ids) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "POST",
      "/map/task/remind",
      {
        remind_time: remind_time,
        task_id: task_id,
        user_ids: user_ids,
      },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 更新提醒
  updateTaskRemind: async(remind_id, remind_time,  user_ids) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "PUT",
      `/map/task/remind/${remind_id}`,
      {
        remind_time: remind_time,
        user_ids: user_ids,
      },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 获取提醒
  getTaskRemind: async (task_id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      "/map/task/remind",
      {
        task_id: task_id,
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
};
