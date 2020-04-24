import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ';
import {baseConfig} from '../globalSet/config'

export default {
  baseMaps: {
    google: {
      title:"谷歌地图",
      // 默认的普通视图
      img: {
        title:"遥感图",
        tile: new TileLayer({
          layerOnType:"baseMap",
          mid:"gg_img_tile",
          source: new XYZ({
            crossOrigin:"anonymous",
            url: "http://mt2.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G",
            projection: "EPSG:3857"
          })
        })
      }
    },
    /***
     * 天地图 要key的
     * vec——街道底图
     * img——影像底图
     * ter——地形底图
     * cva——中文注记
     * cta/cia——道路+中文注记 ---roadLabel
     */
    tianditu: {
      title:"天地图",
        // 基础图
      img: {
        title:"影像图",
        tile: new TileLayer({
          layerOnType:"baseMap",
          mid:"td_img_tile",
          source: new XYZ({
            crossOrigin:"anonymous",
            url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
            projection: "EPSG:3857"
          })
        })
      },
      roadLabel:{
        title:"网路图",
        tile: new TileLayer({
          layerOnType:"baseMap",
          zIndex:1,
          mid:"td_roadLabel_tile",
          source: new XYZ({
            crossOrigin:"anonymous",
            url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
            projection: "EPSG:3857"
          })
        })
      },
      vec:{
        title:"矢量图",
        tile: new TileLayer({
          layerOnType:"baseMap",
          mid:"td_vec_tile",
          source: new XYZ({
            crossOrigin:"anonymous",
            url: "http://t{0-7}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}",
            projection: "EPSG:3857"
          })
        })
      },
      ter:{
        title:"地形图",
        tile: new TileLayer({
          layerOnType:"baseMap",
          mid:"td_ter_tile",
          source: new XYZ({
            crossOrigin:"anonymous",
            url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
            projection: "EPSG:3857"
          })
        })
      },
      label: {
        title:"文字标注",
        tile: new TileLayer({
          layerOnType:"baseMap",
          mid:"td_label_tile",
          source: new XYZ({
            crossOrigin:"anonymous",
            url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${baseConfig.TIANDITU_APP_KEY}`,
            projection: "EPSG:3857"
          })
        })
      }
    },
    /****
     * 高德地图
     * lang可以通过zh_cn设置中文，en设置英文，size基本无作用，scl设置标注还是底图，scl=1代表注记，
     * scl=2代表底图（矢量或者影像），style设置影像和路网，style=6为影像图，
     * vec——街道底图
     * img——影像底图
     * roadLabel---路网+标注
     */
    gaode:{
      title:"高德地图",
      img:{
        title:"影像图",
        tile: new TileLayer({
          layerOnType:"baseMap",
          mid:"gd_img_tile",
          source: new XYZ({
            crossOrigin:"anonymous",
            url: "http://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
            projection: "EPSG:3857"
          })
        })
      },
      vec:{
        title:"矢量图",
        tile: new TileLayer({
          layerOnType:"baseMap",
          mid:"gd_vec_tile",
          source: new XYZ({
            crossOrigin:"anonymous",
            url: "http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
            projection: "EPSG:3857"
          })
        })
      },
      roadLabel:{
        title:"路线图",
        tile: new TileLayer({
          layerOnType:"baseMap",
          zIndex:1,
          mid:"gd_roadLabel_tile",
          source: new XYZ({
            crossOrigin:"anonymous",
            url: "http://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",
            projection: "EPSG:3857"
          })
        })
      },
    }
}
}
