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
import { config, planConf } from "../../utils/customConfig";
import symbolStoreServices from "../../services/symbolStore";
import { createStyle } from "@/lib/utils";
import { setSession, getSession } from "utils/sessionManage";
import { plotImage } from "./lib";

import { connect } from "dva";
import { indexOf } from "lodash";

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
      showGIF: false,
    };
    this.symbols = {};
    // this.handlePlotNameChange = throttle(this.handlePlotNameChange, 1000);
    // this.handlePotRemarkChange = throttle(this.handlePotRemarkChange, 1000);
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
    getSession("usePlot").then((res) => {
      if (res.code === 0) {
        if (!res.data) {
          this.setState({
            showGIF: true,
          });
          setSession("usePlot", "1");
        }
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.plotType !== nextProps.plotType) {
      this.getSymbolData(nextProps);
    }
  }

  updateProps = () => {
    this.setState({
      selectedIndex: 0,
    });
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        visible: false,
        responseData: null,
        isEdit: false,
        featureName: "", // 名称
        selectName: "",
        featureType: "", // 类型
        strokeColorStyle: "",
        remarks: "", // 备注
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
    const { plotType, selectName } = props;
    let res = null;
    let defaultPlotType = {
      type: "默认",
      items: [
        {
          id: "默认点",
          value1: "rgba(155,155,155,0.7)",
          value3: "rgba(155,155,155,1)",
          name: "默认点",
        },
      ],
    };
    if (plotType === "Point") {
      res = await plotServices.GET_POINTSYMBOL();
      const res0 = await symbolStoreServices.GET_ICON();
      res.data = [
        defaultPlotType,
        { type: "自定义", items: [...res0.data] },
        ...res.data,
      ];
    }
    if (plotType === "Polyline" || plotType === "LineString") {
      res = await plotServices.GET_POLYLINESYMBOL();
      defaultPlotType.items[0].id = "默认线";
      defaultPlotType.items[0].name = "默认线";
      res.data = [defaultPlotType, ...res.data];
    }
    if (
      plotType === "Polygon" ||
      plotType === "freePolygon" ||
      plotType === "arrow" ||
      plotType === "rect" ||
      plotType === "circle"
    ) {
      res = await plotServices.GET_POLYGONSYMBOL();
      const res0 = await symbolStoreServices.GET_ICON();
      res.data[2].items = [
        ...res.data[2].items,
        ...config,
        ...res0.data,
      ].reverse();
      defaultPlotType.items[0].id = "默认面";
      defaultPlotType.items[0].name = "默认面";
      res.data = [defaultPlotType, ...res.data.reverse()];
      res.data = [planConf, ...res.data];
    }
    // this.symbols[plotType] = res?.data;
    let symbols = [];
    if (res) {
      res.data.forEach((item) => {
        symbols = [...symbols, ...item.items];
      });
    }
    this.setState(
      {
        symbols: symbols || [],
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
      message.error(err);
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
    if (symbolUrl.indexOf("/") > -1) {
      if (symbolUrl.indexOf("https") === 0) {
        src = symbolUrl;
      } else {
        symbolUrl = symbolUrl.replace("img", "");
        src = require("../../assets" + symbolUrl);
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
        style.backgroundColor = data.value4;
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
      this.props.plotType === "LineString"
    ) {
      style = { ...style, height: 0, border: `1px solid ${symbolUrl}` };
    }
    return style;
  };

  createImage = (operator) => {
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
    }
  };

  updateRedux = (list) => {
    this.createImage(list[list.length - 1]);
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

  //计算类型个数
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

  //图标点击事件
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
    this.sigleImage = null;
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
        featureName: text, // 名称
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
      this.state.plotType === "LineString"
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
        // iconUrl = require("../../assets/mark/gegen.png");
        // let options0 = {
        //   ...this.commonStyleOptions,
        //   iconUrl: iconUrl,
        //   text: text,
        // };
        // options0.showName = false;
        // const style0 = createStyle("Point", options0);
        style = createStyle("Polygon", options);
        // style = [style0, style];
      } else if (featureType.indexOf("/") > -1) {
        // 展示单个图标的多边形
        if (value.sigle && value.value4) {
          this.sigleImage = value.value1;
        }
        if (this.sigleImage) {
          let options0 = {
            ...this.commonStyleOptions,
            fillColor: value.value4,
            text: text,
          };
          options0.showName = false;
          style = createStyle("Polygon", options0);
          attrs = {
            name: text,
            featureType: value.value4,
            sigleImage: value.value1,
            selectName: selectName,
            remark: this.props.remarks,
          };
          this.addPlot(style, attrs);
        } else {
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
    }
    this.addPlot(style, attrs);
  };

  addPlot = (style, attrs) => {
    // 新增标绘状态
    if (!this.props.isModifyPlot) {
      const { operator } = this.props;
      if (operator) {
        operator.feature.setStyle(style);
      } else {
        plotEdit.create(
          this.plotKeyVal[this.props.plotType],
          this.props.dispatch
        );
        Event.Evt.firEvent("setAttribute", {
          style: style,
          attrs: attrs,
          responseData: this.state.symbols,
          cb: this.updateRedux.bind(this),
        });
      }
    } else {
      // 修改状态
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
      tempType = "点";
    }
    if (this.props.plotType === "LineString") {
      tempType = "线";
    }
    if (
      this.props.plotType === "Polygon" ||
      this.props.plotType === "freePolygon" ||
      this.props.plotType === "arrow" ||
      this.props.plotType === "rect" ||
      this.props.plotType === "circle"
    ) {
      tempType = "面";
    }
    return tempType;
  };

  createDefaultPlot = (type) => {
    plotEdit.create(type);
    let tempType = this.getGeometryType(type);
    if (this.symbolType[`默认${tempType}`] === undefined) {
      this.symbolType[`默认${tempType}`] = this.getSymbolTypeCount(
        `默认${tempType}`
      );
    }
    const name = `默认${tempType}#${this.symbolType[`默认${tempType}`] + 1}`;
    let style = null,
      options = {};
    this.selectName = `默认${tempType}`;
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
    Event.Evt.firEvent("setAttribute", {
      style: style,
      attrs: {
        name: name,
        featureType:
          type === "POLYLINE" ? "rgba(155,155,155,1)" : "rgba(155,155,155,0.7)",
        strokeColor: "rgba(155,155,155,1)",
        selectName: `默认${tempType}`,
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
  };

  //标绘名称
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

  // 标绘备注
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
    this.updateOperatorBeforeDeactivate();
  };
  // 线框颜色
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
        operator?.attrs.selectName !== `自定义${tempType}`
      ) {
        if (this.symbolType[`自定义${tempType}`] === undefined) {
          this.symbolType[`自定义${tempType}`] = this.getSymbolTypeCount(
            `自定义${tempType}`
          );
        }
        text = `自定义${tempType}#${this.symbolType[`自定义${tempType}`] + 1}`;
      } else {
        text = operator.attrs.featureName;
      }
      this.props.dispatch({
        type: "modal/updateData",
        payload: {
          featureName: text, // 名称
          selectName: "自定义类型",
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
        selectName: "自定义类型",
        remark: remark,
      };
      delete options.iconUrl;
    }
    if (this.props.plotType === "LineString") {
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
        selectName: "自定义类型",
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
    }
    style = createStyle(newPlotType, options);
    this.addPlot(style, attrs);
  };

  // 填充颜色
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
        operator?.attrs.selectName !== `自定义${tempType}`
      ) {
        if (this.symbolType[`自定义${tempType}`] === undefined) {
          this.symbolType[`自定义${tempType}`] = this.getSymbolTypeCount(
            `自定义${tempType}`
          );
        }
        text = `自定义${tempType}#${this.symbolType[`自定义${tempType}`] + 1}`;
      } else {
        text = operator.attrs.featureName;
      }
      this.props.dispatch({
        type: "modal/updateData",
        payload: {
          featureName: text, // 名称
          selectName: "自定义类型",
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
        selectName: "自定义类型",
        remark: this.props.remarks,
      };
      delete options.iconUrl;
    }
    if (this.props.plotType === "LineString") {
      options = {
        ...this.commonStyleOptions,
        fillColor: value,
        strokeColor: value,
        text: text,
      };
      attrs = {
        name: text,
        featureType: value,
        strokeColor: strokeColor,
        selectName: "自定义类型",
        remark: this.props.remarks,
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
          <img alt="" src={gifUrl} />
          <p>您可以开始绘制了哟！</p>
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
    return (
      <div className={`${styles.panel} ${globalStyle.autoScrollY}`}>
        <div
          className={`${styles.body}`}
          // style={{ height: "calc(100% - 74px)" }}
        >
          {this.createGIF()}
          <p className={styles.title}>选择符号</p>
          <div className={styles.row}>
            <span className={styles.rowspan}>线框颜色</span>
            <ColorPicker
              position="bottomRight"
              colorStyle={
                this.props.selectName === "自定义类型"
                  ? this.props.strokeColorStyle
                  : this.strokeColorStyle
              }
              handleOK={this.handleStrokeColorOkClick}
            ></ColorPicker>
            <span
              className={styles.rowspan}
              style={this.state.plotType === "LineString" ? disableStyle : {}}
            >
              填充颜色
            </span>
            <ColorPicker
              position="bottomRight"
              colorStyle={
                this.props.selectName === "自定义类型"
                  ? this.props.featureType
                  : this.fillColorStyle
              }
              disable={this.state.plotType === "LineString" ? true : false}
              handleOK={this.handleFillColorOkClick}
            ></ColorPicker>
          </div>
          <div className={styles.symbolPanel}>
            {this.state.symbols.length > 0 ? (
              <div className={styles.symbolBlock}>
                <div className={styles.symbolList}>
                  {this.state.symbols.map((item, index) => {
                    return (
                      <div
                        title={item.name}
                        className={`${styles.symbol} ${
                          this.state.selectedIndex === index
                            ? styles.symbolActive
                            : ""
                        }`}
                        key={index}
                        onClick={() => this.handleSymbolItemClick(item, index)}
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
            ) : (
              <Skeleton paragraph={{ rows: 6 }} />
            )}
          </div>
          <p className={styles.title} style={{ margin: "10px 0" }}>
            填写信息
          </p>
          <Input
            placeholder="输入标绘名称(选填)"
            style={{ marginBottom: 6 }}
            value={this.props.featureName}
            onChange={(e) => this.handlePlotNameChange(e.target.value)}
          ></Input>
          <TextArea
            placeholder="填写备注(选填)"
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
            确定
          </Button>
        </div>
      </div>
    );
  }
}
