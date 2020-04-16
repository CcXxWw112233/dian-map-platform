import { MyOverlay, drawFeature } from '../mapUtils'
import mapApp from '../INITMAP'
import { myStyle, removeAllEventLinstener } from './public'
import {createBox} from 'ol/interaction/Draw'

export const boxDrawing = {
  drawing: null,
  overlay: null,
  icon: null,
  el: null,
  isActive: false,
  linsteners: {},

  createDrawing() {
    if (!this.drawing) {
      this.drawing = drawFeature.addDraw(false, 'Circle' , myStyle, createBox())
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

  // overlay按钮
  createOverLayBtnElement(count) {
    let div0 = document.createElement('div')
    const style0 = {
      position: 'absolute',
      top: '10px',
      right: '-35px',
      display: 'flex',
      'flex-direction': 'column'
    }
    if (!count) count = 2
    Object.assign(div0.style,style0)
    for (let i = 0; i < count; i++) {
      let div = document.createElement('div')
      const style1 = {
        width: '40px',
        height: '30px',
        'margin-bottom': '5px',
        'background-color': 'white',
        'line-height': '30px',
        cursor: 'pointer'
      }
      div.innerHTML = '关闭'
      if (i === 1) div.innerHTML = '设置'
      Object.assign(div.style, style1)
      div0.appendChild(div)
    }
    return div0
  },

  addEventLinstener() {
    const start = this.drawing.on('drawstart', e => {
      // const overlays = this.getOverlays()
      // this.overlay = overlays.add()
      // this.el = this.overlay.getElement()
      // mapApp.map.addOverlay(this.overlay)
      // const feature = e.feature
      // this.icon = createIconElement()
      // this.icon.onclick = closeOverlay.bind(this, this.drawing, overlays, this.overlay, feature)
    })
    this.linsteners['drawstart'] = start

    const end = this.drawing.on('drawend', e => {
      const overlays = this.getOverlays()
      this.overlay = overlays.add()
      this.el = this.overlay.getElement()
      mapApp.map.addOverlay(this.overlay)
      const poi = e.feature.getGeometry().getCoordinates()[0][2]
      this.overlay.setPosition(poi)
      const overlayEl = this.createOverLayBtnElement();
      this.el.appendChild(overlayEl)
    })

    this.linsteners['drawend'] = end

  }
}