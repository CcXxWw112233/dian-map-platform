import PlottingLayer from "./plot2ol/src/PlottingLayer";
import FeatureOperatorEvent from "./plot2ol/src/events/FeatureOperatorEvent";
import mapApp from "./INITMAP";
import { request } from "../services/index";
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
      this.type = 'FREEHANDPOLYGON'
    }
    this.currentId = this.typeIdKeys[type];
    if (!this.plottingLayer) {
      this.plottingLayer = new PlottingLayer(this.map);
      dispatch({
        type: "plotting/setLayer",
        payload: {
          layer: this.plottingLayer,
        },
      });
      const me = this;
      // 标绘激活事件
      this.plottingLayer.on(FeatureOperatorEvent.ACTIVATE, (e) => {
        window.featureOperator = e.feature_operator;
        const featureOperator = window.featureOperator;
        // 讲标绘存到redux
        dispatch({
          type: "plotting/setPotting",
          payload: {
            type: this.type,
            operator: e.feature_operator,
          },
        });

        // 更新模态框数据
        dispatch({
          type: "modal/updateData",
          payload: {
            isEdit: true,
            featureName: featureOperator.attrs.name || "", // 名称
            selectName: featureOperator.attrs.selectName || "",
            featureType: featureOperator.attrs.featureType || "", // 类型
            remarks: featureOperator.attrs.remark || "", // 备注
          },
        });
        // 查询数据，弹出模态框
        const currentOperator = me.featureOperatorList.filter(operator => {
          return operator.guid === featureOperator.guid
        })
        if (!currentOperator.length) {
          const url = `${me.baseUrl}/api/map/dict/${me.currentId}/mark`;
          request("GET", url).then((res) => {
            dispatch({
              type: "modal/setVisible",
              payload: {
                visible: true,
                responseData: res.data || {},
              },
            });
          });
        }
      });
      this.plottingLayer.on(FeatureOperatorEvent.DEACTIVATE, (e) => {
        dispatch({
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
  },
};
