import PlotFactory from "../../../utils/plot2ol/src/PlotFactory";
import Feature from "ol/Feature";
import { baseOverlay, PopupOverlay } from "../../../components/PublicOverlays";
import featureOverlay2 from "../../../components/PublicOverlays/featureOverlay/index2";
import { formatLength, formatArea } from "utils/mapUtils";
import { createOverlay, TransformCoordinate } from "../../../lib/utils/index";
import InitMap from "../../../utils/INITMAP";
import { gcj02_to_wgs84, wgs84_to_gcj02 } from "utils/transCoordinateSystem";
const baseMapKeys = ["gd_vec|gd_img|gg_img", "td_vec|td_img|td_ter"];
export const createPlottingFeature = (data) => {
  let newType = data.geoType.toLowerCase();
  let coordinates = data.coordinates;
  if (!coordinates) return;
  if (newType === "point") {
    newType = "marker";
    coordinates = [data.coordinates];
  }
  if (newType === "linestring") {
    newType = "polyline";
  }
  if (newType === "polygon") {
    coordinates = [...data.coordinates[0]];
  }
  // 如果底图是wgs84(天地图)
  if (baseMapKeys[1].indexOf(InitMap.baseMapKey) > -1) {
    // 数据是gcj02（高德）坐标系上画的，要转到wgs84坐标系
    if (!data.coordSysType) {
      for (let i = 0; i < coordinates.length; i++) {
        let tmp = TransformCoordinate(coordinates[i], "EPSG:3857", "EPSG:4326");
        tmp = gcj02_to_wgs84(tmp[0], tmp[1]);
        if (!tmp || tmp.length !== 2) {
          continue;
        }
        coordinates[i] = TransformCoordinate(tmp, "EPSG:4326", "EPSG:3857");
      }
    }
  } else if (baseMapKeys[0].indexOf(InitMap.baseMapKey) > -1) {
    // 如果底图是gcj02(高德)坐标系
    // 数据是wgs84(天地图)坐标系上画的，要转到gcj02坐标系
    if (data.coordSysType === 1) {
      for (let i = 0; i < coordinates.length; i++) {
        let tmp = TransformCoordinate(coordinates[i], "EPSG:3857", "EPSG:4326");
        tmp = wgs84_to_gcj02(tmp[0], tmp[1]);
        if (!tmp || tmp.length !== 2) {
          continue;
        }
        coordinates[i] = TransformCoordinate(tmp, "EPSG:4326", "EPSG:3857");
      }
    }
  }
  let plot = PlotFactory.createPlot(newType, coordinates);
  plot.updatePlot(false);
  let feature = new Feature({ geometry: plot, ...data });
  // let feature = new Feature(plot)
  // 如果有id，则强制添加ID
  if (data.id) {
    feature.setId(data.id);
  }
  return feature;
};

export const createPopupOverlay = (feature, coordinate) => {
  const geometry = feature.getGeometry();
  let len, area, xy, remark;
  if (geometry.type === "polygon") {
    // len = formatLength(geometry);
    area = formatArea(geometry);
  }
  if (geometry.type === "polyline") {
    len = formatLength(geometry);
  }
  if (geometry.type === "marker") {
    const geometry = feature.clone().getGeometry();
    geometry.transform("EPSG:3857", "EPSG:4326");
    const coordinate4326 = geometry.getCoordinates();
    xy = `${coordinate4326[0].toFixed(6)},${coordinate4326[1].toFixed(6)}`;
  }
  if (feature.values_ && feature.values_.content) {
    remark = JSON.parse(feature.values_.content).remark || "";
  }
  let overlay;
  const data = {
    name: feature.values_.name || feature.values_.title,
    len: len,
    area: area,
    xy: xy,
    remark: remark,
    cb: function () {
      InitMap.map.removeOverlay(overlay);
      feature.hasPopup = false;
    },
  };
  let popupEle = new PopupOverlay(data);
  popupEle = new baseOverlay(popupEle, { angleColor: "#fff" });
  overlay = createOverlay(popupEle, {
    positioning: "bottom-left",
    offset: [-10, -15],
  });
  if (feature.overlay) {
    InitMap.map.removeOverlay(feature.overlay);
  }
  feature.overlay = overlay;
  InitMap.map.addOverlay(overlay);
  // let extent = feature.getGeometry().getExtent();
  // coordinate = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
  overlay.setPosition(coordinate);
};

export const createFeatureOverlay = (feature, name, num, imgSrc, cb) => {
  // const feature = operator.feature;
  const geometry = feature.getGeometry();
  let coords = geometry.getCoordinates();
  let ele = new featureOverlay2(name, num, imgSrc, cb);
  // ele = new baseOverlay(ele, { angleColor: "#fff", placement: "topCenter" } )
  let overlay = createOverlay(ele, {
    // id: `${operator.guid}-feature`,
    position: coords,
    offset: [0, 30],
    positioning: "top-center",
    // autoPan: true
  });
  return overlay;
};
