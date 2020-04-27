import Map from 'ol/Map';
import View from 'ol/View';
import {defaults as defaultInteractions, DragRotateAndZoom} from 'ol/interaction';

import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";

const initMap = {
  map : null,
  view: null,
  baseMaps:[],
  operationLayers:[],
  init: function (mapId) {
    return new Promise((resolve,reject)=>{
      this.map = new Map({
        interactions:defaultInteractions().extend([
          new DragRotateAndZoom()
        ]),
        layers:[],
        target: mapId,
        view: this.initView()
      })
      window.map = this.map
      // 回调
      resolve({map:this.map,view:this.view});
    })
  },
  initView:function (center = [12682417.401133642, 2573911.8265894186] ){
    this.view = new View({
      center: center,
      projection: "EPSG:3857",
      minZoom: 3,
      zoom:7,
      maxZoom: 18
    })
    return this.view ;
  },
  addLayer: function(layer, layerArr) {
    const mylayer = this.findLayerById(layer.id, layerArr)
    if (!mylayer) {
      this.map.addLayer(layer)
      layerArr.push(layer)
    } else {
      console.warn('已存在该ID图层！')
    }
  },
  findLayerById: function (id, layerArr = this.operationLayers) {
    layerArr.filter(layer => {
      return layer.id === id
    })
  },
  createTilelayer: function(options) {
    return new TileLayer({
      id: options.id,
      source: new XYZ({
        crossOrigin: "anonymous",
        url: options.url
      })
    })
  },
  removeLayer: function() {
    
  }
}
export default initMap;
