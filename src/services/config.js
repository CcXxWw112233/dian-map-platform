import code from './responseCode'
export const MAP_REQUEST_URL = "/dian_map";
const getBaseUrl = () => {

  const config = {
    getIsDomain: function () {
      let isDomain = false;
      let { hash = "" } = window.location;
      // hash = decodeURIComponent(hash);
      if (!hash) {
        isDomain = true;
      }else
        isDomain = false;
      return isDomain;
    },
    // 获取url传递的参数
    getUrlParam:(function(G){
      let { hash = "",search } = G.location;
      hash = decodeURIComponent(hash || search );
      let paramString = hash.split('?')[1];
      if (!paramString) {
        return {}
      };
      let params = paramString.split('&');
      let param = {};
      params.forEach(item => {
        let props = item.split('=');
        let key = props[0],value = props[1];
        param[key] = value
      })
      return param ;
    })(window),
    // 状态码
    ...code,
    checkResponse: function(res){
      // console.log(res)
      let data = res && res.code !== undefined ? res : (res && res.data || res);
      if(data && data.code === code.SUCCESS){
        return true;
      }else{
        return false;
      }
    }
  }

  let NODE_ENV = process.env.NODE_ENV ;
  // console.log(process.env);
  if(NODE_ENV === 'development'){
    return {
      BASE_URL:"http://maptest.new-di.com",
      API_URL: MAP_REQUEST_URL,
      // Geo_WFS:"http://localhost:8080/geoserver/wfs",
      Geo_WFS:"https://map.di-an.com/geoserver/wfs",
      ...config
    }
  }
  if(NODE_ENV === 'production'){
    return {
      BASE_URL:"https://map.di-an.com",
      API_URL: MAP_REQUEST_URL,
      Geo_WFS:"https://map.di-an.com/geoserver/wfs",
      ...config
    }
  }
}

const BASIC = getBaseUrl();
const REQUEST_UPMS = `/upms`; //用户信息接口
const REQUEST_INTERGFACE_VERSION = "/v2"; //接口版本


export { BASIC, REQUEST_UPMS, REQUEST_INTERGFACE_VERSION }
