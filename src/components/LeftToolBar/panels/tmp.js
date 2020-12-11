import { createStyle, loadFeatureJSON } from "../../../lib/utils/index";
import Axios from "axios";
// 更新江西数据的临时方法
const loadGeoJson = (parent) => {
  Axios.get(require("../../../assets/json/惠州市3857.geojson")).then((res) => {
    let { data } = res;
    let features = loadFeatureJSON(data, "GeoJSON");
    let operatorList = [];
    features.forEach((item, index) => {
      let type = item.getGeometry().getType();
      let name = item.get("name");
      let address = item.get("address");
      let tel = item.get("tel")
      if (tel === "[]") {
        tel = ""
      }
      let content = {
        geometryType: "Point",
        geoType: "Point",
        plotType: "point",
        featureType:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAADKElEQVRYR+2YzWtUZxTGfyeTNFGrC0s3/Qe6EhdduNFNI1JQuwihVoqgjbnjTEyigq6EVnQX6lfNTGZibKEfEgldtBU/ULuoGxcuxJX+AYKIEWLNR/PxyE0movHOfd+5NwYFZ3ufc87vnvPOO+cZ4y39WBKunT+padkErWZ8g/EZ4iOMutlcYgbjMeK2xG9jjQz9vMvGa61TE9i3A1rZNM0RiawZy32KSYyaURrP8N25NnvqExNqvMHy/WpFnAI+8U2+QPcAo7vQbkM+8W4wyXJljgEHzWjwSVpNIzEJ9BQDDmOmuFzxYHNQxw26XpyhNGSVMyg4XQw4EAcXC5YrqQM4kbZTC9+l0rn9xaz1VnvPqmB7S1ozY1xOcaZcvX1QJ744k7W7UcJosLkRnjdjmyt7mucSg8WA7VEjjQTLl7QeuIixKk1hZ6wYATYXsnZzoTYarKyTQLcz8eIIThUC2+cEy/fqQ+q5hrFuceo6sohbTLGx0GH/vax8rWO5AX1q0/wLfLwkYPBIGTYU2+xeLFi+pE0YfwArlgjsGaKlkLWr78E8O/6Od+ytPfxtZ7X6g2lumLHWcxSpZBJ3/s/w+cBuG449/OHDfFlloD1VRf/g/kJggfOCDQV7ytpSJy5gLPPPn0ApxmaMr/oC+9sLrPO0GqcbZ38rmxOU8w8R1zMTbP6xyya8wEJRR5+aFV60b+qHXIyYaOndY9f9155Q+Sa213kCMePaYmM32FmbNsmgwZf+83ErBX+ONbAtztY5zUjFsv2C2Jp675/znH+NZ9jhsnJOsPD9w84tn+QsCrfNirF1N+ZVxRzUwGgDXT4G2AssrPD9P6p/eJ+eJI6pFts2/zbeYLMBCTymIPx74FCxnTMuL+m8+WOnJFm+ny6JHqetEyOCXDFrv9c6+do69lL2fFl5wQ8GTVFFJZ7I2N4X2JVaoUJ9YrAwuJohTguVGizyEg7HZ3xdDOxSkk4lO/wRlV65hD1udF/YVKOcLxIul0wRmoknUbuVL0y6b2WVKrmyjpoYLmTtRBIQ7+2i1uSdv2rVxDOmylkbrTU2Sr8oo1wMkIU5ngPc8D421O3HTQAAAABJRU5ErkJggg==",
        selectName: "自定义类型",
        title: name,
        name: name,
        address: address,
        tel: tel,
        coordSysType: 0,
        // strokeColor: "rgba(255,255,255,1)",
      };
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
      operator.setName(content.title)
      operatorList.push(operator);
    });
    parent.updatePlotList(operatorList);
  });
};

export { loadGeoJson };
