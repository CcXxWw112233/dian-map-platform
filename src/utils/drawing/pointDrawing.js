import mapApp from '../INITMAP'
import { MyOverlay, drawFeature } from '../mapUtils'
import {Circle as CircleStyle, Fill, Style } from 'ol/style';
import { createIconElement, closeOverlay, removeAllEventLinstener } from './public'

export const pointDrawing = {
  drawing: null,
  overlay: null,
  icon: null,
  el: null,
  isActive: false,
  linsteners: {},
  createDrawing(){
    removeAllEventLinstener()
    if (!this.drawing) {
      this.drawing = drawFeature.addDraw(false, 'Point' , new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#f5222d'
          })
        })
      }))
    }
    mapApp.drawing["point"] = this
    if (!this.isActive) {
      mapApp.map.addInteraction(this.drawing)
      this.addEventLinstener()
      this.isActive = true
    } else {
      mapApp.map.removeInteraction(this.drawing)
      this.isActive = false
    }
  },

  getOverlays() {
    if (!this.overlays) {
      this.overlays = new MyOverlay()
    }
    return this.overlays
  },
  addEventLinstener() {
    const me = this
    this.linsteners["drawstart"] = this.drawing.on('drawstart', e => {
      // debugger
      let point = e.feature ;
      let coordinate = point.getGeometry().getCoordinates();
      const geometry = point.clone().getGeometry()
      geometry.transform("EPSG:3857", "EPSG:4326");
      const coordinate4326 = geometry.getCoordinates()
      const overlaysObj = me.getOverlays()
      // if (overlaysObj.overlays.length === 0) {
      //   me.overlay = overlaysObj.add('drawPointTip');
      // }
      me.overlay = overlaysObj.add('drawPointTip');
      me.el = me.overlay.getElement()
      mapApp.map.addOverlay(me.overlay);
      me.overlay.getElement().innerHTML = `${coordinate4326[0].toFixed(6)},${coordinate4326[1].toFixed(6)}`;

      me.overlay.setPosition(coordinate);

      me.icon = createIconElement();

      me.icon.onclick = closeOverlay.bind(me, me.drawing, overlaysObj, me.overlay, point)
    })

    this.linsteners["drawend"] = this.drawing.on('drawend', e => {
      me.el.appendChild(me.icon)
      mapApp.map.removeInteraction(me.drawing)
      me.isActive = false
    })
  }
}