import React, { Component } from "react";
import { Input, Button, Skeleton, message } from "antd";
import throttle from "lodash/throttle";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./Styles.less";
import ColorPicker from "../ColorPicker";
import plotServices from "../../services/plot";
import { plotEdit } from "../../utils/plotEdit";
import FeatureOperatorEvent from "../../utils/plot2ol/src/events/FeatureOperatorEvent";
import Event from "../../lib/utils/event";
import { config, planConf, electricPowerConf } from "../../utils/customConfig";
import symbolStoreServices from "../../services/symbolStore";
import { createStyle } from "@/lib/utils";
import { setSession, getSession } from "utils/sessionManage";
import InitMap from "utils/INITMAP";
import { MyIcon } from '../utils'

import { connect } from "dva";

@connect(
  ({
    plotting: { operator, type },
    featureOperatorList: { featureOperatorList },
    modal: {
      visible,
      responseData,
      featureName,
      selectName,
      featureType,
      strokeColorStyle,
      remarks,
    },
  }) => ({
    operator,
    type,
    featureOperatorList,
    visible,
    responseData,
    featureName,
    selectName,
    featureType,
    strokeColorStyle,
    remarks,
  })
)
export default class PlotInfoPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      symbols: [],
      selectedIndex: 0,
      plotType: "",
      plotName: "",
      plotRemark: "",
      plotStroke: "",
      plotFill: "",
      okBtnState: true,
      showGIF: true,
      isOpen: true
    };
    this.symbols = {};
    this.handlePlotNameChange = throttle(this.handlePlotNameChange, 100);
    this.handlePotRemarkChange = throttle(this.handlePotRemarkChange, 100);
    this.commonStyleOptions = {
      textFillColor: "rgba(255,0,0,1)",
      textStrokeColor: "#fff",
      textStrokeWidth: 3,
      font: "13px sans-serif",
      placement: "Point",
      iconScale: 1,
      PointColor: "#fff",
      showName: true,
      commonFunc: null,
    };
    this.plotKeyVal = {
      Point: "MARKER",
      LineString: "POLYLINE",
      Polygon: "POLYGON",
      freePolygon: "FREEHAND_POLYGON",
      freeLine:"FREEHAND_LINE",
      arrow: "FINE_ARROW",
      rect: "RECTANGLE",
      circle: "CIRCLE",
    };
    this.strokeColorStyle = "rgba(155,155,155,1)";
    this.fillColorStyle = "rgba(155,155,155,0.7)";
    this.symbolType = {};
    this.isModifyPlot = false;
    this.activeFeatureOperator = null;
    this.sigleImage = null;
    this.imgArr = [];
  }
  componentDidMount() {
    this.getSymbolData(this.props);
    this.props.onRef(this);
    // this.setState({
    //   showGIF: true,
    // });
    // getSession("usePlot").then((res) => {
    //   if (res.code === 0) {
    //     if (!res.data) {
    //       this.setState({
    //         showGIF: true,
    //       });
    //       setSession("usePlot", "1");
    //     }
    //   }
    // });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.plotType !== nextProps.plotType) {
      this.getSymbolData(nextProps);
    }
  }

  updateProps = () => {
    // this.setState({
    //   selectedIndex: "0|0",
    // });
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        visible: false,
        responseData: null,
        isEdit: false,
        featureName: "", // ??????
        selectName: "",
        featureType: "", // ??????
        strokeColorStyle: "",
        remarks: "", // ??????
        confirmVidible: false,
      },
    });
    dispatch({
      type: "plotting/setPotting",
      payload: {
        type: "",
        layer: null,
        operator: null,
      },
    });
  };
  componentWillUnmount() {
    this.updateProps();
  }
  _getSymbolData = async (props) => {
    const { plotType, selectName, parent } = props;
    let res = null;
    // let defaultPlotType = {
    //   type: "??????",
    //   items: [
    //     {
    //       id: "?????????",
    //       value1: "rgba(155,155,155,0.7)",
    //       value3: "rgba(155,155,155,1)",
    //       name: "?????????",
    //     },
    //   ],
    // };
    if (plotType === "Point") {
      if (parent.pointSymbols) {
        res = {};
        res.data = parent.pointSymbols;
      } else {
        res = await plotServices.GET_POINTSYMBOL();
        const res0 = await symbolStoreServices.GET_ICON();
        res.data = [
          // defaultPlotType,
          { type: "?????????", items: [...res0.data] },
          electricPowerConf,
          ...res.data,
        ];
        parent.pointSymbols = res.data;
      }
    }
    if (plotType === "Polyline" || plotType === "LineString" || plotType === 'freeLine') {
      if (parent.polylineSymbols) {
        res = {};
        res.data = parent.polylineSymbols;
      } else {
        res = await plotServices.GET_POLYLINESYMBOL();
        // defaultPlotType.items[0].id = "?????????";
        // defaultPlotType.items[0].name = "?????????";
        // res.data = [defaultPlotType, ...res.data];
        res.data = [...res.data];
        parent.polylineSymbols = res.data;
      }
    }
    if (
      plotType === "Polygon" ||
      plotType === "freePolygon" ||
      plotType === "arrow" ||
      plotType === "rect" ||
      plotType === "circle"
    ) {
      if (parent.polygonSymbols) {
        res = {};
        res.data = parent.polygonSymbols;
      } else {
        res = await plotServices.GET_POLYGONSYMBOL();
        const res0 = await symbolStoreServices.GET_ICON();

        // ??????????????????
        const custom = { type: "?????????", items: [...res0.data] };
        res.data[2].items = [...res.data[2].items, ...config];
        // defaultPlotType.items[0].id = "?????????";
        // defaultPlotType.items[0].name = "?????????";
        // res.data = [defaultPlotType, custom, planConf, ...res.data];
        res.data = [custom, planConf, ...res.data];
        parent.polygonSymbols = res.data;
      }
    }
    // this.symbols[plotType] = res?.data;
    // let symbols = [];
    // if (res) {
    //   res.data.forEach((item) => {
    //     symbols = [...symbols, ...item.items];
    //   });
    // }
    this.setState(
      {
        // symbols: symbols || [],
        symbols: res.data,
        plotType: plotType,
      },
      () => {
        if (selectName) {
          for (let i = 0; i < this.state.symbols.length; i++) {
            if (
              this.state.symbols[i].name === selectName ||
              this.state.symbols[i].icon_name === selectName
            ) {
              this.setState({
                selectedIndex: i,
              });
              break;
            }
          }
        }
      }
    );
  };
  setSelectIndex2 = (operator) => {
    const selectName = operator.attrs.selectName;
    this._setSelectIndex(selectName);
  };
  setSelectIndex = (props) => {
    const { selectName } = props;
    this._setSelectIndex(selectName);
  };
  _setSelectIndex = (selectName) => {
    for (let i = 0; i < this.state.symbols.length; i++) {
      if (
        this.state.symbols[i].name === selectName ||
        this.state.symbols[i].icon_name === selectName
      ) {
        this.setState({
          selectedIndex: i,
        });
        break;
      }
    }
  };
  getSymbolData = async (props) => {
    try {
      const { plotType, responseData, isModifyPlot } = props;
      if (!isModifyPlot) {
        await this._getSymbolData(props);
      } else {
        if (!responseData.length) {
          await this._getSymbolData(props);
        } else {
          this.setState(
            {
              symbols: responseData || [],
              plotType: plotType,
            },
            () => this.setSelectIndex(props)
          );
        }
      }
    } catch (err) {
      // message.error(err);
      console.error(err)
    }
  };
  getSymbol = (data) => {
    if (!data) return;
    let style = {};
    let symbolUrl = data.value1 || data.icon_url;
    let strokeColor = "rgba(155,155,155,1)";
    if (data.value3?.indexOf("rgb") > -1) {
      strokeColor = data.value3;
    }
    let src = "";
    if (symbolUrl.indexOf("/") > -1 || data.sigle) {
      if (!data.sigle) {
        if (symbolUrl.indexOf("https") === 0) {
          src = symbolUrl;
        } else {
          symbolUrl = symbolUrl.replace("img", "");
          src = require("../../assets" + symbolUrl);
        }
      } else {
        let sigleImage = data.value4.replace("img", "");
        src = require("../../assets" + sigleImage);
      }
      style = {
        ...style,
        backgroundImage: `url(${src})`,
        backgroundColor: "rgba(255,255,255,1)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "100%",
      };
      if (data.sigle) {
        style.backgroundColor = symbolUrl;
      }
    } else if (data.value1.indexOf("rgb") > -1) {
      style = {
        ...style,
        backgroundColor: symbolUrl,
        // border: `2px solid ${strokeColor}`,
      };
    }
    if (this.props.plotType === "Point") {
      style = { ...style, borderRadius: 16 };
    }
    if (
      this.props.plotType === "Polyline" ||
      this.props.plotType === "LineString" ||
      this.props.plotType === "freeLine"
    ) {
      style = { ...style, height: 0, border: `1px solid ${symbolUrl}` };
    }
    return style;
  };

  createImage = (operator) => {
    if (!operator) return;
    if (this.sigleImage) {
      let iconUrl = "";
      if (this.sigleImage.indexOf("https") === 0) {
        iconUrl = this.sigleImage;
      } else {
        iconUrl = this.sigleImage.replace("img", "");
        iconUrl = require("../../assets" + iconUrl);
      }
      plotEdit.plottingLayer.plotEdit.createPlotOverlay(iconUrl, operator);
      this.sigleImage = null;
    } else {
      const overlayId = operator.feature.get("overlayId");
      if (overlayId) {
        const lastOverlay = InitMap.map.getOverlayById(overlayId);
        if (lastOverlay) {
          delete operator.attrs.sigleImage;
          delete operator.attrs.strokeColor;
          InitMap.map.removeOverlay(lastOverlay);
        }
      }
    }
  };

  updateRedux = (list) => {
    this.createImage(window.featureOperator);
    const { dispatch } = this.props;
    let newList = [];
    if (this.selectName) {
      this.symbolType[this.selectName]++;
    }
    list.forEach((item) => {
      if (item.attrs.name) {
        newList.push(item);
      }
    });
    dispatch({
      type: "featureOperatorList/updateList",
      payload: {
        featureOperatorList: newList,
      },
    });
  };

  //??????????????????
  getSymbolTypeCount = (selectName) => {
    const { featureOperatorList } = this.props;
    let count = 0;
    for (let i = 0; i < featureOperatorList.length; i++) {
      if (featureOperatorList[i].attrs.selectName === selectName) {
        count++;
      }
    }
    return count;
  };

  //??????????????????
  handleSymbolItemClick = (value, index) => {
    this.setState({
      selectedIndex: index,
    });
    let options = {},
      style = {},
      attrs = {};
    let featureType = value.value1 || value.icon_url;
    let strokeColor = "rgba(155,155,155,1)";
    if (value.value3?.indexOf("rgb") > -1) {
      strokeColor = value.value3;
    }
    this.sigleImage = value.value4;
    let selectName = value.name || value.icon_name;
    this.selectName = null;
    let text = "";
    const { operator } = this.props;
    if (
      !operator ||
      this.props.isModifyPlot === true ||
      operator?.attrs.selectName !== selectName
    ) {
      if (this.symbolType[selectName] === undefined) {
        this.symbolType[selectName] = this.getSymbolTypeCount(selectName);
      }
      text = `${selectName}#${this.symbolType[selectName] + 1}`;
      this.selectName = selectName;
    } else {
      text = operator.attrs.name;
    }
    this.props.dispatch({
      type: "modal/updateData",
      payload: {
        featureName: text, // ??????
        selectName: selectName,
        featureType: featureType,
      },
    });
    let remark = this.props.remarks;
    let iconUrl = "";
    if (this.state.plotType === "Point") {
      if (featureType.indexOf("/") > -1) {
        if (featureType.indexOf("https") === 0) {
          iconUrl = featureType;
          let tempImg = new Image();
          tempImg.src = iconUrl;
          tempImg.crossorigin = "anonymous";
          const me = this;
          tempImg.onload = function () {
            options = {
              ...me.commonStyleOptions,
              iconUrl: iconUrl,
              text: text,
            };
            options.iconScale = 32 / tempImg.width;
            attrs = {
              name: text,
              featureType: featureType,
              selectName: selectName,
              remark: remark,
            };
            style = createStyle("Point", options);
            me.addPlot(style, attrs);
          };
          return;
        } else {
          iconUrl = featureType.replace("img", "");
          iconUrl = require("../../assets" + iconUrl);
        }
        options = {
          ...this.commonStyleOptions,
          iconUrl: iconUrl,
          text: text,
        };
        attrs = {
          name: text,
          featureType: featureType,
          selectName: selectName,
          remark: remark,
        };
      } else {
        options = {
          ...this.commonStyleOptions,
          iconUrl: iconUrl,
          text: text,
          radius: 8,
        };
        delete options.iconUrl;
        // options.strokeColor = strokeColor;
        options.fillColor = featureType;
        attrs = {
          name: text,
          featureType: featureType,
          selectName: selectName,
          // strokeColor: strokeColor,
          strokeColor: featureType,
          remark: remark,
        };
      }
      style = createStyle("Point", options);
    }
    if (
      this.state.plotType === "Polyline" ||
      this.state.plotType === "LineString" ||
      this.state.plotType === "freeLine"
    ) {
      if (featureType.indexOf("rgb") > -1) {
        options = {
          ...this.commonStyleOptions,
          strokeColor: featureType,
          strokeWidth: 3,
          text: text,
        };
        // options.lineDash = [10, 10, 10];
        attrs = {
          name: text,
          featureType: featureType,
          strokeColor: featureType,
          selectName: selectName,
          remark: remark,
        };
        style = createStyle("Polyline", options);
      }
    }
    if (
      this.state.plotType === "Polygon" ||
      this.state.plotType === "freePolygon" ||
      this.state.plotType === "arrow" ||
      this.state.plotType === "rect" ||
      this.state.plotType === "circle"
    ) {
      if (featureType.indexOf("rgb") > -1) {
        options = {
          ...this.commonStyleOptions,
          fillColor: featureType,
          // strokeColor: strokeColor,
          strokeColor: featureType,
          text: text,
        };
        attrs = {
          name: text,
          featureType: featureType,
          // strokeColor: strokeColor,
          strokeColor: featureType,
          selectName: selectName,
          remark: remark,
        };
        if (this.sigleImage) {
          attrs.sigleImage = this.sigleImage;
        }
        style = createStyle("Polygon", options);
        // style = [style0, style];
      } else if (featureType.indexOf("/") > -1) {
        if (featureType.indexOf("https") === 0) {
          iconUrl = featureType;
        } else {
          iconUrl = featureType.replace("img", "");
          iconUrl = require("../../assets" + iconUrl);
        }
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        let img = new Image();
        img.src = iconUrl;
        img.crossorigin = "anonymous";
        const me = this;
        img.onload = function () {
          const pat = context.createPattern(img, "repeat");
          options = {
            ...me.commonStyleOptions,
            fillColor: pat,
            text: text,
          };
          attrs = {
            name: text,
            featureType: featureType,
            selectName: selectName,
            remark: me.props.remarks,
          };
          let options0 = {
            ...me.commonStyleOptions,
            fillColor: "rgba(255,255,255,1)",
            text: text,
          };
          options0.showName = false;
          const style0 = createStyle("Polygon", options0);
          style = createStyle("Polygon", options);
          me.addPlot([style0, style], attrs);
        };
        return;
      }
    }
    this.addPlot(style, attrs);
  };

  addPlot = (style, attrs) => {
    // ??????????????????
    if (!this.props.isModifyPlot) {
      const { operator } = this.props;
      if (operator) {
        operator.feature.setStyle(style);
        this.createImage(operator);
      } else {
        plotEdit.create(
          this.plotKeyVal[this.props.plotType],
          this.props.dispatch
        );
        Event.Evt.firEvent("setPlotDrawStyle", style);
        Event.Evt.firEvent("setAttribute", {
          style: style,
          attrs: attrs,
          responseData: this.state.symbols,
          cb: this.updateRedux.bind(this),
        });
      }
    } else {
      // ????????????
      if (!this.props.operator) return;
      this.changeOKBtnState(false);
      let { operator: currentOperator } = this.props;
      if (!currentOperator) return;
      const geometryType = currentOperator.attrs.geometryType;
      currentOperator.attrs = {
        ...attrs,
        geometryType,
      };
      currentOperator.name = attrs.name;
      currentOperator.feature.setStyle(style);
    }
  };

  getGeometryType = (type) => {
    let tempType = "";
    if (this.props.plotType === "Point") {
      tempType = "???";
    }
    if (this.props.plotType === "LineString" || this.props.plotType === 'freeLine') {
      tempType = "???";
    }
    if (
      this.props.plotType === "Polygon" ||
      this.props.plotType === "freePolygon" ||
      this.props.plotType === "arrow" ||
      this.props.plotType === "rect" ||
      this.props.plotType === "circle"
    ) {
      tempType = "???";
    }
    return tempType;
  };

  createDefaultPlot = (type) => {
    plotEdit.create(type);
    let tempType = this.getGeometryType(type);
    if (this.symbolType[`??????${tempType}`] === undefined) {
      this.symbolType[`??????${tempType}`] = this.getSymbolTypeCount(
        `??????${tempType}`
      );
    }
    const name = `??????${tempType}#${this.symbolType[`??????${tempType}`] + 1}`;
    let style = null,
      options = {};
    this.selectName = `??????${tempType}`;
    switch (type) {
      case "MARKER":
        options = {
          ...this.commonStyleOptions,
          fillColor: "rgba(155,155,155,0.7)",
          // strokeColor: strokeColor,
          strokeColor: "rgba(155,155,155,1)",
          text: name,
          radius: 8,
        };
        style = createStyle("Point", options);
        break;
      case "FREEHAND_LINE":
      case "POLYLINE":
        options = {
          ...this.commonStyleOptions,
          // fillColor: "rgba(155,155,155,0.7)",
          strokeColor: "rgba(155,155,155,1)",
          text: name,
        };
        style = createStyle("Polyline", options);
        break;
      case "POLYGON":
      case "FREEHAND_POLYGON":
      case "FINE_ARROW":
      case "RECTANGLE":
      case "CIRCLE":
        options = {
          ...this.commonStyleOptions,
          fillColor: "rgba(155,155,155,0.7)",
          strokeColor: "rgba(155,155,155,1)",
          text: name,
        };
        style = createStyle("Polygon", options);
        break;
      default:
    }
    Event.Evt.firEvent("setPlotDrawStyle", style);
    Event.Evt.firEvent("setAttribute", {
      style: style,
      attrs: {
        name: name,
        featureType:
          type === "POLYLINE" ? "rgba(155,155,155,1)" : "rgba(155,155,155,0.7)",
        strokeColor: "rgba(155,155,155,1)",
        selectName: `??????${tempType}`,
        remark: "",
      },
      responseData: this.state.symbols,
      cb: this.updateRedux.bind(this),
    });
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        featureName: name,
      },
    });
    return plotEdit.plottingLayer?.plotDraw;
  };

  //????????????
  handlePlotNameChange = (value) => {
    if (this.props.operator) {
      this.changeOKBtnState(false);
    }
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        featureName: value,
      },
    });
  };

  updateReduxOperatorList = () => {
    const { dispatch, operator, featureOperatorList } = this.props;
    if (!operator) return;
    if (operator) {
      let newList = [...featureOperatorList];
      let index = newList.findIndex((item) => {
        return item.guid === operator.guid;
      });
      if (index > -1) {
        newList[index] = operator;
        let newList2 = [];
        newList.forEach((item) => {
          if (item.attrs.name) {
            newList2.push(item);
          }
        });
        dispatch({
          type: "featureOperatorList/updateList",
          payload: {
            featureOperatorList: newList2,
          },
        });
      }
    }
  };

  // ????????????
  handlePotRemarkChange = (value) => {
    if (this.props.operator) {
      this.changeOKBtnState(false);
    }
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        remarks: value,
      },
    });
    if (window.featureOperator) {
      window.featureOperator.attrs.remark = value;
    }
  };

  updateOperatorBeforeDeactivate = () => {
    let { operator } = this.props;
    if (operator) {
      this.symbolType[this.props.selectName]++;
      operator.attrs.name = this.props.featureName;
      operator.attrs.selectName = this.props.selectName;
      operator.attrs.strokeColor = this.props.strokeColorStyle;
      operator.attrs.featureType = this.props.featureType;
      operator.setName(this.props.featureName);
      operator.attrs.remark = this.props.remarks;
      let style = operator.feature.getStyle();
      let text = null;
      if (Array.isArray(style)) {
        style.forEach((item, index) => {
          text = item.getText().getText();
          if (text) {
            style[index].getText().setText(this.props.featureName);
          }
        });
        operator.feature.setStyle(style);
      } else {
        text = style.getText(this.props.featureName);
        text.setText(this.props.featureName);
        style.setText(text);
        operator.feature.setStyle(style);
      }
      this.updateReduxOperatorList();
    }
  };
  handleOKClick = () => {
    // this.updateOperatorBeforeDeactivate();
    plotEdit.plottingLayer.plotEdit.deactivate();
  };
  // ????????????
  handleStrokeColorOkClick = (value) => {
    this.strokeColorStyle = value;
    this.setState({
      selectedIndex: -1,
    });
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        strokeColorStyle: value,
      },
    });
    let options = {},
      attrs = {};
    let text = "";
    if (this.props.isModifyPlot) {
      text = this.props.featureName;
    } else {
      const { operator } = this.props;
      let tempType = this.getGeometryType(this.plotKeyVal[this.props.plotType]);
      if (
        !operator ||
        this.props.isModifyPlot === true ||
        operator?.attrs.selectName !== `?????????${tempType}`
      ) {
        if (this.symbolType[`?????????${tempType}`] === undefined) {
          this.symbolType[`?????????${tempType}`] = this.getSymbolTypeCount(
            `?????????${tempType}`
          );
        }
        text = `?????????${tempType}#${this.symbolType[`?????????${tempType}`] + 1}`;
      } else {
        text = operator.attrs.featureName;
      }
      this.props.dispatch({
        type: "modal/updateData",
        payload: {
          featureName: text, // ??????
          selectName: "???????????????",
        },
      });
    }
    let remark = this.props.remarks;
    let { featureType } = this.props;
    if (!featureType || featureType?.indexOf("rgb") < 0) {
      featureType = this.fillColorStyle;
    }
    let style = {};
    if (
      this.props.plotType === "Point" ||
      this.props.plotType === "Polygon" ||
      this.props.plotType === "freePolygon" ||
      this.props.plotType === "arrow" ||
      this.props.plotType === "rect" ||
      this.props.plotType === "circle"
    ) {
      options = {
        ...this.commonStyleOptions,
        fillColor: featureType,
        strokeColor: value,
        text: text,
        radius: 8,
      };
      attrs = {
        name: text,
        featureType: featureType,
        strokeColor: value,
        selectName: "???????????????",
        remark: remark,
      };
      delete options.iconUrl;
    }
    if (this.props.plotType === "LineString" || this.props.plotType === 'freeLine') {
      options = {
        ...this.commonStyleOptions,
        fillColor: value,
        strokeColor: value,
        text: text,
      };
      attrs = {
        name: text,
        featureType: value,
        strokeColor: value,
        selectName: "???????????????",
        remark: remark,
      };
    }
    let newPlotType = this.props.plotType;
    if (
      newPlotType === "freePolygon" ||
      newPlotType === "arrow" ||
      newPlotType === "rect" ||
      newPlotType === "circle"
    ) {
      newPlotType = "Polygon";
    } else if (newPlotType  === "freeLine") {
      newPlotType = "LineString"
    }
    style = createStyle(newPlotType, options);
    this.addPlot(style, attrs);
  };

  // ????????????
  handleFillColorOkClick = (value) => {
    this.setState({
      selectedIndex: -1,
    });
    this.fillColorStyle = value;
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        featureType: value,
      },
    });
    if (!this.props.isModifyPlot) {
      plotEdit.create(
        this.plotKeyVal[this.props.plotType],
        this.props.dispatch
      );
    }
    let options = {},
      attrs = {};
    let text = "";
    if (this.props.isModifyPlot) {
      text = this.props.featureName;
    } else {
      const { operator } = this.props;
      let tempType = this.getGeometryType(this.plotKeyVal[this.props.plotType]);
      if (
        !operator ||
        this.props.isModifyPlot === true ||
        operator?.attrs.selectName !== `?????????${tempType}`
      ) {
        if (this.symbolType[`?????????${tempType}`] === undefined) {
          this.symbolType[`?????????${tempType}`] = this.getSymbolTypeCount(
            `?????????${tempType}`
          );
        }
        text = `?????????${tempType}#${this.symbolType[`?????????${tempType}`] + 1}`;
      } else {
        text = operator.attrs.featureName;
      }
      this.props.dispatch({
        type: "modal/updateData",
        payload: {
          featureName: text, // ??????
          selectName: "???????????????",
        },
      });
    }
    let strokeColor = this.props.strokeColorStyle;
    if (!strokeColor || strokeColor.indexOf("rgb") < 0) {
      strokeColor = this.strokeColorStyle;
    }
    let style = {};
    if (
      this.props.plotType === "Point" ||
      this.props.plotType === "Polygon" ||
      this.props.plotType === "freePolygon" ||
      this.props.plotType === "arrow" ||
      this.props.plotType === "rect" ||
      this.props.plotType === "circle"
    ) {
      options = {
        ...this.commonStyleOptions,
        fillColor: value,
        strokeColor: strokeColor,
        text: text,
        radius: 8,
      };
      attrs = {
        name: text,
        featureType: value,
        strokeColor: strokeColor,
        selectName: "???????????????",
        remark: this.props.remarks,
      };
      delete options.iconUrl;
    }
    // if (this.props.plotType === "LineString" || this.props.plotType === 'freeLine') {
    //   options = {
    //     ...this.commonStyleOptions,
    //     fillColor: value,
    //     strokeColor: value,
    //     text: text,
    //   };
    //   attrs = {
    //     name: text,
    //     featureType: value,
    //     strokeColor: strokeColor,
    //     selectName: "???????????????",
    //     remark: this.props.remarks,
    //   };
    // }
    let newPlotType = this.props.plotType;
    if (
      newPlotType === "freePolygon" ||
      newPlotType === "arrow" ||
      newPlotType === "rect" ||
      newPlotType === "circle"
    ) {
      newPlotType = "Polygon";
    }
    style = createStyle(newPlotType, options);
    this.addPlot(style, attrs);
  };
  handleCloseClick = () => {
    this.props.showPlotInfoPanel && this.props.showPlotInfoPanel(false);
  };

  createGIF = () => {
    if (this.state.showGIF) {
      const gifUrl = require("../../assets/plot/remind.gif");
      return (
        <div style={{ width: "100%" }}>
          <img crossOrigin="anonymous" alt="" src={gifUrl} />
          <p>??????????????????????????????</p>
        </div>
      );
    } else {
      return null;
    }
  };
  changeOKBtnState = (value = true) => {
    this.setState({
      okBtnState: value,
    });
  };
  render() {
    const { TextArea } = Input;
    const disableStyle = { color: "rgba(0,0,0,0.2)" };
    const { isOpen } = this.state;
    return (
      <div className={`${styles.plotpanel} ${isOpen ? styles.plotpanelActive : styles.plotpanelHide}`}
      style={{overflowX:"visible"}}>
        <div className={`${styles.panel} ${globalStyle.autoScrollY}`}
        style={{opacity: isOpen ? 1: 0}}>
          <div
            className={`${styles.body}`}
            // style={{ height: "calc(100% - 74px)" }}
          >
            {/* {this.createGIF()} */}
            <p className={styles.title}>????????????</p>
            <div className={styles.row}>
              <span className={styles.rowspan}>????????????</span>
              <ColorPicker
                position="bottomRight"
                colorStyle={
                  this.props.selectName === "???????????????"
                    ? this.props.strokeColorStyle
                    : this.strokeColorStyle
                }
                handleOK={this.handleStrokeColorOkClick}
              ></ColorPicker>
              <span
                className={styles.rowspan}
                style={(this.state.plotType === "LineString" || this.state.plotType === "freeLine") ? disableStyle : {}}
              >
                ????????????
              </span>
              <ColorPicker
                position="bottomRight"
                colorStyle={
                  this.props.selectName === "???????????????"
                    ? this.props.featureType
                    : this.fillColorStyle
                }
                disable={(this.state.plotType === "LineString" || this.state.plotType === "freeLine") ? true : false}
                handleOK={this.handleFillColorOkClick}
              ></ColorPicker>
            </div>
            <div className={styles.symbolPanel}>
              {this.state.symbols.length > 0 ? (
                <div className={styles.symbolBlock}>
                  {this.state.symbols.map((item0, index0) => {
                    return (
                      <div className={styles.symbolBlock} key={item0.type}>
                        <p>{item0.type}</p>
                        <div className={styles.symbolList}>
                          {item0.items.map((item, index1) => {
                            return (
                              <div
                                title={item.name}
                                className={`${styles.symbol} ${
                                  this.state.selectedIndex ===
                                  `${index0}|${index1}`
                                    ? styles.symbolActive
                                    : ""
                                }`}
                                key={`${index0}|${index1}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  this.handleSymbolItemClick(
                                    item,
                                    `${index0}|${index1}`
                                  );
                                }}
                              >
                                <div
                                  className={styles.symbolColor}
                                  style={this.getSymbol(item)}
                                ></div>
                                <span>{item.name || item.icon_name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Skeleton paragraph={{ rows: 6 }} />
              )}
            </div>
            <p className={styles.title} style={{ margin: "10px 0" }}>
              ????????????
            </p>
            <Input
              placeholder="??????????????????(??????)"
              style={{ marginBottom: 6 }}
              value={this.props.featureName}
              onChange={(e) => this.handlePlotNameChange(e.target.value)}
            ></Input>
            <TextArea
              placeholder="????????????(??????)"
              style={{ marginBottom: 6, height: 84 }}
              value={this.props.remarks}
              onChange={(e) => this.handlePotRemarkChange(e.target.value)}
            ></TextArea>
            <Button
              type="primary"
              block
              onClick={this.handleOKClick}
              disabled={this.state.okBtnState}
            >
              ??????
            </Button>
          </div>
        </div>
        <div className={styles.slideToggle} onClick={() => this.setState({isOpen: !isOpen})}>
          <span style={{transform: isOpen ? 'rotate(-90deg)': 'rotate(90deg)'}} className={styles.slideToggleIcon}>
              <MyIcon type="icon-kuaisuxinjian_xiala"/>
          </span>
        </div>
      </div>
    );
  }
}
