import * as olProj from "ol/proj";
import { getDistance } from "ol/sphere";
import mapApp from "utils/INITMAP";
import { Layer, Source, createStyle, addFeature } from "@/lib/utils/index";

import LPPoiOverlay from "../PublicOverlays/LPPoiOverlay/index";
import baseOverlay from "../PublicOverlays/baseOverlay";
import { createOverlay, TransformCoordinate } from "../../lib/utils";
import event from "../../lib/utils/event";

// 计算poi点到楼盘的距离
export const getDistance2 = (pt1, pt2) => {
  const dis = Math.round(getDistance(pt1, pt2));
  return dis + "米";
};

export const jumpToPoi = (data, keywords) => {
  const ptStr = data.location;
  const pt = ptStr.split(",");
  let newFeature = addFeature("Point", {
    coordinates: olProj.fromLonLat(pt, "EPSG:3857"),
  });
  mapApp.map.getView().fit(newFeature.getGeometry().getExtent(), {
    size: mapApp.map.getSize(),
    duration: 1000,
  });
  poiLayer.poi2Overlay && mapApp.map.removeOverlay(poiLayer.poi2Overlay);
  const data2 = {
    name: data.name,
    address: data.address,
    keywords: keywords,
    distance: data.distance + "米",
    cb: function () {
      mapApp.map.removeOverlay(poiLayer.poi2Overlay);
    },
  };
  let poi2Ele = new LPPoiOverlay(data2);
  poi2Ele = new baseOverlay(poi2Ele, {
    angleColor: "#fff",
    width: "auto",
  });
  const poi2Overlay = createOverlay(poi2Ele, {
    offset: [-10, -90],
  });
  poiLayer.poi2Overlay = poi2Overlay;
  newFeature.overlay = poi2Overlay;
  mapApp.map.addOverlay(newFeature.overlay);
  newFeature.overlay &&
    newFeature.overlay.setPosition(newFeature.getGeometry().getCoordinates());
};

// 展示poi
export const poiLayer = {
  layer: null,
  source: null,
  poi2Overlay: null,
  features: [],
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
                distance: properties.distance,
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
    //     event.Evt.on("transCoordinateSystems2Local", () => {
    //       const baseMapKey = mapApp.baseMapKey;
    //       const lastBaseMapKey = mapApp.lastBaseMapKey;
    //       const baseMapKeys = mapApp.baseMapKeys;
    //       const isSame =
    //         baseMapKeys[0].indexOf(baseMapKey) ===
    //         baseMapKeys[0].indexOf(lastBaseMapKey);
    //       if (isSame === false) {
    //         let newFeatures = [];
    //         let features = this.source.getFeatures();
    //         features.forEach((item) => {
    //           let coords = item.getGeometry().getCoordinates();
    //           let type = features.getGeometry().getType();
    //           if (type === "Point") {
    //             coords = TransformCoordinate(coords, "EPSG:3857", "EPSG:4326");
    //             coords = mapApp.systemDic[baseMapKey](coords[0], coords[1]);
    //             let feature = addFeature("Point", { coordinates: coords });
    //             feature.setStyle(item.getStyle());
    //             newFeatures.push(feature);
    //           }
    //           if (type === "Polygon") {
    //             for (let j = 0; j < coords.length; j++) {
    //               for (let k = 0; k < coords[j].length; k++) {
    //                 let temp = mapApp.systemDic[baseMapKey](coords[j][k][0], coords[j][k][1]);
    //                 if (!temp) {
    //                   continue;
    //                 }
    //                 coords[j][k] = temp;
    //               }
    //             }
    //             let feature = addFeature("Polygon", { coordinates:coords })
    //         this.source.clear();
    //         this.source.addFeatures(newFeatures);
    //       }
    //     });
    //   }
    // }
    event.Evt.on()
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
    const baseMapKey = mapApp.baseMapKey;
    const baseMapKeys = mapApp.baseMapKeys;
    let newFeature = null
    if (baseMapKeys[1].includes(baseMapKey)) {
      newFeature = addFeature("Point", {
        coordinates: olProj.fromLonLat(pt, "EPSG:3857"),
        ...data,
      });
    } else {
      newFeature = addFeature("Point", {
        coordinates: olProj.fromLonLat(pt, "EPSG:3857"),
        ...data
      })
    }
    newFeature.setStyle(style);
    this.source.addFeature(newFeature);
  },
  removePoi: function () {
    this.source && this.source.clear();
    this.poi2Overlay && mapApp.map.removeOverlay(this.poi2Overlay);
  },
};
