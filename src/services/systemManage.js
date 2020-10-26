import { BASIC } from "./config";
import { request } from "./index";
export default {
  ...BASIC,

  // 获取项目权限树
  getPermissionTree: async () => {
    let response = await request("GET", "/map/system/permission/board");
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 获取全局权限树
  getGlobalPermissionTree: async () => {
    let response = await request("GET", "/map/system/permission/global");
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 角色列表（项目）
  getSystemRole: async () => {
    const param = BASIC.getUrlParam;
    let response = await request("GET", "/map/system/role/board", {
      org_id: param.orgId,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 角色列表（全局）
  getGlobalSystemRole: async () => {
    const param = BASIC.getUrlParam;
    let response = await request("GET", "/map/system/role/global", {
      org_id: param.orgId,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 新增角色
  addSystemRole: async (param) => {
    const urlParam = BASIC.getUrlParam;
    param = { ...param, ...{ org_id: urlParam.orgId } };
    let response = await request("POST", "/map/system/role", param);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 为角色赋权
  addPermission2Role: async (param) => {
    let response = await request("PUT", "/map/system/role/permission", param);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 全局信息
  getGlobalRoleUser: async (param) => {
    const urlParam = BASIC.getUrlParam;
    param = {...param, ...{ org_id: urlParam.orgId }}
    let response = await request("GET", "/map/system/user/role/global", param);
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
    let response = await request("PUT", `/map/system/role/${id}`, param);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 修改名称
  modifySystemRoleName: async (id, data) => {
    const param = {
      name: data.name,
    }
    let response = await request("PUT", `/map/system/role/${id}`, param);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },

  // 删除角色
  deleteSystemRole: async (id) => {
    let response = await request("DELETE", `/map/system/role/${id}`);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },
};
