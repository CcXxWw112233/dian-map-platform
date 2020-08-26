import {
  Layer,
  Source,
  createStyle,
  addFeature,
  TransformCoordinate,
} from "../../utils/index";
import event from "../../utils/event";
import { setSession, getSession } from "utils/sessionManage";
import mapApp from "utils/INITMAP";

function Action() {
  this.layer = null;
  this.source = null;
  this.currentPoi = null;
  event.Evt.on("transCoordinateSystems2CommonSearch", (key) => {
    if (this.currentPoi) {
      this.addPOIToMap(this.currentPoi);
    }
  });
  this.getPOI = async (address, locationName, offset) => {
    return await window.CallWebMapFunction("getAddressForName", {
      address: address,
      fromCity: locationName,
      offset: offset || 10,
    });
  };
  this.addPOIToMap = (item) => {
    this.currentPoi = item;
    if (!this.layer) {
      this.layer = Layer({ id: "POILayer", zIndex: 12 });
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
    let coord = null;
    // 当前底图是gcj02坐标系
    const baseMapKeys = mapApp.baseMapKeys;
    const baseMapKey = mapApp.baseMapKey;
    const systemDic = mapApp.systemDic;
    if (baseMapKeys[0].indexOf(baseMapKey) > -1) {
      coord = TransformCoordinate([ptArr[0] * 1, ptArr[1] * 1]);
    } else if (baseMapKeys[1].indexOf(baseMapKey) > -1) {
      coord = TransformCoordinate(
        systemDic[baseMapKey](ptArr[0] * 1, ptArr[1] * 1)
      );
    }
    let newFeature = addFeature("Point", {
      coordinates: coord,
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
    this.currentPoi = null;
  };

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
