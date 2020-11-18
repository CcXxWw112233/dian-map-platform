import React, { PureComponent } from "react";
import { Input, Button, Tooltip, message, Skeleton } from "antd";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "../LeftToolBar.less";
import ColorPicker from "../../ColorPicker/index";
import { guid } from "./lib";
import { symbols } from "./data";
import { plotEdit } from "../../../utils/plotEdit";
import FeatureOperatorEvent from "../../../utils/plot2ol/src/events/FeatureOperatorEvent";
import { createStyle, TransformCoordinate } from "../../../lib/utils/index";
import Event from "../../../lib/utils/event";

import ListAction from "../../../lib/components/ProjectScouting/ScoutingList";
import DetailAction from "../../../lib/components/ProjectScouting/ScoutingDetail";
import { MyIcon } from "../../utils";
import symbolStoreServices from "../../../services/symbolStore";
import mapApp from "utils/INITMAP";
import { DragPan } from "ol/interaction";

// import { loadGeoJson } from "../tmp"

const SymbolBlock = ({
  data,
  plotTypeName = "未选择",
  indexStr,
  strokeColor,
  fillColor,
  plotType,
  cb,
}) => {
  return (
    <div>
      <div
        style={{
          width: "max-content",
          padding: "0 4px",
          background: "#fff",
          transform: "translate(10px, 10px)",
          fontSize: "12px",
        }}
      >
        {data.item.typeName}
      </div>
      <div
        style={{
          border: "1px solid rgba(226,229,236,1)",
          borderRadius: 8,
          // margin: "20px auto",
        }}
      >
        <div style={{ marginTop: 12, textAlign: "left", marginLeft: 12 }}>
          <span>
            {Number(indexStr?.split("|")[0]) === data.index
              ? plotTypeName
              : "未选择"}
          </span>
        </div>
        <div className={styles.block}>
          {data.item.content.map((item, index) => {
            let style = {};
            let index0 = -1,
              index1 = -1;
            let divStyle = {
              margin: 2,
              borderRadius: 10,
              border: "2px solid #fff",
            };
            if (indexStr !== "") {
              const indexArr = indexStr.split("|");
              index0 = Number(indexArr[0]);
              index1 = Number(indexArr[1]);
              if (index0 === data.index && index1 === index) {
                if (plotType === "point") {
                  style = { color: fillColor };
                }
                divStyle = {
                  margin: 2,
                  borderRadius: 10,
                  border: "2px solid #7FA7FF",
                };
              }
            }
            return (
              <Tooltip
                key={guid(false)}
                title={item.name}
                trigger={["hover", "focus", "click"]}
                placement="top"
              >
                <div style={divStyle}>
                  {item.iconfont && item.iconfont.indexOf("&#") > -1 ? (
                    <i
                      style={style}
                      onClick={(e) => {
                        cb(e, data.index, index, item);
                      }}
                      className={globalStyle.global_icon}
                      dangerouslySetInnerHTML={{ __html: item.iconfont }}
                    ></i>
                  ) : null}
                  {item.iconfont && item.iconfont.indexOf("icon-") > -1 ? (
                    <MyIcon
                      type={item.iconfont}
                      style={{ fontSize: 32, background: "none" }}
                      className={styles.symbol}
                      onClick={(e) => {
                        cb(e, data.index, index, item);
                      }}
                    ></MyIcon>
                  ) : null}
                  {item.color && item.color.length > 0 ? (
                    <div
                      style={
                        item.line
                          ? {
                              width: 44,
                              height: 24,
                              display: "inline-flex",
                            }
                          : {}
                      }
                      onClick={(e) => {
                        cb(e, data.index, index, item);
                      }}
                    >
                      <div
                        className={styles.symbol}
                        style={{
                          background: item.color,
                          border: item.line ? `2px solid ${item.color}` : "",
                          height: item.line ? 0 : "",
                          margin: item.line ? "11px auto" : "",
                          transform: item.line ? "translateY(-1px)" : "",
                        }}
                        // onClick={(e) => {
                        //   cb(e, data.index, index, item);
                        // }}
                      ></div>
                    </div>
                  ) : null}
                  {item.imageUrl ? (
                    <div
                      className={styles.symbol}
                      style={{
                        backgroundImage: `url(${item.imageUrl})`,
                        backgroundColor: "rgba(255,255,255,1)",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "100%",
                      }}
                      onClick={(e) => {
                        cb(e, data.index, index, item);
                      }}
                    ></div>
                  ) : null}
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default class Plot extends PureComponent {
  constructor(props) {
    super(props);
    this.props.onRef(this);
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
      symbols: [],
      openPanel: true,
    };
    this.fillColor = "rgba(106, 154, 255, 1)";
    this.strokeColor = "rgba(106, 154, 255, 1)";
    this.nextProps = null;
    this.defaultSymbol = null;
    this.plotLayer = null;
    this.symbol = "";
    this.sigleImage = null;
    this.selectName = "自定义类型";
    this.selectSymbolName = "";
    this.plotName = "自定义类型#1";
    this.plotRemark = "";
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
      line: "LineString",
      freeLine: "LineString",
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
    this.operatorActive = null;
    this.operatorDeactive = null;
    this.projectId = "";
    this.projectName = "";
    this.activeOperator = null;
    this.selectedPlotZIndex = 0;
    this.baseMapKeys = ["gd_vec|gd_img|gg_img", "td_vec|td_img|td_ter"];
    this.isLoaded = true;
    this.msgtimer = null;
  }
  componentDidMount() {
    this.plotLayer = plotEdit.getPlottingLayer();
    const me = this;
    const { parent } = this.props;
    Event.Evt.firEvent("setAttribute", {
      saveCb: this.handleSaveClick.bind(this),
      delCb: this.updatePlotList.bind(this),
    });
    if (
      this.props.plotType === "freeLine" ||
      this.props.plotType === "freePolygon"
    ) {
      this.setActiveDragPan(false);
    }
    this.operatorActive = function (e) {
      // 激活即修改状态
      parent.isModifyPlot = true;
      let operator = e.feature_operator;
      window.featureOperator = operator;
      if (!operator.isScouting) {
        Event.Evt.firEvent("setAttribute", {
          saveCb: me.handleSaveClick.bind(me),
          delCb: me.updatePlotList.bind(me),
        });
        let tmp = parent.featureOperatorList.filter((tmpOperator) => {
          return tmpOperator.guid === operator.guid;
        })[0];
        if (!tmp) {
          parent.updateFeatureOperatorList(operator);
        }
        me.plotName = window.featureOperator.getName();
        me.plotLayer.setToTop(window.featureOperator);
        ListAction.checkItem()
          .then((res) => {
            if (res) {
              // 选择项目后
              if (res.code === 0) {
                me.projectId = res.data.board_id;
                me.projectName = res.data.board_name;
              } else {
                // 未选择项目
                me.projectId = "";
                me.projectName = "";
                me.savePlot2TempPlot(operator);
              }
            }
          })
          .catch((e) => {
            // 未选择项目
            me.projectId = "";
            me.projectName = "";
            me.savePlot2TempPlot(operator);
          });
        switch (me.props.plotType) {
          case "freePolygon":
          case "polygon":
          case "rect":
          case "circle":
          case "arrow":
            if (me.symbol && me.symbol.indexOf("rgb") < 0) {
              let iconUrl = me.getCurrentIcon(me.symbol, {
                fontSize: 38,
                fillColor: "rgba(80, 130, 255, 1)",
                strokeColor: "rgba(80, 130, 255, 1)",
              });
              plotEdit.plottingLayer.plotEdit.createPlotOverlay(
                iconUrl,
                operator
              );
            }
            break;
          default:
            break;
        }
      } else {
      }
    };
    this.operatorDeactive = function (e) {
      // if (!e.feature_operator.isScouting) {
      parent.isModifyPlot = false;
      me.symbol = null;
      me.sigleImage = null;
      parent.oldPlotName = "";
      parent.oldRemark = "";
      Event.Evt.firEvent("stopEditPlot");
      window.featureOperator && delete window.featureOperator;
      // }
    };
    this.plotLayer.on(FeatureOperatorEvent.ACTIVATE, this.operatorActive);
    this.plotLayer.on(FeatureOperatorEvent.DEACTIVATE, this.operatorDeactive);
    if (!parent.isModifyPlot) {
      if (this.props.plotType === "point") {
        this.symbol = this.refs.defaultSymbol.innerText;
        this.getPointDefaultSymbol();
      } else {
        this.updateStateCallbackFunc();
      }
    } else {
      if (parent.activeFeatureOperator) {
        window.featureOperator = parent.activeFeatureOperator;
        this.plotLayer.plotEdit.activate(window.featureOperator.feature);
      }
    }
    if (parent.isModifyPlot === true) {
      this.plotName = parent.oldPlotName;
      this.plotRemark = parent.oldRemark;
      this.setState({
        name: parent.oldPlotName,
        remark: parent.oldRemark,
      });
    }
    if (parent.customSymbols) {
      const mySymbols = symbols;
      this.setState({
        symbols: [parent.customSymbols, ...mySymbols],
      });
    } else {
      this.getCustomSymbol();
    }
  }
  componentWillUnmount() {
    const { parent } = this.props;
    parent.isModifyPlot = false;
    window.featureOperator = null;
    plotEdit.deactivate();
    this.plotLayer.un(FeatureOperatorEvent.ACTIVATE, this.operatorActive);
    this.plotLayer.un(FeatureOperatorEvent.DEACTIVATE, this.operatorDeactive);
    this.setActiveDragPan(true);
  }

  componentWillReceiveProps(nextProps) {
    this.handleResetClick();
    if (nextProps.hidden === false) {
      const { parent } = this.props;
      if (parent.isModifyPlot === true) {
        this.plotName = parent.oldPlotName;
        this.plotRemark = parent.oldRemark;

        this.setState({
          name: parent.oldPlotName,
          remark: parent.oldRemark,
        });
        if (parent.activeFeatureOperator) {
          window.featureOperator = parent.activeFeatureOperator;
          this.plotLayer.plotEdit.activate(window.featureOperator.feature);
        }
      } else {
        this.createPlotName();
        this.nextProps = nextProps;
        if (nextProps.plotType === "point") {
          this.symbol = this.refs.defaultSymbol.innerText;
          this.getPointDefaultSymbol();
        } else {
          this.updateStateCallbackFunc();
        }
        if (
          nextProps.plotType === "freeLine" ||
          nextProps.plotType === "freePolygon"
        ) {
          this.setActiveDragPan(false);
        } else {
          this.setActiveDragPan(true);
        }
      }
    } else {
      this.setActiveDragPan(true);
    }
  }

  setActiveDragPan = (active = true) => {
    let interactions = mapApp.map.getInteractions().getArray();
    interactions.forEach((item) => {
      if (item instanceof DragPan) {
        item.setActive(active);
      }
    });
    if (!active) {
      message.destroy();
      clearTimeout(this.msgtimer);
      this.msgtimer = setTimeout(() => {
        message.destroy();
        message.success("自由绘制中，已锁定图层拖拽", 0);
      }, 50);
    } else {
      clearTimeout(this.msgtimer);
      message.destroy();
    }
  };

  // 获取自定义图标符号
  getCustomSymbol = () => {
    this.isLoaded = false;
    const { parent } = this.props;
    const mySymbols = symbols;
    if (parent.customSymbols) {
      this.setState({
        symbols: [parent.customSymbols, ...mySymbols],
      });
    } else {
      this.customSymbols = {
        typeName: "自定义图标",
        type: "point|polygon|freePolygon|rect|circle|arrow",
        content: [],
      };
      symbolStoreServices
        .GET_ICON()
        .then((res) => {
          this.isLoaded = true;
          if (res.code === "0") {
            const data = res.data;
            if (Array.isArray(data)) {
              data.forEach((item) => {
                const temp = { name: item.icon_name, imageUrl: item.icon_url };
                this.customSymbols.content.push(temp);
              });
              parent.customSymbols = this.customSymbols;
              this.getCustomSymbol();
            }
          }
        })
        .catch((err) => {
          this.isLoaded = true;
          const mySymbols = symbols;
          this.setState({
            symbols: mySymbols,
          });
          console.log(err);
        });
    }
  };

  savePlot2TempPlot = (operator) => {
    this.props.updateFeatureOperatorList(operator);
  };

  updatePlotList = (list) => {
    const { parent } = this.props;
    parent.updateFeatureOperatorList2(list);
    if (parent.returnPanel) {
      parent.leftToolBarRef.displayTempPlot();
    }
  };

  // 从数组中找到operator
  findOperatorFromList = (id) => {
    const { parent } = this.props;
    let index = -1;
    for (let i = 0; i < parent.featureOperatorList.length; i++) {
      if (parent.featureOperatorList[i].guid === id) {
        index = i;
        break;
      }
    }
    return index;
  };

  // 创建标绘名称
  createPlotName = () => {
    const { parent } = this.props;
    let count = parent.featureOperatorList.filter((operator) => {
      return operator.attrs.selectName?.indexOf(this.selectName) > -1;
    }).length;
    this.plotName = this.selectName + "#" + (count + 1);
    this.setState({
      name: this.plotName,
    });
  };

  getMap = () => {
    return require("../../../utils/INITMAP").default;
  };
  // 保存标绘到分组
  save2Group = (operator) => {
    return new Promise((resolve, reject) => {
      const { feature } = operator;

      let param = {
        coordinates: feature.getGeometry().getCoordinates(),
        geoType: feature.getGeometry().getType(),
        ...operator.attrs,
      };
      let obj = {
        collect_type: 4,
        title: operator.attrs.name || operator.attrs.title,
        target: "feature",
        area_type_id:
          window.ProjectGroupId === "other" ? "" : window.ProjectGroupId,
        board_id: this.projectId,
        content: JSON.stringify(param),
      };
      let xy = [];
      if (param.geoType === "Point") {
        xy = TransformCoordinate(param.coordinates, "EPSG:3857", "EPSG:4326");
      } else {
        const extent = operator.feature.getGeometry().getExtent();
        let centerPoi = [
          (extent[0] + extent[2]) / 2,
          (extent[1] + extent[3]) / 2,
        ];
        xy = TransformCoordinate(centerPoi, "EPSG:3857", "EPSG:4326");
      }
      window
        .CallWebMapFunction("getCityByLonLat", {
          lon: xy[0],
          lat: xy[1],
        })
        .then((res) => {
          obj.districtcode = res.addressComponent?.adcode;
          // console.log(board);
          DetailAction.addCollection(obj)
            .then((res) => {
              let obj = DetailAction.CollectionGroup.find(
                (item) => item.id === window.ProjectGroupId
              );
              message.success(
                `标绘已成功保存到${this.projectName}的${
                  obj ? obj.name : "未"
                }分组`
              );
              this.plotLayer.removeFeature(operator);
              resolve(res);
            })
            .catch((err) => {
              reject(err);
              console.log(err);
              message.info(err.message);
            });
        });
    });
  };
  handleInputChange = (val) => {
    let newVal = val.replace(/\s+/g, "");
    // if (!newVal) {
    //   message.info("标绘名称不能空白！");
    //   return;
    // }
    this.plotName = newVal;
    this.setState({
      name: newVal,
    });
    if (window.featureOperator) {
      if (!this.plotName) {
        const { parent } = this.props;
        let count = parent.featureOperatorList.filter((operator) => {
          return operator.attrs.selectName?.indexOf(this.selectName) > -1;
        }).length;
        this.plotName = this.selectName + "#" + (count + 1);
      }
      // 更新style
      let style = window.featureOperator.feature.getStyle();
      style.getText().setText(this.plotName);
      window.featureOperator.feature.setStyle(style);
      // 更新attrs
      window.featureOperator.attrs.name = this.plotName;
      window.featureOperator.setName(this.plotName);
    }
  };
  onTextAreaChange = (val) => {
    this.plotRemark = val;
    this.setState({
      remark: val,
    });
    if (window.featureOperator) {
      window.featureOperator.attrs.remark = this.plotRemark;
    }
  };

  updateStateCallbackFunc = () => {
    const { parent } = this.props;
    if (!parent.isModifyPlot) {
      this.createPlotName();
    }
    if (
      this.props.plotType === "freeLine" ||
      this.props.plotType === "freePolygon"
    )
      this.setActiveDragPan(false);
    let options = {
      ...this.commonStyleOptions,
      strokeColor: this.strokeColor,
      text: this.plotName,
      showName: true,
    };
    let attrs = {
      name: this.plotName,
      featureType:
        this.dic[this.nextProps?.plotType || this.props.plotType] === "Polygon"
          ? this.fillColor
          : this.strokeColor,
      remark: this.state.remark,
      selectName: "自定义类型",
      plotType: this.props.plotType,
      geometryType: this.dic[this.props.plotType],
      coordSysType: 0,
    };
    if (this.baseMapKeys[0].indexOf(mapApp.baseMapKey) === -1) {
      attrs.coordSysType = 1;
    }
    const plotType = this.nextProps?.plotType || this.props.plotType;
    if (this.dic[plotType] === "Polygon") {
      options = { ...options, fillColor: this.fillColor };
      attrs = { ...attrs, strokeColor: this.strokeColor };
    } else if (this.dic[plotType] === "Point") {
      const iconUrl = this.getCurrentIcon(this.symbol, {
        fontSize: 38,
        fillColor: this.fillColor,
        strokeColor: this.strokeColor,
      });
      options = {
        ...options,
        iconUrl: iconUrl,
      };
      attrs.featureType = iconUrl;
    }
    const style = createStyle(
      this.dic[this.nextProps?.plotType || this.props.plotType],
      options
    );
    if (parent.isModifyPlot === false) {
      let drawing = plotEdit.create(
        this.plotDic[this.nextProps?.plotType || this.props.plotType]
      );
      Event.Evt.firEvent("setPlotDrawStyle", style);
      Event.Evt.firEvent("setAttribute", {
        style: style,
        attrs: attrs,
        // saveCb: this.handleSaveClick.bind(this),
        // delCb: this.updatePlotList.bind(this),
      });
      drawing.plotDraw.on("draw_end", (e) => {
        // console.log(e,'333333333333333')
        this.setActiveDragPan(true);
      });
    } else if (parent.isModifyPlot === true && window.featureOperator) {
      if (window.featureOperator.feature) {
        this.setActiveDragPan(true);
        const geoType = window.featureOperator.feature.getGeometry().getType();
        if (geoType === this.dic[this.props.plotType]) {
          window.featureOperator.feature.setStyle(style);
          window.featureOperator.attrs = attrs;
        } else {
          parent.isModifyPlot = false;
          plotEdit.deactivate();
          delete window.featureOperator;
          this.updateStateCallbackFunc();
        }
      }
    }
  };

  getCurrentIcon = (fontContent, { fontSize, fillColor, strokeColor }) => {
    if (
      fontContent.indexOf("data:image") > -1 ||
      fontContent.indexOf("http") > -1
    ) {
      return fontContent;
    }
    let canvas = document.createElement("canvas");
    canvas.width = fontSize;
    canvas.height = fontSize;
    let context = canvas.getContext("2d");
    context.font = fontSize + "px iconfont";
    context.textAlign = "left";
    context.textBaseline = "top";
    if (fillColor && fillColor !== "") {
      context.fillStyle = fillColor;
      context.strokeStyle = fillColor;
      if (fontContent) {
        context.fillText(fontContent, 0, 0);
      }
    }
    // if (strokeColor && strokeColor !== "") {
    //   context.strokeStyle = strokeColor;
    //   if (fontContent) {
    //     context.strokeText(fontContent, 0, 0);
    //   }
    // }
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

  // 获取默认符号
  getPointDefaultSymbol = () => {
    this.createPlotName();
    let iconUrl = this.getCurrentIcon(this.symbol, {
      fontSize: 38,
      fillColor: this.fillColor,
      strokeColor: this.strokeColor,
    });
    let options = {
      ...this.commonStyleOptions,
      text: this.plotName,
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

  // 点选图标后获取符号的回调
  getFillSymbol = (data, index, index2, typeItem) => {
    if (index !== undefined && index2 !== undefined) {
      if (
        this.dic[this.props.plotType] === "Polygon" ||
        this.dic[this.props.plotType] === "LineString"
      ) {
        if (index !== 0) {
          this.setState({
            symbolSelectedIndex: `${index}|${index2}`,
            fillSelectedIndex: -1,
            strokeSelectedIndex: -1,
          });
        } else {
          this.setState({
            symbolSelectedIndex: `${index}|${index2}`,
          });
        }
      } else if (this.dic[this.props.plotType] === "Point") {
        if (index === 0) {
          this.fillColor = "rgba(106, 154, 255, 1)";
          this.setState({
            symbolSelectedIndex: `${index}|${index2}`,
            fillSelectedIndex: -1,
            strokeSelectedIndex: -1,
            customFillSelectedColor: "rgba(106, 154, 255, 1)",
          });
        } else {
          this.setState({
            symbolSelectedIndex: `${index}|${index2}`,
          });
        }
      }
    }
    if (data) {
      this.selectSymbolName = typeItem.name;
      this.selectName = typeItem.name;
      if (data.target.textContent) {
        this.symbol = data.target.textContent;
      } else if (data.currentTarget && typeItem.iconfont) {
        this.fillColor = typeItem.fillColor;
        this.strokeColor = typeItem.fillColor;
        this.symbol = require("../../../assets/plot/marks/" +
          this.selectName +
          ".svg");
      } else {
        this.symbol = typeItem.color || typeItem.imageUrl;
      }
      const { parent } = this.props;
      if (
        parent.isModifyPlot &&
        this.selectName === window.featureOperator.attrs.selectName
      ) {
      } else {
        this.createPlotName();
      }
    }
    let iconUrl = "";
    if (this.symbol.indexOf("rgb") > -1) {
      this.fillColor = this.symbol;
      this.strokeColor = this.symbol;
    } else {
      iconUrl = this.getCurrentIcon(this.symbol, {
        fontSize: 38,
        fillColor:
          this.props.plotType === "point"
            ? this.fillColor
            : "rgba(80, 130, 255, 1)",
        // strokeColor:
        //   this.props.plotType === "point"
        //     ? this.strokeColor
        //     : "rgba(80, 130, 255, 1)",
      });
    }
    if (this.dic[this.props.plotType] === "Point") {
      this.featureType = iconUrl;
    } else if (this.dic[this.props.plotType] === "LineString") {
      this.featureType = this.strokeColor;
    }
    let options = {
      ...this.commonStyleOptions,
      text: this.plotName,
      showName: true,
    };
    switch (this.dic[this.props.plotType]) {
      case "Polygon":
      case "LineString":
        options = {
          ...options,
          strokeColor:
            index === 0 && this.dic[this.props.plotType] === "Polygon"
              ? this.state.customStrokeSelectedColor
              : this.strokeColor,
          fillColor:
            index === 0 && this.dic[this.props.plotType] === "Polygon"
              ? this.state.customFillSelectedColor
              : this.fillColor,
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

  // 创建标绘入口
  createPlot = (options, iconUrl) => {
    const plotType = this.nextProps?.plotType || this.props.plotType;
    const style = createStyle(this.dic[plotType], options);
    let attrs = {
      name: this.plotName,
      strokeColor: this.strokeColor,
      remark: this.plotRemark,
      selectName: this.selectName,
      plotType: this.props.plotType,
      geometryType: this.dic[this.props.plotType],
      coordSysType: 0, //坐标系类型，0代表gcj02，1代表wgs84
    };
    if (this.baseMapKeys[0].indexOf(mapApp.baseMapKey) === -1) {
      attrs.coordSysType = 1;
    }
    if (this.dic[this.props.plotType] === "Polygon") {
      attrs = {
        ...attrs,
        sigleImage: iconUrl,
        featureType: this.fillColor,
      };
    } else {
      attrs = { ...attrs, featureType: this.featureType };
    }
    if (
      this.props.plotType === "freeLine" ||
      this.props.plotType === "freePolygon"
    ) {
      this.setActiveDragPan(false);
    }
    if (!window.featureOperator) {
      let drawing = plotEdit.create(this.plotDic[plotType]);
      Event.Evt.firEvent("setPlotDrawStyle", style);
      Event.Evt.firEvent("setAttribute", {
        style: style,
        attrs: attrs,
      });
      drawing.on("draw_end", () => {
        this.setActiveDragPan(true);
      });
    } else {
      if (window.featureOperator.feature) {
        this.setActiveDragPan(true);
        const geoType = window.featureOperator.feature.getGeometry().getType();
        if (geoType === this.dic[this.props.plotType]) {
          window.featureOperator.feature.setStyle(style);
          window.featureOperator.setName(attrs.name);
          window.featureOperator.attrs = attrs;
          if (this.dic[this.props.plotType] === "Polygon") {
            if (iconUrl) {
              plotEdit.plottingLayer.plotEdit.createPlotOverlay(
                iconUrl,
                window.featureOperator
              );
            } else {
              plotEdit.plottingLayer.plotEdit.removePlotOverlay(
                window.featureOperator
              );
            }
          }
        } else {
          plotEdit.deactivate();
          delete window.featureOperator;
          this.createPlot(options, iconUrl);
        }
      } else {
        plotEdit.deactivate();
        delete window.featureOperator;
        this.createPlot(options, iconUrl);
      }
    }
  };

  handleCustomStrokeColorOkClick = (value) => {
    this.strokeColor = value;
    // this.fillColor = this.state.customFillSelectedColor;
    if (window.featureOperator) {
      plotEdit.plottingLayer.plotEdit.removePlotOverlay(window.featureOperator);
    }
    if (this.dic[this.props.plotType] !== "Point") {
      this.symbol = "";
      this.selectName = "自定义类型";
    } else {
      if (!this.symbol) {
        this.selectName = "自定义类型";
        this.symbol = this.refs.defaultSymbol.innerText;
      }
    }
    this.setState(
      {
        strokeSelectedIndex: -1,
        customStrokeSelectedColor: value,
        symbolSelectedIndex:
          this.props.plotType === "point" ? this.state.symbolSelectedIndex : "",
      },
      () => {
        this.updateStateCallbackFunc();
      }
    );
  };

  handleCustomFillColorOkClick = (value) => {
    this.fillColor = value;
    // this.strokeColor = this.state.customStrokeSelectedColor;
    if (window.featureOperator) {
      plotEdit.plottingLayer.plotEdit.removePlotOverlay(window.featureOperator);
    }
    if (this.dic[this.props.plotType] !== "Point") {
      this.symbol = "";
      this.selectName = "自定义类型";
    } else {
      if (!this.symbol) {
        this.symbol = this.refs.defaultSymbol.innerText;
        this.selectName = "自定义类型";
      }
    }
    this.setState(
      {
        fillSelectedIndex: -1,
        customFillSelectedColor: value,
        symbolSelectedIndex:
          this.props.plotType === "point" ? this.state.symbolSelectedIndex : "",
      },
      () => {
        this.updateStateCallbackFunc();
      }
    );
  };

  handleResetClick = () => {
    this.fillColor = "rgba(106, 154, 255, 1)";
    this.strokeColor = "rgba(106, 154, 255, 1)";
    this.nextProps = null;
    this.defaultSymbol = null;
    this.selectName = "自定义类型";
    this.plotName = "";
    this.plotRemark = "";
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

  plotEditDeactivate = () => {
    plotEdit.deactivate();
  };
  handleSaveClick = () => {
    this.setActiveDragPan(true);
    // 有标绘被选择
    if (window.featureOperator) {
      // 选择了项目
      if (!window.featureOperator.isScouting) {
        if (this.projectId) {
          let featureOperator = window.featureOperator;
          this.save2Group(featureOperator)
            .then((resp) => {
              let data = resp.data;
              let coll = data && data[0];
              if (coll) {
                coll.is_display = "1";
                DetailAction.oldData.push(coll);
                Event.Evt.firEvent(
                  "CollectionUpdate:reload",
                  DetailAction.oldData
                );
              }
              const { parent } = this.props;
              const index = this.findOperatorFromList(featureOperator.guid);
              parent.featureOperatorList.splice(index, 1);
              parent.updateFeatureOperatorList2(parent.featureOperatorList);
              Event.Evt.firEvent("updatePlotFeature");
              this.props.goBackProject();
            })
            .catch((err) => {
              message.info("已保存到临时标绘。");
              plotEdit.deactivate();
            });
        }
        // 未选择项目
        else {
          message.info("已保存到临时标绘。");
          plotEdit.deactivate();
        }
      } else {
        Event.Evt.firEvent("stopEditPlot");
        let data = window.featureOperator.data;
        data.title = this.state.name;
        const { feature } = window.featureOperator;
        let newAttrs = {
          ...window.featureOperator.attrs,
          coordinates: feature.getGeometry().getCoordinates(),
          geoType: feature.getGeometry().getType(),
        };
        newAttrs.coordSysType =
          mapApp.baseMapKeys[0].indexOf(mapApp.baseMapKey) > -1 ? 0 : 1;
        const content = JSON.stringify(newAttrs);
        window.featureOperator.updateFeatueToDB &&
          window.featureOperator.updateFeatueToDB(data, content).then((res) => {
            const { parent } = this.props;
            parent.activeFeatureOperator = null;
            plotEdit.deactivate();
            window.featureOperator && delete window.featureOperator;
            Event.Evt.firEvent("updatePlotFeature");
            this.props.goBackProject();
          });
      }
      const { parent } = this.props;
      if (parent.returnPanel) {
        parent.leftToolBarRef.displayTempPlot();
      }
    } else {
      message.info("请先标绘或选择要保存的标绘。");
    }
  };

  handleDelClick = () => {
    if (window.featureOperator) {
      if (!this.projectId) {
        const { parent } = this.props;
        const index = this.findOperatorFromList(window.featureOperator.guid);
        parent.featureOperatorList.splice(index, 1);
        parent.updateFeatureOperatorList2(parent.featureOperatorList);
      }
      this.plotLayer.removeFeature(window.featureOperator);
      window.featureOperator && delete window.featureOperator;
    }
    plotEdit.deactivate();
  };

  render() {
    const { TextArea } = Input;
    const disableStyle = { color: "rgba(0,0,0,0.2)" };
    const style = { marginTop: 18, marginRight: 10 };
    const { plotType } = this.props;
    return (
      <div
        style={{ width: "100%", height: "100%" }}
        className={this.props.hidden ? styles.hidden : ""}
      >
        <div
          className={styles.header}
          style={{ padding: "0 20px", marginBottom: 10 }}
        >
          <i
            className={globalStyle.global_icon}
            onClick={() => this.props.goBackProject()}
            title="返回到项目(列表)"
          >
            &#xe758;
          </i>
          <i
            className={globalStyle.global_icon}
            title="重置"
            onClick={this.handleResetClick}
          >
            &#xe7ce;
          </i>
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
            <div>
              <div
                style={{
                  width: "max-content",
                  padding: "0 4px",
                  background: "#fff",
                  transform: "translate(10px, 10px)",
                  fontSize: "12px",
                }}
              >
                自定义颜色
              </div>
              <div
                style={{
                  width: "100%",
                  height: "60px",
                  border: "1px solid rgba(226,229,236,1)",
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "row",
                  padding: "0 14px",
                }}
              >
                <div className={styles.header} style={style}>
                  <span
                    style={
                      this.dic[plotType] === "Point"
                        ? {
                            ...disableStyle,
                            ...{ fontSize: "14px" },
                          }
                        : { fontSize: "14px" }
                    }
                  >
                    轮廓色
                  </span>
                  <div
                    className={styles.colorbar}
                    style={{
                      background:
                        this.dic[plotType] === "Point"
                          ? "rgba(0,0,0,0.2)"
                          : this.state.customStrokeSelectedColor,
                      margin: 8,
                      width: "calc(100% - 74px)",
                    }}
                  ></div>
                  <ColorPicker
                    handleOK={this.handleCustomStrokeColorOkClick}
                    disable={this.dic[plotType] === "Point" ? false : true}
                  ></ColorPicker>
                </div>
                <div className={styles.header} style={style}>
                  <span
                    style={
                      this.dic[plotType] === "LineString"
                        ? {
                            ...disableStyle,
                            ...{ fontSize: "14px" },
                          }
                        : { fontSize: "14px" }
                    }
                  >
                    填充色
                  </span>
                  <div
                    className={styles.colorbar}
                    style={{
                      background:
                        this.dic[plotType] === "LineString"
                          ? "rgba(0,0,0,0.2)"
                          : this.state.customFillSelectedColor,
                      margin: 8,
                      width: "calc(100% - 74px)",
                    }}
                  ></div>
                  <ColorPicker
                    handleOK={this.handleCustomFillColorOkClick}
                    disable={this.dic[plotType] === "LineString" ? false : true}
                  ></ColorPicker>
                </div>
              </div>
            </div>
            {this.state.symbols.length > 0 ? (
              this.state.symbols.map((item, index) => {
                if (item.type.indexOf(plotType) >= 0) {
                  return (
                    <SymbolBlock
                      key={guid(false)}
                      data={{ item: item, index: index }}
                      plotTypeName={this.selectSymbolName}
                      indexStr={this.state.symbolSelectedIndex}
                      plotType={plotType}
                      strokeColor={this.state.customStrokeSelectedColor}
                      fillColor={this.state.customFillSelectedColor}
                      cb={this.getFillSymbol}
                    ></SymbolBlock>
                  );
                }
                return null;
              })
            ) : (
              <Skeleton active />
            )}
          </div>
        </div>
        <div
          className={styles.footer}
          style={{ display: "flex", flexDirection: "row" }}
        >
          {/* <Button
            block
            style={{
              width: 140,
              height: 36,
              margin: "12px auto",
              background: "rgba(255,85,85,0.2)",
              borderRadius: 4,
              border: "2px solid rgba(255,85,85,0.2)",
              color: "rgba(255, 85, 85, 1)",
            }}
            onClick={this.handleDelClick}
          >
            删除
          </Button> */}
          <Button
            block
            style={{
              width: "100%",
              height: 36,
              margin: "12px auto",
              background: "rgba(163,205,255,0.2)",
              borderRadius: 4,
              border: "2px solid rgba(127,167,255,1)",
              color: "rgba(102, 144, 255, 1)",
            }}
            onClick={this.handleSaveClick}
          >
            保存
          </Button>
        </div>
      </div>
    );
  }
}
