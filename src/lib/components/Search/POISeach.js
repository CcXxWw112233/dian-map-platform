import {
  Layer,
  Source,
  createStyle,
  addFeature,
  TransformCoordinate,
} from "../../utils/index";
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
}
const exportAction = new Action();
export default exportAction;
