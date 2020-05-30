import { baseConfig } from "../globalSet/config";

const baseMaps = [
  {
    title: "高德电子图",
    id: "gd_vec_tile",
    url:
      "http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  },
  {
    title: "高德影像图",
    id: "gd_img_tile",
    url:
      "http://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
  },
  {
    title: "高德路线图",
    id: "gd_roadLabel_tile",
    url:
      "http://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",
  },
  {
    title: "谷歌遥感图",
    id: "gg_img_tile",
    url:
      "http://mt2.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G",
  },
  {
    title: "天地图影像图",
    id: "td_img_tile",
    url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },
  {
    title: "天地图网路图",
    id: "td_roadLabel_tile",
    url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },
  {
    title: "天地图矢量图",
    id: "td_vec_tile",
    url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },
  {
    title: "天地图地形图",
    id: "td_ter_tile",
    url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },
  {
    title: "天地图注记",
    id: "td_label_tile",
    url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },
];
const baseMapKeys = [
  { name: "高德电子图", key: "gd_vec", keys: ["gd_vec_tile"] },
  {
    name: "高德影像图",
    key: "gd_img",
    keys: ["gd_img_tile", "gd_roadLabel_tile"],
  },
  { name: "谷歌遥感图", key: "gg_img", keys: ["gg_img_tile"] },
  {
    name: "天地图矢量图",
    key: "td_vec",
    keys: ["td_vec_tile", "td_roadLabel_tile", "td_label_tile"],
  },
  {
    name: "天地图影像图",
    key: "td_img",
    keys: ["td_img_tile", "td_roadLabel_tile", "td_label_tile"],
  },
  {
    name: "天地图地形图",
    key: "td_ter",
    keys: ["td_ter_tile", "td_roadLabel_tile", "td_label_tile"],
  },
];
export { baseMaps, baseMapKeys };
