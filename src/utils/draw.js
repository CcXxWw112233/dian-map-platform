import PlottingLayer from './plot2ol/src/PlottingLayer'
import FeatureOperatorEvent from './plot2ol/src/events/FeatureOperatorEvent'
import mapApp from './INITMAP'
import Overlay from 'ol/Overlay'
import * as DomUtils from './plot2ol/util/dom_util'
import { connectEvent, disconnectEvent } from './plot2ol/util/core'
export const draw = {
  map: null,
  plottingLayer: null,
  delBtnOverlay: null,
  delBtnOverlayEl: null,
  create(type, dispatch) {
    if (!this.map) {
      this.map = mapApp.map
    }
    if (!this.plottingLayer) {
      this.plottingLayer = new PlottingLayer(this.map)
      this.plottingLayer.on(FeatureOperatorEvent.ACTIVATE, e => {
        window.featureOperator = e.feature_operator
        // switch (type) {
        //   case "POLYLINE":
        //     e.feature_operator.feature.getGeometry().on("change", geo => {
        //       console.log(geo)
        //     })
        //     break;
        //   default: 
        //   break;
        // }
        dispatch({
          type: "modal/setVisible",
          payload: {
            visible: true
          }
        })
      })
      this.plottingLayer.on(FeatureOperatorEvent.DEACTIVATE, e => {

      })
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
  },
}