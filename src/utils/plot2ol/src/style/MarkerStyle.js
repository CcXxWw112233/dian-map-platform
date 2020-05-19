import FTStyle from "./Style";
import { Fill, Stroke, Circle, Style } from "ol/style";
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
          color: "#a8090a",
        });
        const stroke = new Stroke({
          color: "#0000",
          width: 2,
        });
        image = new Circle({
          radius: 5,
          fill: fill,
          stroke: stroke,
        });
      }
    }

    return new Style({
      image: image,
    });
  }
}
export default MarkerStyle;
