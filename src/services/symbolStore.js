import { BASIC } from "./config";
import { request } from "./index";
export default {
  ...BASIC,
  // 获取所有符号
  GET_ICON: async () => {
    const param = {
      org_id: BASIC.getUrlParam.orgId,
    };
    let response = await request("GET", "/map/icon/load", param);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  },
  DeL_ICON: async (id) => {
    
    let response = await request("DELETE", `/map/icon/${id}`);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
  }
};