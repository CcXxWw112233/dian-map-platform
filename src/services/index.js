import axios from 'axios'
import originJsonp from "jsonp"
import { getBaseUrl } from './config'

const instance = axios.create({
  method:"GET",
  baseURL: getBaseUrl().API_URL
})

instance.interceptors.request.use(config => {
  console.log(config)
  return config ;
})

instance.interceptors.response.use(config => {
  return config ;
})

// 公用的ajax请求方法。
let request = (method, url, data, header)=>{
  return instance({
    method,
    url,
    data,
    headers:{
      ...header
    }
  })
}


const strParam = data => {
  let url = "";
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : "";
    url += "&" + k + "=" + encodeURIComponent(value);
  }
  return url ? url.substring(1) : "";
}

// geoserver wfs服务获取方法
 const getFeature = (url, options) => {
  const myOptions = {
    service: "WFS",
    version: "1.0.0",
    request: "GetFeature",
    outputFormat: "text/javascript",
    format_options: "callback:cb",
  };
  const myUrl = url + (url.indexOf("?") < 0 ? "?" : "&") + strParam({...myOptions, ...options});
  const opts = {
    param: "callback",
    name: "cb",
  };
  return new Promise((resolve, reject) => {
    originJsonp(myUrl, opts, (err, data) => {
      if (!err) {
        resolve(data);
      } else {
        reject(err);
      }
    });
  });
}
export {request, getFeature}
