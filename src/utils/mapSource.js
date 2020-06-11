import { baseConfig } from "../globalSet/config";

const baseMaps = [
  {
    title: "高德电子图",
    id: "gd_vec_tile",
    url: `${document.location.protocol}//webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}`,
  },
  {
    title: "高德影像图",
    id: "gd_img_tile",
    url: `${document.location.protocol}//webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}`,
  },
  {
    title: "高德路线图",
    id: "gd_roadLabel_tile",
    url: `${document.location.protocol}//webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}`,
  },
  {
    title: "谷歌遥感图",
    id: "gg_img_tile",
    url: `${document.location.protocol}//mt2.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G`,
  },
  {
    title: "天地图影像图",
    id: "td_img_tile",
    url: `${document.location.protocol}//t{0-7}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },
  {
    title: "天地图网路图",
    id: "td_roadLabel_tile",
    url: `${document.location.protocol}//t{0-7}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },
  {
    title: "天地图矢量图",
    id: "td_vec_tile",
    url: `${document.location.protocol}//t{0-7}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },
  {
    title: "天地图地形图",
    id: "td_ter_tile",
    url: `${document.location.protocol}//t{0-7}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },
  {
    title: "天地图注记",
    id: "td_label_tile",
    url: `${document.location.protocol}//t{0-7}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },
];
const baseMapDictionary = [
  {
    name: "高德",
    type: "电子图",
    key: "gd_vec",
    img: require("../assets/lenged/basemap-dz.png"),
    values: ["gd_vec_tile"],
  },
  {
    name: "高德",
    type: "影像图",
    key: "gd_img",
    img: require("../assets/lenged/basemap-wx.png"),
    values: ["gd_img_tile", "gd_roadLabel_tile"],
  },
  {
    name: "谷歌",
    type: "影像图",
    key: "gg_img",
    img: require("../assets/lenged/basemap-wx.png"),
    values: ["gg_img_tile"],
  },
  {
    name: "天地图",
    type: "电子图",
    key: "td_vec",
    img: require("../assets/lenged/basemap-dz.png"),
    values: ["td_vec_tile", "td_roadLabel_tile", "td_label_tile"],
  },
  {
    name: "天地图",
    type: "影像图",
    key: "td_img",
    img: require("../assets/lenged/basemap-wx.png"),
    values: ["td_img_tile", "td_roadLabel_tile", "td_label_tile"],
  },
  {
    name: "天地图",
    type: "地形图",
    key: "td_ter",
    img: require("../assets/lenged/basemap-dx.png"),
    values: ["td_ter_tile", "td_roadLabel_tile", "td_label_tile"],
  },
];
export { baseMaps, baseMapDictionary };
