import FTStyle from "./Style";
import { Fill, Stroke, Circle, Style, Text } from "ol/style";
// import Stroke from 'ol/style/Stroke'
// import Fill from 'ol/style/Fill'
import Icon from "ol/style/Icon";

class MarkerStyle extends FTStyle {
  /**
   * @class MarkerStyle
   * @classdesc 点类样式
   * @extends {FTStyle}
   * @author daiyujie
   * @constructs
   */
  constructor() {
    super();
    this._style = {
      image: {
        //--ol.Image 的全部属性
        icon: {
          // src: require('./assets/marker-begin.png'),
          offset: [0, 0],
          opacity: 1,
          scale: 1,
          anchor: [0.5, 0.5],
          offset: [0, 0],
          scale: 1,
        },
      },
    };
  }
  parse() {
    let image = null;

    if (this._style.image) {
      if (this._style.image.icon && this._style.image.icon.src) {
        image = new Icon(this._style.image.icon);
      } else {
        const fill = new Fill({
          color: "rgba(155,155,155,0.7)",
        });
        const stroke = new Stroke({
          color: "rgba(155,155,155,1)",
          width: 2,
        });
        image = new Circle({
          radius: 8,
          fill: fill,
          stroke: stroke,
        });
      }
    }

    return new Style({
      image: image,
      text: new Text({
        offsetX: 0,
        offsetY: -25,
        overflow: true,
        text: "默认类型",
        fill: new Fill({
          color: "rgba(255,0,0,1)",
        }),
        font: "13px sans-serif",
        stroke: new Stroke({
          color: "rgba(255,255,255,0.8)",
          width: 3,
        }),
      }),
    });
  }
}
export default MarkerStyle;
