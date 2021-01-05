import axios from "axios";
import originJsonp from "jsonp";
import { BASIC } from "./config";
import { message } from "antd";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Cookies from "js-cookie";

const instance = axios.create({
  method: "GET",
  baseURL: BASIC.API_URL
});
NProgress.inc(0.3);
NProgress.configure({ easing: "ease", speed: 500, showSpinner: false });
let requestTimer = null,
  responseTimer = null;
instance.interceptors.request.use(config => {
  let token = Cookies.get("Authorization");
  console.log("sssssaaa", token);
  if (token) {
    config.headers["Authorization"] = token;
    NProgress.start();
  } else {
    clearTimeout(requestTimer);
    if (BASIC.getUrlParam.isMobile === "1") return {};
    requestTimer = setTimeout(() => {
      message.error("缺少权限，无法试用地图");
      redirectToLogin();
    }, 1000);
    return {};
  }
  return config;
});

instance.interceptors.response.use(
  config => {
    let { data } = config;
    NProgress.done();
    if (data.code === BASIC.TOKEN_AUTH_ERROR) {
      clearTimeout(responseTimer);
      if (BASIC.getUrlParam.isMobile === "1") return {};
      responseTimer = setTimeout(() => {
        message.error("权限不足，请重新登录");
        // 调用灵犀
        try {
          if (window.parent) {
            window.parent.postMessage("token_invalid", "*");
          }
        } catch (err) {
          console.log(err);
        }
      }, 1000);
      return config;
    } else return config;
  },
  err => {
    NProgress.done();
    if (err && err.response) {
      if (err.response.status === BASIC.SERVER_ERROR) {
        clearTimeout(responseTimer);
        if (BASIC.getUrlParam.isMobile === "1") return {};
        responseTimer = setTimeout(() => {
          message.error("系统繁忙,请稍后再试");
        }, 1000);
      }

      // eslint-disable-next-line eqeqeq
      if (err.response.status == BASIC.TOKEN_AUTH_ERROR) {
        clearTimeout(responseTimer);
        if (BASIC.getUrlParam.isMobile === "1") return {};
        responseTimer = setTimeout(() => {
          message.error("权限不足，请重新登录");
          redirectToLogin();
          // let url = "";
          // try {
          //   url = window.top.document.referrer;
          // } catch (M) {
          //   if (window.parent) {
          //     try {
          //       url = window.parent.document.referrer;
          //     } catch (L) {
          //       url = "";
          //     }
          //   }
          // }
          // if (url === "") {
          //   url = document.referrer;
          // }
          // window.parent.location.href =
          //   url ||
          //   "https://lingxi.di-an.com/" +
          //     "#/login?redirect=/technological/simplemode/home";
        }, 1000);
      }

      return err.response;
    }
    return err && err.response;
  }
);
//重定向路由
function redirectToLogin() {
  const { origin, hash } = window.location;
  const hashname = !!hash ? hash.replace("#", "") : hash;
  window.location.href = `${origin}/#/login?redirect=${hashname}`;
}

// 公用的ajax请求方法。
let request = (method, url, data, header) => {
  let obj = {};
  method === "GET" ? (obj.params = data) : (obj.data = data);
  return instance({
    method,
    url,
    ...obj,
    headers: {
      ...header
    }
  });
};

const strParam = data => {
  let url = "";
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : "";
    url += "&" + k + "=" + encodeURIComponent(value);
  }
  return url ? url.substring(1) : "";
};

// geoserver wfs服务获取方法
const getFeature = (url, options) => {
  const myOptions = {
    service: "WFS",
    version: "1.0.0",
    request: "GetFeature",
    outputFormat: "text/javascript",
    format_options: "callback:cb"
  };
  const myUrl =
    url +
    (url.indexOf("?") < 0 ? "?" : "&") +
    strParam({ ...myOptions, ...options });
  const opts = {
    param: "callback",
    name: "cb"
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
};

export { request, getFeature };
