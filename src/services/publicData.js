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
    let response = await request("GET", "/map/public/poi");
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 插入一条poi数据
  INSERT_PUBLIC_POI: async (data) => {
    let response = await request("POST", "/map/ad_poi", data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 查询poi数据
  QUERY_PUBLIC_POI: async (adId) => {
    let response = await request("GET", `/map/ad_poi?ad_id=${adId}`);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 周边查询
  QUERY_LOCAL_GEOM: async ({ lon, lat, radius, type, adcode, key }) => {
    let response = await request(
      "GET",
      `/map/ad_poi/list?lon=${lon}&lat=${lat}&radii=${radius}&type=${type}&adcode=${adcode}&key=${key}`
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  // 获取人口类的公共数据
  getPopulationDatas: async (code, type) => {
    let response = await request(
      "GET",
      `/map/area/population/extent?code=${code}&type=${type}`
    );
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  setPublicDataIdsToProject: async (groupId, projectId, ids) => {
    const data = {
      area_type_id: groupId,
      board_id: projectId,
      poi_ids: ids,
    };
    let response = await request("POST", "/map/public/poi/import", data);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
};
