import areaSearch from "services/areaSearch";
import { Layer, Source, createStyle, loadFeatureJSON } from "../../utils/index";
import mapApp from "utils/INITMAP";
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
  // 省
  this.getProvince = async () => {
    return await GET_PROVINCE();
  };
  // 市
  this.getCity = async (province) => {
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
    newFeature.setStyle(style);
    this.source.addFeature(newFeature);
    mapApp.map.getView().fit(this.source.getExtent(), {
      size: mapApp.map.getSize(),
      duration: 1000,
    });
  };

  this.addAreaGeomToMap = (data) => {
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
    }
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
