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

  //根据geojson文件ID获取图标资源
  getList: async (ids) => {
    const base64 = getBase64OrgId();
    let response = await request("GET", "/map/geojson_resource/list",{
      ids: ids
    },{
      BaseInfo: base64
    })
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 添加geojson图标资源
  add: async (data) => {
    const base64 = getBase64OrgId();
    let response = await request("POST", "/map/geojson_resource/add", {
      geojson_id: data.geojson_id,
      image_base64: data.image_base64
    },{
      BaseInfo: base64
    })
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 删除geojson图标资源
  delete: async (id) => {
    const base64 = getBase64OrgId();
    let response = await request("DELETE", `/map/geojson_resource/delete/${id}`, {},{
      BaseInfo: base64
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 更新geojson图标资源
  update: async (data) => {
    const base64 = getBase64OrgId();
    let response = await request("PUT", "/map//geojson_resource/modify", {
      id: data.id,
      geojson_id: data.id,
      image_base64: data.image_base64
    }, {
      BaseInfo: base64
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  }

}