import PlottingLayer from './plot2ol/src/PlottingLayer'
import mapApp from './INITMAP'
export const draw = {
  map: null,
  plottingLayer: null,
  create(type) {
    if (!this.map) {
      this.map = mapApp.map
    }
    if (!this.plottingLayer) {
      this.plottingLayer = new PlottingLayer(this.map)
    }
    const PlotTypes = {
      MARKER: 'marker',
      POLYLINE: 'polyline',
      POLYGON: 'polygon',
      CIRCLE:'circle',
      ELLIPSE:'ellipse',
      RECTANGLE:'rectangle',
      ARC:'arc',
      ATTACK_ARROW:'attack_arrow',
      CLOSED_CURVE:"closed_curve",
      CURVE:'curve',
      DOUBLE_ARROW:'double_arrow',
      FINE_ARROW:'fine_arrow',
      ASSAULT_DIRECTION:'assault_direction',
      FREEHAND_LINE:'freehand_line',
      FREEHAND_POLYGON:'freehand_polygon',
      GATHERING_PLACE:'gathering_place',
      LUNE:'lune',
      SECTOR: 'sector',
      SQUAD_COMBAT: 'squad_combat',
      STRAIGHT_ARROW:'straight_arrow',
      TAILED_ATTACK_ARROW:'tailed_attack_arrow',
      TAILED_SQUAD_COMBAT:'tailed_squad_combat'
    }
    this.plottingLayer.addFeature(PlotTypes[type])
  }
}