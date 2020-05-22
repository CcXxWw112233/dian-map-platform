import axios from 'axios'
import originJsonp from "jsonp"
import { BASIC } from './config'
import { message } from 'antd'

const instance = axios.create({
  method:"GET",
  baseURL: BASIC.API_URL
})
let requestTimer = null ,responseTimer = null;
instance.interceptors.request.use(config => {
  let token = BASIC.getUrlParam.token;
  if(token){
    config.headers['Authorization'] = token;
  }
  else {
    clearTimeout(requestTimer);
    requestTimer = setTimeout(()=>{
      message.error('缺少权限，无法试用地图');
    },1000)
    return {}
  };
  return config ;
})

instance.interceptors.response.use(config => {
  let { data } = config;
  if(data.code === BASIC.TOKEN_AUTH_ERROR){
    clearTimeout(responseTimer);
    responseTimer = setTimeout(()=>{
      message.error('权限不足，请重新登录');
    }, 1000)
    return config;
  }else
  
  return config ;
},err => {
  if(err && err.response && err.response.status == BASIC.SERVER_ERROR){
    clearTimeout(responseTimer);
    responseTimer = setTimeout(()=>{
      message.error('系统繁忙,请稍后再试')
    },1000)
    return err.response;
  }
  return err && err.response;
})

// 公用的ajax请求方法。
let request = (method, url, data, header)=>{
  let obj = {};
  method === "GET" ? obj.params = data: obj.data = data;
  return instance({
    method,
    url,
    ...obj,
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
