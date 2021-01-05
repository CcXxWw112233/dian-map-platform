import { getSessionOrgId } from "../utils/sessionData";
import { BASIC } from "./config";
import { request } from "./index";
export default {
  ...BASIC,
  // 获取所有上传的符号
  GET_ICON: async () => {
    const param = {
      org_id: getSessionOrgId(),
    };
    let response = await request("GET", "/map/icon/load", param);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },
  // 删除上传的符号
  DeL_ICON: async (id) => {

    let response = await request("DELETE", `/map/icon/${id}`);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  }
};
