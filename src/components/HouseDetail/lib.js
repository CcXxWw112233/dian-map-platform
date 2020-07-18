import * as olProj from 'ol/proj';
import mapApp from "utils/INITMAP";
import {
  Layer,
  Source,
  createStyle,
  addFeature,
  TransformCoordinate,
} from "@/lib/utils/index";
// 计算poi点到楼盘的距离
export const getDistance = (pt1, pt2) => {
  const projPt1 = olProj.fromLonLat(pt1, "EPSG:3857")
  const projPt2 = olProj.fromLonLat(pt2, "EPSG:3857")
  return Math.round(Math.sqrt(Math.pow((projPt1[0] - projPt2[0]), 2) + Math.pow((projPt1[1] - projPt2[1]), 2))) + '米'
}

export const jumpToPoi = (ptStr) => {
  const pt = ptStr.split(",")
  let newFeature = addFeature("Point", {
    coordinates: olProj.fromLonLat(pt, "EPSG:3857")
  })
  mapApp.map.getView().fit(newFeature.getGeometry().getExtent(), {
    size: mapApp.map.getSize(),
    duration: 1000,
  });
}

// 展示poi
export const poiLayer = {
  layer: null,
  source: null,
  init: function () {
    if (!this.layer) {
      let layers = mapApp.map.getLayers();
      layers = layers.getArray();
      const layer = layers.find(item => item.get('id') === "POI2Layer");
      if (!layer) {
        this.layer = Layer({ id: "POI2Layer", zIndex: 12 });
        this.source = Source();
        this.layer.setSource(this.source);
        mapApp.map.addLayer(this.layer);
      }
    }
  },
  addPoiToMap: function (pt = [0, 0], iconName = "", poiName = "") {
    const iconUrl = require(`../../assets/poi/${iconName}.svg`)
    const style = createStyle("Point", {
      iconUrl: iconUrl,
      showName: true,
      text: poiName,
      textFillColor: "rgb(254, 32, 66)",
      font: "14px sans-serif",
    });
    let newFeature = addFeature("Point", {
      coordinates: olProj.fromLonLat(pt, "EPSG:3857")
    })
    newFeature.setStyle(style);
    this.source.addFeature(newFeature);
  },
  removePoi: function () {
    this.source && this.source.clear();
  }
}
