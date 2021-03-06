import PlottingLayer from "./plot2ol/src/PlottingLayer";
import FeatureOperatorEvent from "./plot2ol/src/events/FeatureOperatorEvent";
import mapApp from "./INITMAP";
import { request } from "../services/index";
import { config } from "./customConfig";
import { BASIC, MAP_REQUEST_URL } from "../services/config";
import Event from "../lib/utils/event";
// import Overlay from 'ol/Overlay'
// import * as DomUtils from './plot2ol/util/dom_util'
// import { connectEvent, disconnectEvent } from './plot2ol/util/core'
export const draw = {
  map: null,
  target: null,
  plottingLayer: null,
  delBtnOverlay: null,
  delBtnOverlayEl: null,
  baseUrl: "https://map.di-an.com",
  typeIdKeys: {
    MARKER: "afa356c6c577452db715583453e6de6d",
    POLYLINE: "ae60a1157a734d8ebb864b90858abeb1",
    POLYGON: "9f9bc44de1884bedbfb59fe8440edceb",
    FREEHAND_POLYGON: "9f9bc44de1884bedbfb59fe8440edceb",
  },
  currentId: null,
  currentType: null,
  drawDispatch: null,
  featureOperatorList: [],
  responseData: {},
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
      this.type = "FREEHANDPOLYGON";
    }
    this.currentId = this.typeIdKeys[type];
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

  // ??????????????????
  onActiveEventListener(cb) {
    this.plottingLayer.on(FeatureOperatorEvent.ACTIVATE, (e) => {
      window.featureOperator = e.feature_operator;
      cb && cb(e);
    });
  },
  // ??????????????????
  onDeactiveEventListener(cb) {
    this.plottingLayer.on(FeatureOperatorEvent.DEACTIVATE, (e) => {
      window.featureOperator = e.feature_operator;
      cb && cb(e);
    });
  },
  updateProps(featureOperator) {
    // ???????????????redux
    if (this.drawDispatch) {
      this.drawDispatch({
        type: "plotting/setPotting",
        payload: {
          type: this.type,
          operator: featureOperator,
        },
      });
      this.drawDispatch({
        type: "modal/updateData",
        payload: {
          featureName: featureOperator.attrs.name,
          selectName: featureOperator.attrs.selectName,
          featureType: featureOperator.attrs.featureType,
          remarks: featureOperator.attrs.remark,
          strokeColorStyle: featureOperator.attrs.strokeColor,
        },
      });
    }
  },
  activeCallBack() {
    const featureOperator = window.featureOperator;
    // ???????????????????????????????????????????????????
    const currentOperator = this.featureOperatorList.filter((operator) => {
      return operator.guid === featureOperator.guid;
    });
    // ????????????
    if (!currentOperator.length) {
      if (this.responseData && this.responseData[this.currentId]) {
        this.updateProps(featureOperator);
        this.drawDispatch({
          type: "modal/setVisible",
          payload: {
            visible: true,
            responseData: this.responseData[this.currentId].data || {},
          },
        });
      } else {
        const url = `${this.baseUrl}${MAP_REQUEST_URL}/map/dict/${this.currentId}/mark`;
        request("GET", url).then((res) => {
          // ??????
          if (this.type === "POLYGON" || this.type === "FREEHANDPOLYGON") {
            const items = [...res.data?.data[2].items || [], ...config];
            res.data.data[2].items = items;
          }
          this.responseData[this.currentId] = res;
          this.updateProps(featureOperator);
          this.drawDispatch({
            type: "modal/setVisible",
            payload: {
              visible: true,
              responseData: res.data || {},
            },
          });
        });
      }
    }
  },
  deactiveCallback() {
    this.drawDispatch({
      type: "modal/updateData",
      payload: {
        isEdit: false,
        featureName: "", // ??????
        selectName: "",
        featureType: "", // ??????
        remarks: "", // ??????
      },
    });
  },
  bindEventListener() {
    const me = this;
    // ??????????????????
    this.plottingLayer.on(FeatureOperatorEvent.ACTIVATE, (e) => {
      if (!e.feature_operator.isScouting) {
        me.target.style.cursor = "default";
        window.featureOperator = e.feature_operator;
        let isMobile = BASIC.getUrlParam.isMobile;
        if (!isMobile) {
          window.onbeforeunload = function (ee) {
            if (window.featureOperator) {
              var ex = window.event || ee;
              ex.returnValue = "??????????????????????????????????????????????????????";
            }
          };
          me.activeCallBack();
        }
      }
    });
    this.plottingLayer.on(FeatureOperatorEvent.DEACTIVATE, (e) => {
      if (!e.feature_operator.isScouting) {
        me.target.style.cursor = "default";
        let isMobile = BASIC.getUrlParam.isMobile;
        if (!isMobile) {
          me.deactiveCallback();
        }
      } else {
        Event.Evt.firEvent("stopEditPlot")
        const operator = e.feature_operator;
        const feature = operator.feature;
        const plot = feature && feature.getGeometry();
        plot.isActive = false;
        //??????????????????
        const g = operator.feature.getGeometry();
        const coord = g?.getCoordinates();
        if (JSON.stringify(coord) !== JSON.stringify(JSON.parse(operator.data.content)?.coordinates)) {
          //??????????????????, ???????????????????????????
          me.drawDispatch &&
            me.drawDispatch({
              type: "modal/updateData",
              payload: {
                confirmVidible: true,
              },
            });
          Event.Evt.on("saveFeatureToDB", (val) => {
            if (val === true) {
              const data = operator.data;
              operator.updateFeatueToDB(data, feature).then((res) => {
                Event.Evt.firEvent("updatePlotFeature", res);
              });
            } else {
              let coordinates = JSON.parse(operator.data.content)?.coordinates;
              const type = operator.feature?.getGeometry().getType();
              if (!type) return
              if (type === "Point") {
                coordinates = [coordinates];
              }
              if (type === "Polygon") {
                coordinates = [...coordinates[0]];
              }
              operator.setCoordinates(coordinates || []);
            }
          });
        }
      }
    });
  },
};
