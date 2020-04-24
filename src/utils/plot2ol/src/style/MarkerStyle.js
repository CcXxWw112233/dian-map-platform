
import FTStyle from "./Style";
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import Icon from 'ol/style/Icon'
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
        debugger
        this._style = {
            image: {
                //--ol.Image 的全部属性
                icon: {
                    src: require('./assets/marker-begin.png'),
                    offset: [0, 0],
                    opacity: 1,
                    scale: 1,
                    anchor: [0.5, 0.5],
                    offset: [0, 0],
                    scale: 1
                }
            }

        }
    }
    parse() {
        let image = null;

        if (this._style.image) {
            if (this._style.image.icon) {
                image = new Icon(this._style.image.icon)
            }
        }

        return new Style({
            image: image
        });
    }
  

}
export default MarkerStyle