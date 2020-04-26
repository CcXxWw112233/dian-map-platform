import { baseConfig } from "../globalSet/config";
export const baseMaps = [
  {
    title: "谷歌遥感图",
    name: "gg_img_tile",
    url:
      "http://mt2.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G",
  },
  {
    title: "天地图影像图",
    name: "td_img_tile",
    url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },
  {
    title: "天地图网路图",
    name: "td_roadLabel_tile",
    url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },{
    title: "天地图矢量图",
    name: "td_vec_tile",
    url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },{
    title: "天地图地形图",
    name: "td_ter_tile",
    url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },{
    title: '天地图注记',
    name: 'td_label_tile',
    url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
  },{
    title: '高德影像图',
    name: 'gd_img_tile',
    url: "http://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
  },{
    title: '高德电子图',
    name: 'gd_vec_tile',
    url: "http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  },{
    title: '高德路线图',
    name: 'gd_roadLabel_tile',
    url: "http://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",
  }
];
