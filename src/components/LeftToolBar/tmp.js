import Axios from "axios";
import Feature from "ol/Feature";
import { createStyle, loadFeatureJSON } from "../../lib/utils/index";

import PlotFactory from "@/utils/plot2ol/src/PlotFactory";

// 更新江西数据的临时方法
const loadGeoJson = async (parent) => {
  debugger;
  const plotLayer = parent.plotLayer;
  return await Axios.get(
    require("../../assets/geojson/水路路线图.geojson")
  ).then((res) => {
    const commonStyleOptions = {
      textFillColor: "rgba(255,0,0,1)",
      textStrokeColor: "#fff",
      textStrokeWidth: 3,
      font: "13px sans-serif",
      placement: "Point",
      iconScale: 1,
      PointColor: "#fff",
      showName: true,
      commonFunc: null,
    };
    let { data } = res;
    let features = loadFeatureJSON(data, "GeoJSON");
    let p = [];
    features.forEach((item, index) => {
      let type = item.getGeometry().getType();
      let name = item.get("name");
      let fillColor = item.get("fillColor");
      let strokeColor = item.get("strokeColor");

      // 点
      // let coordinates = item.getGeometry().getCoordinates()
      // let plot = PlotFactory.createPlot("polyline", [coordinates]);
      // let feature = new Feature({ geometry: plot });
      // let style = createStyle(type, {
      //   fillColor: "rgba(128,58,10,1)",
      //   strokeColor: "rgba(146,208,80,1)",
      //   ...commonStyleOptions,
      //   showName: true,
      //   text: txtmemo,
      // });
      // feature.setStyle(style);
      // let fo = plotLayer._addFeature(feature);
      // fo.setName(txtmemo);
      // fo.attrs = {
      //   name: txtmemo,
      //   fillColor: "rgba(128,58,10,1)",
      //   strokeColor: "rgba(146,208,80,1)",
      //   featureType: "rgba(128,58,10,1)",
      //   geoType: "Point",
      //   remark: "",
      //   selectName: "自定义类型",
      //   coordSysType: 0,
      // };
      // parent.props.parent.featureOperatorList.push(fo);

      let coordinates = item.getGeometry().getCoordinates();
      for (let i = 0; i < coordinates.length; i++) {
        let plot = PlotFactory.createPlot("polyline", coordinates[i]);
        let feature = new Feature({ geometry: plot });
        let style = createStyle("Polyline", {
          // fillColor: "rgba(0,176,240,0.8)",
          strokeColor: "rgba(0,176,240,1)",
          ...commonStyleOptions,
          showName: true,
          text: name || "未命名水路路线图",
        });
        feature.setStyle(style);
        let fo = plotLayer._addFeature(feature);
        fo.setName(name || "未命名水路路线图");
        fo.attrs = {
          name: name || "未命名水路路线图",
          // fillColor: "rgba(0,176,240,1)",
          strokeColor: "rgba(0,176,240,1)",
          featureType: "rgba(0,176,240,1)",
          geoType: "Polyline",
          remark: "",
          selectName: "自定义类型",
          coordSysType: 0,
        };
        parent.props.parent.featureOperatorList.push(fo);
      }
    });
    Promise.all(p).then((res) => {
      console.log(res);
    });
    // this.Source.addFeatures(features)
    // console.log(features);
  });
};

export { loadGeoJson };
