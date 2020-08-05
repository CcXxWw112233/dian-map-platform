import { MyOverlay, drawFeature, formatArea } from "../mapUtils";
import mapApp from "../INITMAP";
import {
  createIconElement,
  closeOverlay,
  myStyle,
  removeAllEventLinstener,
} from "./public";

export const polygonDrawing = {
  drawing: null,
  overlay: null,
  icon: null,
  el: null,
  isActive: false,
  linsteners: {},

  createDrawing() {
    removeAllEventLinstener();
    mapApp.drawing["polygon"] = this;
    if (!this.drawing) {
      this.drawing = drawFeature.addDraw(false, "Polygon", myStyle);
    }
    if (!this.isActive) {
      mapApp.map.addInteraction(this.drawing);
      this.addEventLinstener();
      this.isActive = true;
    } else {
      mapApp.map.removeInteraction(this.drawing);
      this.isActive = false;
    }
    return this.drawing;
  },

  getOverlays() {
    if (!this.overlays) {
      this.overlays = new MyOverlay();
    }
    return this.overlays;
  },

  addEventLinstener() {
    const me = this;
    const start = this.drawing.on("drawstart", (e) => {
      const overlays = me.getOverlays();
      me.overlay = overlays.add("drawPolygonArea");
      me.el = me.overlay.getElement();
      mapApp.map.addOverlay(me.overlay);
      const feature = e.feature;
      feature.getGeometry().on("change", (geo) => {
        let target = geo.target;
        me.el.innerHTML = formatArea(target);
        let lastCoor = target.getInteriorPoint().getCoordinates();
        me.overlay.setPosition(lastCoor);
      });
      me.icon = createIconElement();
      me.icon.onclick = closeOverlay.bind(
        me,
        me.drawing,
        overlays,
        me.overlay,
        feature
      );
    });
    this.linsteners["drawstart"] = start;

    const end = this.drawing.on("drawend", (e) => {
      me.el.appendChild(this.icon);
      this.deactivate();
    });

    this.linsteners["drawend"] = end;
  },
  deactivate() {
    mapApp.map.removeInteraction(this.drawing);
    this.isActive = false;
  },
};
