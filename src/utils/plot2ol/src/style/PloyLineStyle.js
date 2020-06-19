import FTStyle from "./Style";
import { Fill, Stroke, Circle, Style, Text } from "ol/style";
// import Fill from 'ol/style/Fill'

class PolyLineStyle extends FTStyle {

    /**
     * @classdesc 折线类样式
     * @author daiyujie
     * @extends {FTStyle}
     * @constructs
     */
    constructor() {
        super();
        this._style = {
            //--ol.style.Stroke所有选项
            stroke: {
                color: 'rgba(155,155,155,1)',
                width: 3,
                lineDash: [10, 10, 10]
            }
        }
    }
    parse() {
        let stroke = null;
        if (this._style.stroke) {
            stroke = new Stroke(this._style.stroke)
        }
        return new Style({
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

export default PolyLineStyle