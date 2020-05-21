import code from './responseCode'
const getBaseUrl = () => {
  const config = {
    // 获取url传递的参数
    getUrlParam:(function(G){
      let { hash = "" } = G.location;
      hash = decodeURIComponent(hash);
      let paramString = hash.split('?')[1];
      if(!paramString) return {};
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
      let data = res.code !== undefined ? res : (res.data || res);
      if(data.code === code.SUCCESS){
        return true;
      }else{
        return false;
      }
    }
  }

  let NODE_ENV = process.env.NODE_ENV ;
  if(NODE_ENV === 'development'){
    return {
      API_URL: '/api',
      Geo_WFS:"https://map.di-an.com/geoserver/wfs",
      ...config,
    }
  }
  if(NODE_ENV === 'production'){
    return {
      API_URL: '/api',
      Geo_WFS:"https://map.di-an.com/geoserver/wfs",
      ...config,
    }
  }
}

const BASIC = getBaseUrl();

export { BASIC }
