import { BASIC } from "./config";
import { request } from "./index";
export default {
  ...BASIC,
  GET_POINTSYMBOL: async () => {
    let response = await request("GET", "/map/dict/afa356c6c577452db715583453e6de6d/mark");
    if (BASIC.checkResponse(response)) {
      return response.data
    }
  },

  GET_POLYLINESYMBOL: async () => {
    let response = await request("GET", "/map/dict/ae60a1157a734d8ebb864b90858abeb1/mark")
    if (BASIC.checkResponse(response)) {
      return response.data
    }
  },

  GET_POLYGONSYMBOL: async () => {
    let response = await request("GET", "/map/dict/9f9bc44de1884bedbfb59fe8440edceb/mark")
    if (BASIC.checkResponse(response)) {
      return response.data
    }
  }
}