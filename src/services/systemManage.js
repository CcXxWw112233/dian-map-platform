import { BASIC } from "./config";
import { request } from "./index";
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

  // 获取项目权限树
  getPermissionTree: async () => {
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      "/map/system/permission/board",
      {},
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 获取应用级权限树
  getGlobalPermissionTree: async () => {
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      "/map/system/permission/global",
      {},
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 角色列表（项目）
  getSystemRole: async () => {
    const param = BASIC.getUrlParam;
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      "/map/system/role/board",
      {
        org_id: param.orgId,
      },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 角色列表（全局）
  getGlobalSystemRole: async () => {
    const param = BASIC.getUrlParam;
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      "/map/system/role/global",
      {
        org_id: param.orgId,
      },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 新增角色
  addSystemRole: async (param) => {
    const urlParam = BASIC.getUrlParam;
    const base64 = getBase64OrgId();
    param = { ...param, ...{ org_id: urlParam.orgId } };
    let response = await request("POST", "/map/system/role", param, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 为角色赋权
  addPermission2Role: async (param) => {
    const base64 = getBase64OrgId();
    let response = await request("PUT", "/map/system/role/permission", param, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 全局信息
  getGlobalRoleUser: async (param) => {
    const urlParam = BASIC.getUrlParam;
    param = { ...param, ...{ org_id: urlParam.orgId } };
    const base64 = getBase64OrgId();
    let response = await request("GET", "/map/system/user/role/global", param, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 修改角色
  modifySystemRole: async (id, data) => {
    const param = {
      function_ids: data.function_ids,
      is_default: data.is_default,
      name: data.name,
      org_id: data.org_id,
      role_id: data.role_id,
    };
    const base64 = getBase64OrgId();
    let response = await request("PUT", `/map/system/role/${id}`, param, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 修改名称
  modifySystemRoleName: async (id, data) => {
    const param = {
      name: data.name,
    };
    const base64 = getBase64OrgId();
    let response = await request("PUT", `/map/system/role/${id}`, param, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 删除角色
  deleteSystemRole: async (id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "DELETE",
      `/map/system/role/${id}`,
      {},
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 获取项目成员
  getProjectMember: async (projectId) => {
    const base64 = getBase64(projectId);
    let response = await request(
      "GET",
      "/map/board/user",
      {
        board_id: projectId,
      },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 为项目新增成员
  addProjectMember: async (param) => {
    const base64 = getBase64(param.board_id);
    let response = await request("POST", "/map/board/user", param, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 修改项目成员角色
  modifyProjectMember: async (param) => {
    const base64 = getBase64(param.board_id);
    let response = await request("PUT", "/map/board/user/role", param, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 删除项目成员
  deleteProjectMember: async (id, boardId) => {
    const base64 = getBase64(boardId);
    let response = await request(
      "DELETE",
      `/map/board/user/${id}`,
      {},
      {
        BaseInfo: base64,
      }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 获取组织用户
  getOrgUser: async () => {
    const urlParam = BASIC.getUrlParam;
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      `/map/org/user`,
      {
        org_id: urlParam.orgId,
      },
      {
        BaseInfo: base64,
      }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 获取登录用户
  getLoginUser: async () => {
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      "/map/user/info",
      {},
      {
        BaseInfo: base64,
      }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 获取个人当前组织权限列表（项目）
  getPersonalPermission2Project: async () => {
    const base64 = getBase64OrgId();
    const urlParam = BASIC.getUrlParam;
    let response = await request(
      "POST",
      `/map/system/permission/board?org_id=${urlParam.orgId}`,
      {},
      {
        BaseInfo: base64,
      }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  getPersonalPermission2Global: async () => {
    const base64 = getBase64OrgId();
    const urlParam = BASIC.getUrlParam;
    let response = await request(
      "POST",
      `/map/system/permission/global?org_id=${urlParam.orgId}`,
      {},
      {
        BaseInfo: base64,
      }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },
};
