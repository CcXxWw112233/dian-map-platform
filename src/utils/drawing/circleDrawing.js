import { MyOverlay, drawFeature } from '../mapUtils'
import mapApp from '../INITMAP'
import { createIconElement, closeOverlay, myStyle, removeAllEventLinstener } from './public'

export const circleDrawing = {
  drawing: null,
  overlay: null,
  icon: null,
  el: null,
  isActive: false,
  linsteners: {},

  createDrawing() {
    if (!this.drawing) {
      this.drawing = drawFeature.addDraw(false, 'Circle' , myStyle)
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
      const overlays = this.getOverlays()
      this.overlay = overlays.add('drawPolygonArea')
      this.el = this.overlay.getElement()
      mapApp.map.addOverlay(this.overlay)
      const feature = e.feature
      feature.getGeometry().on('change',(geo) => {
        let target = geo.target;
        const radius = feature.getGeometry().getRadius()
        this.el.innerHTML = radius.toFixed(2) + 'm'
        const centerPoi = geo.target.getCenter()
        const lastPoi = geo.target.getLastCoordinate()
        this.overlay.setPosition([(centerPoi[0] + lastPoi[0]) / 2, (centerPoi[1] + lastPoi[1]) / 2]);
      })
      this.icon = createIconElement()
      this.icon.onclick = closeOverlay.bind(this, this.drawing, overlays, this.overlay, feature)
    })
    this.linsteners['drawstart'] = start

    const end = this.drawing.on('drawend', e => {
      this.el.appendChild(this.icon)
    })

    this.linsteners['drawend'] = end

  }
}