import PlotFactory from "../../../utils/plot2ol/src/PlotFactory";
import Feature from "ol/Feature";
import { baseOverlay, PopupOverlay } from "../../../components/PublicOverlays";
import { formatLength, formatArea } from "utils/mapUtils";
import { createOverlay } from "../../../lib/utils/index";
import InitMap from "../../../utils/INITMAP";
export const createPlottingFeature = (data) => {
  let newType = data.geoType.toLowerCase();
  let coordinates = null;
  if (newType === "point") {
    newType = "marker";
    coordinates = [data.coordinates];
  }
  if (newType === "linestring") {
    newType = "polyline";
    coordinates = data.coordinates;
  }
  if (newType === "polygon") {
    coordinates = [...data.coordinates[0]];
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
  let len, area, xy,remark;
  if (geometry.type === "polygon") {
    len = formatLength(geometry);
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
    remark = JSON.parse(feature.values_.content).remark || ""
  }
  let overlay;
  const data = {
    name: feature.values_.name,
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
  popupEle = new baseOverlay(popupEle, {angleColor: "#fff"});
  overlay = createOverlay(popupEle, {
    positioning: "bottom-left",
    offset: [-10, -15],
  });
  if (feature.overlay) {
    InitMap.map.removeOverlay(feature.overlay);
  }
  feature.overlay = overlay;
  InitMap.map.addOverlay(overlay);
  overlay.setPosition(coordinate);
};
