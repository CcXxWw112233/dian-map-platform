import { plotEdit } from "utils/plotEdit";
import { createStyle } from "@/lib/utils";
const Action = {
  commonStyleOptions: {
    textFillColor: "rgba(255,0,0,1)",
    textStrokeColor: "#fff",
    textStrokeWidth: 3,
    font: "13px sans-serif",
    placement: "point",
    iconScale: 0.6,
    pointColor: "#fff",
    showName: true,
    commonFunc: null,
  },
  defaultFillColor: "rgba(168,9,10,0.7)",
  defaultStrokeColor: "rgba(168,9,10,1)",
  /*
  1、绘制完未保存取消
  2、编辑取消
   */
  delCallBack: function ({ dispatch }) {
    const { featureOperatorList, plottingLayer } = plotEdit
    let newFeatureOperatorList = [...featureOperatorList]
    const index = featureOperatorList.findIndex(item => {
      return item.guid === window.featureOperator.guid
    })
    if (index >= 0) {
      newFeatureOperatorList.splice(index, 1)
      plotEdit.featureOperatorList = newFeatureOperatorList
      dispatch({
        type: "featureOperatorList/updateList",
        payload: {
          featureOperatorList: newFeatureOperatorList,
        },
      });
    }
    plottingLayer.removeFeature(window.featureOperator);
    window.featureOperator && delete window.featureOperator
  },


  updateCallBack: function({dispatch}) {
    const { featureOperatorList } = plotEdit
    let newFeatureOperatorList = [...featureOperatorList]
    const index = featureOperatorList.findIndex(item => {
      return item.guid === window.featureOperator.guid
    })
    if (index >= 0) {
      plotEdit.featureOperatorList = newFeatureOperatorList
      dispatch({
        type: "featureOperatorList/updateList",
        payload: {
          featureOperatorList: newFeatureOperatorList,
        },
      });
    }
  },

  bindCb: function ({ dispatch }) {
    const { plottingLayer } = plotEdit;
    plottingLayer.plotEdit.setDelCallback(this.delCallBack.bind(this, { dispatch }))
    plottingLayer.plotEdit.setUpdateCallback(this.updateCallBack.bind(this, {dispatch}))
  },
  // 拼接poiStr
  getPointStr: function () {
    const featureOperator = window.featureOperator;
    const feature = featureOperator.feature.clone();
    const geometry = feature.getGeometry();
    geometry.transform("EPSG:3857", "EPSG:4326");
    const points = geometry.getCoordinates();
    let pointStr = "";
    if (points && points.length) {
      if (typeof points[0] === "number") {
        points.forEach((item, index) => {
          pointStr += `${item},`;
        });
      } else {
        points.forEach((point, index) => {
          pointStr += `${point[0]} ${point[1]},`;
        });
      }
    }
    return pointStr.substr(0, pointStr.length - 1);
  },
  setAttribute: function (attrs, { dispatch, plottingType, operator, featureOperatorList }) {
    let tempType = plottingType.toLowerCase();
    tempType = tempType[0].toUpperCase() + tempType.slice(1);
    let styleOptions = null
    const defaultOptions = {
      fillColor: attrs.fillColorStyle || this.defaultFillColor,
      strokeColor: attrs.strokeColorStyle || this.defaultStrokeColor,
      text: attrs.featureName,
    }
    let iconUrl = "", newAttrs = {}
    let isImagePolygon = false
    const newGeom = this.getPointStr()
    switch (plottingType) {
      default:
        break
      case "POINT":
        if (attrs.fillColorStyle?.indexOf("/") > -1) {
          iconUrl = attrs.fillColorStyle.replace("img", "")
          iconUrl = require("../../../assets" + iconUrl)
          styleOptions = {
            ...this.commonStyleOptions,
            iconUrl: iconUrl,
            iconScale: 1,
            text: attrs.featureName
          }
        } else {
          styleOptions = {
            ...this.commonStyleOptions,
            ...defaultOptions,
            radius: 8,
          }
        }
        newAttrs = {
          geom: `POINT(${newGeom})`,
          icon_url: attrs.fillColorStyle || this.defaultFillColor,
          featureType: attrs.fillColorStyle || this.defaultFillColor,
          strokeColor: attrs.strokeColorStyle || this.defaultStrokeColor,
          main_id: "",
          name: attrs.featureName,
          remark: attrs.remarks || "",
          selectName: attrs.featureSelectName,
          plottingType: plottingType,
        }
        break;
      case "POLYLINE":
        styleOptions = {
          ...this.commonStyleOptions,
          strokeColor: attrs.strokeColorStyle || this.defaultStrokeColor,
          strokeWidth: 3,
          text: attrs.featureName
        }
        newAttrs = {
          geom: `LINESTRING(${newGeom})`,
          style: `${attrs.strokeColorStyle};${attrs.strokeColorStyle}`,
          featureType: attrs.strokeColorStyle || this.defaultStrokeColor,
          main_id: "",
          name: attrs.featureName,
          remark: attrs.remarks || "",
          selectName: attrs.featureSelectName,
          plottingType: plottingType,
        }
        break
      case "POLYGON":
      case "FINE_ARROW":
      case "RECTANGLE":
      case "CIRCLE":
      case "FREEHANDPOLYGON":
        plottingType = "POLYGON"
        tempType = "Polygon"
        if (attrs.fillColorStyle?.indexOf("/") > -1) {
          isImagePolygon = true
          iconUrl = attrs.fillColorStyle.replace("img", "")
          iconUrl = require("../../../assets" + iconUrl)
          let canvas = document.createElement("canvas");
          let context = canvas.getContext("2d");
          let img = new Image();
          img.crossorigin = "anonymous";
          img.src = iconUrl;
          const me = this;
          img.onload = function () {
            const pat = context.createPattern(img, "repeat");
            styleOptions = {
              ...me.commonStyleOptions,
              fillColor: pat,
              text: attrs.featureName,
            };
            const style = createStyle(tempType, styleOptions);
            window.featureOperator.feature.setStyle(style);
            newAttrs = {
              geom: `POLYGON((${newGeom}))`,
              style: `${attrs.fillColorStyle};icon`,
              featureType: attrs.fillColorStyle,
              strokeColor: attrs.strokeColorStyle,
              main_id: "",
              name: attrs.featureName,
              remark: attrs.remarks || "",
              selectName: attrs.featureSelectName,
              plottingType: plottingType,
            }
            const keyArray = Object.keys(newAttrs);
            keyArray.forEach((key) => {
              window.featureOperator.setAttribute(key, newAttrs[key]);
            });
            const { featureOperatorList } = plotEdit;
            const index = featureOperatorList.findIndex(item => {
              return item.guid === window.featureOperator.guid
            })
            if (index < 0) {
              plotEdit.featureOperatorList.push(window.featureOperator)
            }
            return
          };
        } else {
          styleOptions = {
            ...this.commonStyleOptions,
            ...defaultOptions
          }
        }
        newAttrs = {
          geom: `POLYGON((${newGeom}))`,
          style: `${attrs.fillColorStyle};${attrs.strokeColorStyle}`,
          featureType: attrs.fillColorStyle || this.defaultFillColor,
          strokeColor: attrs.strokeColorStyle || this.defaultStrokeColor,
          main_id: "",
          name: attrs.featureName,
          remark: attrs.remarks || "",
          selectName: attrs.featureSelectName,
          plottingType: plottingType,
        }
        break
    }
    if (!isImagePolygon) {
      const style = createStyle(tempType, styleOptions)
      window.featureOperator.feature.setStyle(style)
    }
    window.featureOperator.setName(attrs.featureName);
    const keyArray = Object.keys(newAttrs);
    keyArray.forEach((key) => {
      window.featureOperator.setAttribute(key, newAttrs[key]);
    });
    this.updateList({ dispatch, operator, featureOperatorList })
  },

  updateList: function ({ dispatch, operator, featureOperatorList }) {
    let newList = [...featureOperatorList]
    const index = featureOperatorList.findIndex(item => {
      return item.guid === operator.guid
    })
    if (index < 0) {
      newList = [...newList, operator]
      plotEdit.featureOperatorList = newList
    }
    dispatch({
      type: "featureOperatorList/updateList",
      payload: {
        featureOperatorList: newList
      }
    })
    this.bindCb({ dispatch })
  }
}



export default Action