import PlottingLayer from "./plot2ol/src/PlottingLayer";
import FeatureOperatorEvent from "./plot2ol/src/events/FeatureOperatorEvent";
import mapApp from "./INITMAP";
import { request } from "../services/index";
import { config } from "./customConfig";
import { BASIC } from "../services/config";
import Event from "../lib/utils/event";
import { DragPan } from 'ol/interaction'
// import Overlay from 'ol/Overlay'
// import * as DomUtils from './plot2ol/util/dom_util'
// import { connectEvent, disconnectEvent } from './plot2ol/util/core'
export const plotEdit = {
  map: null,
  target: null,
  plottingLayer: null,
  delBtnOverlay: null,
  delBtnOverlayEl: null,
  currentId: null,
  currentType: null,
  drawDispatch: null,
  featureOperatorList: [],
  responseData: {},
  deactivate() {
    if (this.plottingLayer) {
      this.plottingLayer.plotDraw.deactivate();
      this.target.style.cursor = "default";
    }
  },
  getPlottingLayer(dispatch) {
    this.drawDispatch = dispatch;
    if (!this.map) {
      this.map = mapApp.map;
      this.target = document.getElementById(this.map.getTarget());
    }
    if (!this.plottingLayer) {
      this.plottingLayer = new PlottingLayer(this.map);
      window.plottingLayer = this.plottingLayer;
      this.bindEventListener();
    }
    return this.plottingLayer;
  },
  create(type, dispatch) {
    this.drawDispatch = dispatch;
    this.getPlottingLayer(dispatch);
    this.target.style.cursor = "crosshair";
    this.type = type;
    if (type === "MARKER") {
      this.type = "POINT";
    }
    if (type === "FREEHAND_POLYGON") {
      let interactions = this.map.getInteractions();
      interactions.forEach(item => {
        if(item instanceof DragPan){
          item.setActive(false);
        }
      })
      this.type = "FREEHANDPOLYGON";
    }
    const PlotTypes = {
      MARKER: "marker",
      POLYLINE: "polyline",
      POLYGON: "polygon",
      CIRCLE: "circle",
      ELLIPSE: "ellipse",
      RECTANGLE: "rectangle",
      ARC: "arc",
      ATTACK_ARROW: "attack_arrow",
      CLOSED_CURVE: "closed_curve",
      CURVE: "curve",
      DOUBLE_ARROW: "double_arrow",
      FINE_ARROW: "fine_arrow",
      ASSAULT_DIRECTION: "assault_direction",
      FREEHAND_LINE: "freehand_line",
      FREEHAND_POLYGON: "freehand_polygon",
      GATHERING_PLACE: "gathering_place",
      LUNE: "lune",
      SECTOR: "sector",
      SQUAD_COMBAT: "squad_combat",
      STRAIGHT_ARROW: "straight_arrow",
      TAILED_ATTACK_ARROW: "tailed_attack_arrow",
      TAILED_SQUAD_COMBAT: "tailed_squad_combat",
    };
    this.plottingLayer.addFeature(PlotTypes[type]);
    return this.plottingLayer;
  },

  bindEventListener() {
    const me = this;
    // 标绘激活事件
    this.plottingLayer.on(FeatureOperatorEvent.ACTIVATE, (e) => {
      if(this.type === 'FREEHANDPOLYGON'){
        let interactions = this.map.getInteractions();
        interactions.forEach(item => {
          if(item instanceof DragPan){
            item.setActive(true);
          }
        });
      }
      
      if (!e.feature_operator.isScouting) {
        me.target.style.cursor = "default";
        window.featureOperator = e.feature_operator;
        let isMobile = BASIC.getUrlParam.isMobile;
        if (!isMobile) {
          window.onbeforeunload = function (ee) {
            if (window.featureOperator) {
              var ex = window.event || ee;
              ex.returnValue = "当前标绘未保存，确定离开当前页面吗？";
            }
          };
        }
      }
    });
    // 取消激活
    this.plottingLayer.on(FeatureOperatorEvent.DEACTIVATE, (e) => {
      me.target.style.cursor = "default";
      if (!e.feature_operator.isScouting) {
      } else {
        Event.Evt.firEvent("stopEditPlot");
        const operator = e.feature_operator;
        const feature = operator.feature;
        const plot = feature && feature.getGeometry();
        plot.isActive = false;
        //检测是否修改
        const g = operator.feature.getGeometry();
        const coord = g?.getCoordinates();
        if (
          JSON.stringify(coord) !==
          JSON.stringify(JSON.parse(operator.data.content)?.coordinates)
        ) {
          const data = operator.data;
          operator.updateFeatueToDB(data, feature).then((res) => {
            Event.Evt.firEvent("updatePlotFeature", res);
          });
        }
      }
    });
  },
};
