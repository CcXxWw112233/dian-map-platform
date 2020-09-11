import areaSearch from "services/areaSearch";
import {
  Layer,
  Source,
  createStyle,
  loadFeatureJSON,
  TransformCoordinate,
} from "../../utils/index";
import mapApp from "utils/INITMAP";
import event from "../../../lib/utils/event";
function Action() {
  const {
    GET_PROVINCE,
    GET_CITY,
    GET_DISTRICT,
    GET_TOWN,
    GET_VILLIGE,
    GET_GEOM,
  } = areaSearch;
  this.layer = null;
  this.source = null;
  this.currentData = null;
  event.Evt.on("transCoordinateSystems2AreaSearch", () => {
    const baseMapKey = mapApp.baseMapKey;
    const lastBaseMapKey = mapApp.lastBaseMapKey;
    const baseMapKeys = mapApp.baseMapKeys;
    const isSame =
      baseMapKeys[0].indexOf(baseMapKey) ===
      baseMapKeys[0].indexOf(lastBaseMapKey);
    if (this.currentData && isSame === false) {
      this.addAreaGeomToMap(this.currentData);
    }
  });
  // 省
  this.getProvince = async () => {
    return await GET_PROVINCE();
  };
  // 市
  this.getCity = async (province) => {
    debugger
    return await GET_CITY(province);
  };
  // 县
  this.getDistrict = async (city) => {
    return await GET_DISTRICT(city);
  };
  // 镇
  this.getTown = async (district) => {
    return await GET_TOWN(district);
  };
  // 村
  this.getVillige = async (town) => {
    return await GET_VILLIGE(town);
  };

  this.getGeom = async (code, needChange) => {
    return await GET_GEOM(code, needChange);
  };

  this.loadFeature = (data, style) => {
    const newFeature = loadFeatureJSON(data);
    // 当前底图是gcj02坐标系
    const baseMapKeys = mapApp.baseMapKeys;
    const baseMapKey = mapApp.baseMapKey;
    const systemDic = mapApp.systemDic;
    if (baseMapKeys[1].indexOf(baseMapKey) > -1) {
      let coords = newFeature.getGeometry().getCoordinates();
      for (let i = 0; i < coords.length; i++) {
        for (let j = 0; j < coords[i].length; j++) {
          let tmp = TransformCoordinate(coords[i][j], "EPSG:3857", "EPSG:4326");
          tmp = systemDic[baseMapKey](tmp[0], tmp[1]);
          tmp = TransformCoordinate(tmp, "EPSG:4326", "EPSG:3857");
          coords[i][j] = tmp;
        }
      }
      newFeature.getGeometry().setCoordinates(coords);
    }
    newFeature.setStyle(style);
    this.source.addFeature(newFeature);
    mapApp.map.getView().fit(this.source.getExtent(), {
      size: mapApp.map.getSize(),
      duration: 1000,
    });
  };


  this.clearAreaExtent = () => {
    this.source.clear();
  }

  this.addAreaGeomToMap = (data) => {
    this.currentData = data;
    if (!data) return;
    if (!this.layer) {
      this.layer = Layer({ id: "areaLayer", zIndex: 10 });
      this.source = Source();
      this.layer.setSource(this.source);
      mapApp.map.addLayer(this.layer);
    }
    this.source.clear();
    let options = {
      strokeColor: "#0000FF",
      strokeWidth: 4,
      // fillColor: "rgba(255,255,255,0)",
    };
    const style = createStyle("MultiLineString", options);
    let newData = null;
    newData = {
      source: data,
      options: {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      },
    };
    this.loadFeature(newData, style);
  };
}
const exportAction = new Action();
export default exportAction;
