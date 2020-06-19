import FTStyle from "./Style";
import { Fill, Stroke, Circle, Style, Text } from "ol/style";
class PolygonStyle extends FTStyle {
  /**
   * @classdesc 多边形类样式
   * @author daiyujie
   * @extends {FTStyle}
   * @constructs
   */
  constructor() {
    super();
    this._style = {
      fill: { color: "rgba(155,155,155,0.7)" },
      stroke: {
        color: "rgba(155,155,155,1)",
        width: 3,
      },
    };
  }
  parse() {
    let fill,
      stroke = null;
    if (this._style.fill) {
      fill = new Fill(this._style.fill);
    }
    if (this._style.stroke) {
      stroke = new Stroke(this._style.stroke);
    }
    return new Style({
      fill: fill,
      stroke: stroke,
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
export default PolygonStyle;
