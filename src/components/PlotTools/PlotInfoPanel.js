import React, { Component } from "react";
import { Input, Button, Skeleton } from "antd";
import throttle from "lodash/throttle";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./Styles.less";
import ColorPicker from "../ColorPicker";
import plotServices from "../../services/plot";
import { plotEdit } from "../../utils/plotEdit";
import Event from "../../lib/utils/event";
import { config } from "../../utils/customConfig";
import { createStyle } from "@/lib/utils";
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
      selectedSymbolId: null,
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
    this.strokeColorStyle = "rgba(155,155,155,1)"
    this.fillColorStyle = "rgba(155,155,155,0.7)"
  }
  componentDidMount() {
    this.getSymbolData(this.props);
  }
  componentWillReceiveProps(nextProps) {
    const { isModifyPlot } = nextProps;
    this.getSymbolData(nextProps);
  }
  componentWillUnmount() {
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
  }
  getSymbolData = async (props) => {
    const { plotType } = props;
    if (!this.symbols[plotType]) {
      let res = null;
      if (plotType === "Point") {
        res = await plotServices.GET_POINTSYMBOL();
      }
      if (plotType === "Polyline" || plotType === "LineString") {
        res = await plotServices.GET_POLYLINESYMBOL();
      }
      if (
        plotType === "Polygon" ||
        plotType === "freePolygon" ||
        plotType === "arrow" ||
        plotType === "rect" ||
        plotType === "circle"
      ) {
        res = await plotServices.GET_POLYGONSYMBOL();
        res.data[2].items = [...res.data[2].items, ...config];
      }
      this.symbols[plotType] = res?.data;
    }
    this.setState({
      symbols: this.symbols[plotType] || [],
      plotType: plotType,
    });
  };
  getSymbol = (data) => {
    if (!data) return;
    let style = {};
    let symbolUrl = data.value1;
    if (symbolUrl.indexOf("/") > -1) {
      symbolUrl = symbolUrl.replace("img", "");
      const src = require("../../assets" + symbolUrl);
      style = {
        ...style,
        backgroundImage: `url(${src})`,
        backgroundColor: "rgba(255,255,255,1)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
      };
    } else if (data.value1.indexOf("rgb") > -1) {
      style = {
        ...style,
        backgroundColor: symbolUrl,
      };
    }
    if (this.props.plotType === "Point") {
      style = { ...style, borderRadius: 8 };
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
    dispatch({
      type: "featureOperatorList/updateList",
      payload: {
        featureOperatorList: list,
      },
    });
  };
  handleSymbolItemClick = (value) => {
    this.setState({
      selectedSymbolId: value.id,
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
    let featureType = value.value1;
    let text = this.props.featureName || "未命名";
    let remark = this.props.remarks;
    if (this.state.plotType === "Point") {
      if (featureType.indexOf("/") > -1) {
        let iconUrl = featureType.replace("img", "");
        iconUrl = require("../../assets" + iconUrl);
        options = {
          ...this.commonStyleOptions,
          iconUrl: iconUrl,
          text: text,
        };
        attrs = {
          name: text,
          featureType: value.value1,
          selectName: value.name,
          remark: remark,
        };
      } else {
        delete options.iconUrl;
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
          strokeColor: value.value1,
          strokeWidth: 3,
          text: text,
        };
        attrs = {
          name: text,
          featureType: value.value1,
          strokeColor: value.value1,
          selectName: value.name,
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
          fillColor: value.value1,
          strokeColor: value.value1,
          text: text,
        };
        attrs = {
          name: text,
          featureType: value.value1,
          strokeColor: value.value1,
          selectName: value.name,
          remark: remark,
        };
        style = createStyle("Polygon", options);
      } else if (featureType.indexOf("/") > -1) {
        let iconUrl = featureType.replace("img", "");
        iconUrl = require("../../assets" + iconUrl);
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
            featureType: value.value1,
            selectName: value.name,
            remark: me.props.remarks,
          };
          style = createStyle("Polygon", options);
          if (!me.props.isModifyPlot) {
            Event.Evt.firEvent("setAttribute", {
              style: style,
              attrs: attrs,
              cb: me.updateRedux.bind(me),
            });
          } else {
            window.featureOperator.attrs = attrs;
            window.featureOperator.setName(attrs.name);
            window.featureOperator.feature.setStyle(style);
            me.updateReduxOperatorList();
          }
        };
        return;
      }
    }
    if (!this.props.isModifyPlot) {
      Event.Evt.firEvent("setAttribute", {
        style: style,
        attrs: attrs,
        cb: this.updateRedux.bind(this),
      });
    } else {
      window.featureOperator.attrs = attrs;
      window.featureOperator.setName(attrs.name);
      window.featureOperator.feature.setStyle(style);
      this.updateReduxOperatorList();
    }
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
      dispatch({
        type: "featureOperatorList/updateList",
        payload: {
          featureOperatorList: newList,
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
    this.strokeColorStyle = value
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
    let text = this.props.featureName || "未命名";
    let remark = this.props.remarks;
    let featureType = this.fillColorStyle;
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
    this.fillColorStyle = value
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
    let text = this.props.featureName || "未命名";
    let strokeColor = this.strokeColorStyle
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
        <div className={styles.body} style={{ height: "calc(100% - 74px)" }}>
          <Input
            placeholder="输入标绘名称"
            style={{ marginBottom: 12 }}
            value={this.props.featureName}
            onChange={(e) => this.handlePlotNameChange(e.target.value)}
          ></Input>
          <TextArea
            placeholder="填写备注"
            style={{ marginBottom: 12, height: 84 }}
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
          <div className={`${styles.symbolPanel} ${globalStyle.autoScrollY}`}>
            {this.state.symbols.length > 0 ? (
              this.state.symbols.map((symbol) => {
                return (
                  <div className={styles.symbolBlock} key={symbol.type}>
                    <p
                      style={{ margin: 0, textAlign: "left", marginBottom: 4 }}
                    >
                      {symbol.type}
                    </p>
                    <div className={styles.symbolList}>
                      {symbol.items.map((item) => {
                        return (
                          <div
                            title={item.name}
                            className={`${styles.symbol} ${
                              this.state.selectedSymbolId === item.id
                                ? styles.symbolActive
                                : ""
                            }`}
                            key={item.id}
                            onClick={() => this.handleSymbolItemClick(item)}
                          >
                            <div
                              className={styles.symbolColor}
                              style={this.getSymbol(item)}
                            ></div>
                            <span>{item.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <Skeleton paragraph={{ rows: 6 }} />
            )}
          </div>
        </div>
        <div className={styles.footer}>
          <Button type="primary" block onClick={this.handleOKClick}>
            {this.props.isModifyPlot ? "确定" : "完成"}
          </Button>
        </div>
      </div>
    );
  }
}
