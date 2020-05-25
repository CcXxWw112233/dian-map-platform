import PlottingLayer from "./plot2ol/src/PlottingLayer";
import FeatureOperatorEvent from "./plot2ol/src/events/FeatureOperatorEvent";
import mapApp from "./INITMAP";
import { request } from "../services/index";
import { config } from "./customConfig";
// import Overlay from 'ol/Overlay'
// import * as DomUtils from './plot2ol/util/dom_util'
// import { connectEvent, disconnectEvent } from './plot2ol/util/core'
export const draw = {
  map: null,
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
    }
    if (!this.plottingLayer) {
      this.plottingLayer = new PlottingLayer(this.map);
      this.bindEventListener();
    }
    return this.plottingLayer;
  },
  create(type, dispatch) {
    this.drawDispatch = dispatch;
    if (!this.map) {
      this.map = mapApp.map;
    }
    this.type = type;
    if (type === "MARKER") {
      this.type = "POINT";
    }
    if (type === "FREEHAND_POLYGON") {
      this.type = "FREEHANDPOLYGON";
    }
    this.currentId = this.typeIdKeys[type];
    this.getPlottingLayer(dispatch);
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
  },

  // 标绘完成回调
  onActiveEventListener() {
    return new Promise((resolve) => {
      this.plottingLayer.on(FeatureOperatorEvent.ACTIVATE, (e) => {
        window.featureOperator = e.feature_operator;
        resolve(e.feature_operator);
      });
    });
  },
  // 标绘切换回调
  onDeactiveEventListener() {
    return new Promise((resolve) => {
      this.plottingLayer.on(FeatureOperatorEvent.DEACTIVATE, (e) => {
        window.featureOperator = e.feature_operator;
        resolve(e.feature_operator);
      });
    });
  },
  bindEventListener() {
    const me = this;
    // 标绘激活事件
    this.plottingLayer.on(FeatureOperatorEvent.ACTIVATE, (e) => {
      window.featureOperator = e.feature_operator;
      const featureOperator = window.featureOperator;
      // 讲标绘存到redux
      me.drawDispatch({
        type: "plotting/setPotting",
        payload: {
          type: this.type,
          operator: e.feature_operator,
        },
      });

      // 更新模态框数据
      me.drawDispatch({
        type: "modal/updateData",
        payload: {
          isEdit: true,
          featureName: featureOperator.attrs.name || "", // 名称
          selectName: featureOperator.attrs.selectName || "",
          featureType: featureOperator.attrs.featureType || "", // 类型
          remarks: featureOperator.attrs.remark || "", // 备注
        },
      });

      // 查询数据，存在当前标绘，弹出模态框
      const currentOperator = me.featureOperatorList.filter((operator) => {
        return operator.guid === featureOperator.guid;
      });
      // 如果存在
      if (!currentOperator.length) {
        if (me.responseData && me.responseData[me.currentId]) {
          me.drawDispatch({
            type: "modal/setVisible",
            payload: {
              visible: true,
              responseData: me.responseData[me.currentId].data || {},
            },
          });
        } else {
          const url = `${me.baseUrl}/api/map/dict/${me.currentId}/mark`;
          request("GET", url).then((res) => {
            // 葛根
            if (this.type === "POLYGON" || this.type === "FREEHANDPOLYGON") {
              const items = [...res.data.data[2].items, ...config];
              res.data.data[2].items = items;
            }
            me.responseData[me.currentId] = res;
            me.drawDispatch({
              type: "modal/setVisible",
              payload: {
                visible: true,
                responseData: res.data || {},
              },
            });
          });
        }
      }
    });
    this.plottingLayer.on(FeatureOperatorEvent.DEACTIVATE, (e) => {
      me.drawDispatch({
        type: "modal/updateData",
        payload: {
          isEdit: false,
          featureName: "", // 名称
          selectName: "",
          featureType: "", // 类型
          remarks: "", // 备注
        },
      });
    });
  },
};
