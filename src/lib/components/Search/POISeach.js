import {
  Layer,
  Source,
  createStyle,
  addFeature,
  TransformCoordinate,
} from "../../utils/index";
import { setSession, getSession } from "utils/sessionManage";
import mapApp from "utils/INITMAP";
function Action() {
  this.layer = null;
  this.source = null;
  this.getPOI = async (address, locationName, offset) => {
    return await window.CallWebMapFunction("getAddressForName", {
      address: address,
      fromCity: locationName,
      offset: offset || 10,
    });
  };
  this.addPOIToMap = (item) => {
    if (!this.layer) {
      this.layer = Layer({ id: "POILayer", zIndex: 11 });
      this.source = Source();
      this.layer.setSource(this.source);
      mapApp.map.addLayer(this.layer);
    }
    this.source.clear();
    const iconUrl = require("../../../assets/location.png");
    const style = createStyle("Point", {
      iconUrl: iconUrl,
      showName: true,
      text: item.name,
      textFillColor: "rgb(23, 105, 251)",
      font: "14px sans-serif",
    });
    const ptArr = item.location.split(",");
    let newFeature = addFeature("Point", {
      coordinates: TransformCoordinate([ptArr[0] * 1, ptArr[1] * 1]),
    });
    newFeature.setStyle(style);
    this.source.addFeature(newFeature);
    mapApp.map.getView().fit(this.source.getExtent(), {
      size: mapApp.map.getSize(),
      duration: 1000,
    });
  };

  this.removePOI = () => {
    this.source && this.source.clear();
  }

  this.setSession = (address) => {
    getSession("search").then((res) => {
      let data = res.data;
      if (data) {
        if (data.indexOf(`${address},`) < 0) {
          setSession("search", `${data}${address},`);
        }
      } else {
        setSession("search", `${address},`);
      }
    });
  };
  this.cleanSearchSession = () => {
    setSession("search", "");
  };

  this.getSessionArray = async () => {
    const res = await getSession("search");
    let arr = [];
    if (res.code === 0) {
      if (res.data) {
        arr = res.data.substr(0, res.data.length - 1).split(",");
        arr = arr.filter((item) => {
          return item && item.trim();
        });
      }
    }
    return arr;
  };
}
const exportAction = new Action();
export default exportAction;
