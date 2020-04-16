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
    debugger
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
    if (!this.isActive) {
      mapApp.map.addInteraction(this.drawing)
      this.addEventLinstener()
      this.isActive = true
    } else {
      removeAllEventLinstener(this.drawing, this.linsteners)
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
    const start = this.drawing.on('drawstart', e => {
      let point = e.feature ;
      let coordinate = point.getGeometry().getCoordinates();
      const overlays = this.getOverlays()
      this.overlay = overlays.add( 'drawPointTip');
      this.el = this.overlay.getElement()
      mapApp.map.addOverlay(this.overlay);
      this.overlay.getElement().innerHTML = String(coordinate);

      this.overlay.setPosition(coordinate);

      this.icon = createIconElement();

      this.icon.onclick = closeOverlay.bind(this, this.drawing, overlays, this.overlay, point)
    })
    this.linsteners['drawstart'] = start

    const end = this.drawing.on('drawend', e => {
      this.el.appendChild(this.icon)
    })

    this.linsteners['drawend'] = end
  }
}