import Map from "ol/Map";
import View from "ol/View";
import {
  defaults as defaultInteractions,
  DragRotateAndZoom,
  DragPan,
} from "ol/interaction";

import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";

import { baseMaps, baseMapDictionary } from "utils/mapSource";
import { gcj02_to_wgs84, wgs84_to_gcj02 } from "utils/transCoordinateSystem";

const initMap = function () {
  return {
    status: null,
    map: null,
    view: null,
    drawing: {},
    baseMaps: [],
    mapId: "",
    lastBaseMapKey: "",
    baseMapKey: "",
    operationLayers: [],
    adcode: "",
    baseMapKeys: ["gd_vec|gd_img|gg_img", "td_vec|td_img|td_ter"],
    systemDic: {
      gd_vec: wgs84_to_gcj02,
      gd_img: wgs84_to_gcj02,
      gg_img: wgs84_to_gcj02,
      td_vec: gcj02_to_wgs84,
      td_img: gcj02_to_wgs84,
      td_ter: gcj02_to_wgs84,
    },
    checkUpdateMapSystem: function(to){
      let arr1 = ['gd_vec','gd_img','gg_img'];
      let arr2 = ['td_vec','td_img','td_ter'];
      // 如果从两个分组中找出都找除了from和to，那代表是不同坐标系转换
      if((arr1.includes(this.lastBaseMapKey) && arr2.includes(to)) ||
      (arr2.includes(this.lastBaseMapKey) && arr1.includes(to))){
        // 需要更新
        return true;
      }
      return false;
    },
    init: function (mapId) {
      this.mapId = mapId;
      this.status = "rendering";
      return new Promise((resolve, reject) => {
        this.map = new Map({
          interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
          layers: [],
          target: mapId,
          view: this.initView(),
        });
        this.status = "renderend";
        window.map = this.map;
        // 屏蔽右键菜单
        this.map.getViewport().oncontextmenu = () => {
          return false;
        };
        // 回调
        resolve({ map: this.map, view: this.view });
      });
    },
    initView: function (center = [12682417.401133642, 2573911.8265894186]) {
      this.view = new View({
        center: center,
        projection: "EPSG:3857",
        minZoom: 5,
        zoom: 10,
        maxZoom: 20,
        enableRotation: false,
      });
      return this.view;
    },
    addLayer: function (layer, layerArr = this.operationLayers) {
      const mylayer = this.findLayerById(layer.get("id"), layerArr);
      if (!mylayer) {
        this.map.addLayer(layer);
        layerArr.push(layer);
      } else {
        console.warn("已存在该ID图层！");
      }
    },
    findLayerById: function (id, layerArr = this.operationLayers) {
      let layers = this.map.getLayers();
      layers = layers.getArray();
      let layer = layers.find((item) => item.get("id") === id);
      return layer;
    },
    createTilelayer: function (options, zIndex) {
      return new TileLayer({
        id: options.id,
        zIndex: zIndex,
        source: new XYZ({
          crossOrigin: "anonymous",
          url: options.url,
        }),
      });
    },
    addBaseLayer: function (layer, layerArr = this.baseMaps) {
      const id = layer.get("id");
      const myLayer = this.findLayerById(id, (layerArr = this.baseMaps));
      if (!myLayer) {
        this.map.addLayer(layer);
        layerArr.push(layer);
      } else {
        console.warn("已存在该ID图层！");
      }
    },
    changeBaseMap: function (key) {
      this.lastBaseMapKey = this.baseMapKey;
      this.baseMapKey = key;
      let baseMapKey = null;
      if (baseMapDictionary && baseMapDictionary.length) {
        baseMapKey = baseMapDictionary.filter((item) => {
          return item.key === key;
        })[0];
      }
      if (baseMapKey && baseMapKey.values.length > 0) {
        this.baseMaps.forEach((layer) => {
          layer.setVisible(false);
        });
        baseMapKey.values.forEach((key, index) => {
          let layer = this.findLayerById(key, this.baseMaps);
          if (!layer) {
            let zIndex = index;
            const baseMapItem = baseMaps.filter((baseMap) => {
              return baseMap.id === key;
            })[0];
            const baseLayer = this.createTilelayer(baseMapItem, zIndex);
            this.addBaseLayer(baseLayer);
          } else {
            layer.setVisible(true);
          }
        });
      }
    },

    // 路网显示隐藏
    showRoadLabel: function (key, value = false) {
      let baseMapKey = null;
      if (baseMapDictionary && baseMapDictionary.length) {
        baseMapKey = baseMapDictionary.filter((item) => {
          return item.key === key;
        })[0];
      }
      if (baseMapKey && baseMapKey.values.length > 0) {
        if (value === false) {
          this.baseMaps.forEach((layer) => {
            if (layer.get("id")?.indexOf("_roadLabel_tile") > -1) {
              layer.setVisible(false);
            }
          });
        } else {
          baseMapKey.values.forEach((key, index) => {
            let layer = this.findLayerById(key, this.baseMaps);
            if (layer.get("id")?.indexOf("_roadLabel_tile") > -1) {
              layer.setVisible(true);
            }
          });
        }
      }
    },
    removeLayer: function (layer) {
      this.map.removeLayer(layer);
      let index = this.operationLayers.findIndex(
        (item) => item.get("id") === layer.get("id")
      );
      this.operationLayers.splice(index, 1);
    },
    // changeBaseMap: (item) => {
    //   this.baseMaps.forEach(layer => {
    //     layer.setVisible(false)
    //   })
    //   let layer = myMapApp.findLayerById(item.id, myMapApp.baseMaps)
    //   if (!layer) {
    //     layer = myMapApp.createTilelayer(item)
    //     myMapApp.addLayer(layer, myMapApp.baseMaps)
    //   } else {
    //     layer.setVisible(true)
    //   }
    // }
  };
};

export default new initMap();
