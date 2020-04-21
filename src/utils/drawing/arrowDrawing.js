// import { PlottingLayer } from '../plot2ol/index'
import PlottingLayer from '../plot2ol/src/PlottingLayer'
import mapApp from '../INITMAP'
export const arrowDrawing = {
  map: null,
  plottingLayer: null,
  createDrawing() {
    if (!this.map) {
      this.map = mapApp.map
    }
    if (!this.plottingLayer) {
      this.plottingLayer = new PlottingLayer(this.map)
    }
    const type = 'fine_arrow'
    this.plottingLayer.addFeature(type)
  }
}