import { BASIC } from "./config";
import { request } from "./index";
export default {
  ...BASIC,
  // 省
  GET_PROVINCE: async () => {
    let response = await request("GET", "/map/area/province");
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
  // 市
  GET_CITY: async (province) => {
    let response = await request("GET", `/map/area/${province}/city`);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
  // 县
  GET_DISTRICT: async (city) => {
    let response = await request("GET", `/map/area/${city}/district`);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
  //镇
  GET_TOWN: async (district) => {
    let response = await request("GET", `/map/area/${district}/place`);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
  GET_VILLIGE: async (town) => {
    let response = await request("GET", `/map/area/${town}/villige`);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },

  GET_GEOM: async (code) => {
    let response = await request("GET", `/map/area/${code}/geom`);
    if (BASIC.checkResponse(response)) {
      return response.data;
    }
    return Promise.reject(response && response.data);
  },
};
