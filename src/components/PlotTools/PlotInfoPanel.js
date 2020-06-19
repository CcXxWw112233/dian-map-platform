import React, { Component } from "react";
import { Input, Button, Skeleton, message } from "antd";
import throttle from "lodash/throttle";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./Styles.less";
import ColorPicker from "../ColorPicker";
import plotServices from "../../services/plot";
import { plotEdit } from "../../utils/plotEdit";
import Event from "../../lib/utils/event";
import { config } from "../../utils/customConfig";
import symbolStoreServices from "../../services/symbolStore";
import { createStyle } from "@/lib/utils";
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
  }
  componentDidMount() {
    this.getSymbolData(this.props);
    this.props.onRef(this);
  }
  componentWillReceiveProps(nextProps) {
    this.getSymbolData(nextProps);
  }

  updateProps = () => {
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
  getSymbolData = async (props) => {
    try {
      const { plotType, responseData, isModifyPlot } = props;
      if (!isModifyPlot) {
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
        }
        // this.symbols[plotType] = res?.data;
        let symbols = [];
        if (res) {
          res.data.forEach((item) => {
            symbols = [...symbols, ...item.items];
          });
        }
        this.setState({
          symbols: symbols || [],
          plotType: plotType,
        });
      } else {
        this.setState({
          symbols: responseData || [],
          plotType: plotType,
        });
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
    } else if (data.value1.indexOf("rgb") > -1) {
      style = {
        ...style,
        backgroundColor: symbolUrl,
        border: `2px solid ${strokeColor}`,
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
  createAttr = () => {};
  updateRedux = (list) => {
    const { dispatch } = this.props;
    let newList = [];
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
  handleSymbolItemClick = (value, index) => {
    this.setState({
      selectedIndex: index,
    });
    if (!this.props.isModifyPlot) {
      plotEdit.create(
        this.plotKeyVal[this.props.plotType],
        this.props.dispatch
      );
    }
    let options = {},
      style = {},
      attrs = {};
    let featureType = value.value1 || value.icon_url;
    let strokeColor = "rgba(155,155,155,1)";
    if (value.value3?.indexOf("rgb") > -1) {
      strokeColor = value.value3;
    }
    let selectName = value.name || value.icon_name;
    if (this.symbolType[selectName] === undefined) {
      this.symbolType[selectName] = 0;
    }
    let text = "";
    if (this.props.isModifyPlot) {
      text = this.props.featureName;
    } else {
      text = `${selectName}#${++this.symbolType[selectName]}`;
      this.props.dispatch({
        type: "modal/updateData",
        payload: {
          featureName: text, // 名称
        },
      });
    }
    let remark = this.props.remarks;
    let iconUrl = "";
    if (this.state.plotType === "Point") {
      if (featureType.indexOf("/") > -1) {
        if (featureType.indexOf("https") === 0) {
          iconUrl = featureType;
          let tempImg = new Image();
          tempImg.src = iconUrl;
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
        options.strokeColor = strokeColor;
        options.fillColor = featureType;
        attrs = {
          name: text,
          featureType: featureType,
          selectName: selectName,
          strokeColor: strokeColor,
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
        options.lineDash = [10, 10, 10];
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
          strokeColor: strokeColor,
          text: text,
        };
        attrs = {
          name: text,
          featureType: featureType,
          strokeColor: strokeColor,
          selectName: selectName,
          remark: remark,
        };
        style = createStyle("Polygon", options);
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
          style = createStyle("Polygon", options);
          me.addPlot(style, attrs);
        };
        return;
      }
    }
    this.addPlot(style, attrs);
  };

  addPlot = (style, attrs) => {
    if (!this.props.isModifyPlot) {
      Event.Evt.firEvent("setAttribute", {
        style: style,
        attrs: attrs,
        responseData: this.state.symbols,
        cb: this.updateRedux.bind(this),
      });
    } else {
      if (!window.featureOperator) return;
      window.featureOperator.attrs = attrs;
      window.featureOperator.setName(attrs.name);
      window.featureOperator.feature.setStyle(style);
      this.updateReduxOperatorList();
    }
  };

  getGeometryType = (type) => {
    let tempType = "";
    // if (type === "MARKER") {
    //   tempType = "点";
    // }
    // if (type === "POLYLINE") {
    //   tempType = "线";
    // }
    // if (
    //   type === "POLYGON" ||
    //   type === "FREEHAND_POLYGON" ||
    //   type === "FINE_ARROW" ||
    //   type === "RECTANGLE" ||
    //   type === "CIRCLE"
    // ) {
    //   tempType = "面";
    // }
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
      this.symbolType[`默认${tempType}`] = 0;
    }
    const name = `默认${tempType}#${++this.symbolType[`默认${tempType}`]}`;
    Event.Evt.firEvent("setAttribute", {
      attrs: {
        name: name,
        featureType:
          type === "POLYLINE" ? "rgba(155,155,155,1)" : "rgba(155,155,155,0.7)",
        strokeColor: "rgba(155,155,155,1)",
        selectName: "自定义类型",
        remark: "",
      },
      responseData: this.state.symbols,
      cb: this.updateRedux.bind(this),
    });
  };

  //标绘名称
  handlePlotNameChange = (value) => {
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        featureName: value,
      },
    });
  };

  updateReduxOperatorList = () => {
    const { dispatch, featureOperatorList } = this.props;
    let newList = [...featureOperatorList];
    let index = newList.findIndex((item) => {
      return item.guid === window.featureOperator.guid;
    });
    if (index > -1) {
      newList[index] = window.featureOperator;
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
  };

  // 标绘备注
  handlePotRemarkChange = (value) => {
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
  handleOKClick = () => {
    if (this.props.isModifyPlot) {
      window.featureOperator.attrs.name = this.props.featureName;
      window.featureOperator.setName(this.props.featureName);
      window.featureOperator.attrs.remark = this.props.remarks;
      let style = window.featureOperator.feature.getStyle();
      let text = style.getText(this.props.featureName);
      text.setText(this.props.featureName);
      style.setText(text);
      window.featureOperator.feature.setStyle(style);
      this.updateReduxOperatorList();
      this.props.showPlotInfoPanel(false);
    } else {
      this.props.showPlotInfoPanel(false);
    }
    this.props.hideTempPlotPanel(true);
    this.props.changeActiveBtn("tempPlot");
  };
  // 线框颜色
  handleStrokeColorOkClick = (value) => {
    this.strokeColorStyle = value;
    this.setState({
      selectedSymbolId: -1,
    });
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        strokeColorStyle: value,
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
      let tempType = this.getGeometryType(this.plotKeyVal[this.props.plotType]);
      if (this.symbolType[`自定义${tempType}`] === undefined) {
        this.symbolType[`自定义${tempType}`] = 0;
      }
      text = `自定义${tempType}#${++this.symbolType[`自定义${tempType}`]}`;
      this.props.dispatch({
        type: "modal/updateData",
        payload: {
          featureName: text, // 名称
        },
      });
    }
    let remark = this.props.remarks;
    let featureType = this.props.featureType || this.fillColorStyle;
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
    if (!this.props.isModifyPlot) {
      Event.Evt.firEvent("setAttribute", {
        style: style,
        attrs: attrs,
        responseData: this.state.symbols,
        cb: this.updateRedux.bind(this),
      });
    } else {
      window.featureOperator.attrs = attrs;
      window.featureOperator.setName(attrs.name);
      window.featureOperator.feature.setStyle(style);
      this.updateReduxOperatorList();
    }
  };

  // 填充颜色
  handleFillColorOkClick = (value) => {
    this.setState({
      selectedSymbolId: -1,
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
      let tempType = this.getGeometryType(this.plotKeyVal[this.props.plotType]);
      if (this.symbolType[`自定义${tempType}`] === undefined) {
        this.symbolType[`自定义${tempType}`] = 0;
      }
      text = `自定义${tempType}#${++this.symbolType[`自定义${tempType}`]}`;
      this.props.dispatch({
        type: "modal/updateData",
        payload: {
          featureName: text, // 名称
        },
      });
    }
    let strokeColor = this.props.strokeColorStyle || this.strokeColorStyle;
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
    if (!this.props.isModifyPlot) {
      Event.Evt.firEvent("setAttribute", {
        style: style,
        attrs: attrs,
        responseData: this.state.symbols,
        cb: this.updateRedux.bind(this),
      });
    } else {
      window.featureOperator.attrs = attrs;
      window.featureOperator.setName(attrs.name);
      window.featureOperator.feature.setStyle(style);
      this.updateReduxOperatorList();
    }
  };
  handleCloseClick = () => {
    this.props.showPlotInfoPanel && this.props.showPlotInfoPanel(false);
  };
  getDefaultStyle = () => {
    let style = {
      border: "2px solid rgba(155,155,155,1)",
      backgroundColor: "rgba(155,155,155,0.7)",
    };
    if (this.props.plotType === "Point") {
      style = {
        ...style,
        borderRadius: 16,
      };
    } else if (this.props.plotType === "LineString") {
      style = {
        ...style,
        height: 0,
      };
    } else if (
      this.props.plotType === "Polygon" ||
      this.props.plotType === "freePolygon" ||
      this.props.plotType === "arrow" ||
      this.props.plotType === "rect" ||
      this.plotType === "circle"
    ) {
    }
    return style;
  };
  createDefautSymbol = () => {
    if (this.props.plotType === "Point") {
      const item = {
        value1: "rgba(155,155,155,0.7)",
      };
      return (
        <div
          className={styles.symbol}
          key={`默认${this.getGeometryType()}`}
          onClick={() => this.handleSymbolItemClick(item)}
        >
          <div
            className={styles.symbolColor}
            style={this.getDefaultStyle()}
          ></div>
          <span>{`默认${this.getGeometryType()}`}</span>
        </div>
      );
    }
  };
  render() {
    const { TextArea } = Input;
    const disableStyle = { color: "rgba(0,0,0,0.2)" };
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <span>{!this.props.isModifyPlot ? "新增标绘" : "修改标绘"}</span>
          <i
            className={`${globalStyle.global_icon} ${globalStyle.btn}`}
            style={{ fontSize: 14, float: "right" }}
            onClick={this.handleCloseClick}
          >
            &#xe632;
          </i>
        </div>
        <div
          className={`${styles.body} ${globalStyle.autoScrollY}`}
          style={{ height: "calc(100% - 74px)" }}
        >
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
        </div>
        {this.props.isModifyPlot ? (
          <div className={styles.footer}>
            <Button type="primary" block onClick={this.handleOKClick}>
              {this.props.isModifyPlot ? "确定" : "完成"}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }
}
