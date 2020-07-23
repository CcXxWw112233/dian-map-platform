import * as olProj from "ol/proj";
import { getDistance } from "ol/sphere";
import mapApp from "utils/INITMAP";
import { Layer, Source, createStyle, addFeature } from "@/lib/utils/index";

import LPPoiOverlay from "../PublicOverlays/LPPoiOverlay/index";
import baseOverlay from "../PublicOverlays/baseOverlay";
import { createOverlay } from "../../lib/utils";

// 计算poi点到楼盘的距离
export const getDistance2 = (pt1, pt2) => {
  // const projPt1 = olProj.fromLonLat(pt1, "EPSG:3857");
  // const projPt2 = olProj.fromLonLat(pt2, "EPSG:3857");
  // return (
  //   Math.round(
  //     Math.sqrt(
  //       Math.pow(projPt1[0] - projPt2[0], 2) +
  //         Math.pow(projPt1[1] - projPt2[1], 2)
  //     )
  //   ) + "米"
  // );
  const dis = Math.round(getDistance(pt1, pt2));
  return dis + "米";
};

export const jumpToPoi = (ptStr) => {
  const pt = ptStr.split(",");
  let newFeature = addFeature("Point", {
    coordinates: olProj.fromLonLat(pt, "EPSG:3857"),
  });
  mapApp.map.getView().fit(newFeature.getGeometry().getExtent(), {
    size: mapApp.map.getSize(),
    duration: 1000,
  });
};

// 展示poi
export const poiLayer = {
  layer: null,
  source: null,
  poi2Overlay: null,
  init: function () {
    if (!this.layer) {
      let layers = mapApp.map.getLayers();
      layers = layers.getArray();
      const layer = layers.find((item) => item.get("id") === "POI2Layer");
      if (!layer) {
        this.layer = Layer({ id: "POI2Layer", zIndex: 12 });
        this.source = Source();
        this.layer.setSource(this.source);
        mapApp.map.addLayer(this.layer);
        mapApp.map.on("click", (e) => {
          const obj = mapApp.map.forEachFeatureAtPixel(
            e.pixel,
            (feature, layer) => {
              return { feature, layer };
            }
          );
          if (obj?.layer) {
            if (obj.layer.get("id") === "POI2Layer") {
              this.poi2Overlay && mapApp.map.removeOverlay(this.poi2Overlay);
              const properties = obj.feature.getProperties();
              const data = {
                name: properties.name,
                address: properties.address,
                keywords: properties.keywords,
                cb: function () {
                  mapApp.map.removeOverlay(this.poi2Overlay);
                  this.poi2Overlay = null;
                  obj.feature.hasPopup = false;
                },
              };
              let poi2Ele = new LPPoiOverlay(data);
              poi2Ele = new baseOverlay(poi2Ele, {
                angleColor: "#fff",
                width: "auto",
              });
              this.poi2Overlay = createOverlay(poi2Ele, {
                offset: [-10, -90],
              });
              if (obj.feature.overlay) {
                mapApp.map.removeOverlay(obj.feature.overlay);
              }
              obj.feature.overlay = this.poi2Overlay;
              mapApp.map.addOverlay(obj.feature.overlay);
              obj.feature.overlay &&
                obj.feature.overlay.setPosition(
                  obj.feature.getGeometry().getCoordinates()
                );
            }
          } else {
            this.poi2Overlay && mapApp.map.removeOverlay(this.poi2Overlay);
            this.poi2Overlay = null;
          }
        });
      }
    }
  },
  addPoiToMap: function (pt, iconName, poiName, data) {
    const iconUrl = require(`../../assets/poi/${iconName}.svg`);
    const style = createStyle("Point", {
      iconUrl: iconUrl,
      showName: false,
      text: poiName,
      textFillColor: "rgb(254, 32, 66)",
      font: "14px sans-serif",
    });
    let newFeature = addFeature("Point", {
      coordinates: olProj.fromLonLat(pt, "EPSG:3857"),
      ...data,
    });
    newFeature.setStyle(style);
    this.source.addFeature(newFeature);
  },
  removePoi: function () {
    this.source && this.source.clear();
    this.poi2Overlay && mapApp.map.removeOverlay(this.poi2Overlay);
  },
};
