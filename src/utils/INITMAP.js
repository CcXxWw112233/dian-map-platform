import Map from 'ol/Map';
import View from 'ol/View';
import {defaults as defaultInteractions, DragRotateAndZoom} from 'ol/interaction';

const initMap = {
  map : null,
  view: null,
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
  }
}
export default initMap;
