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
    this.linsteners["drawstart"] = this.drawing.on('drawstart', e => {
      let point = e.feature ;
      let coordinate = point.getGeometry().getCoordinates();
      const overlays = this.getOverlays()
      this.overlay = overlays.add( 'drawPointTip');
      this.el = this.overlay.getElement()
      mapApp.map.addOverlay(this.overlay);
      this.overlay.getElement().innerHTML = `${coordinate[0].toFixed(2)},${coordinate[1].toFixed(2)}`;

      this.overlay.setPosition(coordinate);

      this.icon = createIconElement();

      this.icon.onclick = closeOverlay.bind(this, this.drawing, overlays, this.overlay, point)
    })

    this.linsteners["drawend"] = this.drawing.on('drawend', e => {
      this.el.appendChild(this.icon)
      mapApp.map.removeInteraction(this.drawing)
      this.isActive = false
    })
  }
}