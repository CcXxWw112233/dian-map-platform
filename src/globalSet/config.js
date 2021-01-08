import { BASIC } from "../services/config";

export const baseConfig = {
  // 高德地图的appkey
  // 高德地图的appkey
  GAODE_APP_KEY: "1c257562b93bf91272666c994ba2d026",
  // 高德地图服务APPKEY // 用来调用地址查询，天气查询，多边形查询，路径规划查询等功能
  GAODE_SERVER_APP_KEY: "ca82fc7d4e7ddbf2bdf052163cf2f49b",
  // 天地图的appkey
  TIANDITU_APP_KEY: "56e269a51b3c1af54dc6042407d8fdb3"
};

//微信登录所需参数配置
export const WECHAT_APPID = "wx358dea60cb617301";
export const COLLBACK_PRODUCTION_URL =
  "https://lingxi.di-an.com/dian_lingxi/upms/weChat/collBack";
export const COLLBACK_DEVELOPMENT_URL =
  "https://lingxi.di-an.com/dian_lingxi/upms/weChat/collBack";
export const REQUEST_PREFIX = "/dian_map";

// 入口方式，是从iframe访问，还是通过正常页面地址访问，区分内嵌和独立,
// 通过iframe 内嵌必须要携带token和orgId
export const ENTRANCE_MODE_IFRAME =
  !!BASIC.getUrlParam.token && !!BASIC.getUrlParam.orgId;
