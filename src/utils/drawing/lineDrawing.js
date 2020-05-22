import { MyOverlay, drawFeature, formatLength } from '../mapUtils'
import mapApp from '../INITMAP'
import { createIconElement, closeOverlay, myStyle, removeAllEventLinstener } from './public'

export const lineDrawing = {
  drawing: null,
  overlay: null,
  icon: null,
  el: null,
  isActive: false,
  linsteners: {},

  createDrawing() {
    removeAllEventLinstener()
    mapApp.drawing["line"] = this
    if (!this.drawing) {
      this.drawing = drawFeature.addDraw(false, 'LineString' , myStyle)
    }
    if (!this.isActive) {
      mapApp.map.addInteraction(this.drawing)
      this.addEventLinstener()
      this.isActive = true
    } else {
      // removeAllEventLinstener()
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
      this.overlay = overlays.add('drawLineLength')
      this.el = this.overlay.getElement()
      mapApp.map.addOverlay(this.overlay)
      const line = e.feature
      this.geometry = line.getGeometry()
      this.geoChange = this.geometry.on('change',(geo) => {
        let target = geo.target;
        this.el.innerHTML = formatLength(target)
        let lastCoor = target.getLastCoordinate();
        this.overlay.setPosition(lastCoor);
      })
      this.icon = createIconElement()
      this.icon.onclick = closeOverlay.bind(this, this.drawing, overlays, this.overlay, line)
    })
    this.linsteners['drawstart'] = start

    const end = this.drawing.on('drawend', e => {
      this.el.appendChild(this.icon)
      this.geometry.un("change", this.geoChange)
      mapApp.map.removeInteraction(this.drawing)
      this.isActive = false
    })

    this.linsteners['drawend'] = end

  }
}