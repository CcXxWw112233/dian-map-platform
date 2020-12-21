import { createStyle, loadFeatureJSON } from "../../../lib/utils/index";
import Axios from "axios";
const loadGeoJson = (parent, name) => {
  // let arr = ["../../../assets/json/惠州市3857.geojson"]
  Axios.get(require(`../../../assets/json/${name}.geojson`)).then((res) => {
    let { data } = res;
    let features = loadFeatureJSON(data, "GeoJSON");
    let operatorList = [];
    let tmpList = [];
    features.forEach((item, index) => {
      let type = item.getGeometry().getType();
      let name = item.get("name");
      let address = item.get("address");
      let tel = item.get("tel");
      if (tel === "[]") {
        tel = "";
      }
      let content = {
        geometryType: "Point",
        geoType: "Point",
        plotType: "point",
        featureType: "data:image/png;base64,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",
        selectName: name === "惠州市3857" ? "电信营业厅" : "亚朵酒店",
        title: name,
        name: name,
        address: address,
        tel: tel,
        coordSysType: 0,
        // strokeColor: "rgba(255,255,255,1)",
      };
      if (name === "惠州市3857") {
        content.meetingRoomNum = Math.round(Math.random() * 3);
      }
      let style = createStyle(type, {
        iconUrl: content.featureType,
        showName: true,
        text: name,
        textFillColor: "rgba(255,0,0,1)",
        textStrokeColor: "#fff",
        textStrokeWidth: 3,
        font: "13px sans-serif",
        placement: "Point",
        iconScale: 1,
        PointColor: "#fff",
        commonFunc: null,
      });

      item.setStyle(style);
      let operator = parent.plotLayer && parent.plotLayer._addFeature(item);
      operator.attrs = content;
      operator.setName(content.title);
      let arr = ["电信营业厅", "中国电信"]
      if (!arr.includes(content.title)) {
        operatorList.push(operator);
      } else {
        tmpList.push(operator)
      }
    });
    operatorList = operatorList.concat(tmpList);
    parent.updatePlotList(operatorList);
  });
};

export { loadGeoJson };
