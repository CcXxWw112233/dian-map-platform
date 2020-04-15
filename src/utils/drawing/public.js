import { Fill, Stroke, Style } from 'ol/style';
import { fullScreen,exitScreen } from '../utils'
import {DragZoom} from 'ol/interaction'
import { always } from 'ol/events/condition'
import mapApp from '../INITMAP'
// 创建关闭按钮
export const createIconElement = function() {
  let icon = document.createElement('span');
  icon.innerHTML = "X";
  let style = {
    position:'absolute',
    top:"-10px",
    righ:"5px",
    padding:"5px",
    width:"10px",
    height:"10px",
    lineHeight:"10px",
    color:"#000",
    fontSize:"12px",
    background:"#fff",
    borderRadius:"99px",
    cursor:"pointer"
  }
  Object.assign(icon.style, style);
  return icon ;
}

export const closeOverlay = function(drawing, allOverlay, overlay, feature, type = 'line') {
  if (allOverlay && overlay) {
    allOverlay.remove(overlay)
    const source = drawing.get('sourceInDraw')
    source.removeFeature(feature)
    const el = overlay.getElement()
    el.parentNode.removeChild(el)
  }
}

export const myStyle =  new Style({
  fill: new Fill({
    color:'rgba(255,120,117,0.3)'
  }),
  stroke: new Stroke({
    color: "#f5222d",
    width: 2
  })
})

export const removeAllEventLinstener = function(drawing, linsteners) {
  const linstenerArr = Object.keys(linsteners)
  linstenerArr.forEach(item => {
    drawing.un(item, linsteners[item])
  })
}

export const myZoomIn = function() {
  // 调用地图本身存在的放大缩小
  const zoomIn = document.querySelector('.ol-zoom-in')
  zoomIn && zoomIn.click()
}

export const myZoomOut = function() {
  const dom = document.querySelector('.ol-zoom-out')
  dom && dom.click()
}

export const myFullScreen = {
  isFull: false,
  change: function() {
    if (this.isFull) {
      this.isFull = false
      exitScreen()
    } else {
      fullScreen()
      this.isFull = true
    }
  }
}

export const myDragZoom = {
  dragZoom: null,
  setVal: function() {
    if (!this.dragZoom) {
      this.dragZoom = new DragZoom({
        condition: always,
      })
      this.dragZoom.setActive(false)
      mapApp.map.addInteraction(this.dragZoom)
    }
    const active = this.dragZoom.getActive()
    if(active){
      // 关闭框选放大功能
      this.dragZoom.setActive(false)
    }else{
      // 激活框选放大功能
      this.dragZoom.setActive(true);
    }
  }
}