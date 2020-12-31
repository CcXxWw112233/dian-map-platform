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
export default {
  ...BASIC,
  // 根据全景图Id获取所有的链接
  getList: async (resource_id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "GET",
      "/map/panorama_coordinate/list",
      { resource_id: resource_id },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 保存一条全景链接
  add: async (p_id, target_id, pitch, yaw) => {
    const param = {
      p_id: p_id,
      target_id: target_id,
      pitch: pitch,
      yaw: yaw,
    };
    const base64 = getBase64OrgId();
    let response = await request(
      "POST",
      "/map/panorama_coordinate/add",
      param,
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 修改一条全景链接
  modify: async ({ id, p_id, name, target_id, pitch, yaw }) => {
    const param = {
      id: id,
      name: name,
      p_id: p_id,
      target_id: target_id,
      pitch: pitch,
      yaw: yaw,
    };
    const base64 = getBase64OrgId();
    let response = await request(
      "PUT",
      "/map/panorama_coordinate/modify",
      param,
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 删除一条全景链接
  delete: async (id) => {
    const base64 = getBase64OrgId();
    let response = await request(
      "DELETE",
      `/map/panorama_coordinate/${id}`,
      {},
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
};
