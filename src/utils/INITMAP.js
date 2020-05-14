import Map from "ol/Map";
import View from "ol/View";
import {
  defaults as defaultInteractions,
  DragRotateAndZoom,
} from "ol/interaction";

import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";

import LayerGroup from "ol/layer/Group";
import Collection from "ol/Collection";

const initMap = {
  status: null,
  map: null,
  view: null,
  drawing: {},
  baseMaps: [],
  operationLayers: [],
  init: function (mapId) {
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
      // 回调
      resolve({ map: this.map, view: this.view });
    });
  },
  initView: function (center = [12682417.401133642, 2573911.8265894186]) {
    this.view = new View({
      center: center,
      projection: "EPSG:3857",
      minZoom: 3,
      zoom: 7,
      maxZoom: 18,
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
    // layerArr.filter((layer) => {
    //   return layer.get("id") === id;
    // });
    let layer = null;
    for (let i = 0; i < layerArr.length; i++) {
      const currentId = layerArr[i].get("id");
      if (currentId === id) {
        layer = layerArr[i];
        break;
      }
    }
    return layer;
  },
  createTilelayer: function (options) {
    return new TileLayer({
      id: options.id,
      source: new XYZ({
        crossOrigin: "anonymous",
        url: options.url,
      }),
    });
  },
  createBaseLayer: function (options) {
    let layerGroup = null;
    if (options && options.url) {
      layerGroup = new LayerGroup({ id: options.id });
      let layerCollection = new Collection();
      const urls = options.url;
      urls.forEach((url, index) => {
        const option = { url: url, id: `${options.id}${index}` };
        const layer = this.createTilelayer(option);
        layerCollection.push(layer);
      });
      layerGroup.setLayers(layerCollection);
    }
    return layerGroup;
  },
  addBaseLayer: function (layer, layerArr = this.baseMaps) {
    const myLayer = this.findLayerById(layer, layerArr = this.baseMaps);
    if (!myLayer) {
      this.map.setLayerGroup(layer);
      layerArr.push(layer);
    } else {
      console.warn("已存在该ID图层！");
    }
  },
  removeLayer: function (layer) {
    this.map.removeLayer(layer);
    let index = this.operationLayers.findIndex(
      (item) => item.get("id") === layer.get("id")
    );
    this.operationLayers.splice(index, 1);
  },
};
export default initMap;
