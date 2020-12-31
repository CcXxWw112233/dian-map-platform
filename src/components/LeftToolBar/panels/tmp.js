import { createStyle, loadFeatureJSON } from "../../../lib/utils/index";
import Axios from "axios";
const loadGeoJson = (parent, fileName) => {
  // let arr = ["../../../assets/json/惠州市3857.geojson"]
  Axios.get(require(`../../../assets/json/${fileName}.geojson`)).then((res) => {
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
        selectName: "四五星级酒店",
        title: name,
        name: name,
        address: address,
        tel: tel,
        coordSysType: 0,
        // strokeColor: "rgba(255,255,255,1)",
      };
      if (fileName === "惠州市3857") {
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
