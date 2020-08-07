import React, { useState } from "react";
import { Input, Select, Button, Tooltip, message } from "antd";
import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "../LeftToolBar.less";
import ColorPicker from "../../ColorPicker/index";
import { guid } from "./lib";
import { symbols } from "./data";
import { plotEdit } from "../../../utils/plotEdit";
import FeatureOperatorEvent from "../../../utils/plot2ol/src/events/FeatureOperatorEvent";
import { createStyle, createOverlay, getPoint } from "../../../lib/utils/index";
import Event from "../../../lib/utils/event";

import addFeatureOverlay from "../../PublicOverlays/addFeaturesOverlay/index";
import ListAction from "../../../lib/components/ProjectScouting/ScoutingList";
import DetailAction from "../../../lib/components/ProjectScouting/ScoutingDetail";

const SymbolBlock = ({
  data,
  indexStr,
  strokeColor,
  fillColor,
  plotType,
  cb,
}) => {
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
                if (plotType === "point") {
                  style = { color: fillColor };
                } else {
                  style = { color: "rgb(80, 130, 255)" };
                }
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
      featureType: "",
      strokeColor: "",
      fillSelectedIndex: -1,
      strokeSelectedIndex: -1,
      customFillSelectedColor: "rgba(106, 154, 255, 1)",
      customStrokeSelectedColor: "rgba(106, 154, 255, 1)",
      symbolSelectedIndex: "",
      strokePercent: "1",
      fillPercent: "1",
    };
    this.fillColor = "rgba(106, 154, 255, 1)";
    this.strokeColor = "rgba(106, 154, 255, 1)";
    this.nextProps = null;
    this.defaultSymbol = null;
    this.plotLayer = null;
    this.symbol = "";
    this.sigleImage = null;
    this.selectName = "自定义类型";
    this.defeaultColors = [
      { fill: "rgba(255,84,86,1)", border: "rgba(255,84,86,1)" },
      { fill: "rgba(157, 104, 255, 1)", border: "rgba(157, 104, 255, 1)" },
      { fill: "rgba(126, 213, 255, 1)", border: "rgba(126, 213, 255, 1)" },
      { fill: "rgba(80, 130, 255, 1)", border: "rgba(80, 130, 255, 1)" },
      { fill: "rgba(106, 154, 255, 1)", border: "rgba(106, 154, 255, 1)" },
      { fill: "rgba(2, 121, 107, 1)", border: "rgba(2, 121, 107, 1)" },
      { fill: "rgba(255, 201, 0, 1)", border: "rgba(255, 201, 0, 1)" },
      { fill: "rgba(245, 124, 0, 1)", border: "rgba(245, 124, 0, 1)" },
      { fill: "rgba(74, 80, 111, 1)", border: "rgba(74, 80, 111, 1)" },
      { fill: "rgba(106, 113, 145, 1)", border: "rgba(106, 113, 145, 1)" },
      { fill: "rgba(130, 138, 169, 1)", border: "rgba(130, 138, 169, 1)" },
      { fill: "rgba(208, 211, 226, 1)", border: "rgba(208, 211, 226, 1)" },
      { fill: "rgba(93, 64, 55, 1)", border: "rgba(93, 64, 55, 1)" },
      { fill: "rgba(141, 110, 99, 1)", border: "rgba(141, 110, 99, 1)" },
    ];
    this.dic = {
      point: "Point",
      line: "Polyline",
      freeLine: "Polyline",
      polygon: "Polygon",
      freePolygon: "Polygon",
      rect: "Polygon",
      circle: "Polygon",
      arrow: "Polygon",
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
  componentDidMount() {
    // console.log(DetailAction.CollectionGroup)
    // console.log(ListAction.projects)
    this.plotLayer = plotEdit.getPlottingLayer();
    const me = this;
    this.plotLayer.on(FeatureOperatorEvent.ACTIVATE, (e) => {
      if (!e.feature_operator.isScouting) {
        let operator = e.feature_operator;
        let { feature } = operator;
        this.addDrawFeature(feature, operator);
        switch (me.props.plotType) {
          case "freePolygon":
          case "polygon":
          case "rect":
          case "circle":
          case "arrow":
            if (this.symbol) {
              let iconUrl = this.getCurrentIcon(this.symbol, {
                fontSize: 38,
                fillColor: "rgba(80, 130, 255, 1)",
                strokeColor: "rgba(80, 130, 255, 1)",
              });
              plotEdit.plottingLayer.plotEdit.createPlotOverlay(
                iconUrl,
                operator
              );
              this.sigleImage = null;
            }
            break;
          default:
            break;
        }
      }
    });
    this.plotLayer.on(FeatureOperatorEvent.DEACTIVATE, (e) => {
      if (!e.feature_operator.isScouting) {
        console.log(e.feature_operator);
      }
    });
    if (this.props.plotType === "point") {
      this.symbol = this.refs.defaultSymbol.innerText;
      this.getPointDefaultSymbol();
    } else {
      this.updateStateCallbackFunc();
    }
  }
  componentWillReceiveProps(nextProps) {
    this.handleResetClick();
    this.nextProps = nextProps;
    if (nextProps.plotType === "point") {
      this.symbol = this.refs.defaultSymbol.innerText;
      this.getPointDefaultSymbol();
    } else {
      this.updateStateCallbackFunc();
    }
  }
  getMap = () => {
    return require("../../../utils/INITMAP").default;
  };
  addDrawFeature = async (feature, operator) => {
    let geo = feature.getGeometry();
    let type = geo.getType();
    let position = null;
    switch (type) {
      case "Point":
        position = geo.getCoordinates();
        break;
      case "Polygon":
        position = getPoint(geo.getExtent(), "center");
        break;
      case "LineString":
        position = geo.getLastCoordinate();
        break;
      default:
    }
    if (position) {
      let map = this.getMap().map;
      let overlay = null,
        t = "project",
        data = [];
      let res = await ListAction.checkItem().catch((err) => {});
      if (res) {
        if (res.code === 0) {
          t = "project";
        }
      } else {
        t = "project";
      }
      data =
        t === "project"
          ? ListAction.projects.map((item) => {
              return { ...item, text: item.board_name, key: item.board_id };
            })
          : DetailAction.CollectionGroup.map((item) => {
              return { ...item, text: item.name, key: item.id };
            });

      let ele = new addFeatureOverlay({ dataSource: data, width: 300 }, t);
      overlay = createOverlay(ele.element, {
        positioning: "bottom-left",
        position: position,
        offset: [-10, -30],
      });
      map.addOverlay(overlay);
      ele.on = {
        onClose: (tp) => {
          // ele.close();
          if (tp === "close") {
            overlay.setPosition(null);
          } else {
            map.removeOverlay(overlay);
            overlay.setPosition(null);
            this.plotLayer.removeFeature(operator);
          }
          Event.Evt.un("FeatureOnAddCalcel");
          Event.Evt.un("FeatureOnAddSure");
        },
        onInput: (val) => {},
        onConfirm: (val) => {
          if (!val.name) return message.warn("请输入名称");
          if (t === "project")
            this.save2Project(val, feature, operator, ele, overlay);
          if (t === "group")
            this.save2Group(val, feature, operator, ele, overlay);
        },
        onAdd: (type) => {
          if (type === "project") {
            overlay.setPosition(null);
            ListAction.addDrawBoard()
              .then((f) => {
                let ft = f.feature;
                let coor = ft.getGeometry().getCoordinates();
                ListAction.addBoardOverlay(coor, { viewToCenter: 1 })
                  .then((obj) => {
                    // console.log(obj);
                    let param = {
                      board_name: obj.name,
                      remark: obj.remark,
                      lng: coor[0],
                      lat: coor[1],
                    };
                    ListAction.addBoard(param)
                      .then((resp) => {
                        overlay.setPosition(position);
                        message.success("新建项目成功");
                        ListAction.projects.push(resp.data);
                        ele.data &&
                          (ele.data.dataSource = ListAction.projects.map(
                            (item) => {
                              return {
                                ...item,
                                text: item.board_name,
                                key: item.board_id,
                              };
                            }
                          ));
                        ele.updateMenus();
                      })
                      .catch((err) => {
                        overlay.setPosition(position);
                        message.error("新建项目失败，请稍后再试");
                      });
                    ListAction.removeDraw();
                  })
                  .catch((er) => {
                    // 取消绘制了
                    ListAction.removeDraw();
                    overlay.setPosition(position);
                  });
              })
              .catch((err) => {
                overlay.setPosition(position);
              });
          } else if (type === "group") {
            overlay.setPosition(null);
            Event.Evt.firEvent("FeatureOnAddBtn", type);
            Event.Evt.on("FeatureOnAddCalcel", () => {
              overlay.setPosition(position);
            });
            Event.Evt.on("FeatureOnAddSure", () => {
              let list = DetailAction.CollectionGroup.map((item) => {
                return { ...item, text: item.name, key: item.id };
              });
              ele.data.dataSource = list;
              ele.updateMenus();
              overlay.setPosition(position);
            });
          }
        },
      };
    }
  };
  // 保存到项目
  save2Project = (board, feature, operator, ele, overlay) => {
    let param = {
      coordinates: feature.getGeometry().getCoordinates(),
      geoType: feature.getGeometry().getType(),
      ...operator.attrs,
    };
    let obj = {
      collect_type: 4,
      title: board.name,
      target: "feature",
      area_type_id: "",
      board_id: board.selection.board_id,
      content: JSON.stringify(param),
    };
    DetailAction.addCollection(obj)
      .then((res) => {
        message.success("保存成功,请进入项目查看");
        overlay.setPosition(null);
        this.getMap().map.removeOverlay(overlay);
        this.plotLayer.removeFeature(operator);
      })
      .catch((err) => {
        console.log(err);
        message.error("保存失败，请稍后再试");
      });
  };
  save2Group = (board, feature, operator, ele, overlay) => {
    let param = {
      coordinates: feature.getGeometry().getCoordinates(),
      geoType: feature.getGeometry().getType(),
      ...operator.attrs,
    };
    let obj = {
      collect_type: 4,
      title: board.name,
      target: "feature",
      area_type_id: board.selection.id,
      board_id: board.selection.board_id,
      content: JSON.stringify(param),
    };
    console.log(board);
    // DetailAction.addCollection(obj).then(res => {
    //   message.success('保存成功,请进入项目查看');
    //   overlay.setPosition(null);
    //   this.getMap().map.removeOverlay(overlay);
    //   this.plotLayer.removeFeature(operator)
    // }).catch(err => {
    //   console.log(err);
    //   message.error('保存失败，请稍后再试');
    // })
  };
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
        customFillSelectedColor: this.fillColor,
      });
    }
    if (this.props.plotType === "point") {
      this.getPointDefaultSymbol();
    }
    switch (this.props.plotType) {
      case "point":
        this.state.symbolSelectedIndex === ""
          ? this.getPointDefaultSymbol()
          : this.getFillSymbol();
        break;
      case "line":
      case "freeLine":
      case "freePolygon":
      case "polygon":
      case "rect":
      case "circle":
      case "arrow":
        this.updateStateCallbackFunc();
        break;
      default:
        break;
    }
  };

  updateStateCallbackFunc = () => {
    let options = {
      ...this.commonStyleOptions,
      strokeColor: this.strokeColor,
      text: this.state.name,
      showName: true,
    };
    let attrs = {
      name: this.state.name,
      featureType:
        this.dic[this.nextProps?.plotType || this.props.plotType] === "Polygon"
          ? this.fillColor
          : this.strokeColor,
      remark: this.state.remark,
      selectName: "自定义类型",
    };
    if (
      this.dic[this.nextProps?.plotType || this.props.plotType] === "Polygon"
    ) {
      options = { ...options, fillColor: this.fillColor };
      attrs = { ...attrs, strokeColor: this.strokeColor };
    }
    const style = createStyle(
      this.dic[this.nextProps?.plotType || this.props.plotType],
      options
    );
    plotEdit.create(
      this.plotDic[this.nextProps?.plotType || this.props.plotType]
    );
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

  getPointDefaultSymbol = () => {
    let iconUrl = this.getCurrentIcon(this.symbol, {
      fontSize: 38,
      fillColor: this.fillColor,
      strokeColor: this.strokeColor,
    });
    let options = {
      ...this.commonStyleOptions,
      text: this.state.name,
      showName: true,
    };
    options = {
      ...options,
      iconUrl: iconUrl,
    };
    this.featureType = iconUrl;
    this.selectName = "自定义类型";
    this.createPlot(options, iconUrl);
  };

  getFillSymbol = (data, index, index2) => {
    if (index !== undefined && index2 !== undefined) {
      this.setState({
        symbolSelectedIndex: `${index}|${index2}`,
      });
    }
    if (data) {
      this.selectName = data.typeName;
      this.symbol = data.target.textContent;
    }
    let iconUrl = this.getCurrentIcon(this.symbol, {
      fontSize: 38,
      fillColor:
        this.props.plotType === "point"
          ? this.fillColor
          : "rgba(80, 130, 255, 1)",
    });
    this.featureType = iconUrl;
    let options = {
      ...this.commonStyleOptions,
      text: this.state.name,
      showName: true,
    };
    switch (this.dic[this.props.plotType]) {
      case "Polygon":
        options = {
          ...options,
          strokeColor: this.strokeColor,
          fillColor: this.fillColor,
          sigleImage: this.featureType
        };
        break;
      default:
        options = {
          ...options,
          iconUrl: iconUrl,
        };
        break;
    }
    this.createPlot(options, iconUrl);
  };

  createPlot = (options, iconUrl) => {
    const plotType = this.nextProps?.plotType || this.props.plotType;
    const style = createStyle(this.dic[plotType], options);
    let attrs = {
      name: this.state.name,
      featureType: this.featureType,
      strokeColor: "",
      remark: this.state.remark,
      selectName: this.selectName,
    };
    if (this.dic[this.props.plotType] === "Polygon") {
      attrs = { ...attrs, sigleImage: iconUrl };
    }
    plotEdit.create(this.plotDic[plotType]);
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
    this.fillColor = "rgba(106, 154, 255, 1)";
    this.strokeColor = "rgba(106, 154, 255, 1)";
    this.nextProps = null;
    this.defaultSymbol = null;
    this.plotLayer = null;
    this.symbol = "";
    this.selectName = "自定义类型";
    this.setState({
      name: "",
      remark: "",
      featureType: "",
      strokeColor: "",
      fillSelectedIndex: -1,
      strokeSelectedIndex: -1,
      customFillSelectedColor: "rgba(106, 154, 255, 1)",
      customStrokeSelectedColor: "rgba(106, 154, 255, 1)",
      symbolSelectedIndex: "",
      strokePercent: "1",
      fillPercent: "1",
    });
    plotEdit.deactivate();
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
            <i
              className={globalStyle.global_icon}
              ref="defaultSymbol"
              style={{ display: "none" }}
            >
              &#xe75d;
            </i>
            {this.props.plotType !== "point" ? (
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
            ) : null}
            {this.props.plotType !== "point" ? (
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
            ) : null}
            {this.props.plotType === "line" ||
            this.props.plotType === "freeLine" ? null : (
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
            )}
            {this.props.plotType === "line" ||
            this.props.plotType === "freeLine" ? null : (
              <div className={styles.block}>
                {this.defeaultColors.map((item, index) => {
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
                        <i className={globalStyle.global_icon}>&#xe75b;</i>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
                    plotType={this.props.plotType}
                    strokeColor={this.state.customStrokeSelectedColor}
                    fillColor={this.state.customFillSelectedColor}
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
