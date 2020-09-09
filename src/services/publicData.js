import { BASIC } from "./config";
import { request, getFeature } from "./index";
export const publicDataUrl = {
  request,
  getFeature,
  // 获取公有数据的列表，使用jsonp
  GET_GEO_DATA: BASIC.Geo_WFS,
};

export default {
  // 拿到公共数据的树
  GET_PUBLIC_TREE: async () => {
    let response = await request("GET", "map/public/poi");
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
};
