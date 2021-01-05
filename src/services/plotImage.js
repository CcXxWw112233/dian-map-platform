import { BASIC } from "./config";
import { request } from "./index";
import checkResponse from "./checkResponse";
import { getSession } from "utils/sessionManage";
import { getSessionOrgId } from "../utils/sessionData";
const getBase64OrgId = () => {
  // const urlParam = BASIC.getUrlParam;
  const obj = { orgId: getSessionOrgId() };
  let str = JSON.stringify(obj);
  // str = encodeURI(str);
  const base64 = btoa(str);
  return base64;
};
const getBase64 = (id) => {
  // const urlParam = BASIC.getUrlParam;
  const obj = { orgId: getSessionOrgId(), boardId: id };
  let str = JSON.stringify(obj);
  // str = encodeURI(str);
  const base64 = btoa(str);
  return base64;
};

export default {
  ...BASIC,
  // 文件上传
  upload_file: async (data) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request("POST", "/map/file/upload", data, {
      BaseInfo: base64,
    });
    if (BASIC.checkResponse(response)) {
      return response.data;
    }

    return Promise.reject(response && response.data);
  },
  add: async (image_id, plot_id) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request(
      "POST",
      "/map/plot_images/add",
      {
        image_id: image_id,
        plot_id: plot_id,
      },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  getList: async (plot_id) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request(
      "GET",
      "/map/plot_images/list",
      { plot_id: plot_id },
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
  delete: async (id) => {
    let res = await getSession("ScoutingItemId");
    let board_id = res.data;
    let base64 = getBase64(board_id);
    let response = await request(
      "DELETE",
      `/map/plot_images/${id}`,
      {},
      { BaseInfo: base64 }
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
};
