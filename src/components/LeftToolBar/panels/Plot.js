import React, { useState } from "react";
import { Input, Select, Button, Tooltip } from "antd";
import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "../LeftToolBar.less";
import ColorPicker from "../../ColorPicker/index";
import { guid } from "./lib";
import { symbols } from "./data";
import { plotEdit } from "../../../utils/plotEdit";
import { createStyle } from "../../../lib/utils/index";
import Event from "../../../lib/utils/event";

const SymbolBlock = ({ data, indexStr, cb }) => {
  let [show, toggle] = useState(true);
  const style = {
    transform: "translateX(-10px)",
    margin: "10px 0px",
  };
  return (
    <div>
      <div className={styles.header}>
        <span>{data.item.typeName}</span>
        {show ? (
          <CaretDownOutlined
            style={style}
            onClick={() => {
              toggle(false);
            }}
          />
        ) : (
          <CaretUpOutlined
            style={style}
            onClick={() => {
              toggle(true);
            }}
          />
        )}
      </div>
      {show ? (
        <div className={styles.block}>
          {data.item.content.map((item, index) => {
            let style = {};
            if (indexStr !== "") {
              const indexArr = indexStr.split("|");
              if (
                Number(indexArr[0]) === data.index &&
                Number(indexArr[1]) === index
              ) {
                style = { color: "rgb(80, 130, 255)" };
              }
            }
            return (
              <Tooltip
                key={guid(false)}
                title={item.name}
                trigger={["hover", "focus", "click"]}
                placement="top"
              >
                <i
                  style={style}
                  onClick={(e) => {
                    cb(e, data.index, index);
                  }}
                  className={globalStyle.global_icon}
                  dangerouslySetInnerHTML={{ __html: item.iconfont }}
                ></i>
              </Tooltip>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
export default class Plot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      remark: "",
      fillSelectedIndex: -1,
      strokeSelectedIndex: -1,
      customFillSelectedColor: "rgba(255,255,255,1)",
      customStrokeSelectedColor: "rgba(255,255,255,1)",
      symbolSelectedIndex: "",
      strokePercent: "1",
      fillPercent: "1",
    };
    this.fillColor = "rgb(208, 211, 226)";
    this.strokeColor = "rgb(130, 138, 169)";
    this.defeaultColors = [
      { fill: "rgba(255,84,86,1)", border: "rgba(255,84,86,1)" },
      { fill: "rgba(157, 104, 255, 1)", border: "rgba(157, 104, 255, 1)" },
      { fill: "rgba(126, 213, 255, 1)", border: "rgba(126, 213, 255, 1)" },
      { fill: "rgba(80, 130, 255, 1)", border: "rgba(80, 130, 255, 1)" },
      { fill: "rgba(2, 121, 107, 1)", border: "rgba(2, 121, 107, 1)" },
      { fill: "rgba(255, 201, 0, 1)", border: "rgba(255, 201, 0, 1)" },
      { fill: "rgba(245, 124, 0, 1)", border: "rgba(245, 124, 0, 1)" },
      { fill: "rgba(74, 80, 111, 1)", border: "rgba(74, 80, 111, 1)" },
      { fill: "rgba(106, 113, 145, 1)", border: "rgba(106, 113, 145, 1)" },
      { fill: "rgba(130, 138, 169, 1)", border: "rgba(130, 138, 169, 1)" },
      { fill: "rgba(208, 211, 226, 1)", border: "rgba(208, 211, 226, 1)" },
      {
        fill: "rgba(255, 255, 255, 1)",
        border: "rgba(208,211,226,1)",
        selectedColor: "rgb(130, 138, 169)",
      },
      { fill: "rgba(93, 64, 55, 1)", border: "rgba(93, 64, 55, 1)" },
      { fill: "rgba(141, 110, 99, 1)", border: "rgba(141, 110, 99, 1)" },
    ];
    this.dic = {
      point: "Point",
      line: "Polyline",
      freeLine: "Polyline",
      polygon: "Polygon",
      freePolygon: "Polygon",
    };
    this.plotDic = {
      point: "MARKER",
      line: "POLYLINE",
      freeLine: "FREEHAND_LINE",
      polygon: "POLYGON",
      freePolygon: "FREEHAND_POLYGON",
      arrow: "FINE_ARROW",
      rect: "RECTANGLE",
      circle: "CIRCLE",
    };
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
  }
  componentWillReceiveProps(nextProps) {
    this.handleResetClick();
  }
  handleInputChange = (val) => {
    this.setState({
      name: val,
    });
  };
  onTextAreaChange = (val) => {
    this.setState({
      remark: val,
    });
  };
  handleColorClick = (data, type) => {
    // 0为轮廓色
    if (type === 0) {
      this.strokeColor = data.fill;
      const index = this.strokeColor.lastIndexOf(",");
      this.strokeColor =
        this.strokeColor.substr(0, index + 1) +
        " " +
        this.state.strokePercent +
        ")";
      this.setState({
        symbolSelectedIndex: "",
        customStrokeSelectedColor: this.strokeColor,
      });
    }
    // 1为填充色
    if (type === 1) {
      this.fillColor = data.fill;
      const index = this.fillColor.lastIndexOf(",");
      this.fillColor =
        this.fillColor.substr(0, index + 1) +
        " " +
        this.state.fillPercent +
        ")";
      this.setState({
        symbolSelectedIndex: "",
        customFillSelectedColor: this.fillColor,
      });
    }
    this.updateStateCallbackFunc();
  };

  updateStateCallbackFunc = () => {
    const options = {
      ...this.commonStyleOptions,
      radius: 8,
      fillColor: this.fillColor,
      strokeColor: this.strokeColor,
      text: this.state.name,
      showName: true,
    };
    const attrs = {
      name: this.state.name,
      featureType: this.fillColor,
      strokeColor: this.strokeColor,
      remark: this.state.remark,
      selectName: "自定义类型",
    };
    const style = createStyle(this.dic[this.props.plotType], options);
    plotEdit.create(this.plotDic[this.props.plotType]);
    Event.Evt.firEvent("setPlotDrawStyle", style);
    Event.Evt.firEvent("setAttribute", {
      style: style,
      attrs: attrs,
    });
  };

  getCurrentIcon = (fontContent, { fontSize, fillColor, strokeColor }) => {
    let canvas = document.createElement("canvas");
    canvas.width = fontSize;
    canvas.height = fontSize;
    let context = canvas.getContext("2d");
    context.font = fontSize + "px iconfont";
    context.textAlign = "left";
    context.textBaseline = "top";
    if (fillColor && fillColor !== "") {
      context.fillStyle = fillColor;
      context.fillText(fontContent, 0, 0);
    }
    if (strokeColor && strokeColor !== "") {
      context.strokeStyle = strokeColor;
      context.strokeText(fontContent, 0, 0);
    }
    // let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    // for (let i = 0; i < imageData.data.length; i += 4) {
    //   // 当该像素是透明的,则设置成白色
    //   if (imageData.data[i + 3] === 0) {
    //     imageData.data[i] = 255;
    //     imageData.data[i + 1] = 255;
    //     imageData.data[i + 2] = 255;
    //     imageData.data[i + 3] = 255;
    //   }
    // }
    // context.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
  };

  getFillSymbol = (data, index, index2) => {
    this.setState({
      fillSelectedIndex: -1,
      strokeSelectedIndex: -1,
      symbolSelectedIndex: `${index}|${index2}`,
    });
    let iconUrl = this.getCurrentIcon(data.target.textContent, {
      fontSize: 40,
      fillColor: "rgba(106, 154, 255, 1)",
      strokeColor: "rgba(106, 154, 255, 1)",
    });
    let options = {
      ...this.commonStyleOptions,
      text: this.state.name,
      showName: true,
    };
    switch (this.props.plotType) {
      case "polygon":
      case "freePolygon":
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        let img = new Image();
        img.src = iconUrl;
        img.crossorigin = "anonymous";
        const me = this;
        img.onload = function () {
          const pat = context.createPattern(img, "repeat");
          options = { ...options, fillColor: pat };
          me.createPlot(options, data, iconUrl);
        };
        break;
      default:
        options = {
          ...options,
          iconUrl: iconUrl,
        };
        this.createPlot(options, data, iconUrl);
        break;
    }
  };

  createPlot = (options, data, iconUrl) => {
    const style = createStyle(this.dic[this.props.plotType], options);
    let attrs = {
      name: this.state.name,
      featureType: data.iconfont,
      strokeColor: "",
      remark: this.state.remark,
      selectName: data.typeName,
    };
    if (
      this.props.plotType === "polygon" ||
      this.props.plotType === "freePolygon"
    ) {
      attrs = {...attrs, sigleImage: iconUrl}
    }
    plotEdit.create(this.plotDic[this.props.plotType]);
    Event.Evt.firEvent("setPlotDrawStyle", style);
    Event.Evt.firEvent("setAttribute", {
      style: style,
      attrs: attrs,
    });
  };
  handleCustomStrokeColorOkClick = (value) => {
    this.setState({
      strokeSelectedIndex: -1,
      customStrokeSelectedColor: value,
    });
  };
  handleCustomFillColorOkClick = (value) => {
    this.setState({
      fillSelectedIndex: -1,
      customFillSelectedColor: value,
    });
  };

  handleCustomStrokeColorSelectChange = (value) => {
    let { customStrokeSelectedColor } = this.state;
    let index = customStrokeSelectedColor.lastIndexOf(",");
    let newStr =
      customStrokeSelectedColor.substr(0, index + 1) + " " + value + ")";
    this.setState({
      customStrokeSelectedColor: newStr,
      strokePercent: value,
    });
  };

  handleCustomFillColorSelectChange = (value) => {
    let { customFillSelectedColor } = this.state;
    let index = customFillSelectedColor.lastIndexOf(",");
    let newStr =
      customFillSelectedColor.substr(0, index + 1) + " " + value + ")";
    this.setState({
      customFillSelectedColor: newStr,
      fillPercent: value,
    });
  };

  handleResetClick = () => {
    this.fillColor = "rgb(208, 211, 226)";
    this.strokeColor = "rgb(130, 138, 169)";
    this.setState({
      name: "",
      remark: "",
      fillSelectedIndex: -1,
      strokeSelectedIndex: -1,
      customFillSelectedColor: "rgba(255,255,255,1)",
      customStrokeSelectedColor: "rgba(255,255,255,1)",
      symbolSelectedIndex: "",
      strokePercent: "1",
      fillPercent: "1",
    });
  };
  render() {
    const { TextArea } = Input;
    const { Option } = Select;

    return (
      <div
        className={styles.panel}
        style={{ position: "absolute", left: 56, top: 0 }}
      >
        <div
          className={styles.header}
          style={{ padding: "0 20px", marginBottom: 10 }}
        >
          <i
            className={globalStyle.global_icon}
            onClick={() => this.props.goBackProject()}
          >
            &#xe758;
          </i>
          <i className={globalStyle.global_icon}>&#xe759;</i>
        </div>
        <div
          className={`${styles.body} ${globalStyle.autoScrollY}`}
          style={{
            height: "calc(100% - 110px)",
          }}
        >
          <div className={styles.content}>
            <Input
              style={{
                width: "100%",
                height: 40,
                marginBottom: 20,
              }}
              placeholder="输入名称"
              allowClear
              value={this.state.name}
              onChange={(e) => this.handleInputChange(e.target.value)}
            />
            <TextArea
              style={{
                width: "100%",
                height: 120,
              }}
              placeholder="填写备注"
              allowClear
              value={this.state.remark}
              onChange={(e) => this.onTextAreaChange(e.target.value)}
            />
            <div className={styles.header} style={{ marginTop: 20 }}>
              <span>自定义轮廓色</span>
              <ColorPicker
                style={{ margin: "auto" }}
                handleOK={this.handleCustomStrokeColorOkClick}
              ></ColorPicker>
              <div
                className={styles.colorbar}
                style={{
                  background: this.state.customStrokeSelectedColor,
                  margin: "auto",
                }}
              ></div>
              <Select
                value={this.state.strokePercent}
                style={{ width: 120 }}
                bordered={false}
                onChange={(e) => this.handleCustomStrokeColorSelectChange(e)}
              >
                <Option value="1">100%</Option>
                <Option value="0.75">75%</Option>
                <Option value="0.5">50%</Option>
                <Option value="0.25">25%</Option>
                <Option value="0">0%</Option>
              </Select>
            </div>
            <div className={styles.block}>
              {this.defeaultColors.map((item, index) => {
                const style = item.selectedColor
                  ? { color: item.selectedColor }
                  : {};
                return (
                  <div
                    className={styles.symbol}
                    key={guid(false)}
                    style={{
                      background: item.fill,
                      border: `1px solid ${item.border}`,
                    }}
                    onClick={() => {
                      this.setState(
                        { strokeSelectedIndex: index },
                        this.handleColorClick(item, 0)
                      );
                    }}
                  >
                    {this.state.strokeSelectedIndex === index && (
                      <i className={globalStyle.global_icon} style={style}>
                        &#xe75b;
                      </i>
                    )}
                  </div>
                );
              })}
            </div>
            <div className={styles.header} style={{ marginTop: 20 }}>
              <span>自定义填充色</span>
              <ColorPicker
                style={{ margin: "auto" }}
                handleOK={this.handleCustomFillColorOkClick}
              ></ColorPicker>
              <div
                className={styles.colorbar}
                style={{
                  background: this.state.customFillSelectedColor,
                  margin: "auto",
                }}
              ></div>
              <Select
                value={this.state.fillPercent}
                style={{ width: 120 }}
                bordered={false}
                onChange={(e) => this.handleCustomFillColorSelectChange(e)}
              >
                <Option value="1">100%</Option>
                <Option value="0.75">75%</Option>
                <Option value="0.5">50%</Option>
                <Option value="0.25">25%</Option>
                <Option value="0">0%</Option>
              </Select>
            </div>
            <div className={styles.block}>
              {this.defeaultColors.map((item, index) => {
                const style = item.selectedColor
                  ? { color: item.selectedColor }
                  : {};
                return (
                  <div
                    className={styles.symbol}
                    key={guid(false)}
                    style={{
                      background: item.fill,
                      border: `1px solid ${item.border}`,
                    }}
                    onClick={() => {
                      this.setState(
                        { fillSelectedIndex: index },
                        this.handleColorClick(item, 1)
                      );
                    }}
                  >
                    {this.state.fillSelectedIndex === index && (
                      <i className={globalStyle.global_icon} style={style}>
                        &#xe75b;
                      </i>
                    )}
                  </div>
                );
              })}
            </div>
            {/* <div className={styles.header}>
              <span>图标</span>
            </div> */}
            {symbols.map((item, index) => {
              if (item.type.indexOf(this.props.plotType) >= 0) {
                return (
                  <SymbolBlock
                    key={guid(false)}
                    data={{ item: item, index: index }}
                    indexStr={this.state.symbolSelectedIndex}
                    cb={this.getFillSymbol}
                  ></SymbolBlock>
                );
              }
              return null;
            })}
          </div>
        </div>
        <div className={styles.footer}>
          <Button
            block
            style={{
              width: 260,
              height: 36,
              margin: "12px auto",
              background: "rgba(163,205,255,0.2)",
              borderRadius: 4,
              border: "1px solid rgba(127,167,255,1)",
            }}
            onClick={this.handleResetClick}
          >
            重新设置
          </Button>
        </div>
      </div>
    );
  }
}
