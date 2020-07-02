import React, { Component } from "react";

import styles from "./Styles.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { plotEdit } from "utils/plotEdit";
import {
  // boxDrawing, circleDrawing,
  lineDrawing,
  pointDrawing,
  polygonDrawing,
  // arrowDrawing,textDrawing
} from "utils/drawing";
import PlotToolPanel from "./PlotInfoPanel";
import TempPlotPanel from "./TempPlotPanel";
import SymbolStore from "./SymbolStore";
import FeatureOperatorEvent from "../../utils/plot2ol/src/events/FeatureOperatorEvent";
import mapApp from "utils/INITMAP";

import { connect } from "dva";

@connect(() => ({}))
export default class ToolBar extends Component {
  constructor(props) {
    super(props);
    this.tools = [
      {
        key: "symbolStore",
        icon: "&#xe621;",
        name: "符号库",
        cb: () => {
          this.handleToolClick("symbolStore");
          this.deactivate();
          this.setState({
            showPlotAddpanel: false,
            showTempPlotPanel: false,
            showSymbolStorePanel: true,
          });
        },
      },
      {
        key: "pointPlot",
        icon: "&#xe620;",
        name: "标记点",
        cb: () => {
          this.handleToolClick("pointPlot");
          this.deactivate();
          // plotEdit.create("MARKER");
          this.setState(
            {
              showPlotAddpanel: true,
              showTempPlotPanel: false,
              showSymbolStorePanel: false,
              plotType: "Point",
              isModifyPlot: false,
            },
            () => {
              this.child.updateProps();
              this.child.createDefaultPlot("MARKER");
            }
          );
        },
      },
      {
        key: "linePlot",
        icon: "&#xe624;",
        name: "标记线",
        cb: () => {
          this.handleToolClick("linePlot");
          this.deactivate();
          // plotEdit.create("POLYLINE");
          this.setState(
            {
              showPlotAddpanel: true,
              showTempPlotPanel: false,
              showSymbolStorePanel: false,
              plotType: "LineString",
              isModifyPlot: false,
            },
            () => {
              this.child.updateProps();
              this.child.createDefaultPlot("POLYLINE");
            }
          );
        },
      },
      {
        key: "polygonPlot",
        icon: "&#xe625;",
        name: "标记面",
        cb: () => {
          this.handleToolClick("polygonPlot");
          this.deactivate();
          // plotEdit.create("POLYGON");
          this.setState(
            {
              showPlotAddpanel: true,
              showTempPlotPanel: false,
              showSymbolStorePanel: false,
              plotType: "Polygon",
              isModifyPlot: false,
            },
            () => {
              this.child.updateProps();
              this.child.createDefaultPlot("POLYGON");
            }
          );
        },
      },
      {
        key: "freePlygonPlot",
        icon: "&#xe631;",
        name: "自由面",
        cb: () => {
          this.handleToolClick("freePlygonPlot");
          this.deactivate();
          // plotEdit.create("FREEHAND_POLYGON");
          this.setState(
            {
              showPlotAddpanel: true,
              showTempPlotPanel: false,
              showSymbolStorePanel: false,
              plotType: "freePolygon",
              isModifyPlot: false,
            },
            () => {
              this.child.updateProps();
              this.child.createDefaultPlot("FREEHAND_POLYGON");
            }
          );
        },
      },
    ];
    this.otherTools = [
      {
        key: "arrowPlot",
        icon: "&#xe62d;",
        name: "箭头",
        cb: () => {
          this.handleToolClick("arrowPlot");
          this.deactivate();
          // plotEdit.create("FINE_ARROW");
          this.setState(
            {
              showPlotAddpanel: true,
              showTempPlotPanel: false,
              showSymbolStorePanel: false,
              plotType: "arrow",
              isModifyPlot: false,
            },
            () => {
              this.child.updateProps();
              this.child.createDefaultPlot("FINE_ARROW");
            }
          );
        },
      },
      {
        key: "rectPlot",
        icon: "&#xe62e;",
        name: "矩形",
        cb: () => {
          this.handleToolClick("rectPlot");
          this.deactivate();
          // plotEdit.create("RECTANGLE");
          this.setState(
            {
              showPlotAddpanel: true,
              showTempPlotPanel: false,
              showSymbolStorePanel: false,
              plotType: "rect",
              isModifyPlot: false,
            },
            () => {
              this.child.updateProps();
              this.child.createDefaultPlot("RECTANGLE");
            }
          );
        },
      },
      {
        key: "circlePlot",
        icon: "&#xe62f;",
        name: "圆",
        cb: () => {
          this.handleToolClick("circlePlot");
          this.deactivate();
          // plotEdit.create("CIRCLE");
          this.setState(
            {
              showPlotAddpanel: true,
              showTempPlotPanel: false,
              showSymbolStorePanel: false,
              plotType: "circle",
              isModifyPlot: false,
            },
            () => {
              this.child.updateProps();
              this.child.createDefaultPlot("CIRCLE");
            }
          );
        },
      },
      {
        key: "coordinateMeasure",
        icon: "&#xe627;",
        name: "坐标",
        cb: () => {
          this.toggleActive("coordinateMeasure");
          this.deactivate();
          this.setState({
            showPlotAddpanel: false,
            showTempPlotPanel: false,
            showSymbolStorePanel: false,
          });
          pointDrawing.createDrawing();
        },
      },
      {
        key: "distanceMeasure",
        icon: "&#xe62a;",
        name: "距离",
        cb: () => {
          this.toggleActive("distanceMeasure");
          this.deactivate();
          this.setState({
            showPlotAddpanel: false,
            showTempPlotPanel: false,
            showSymbolStorePanel: false,
          });
          lineDrawing.createDrawing();
        },
      },
      {
        key: "areaMeasure",
        icon: "&#xe62c;",
        name: "面积",
        cb: () => {
          this.toggleActive("areaMeasure");
          this.deactivate();
          this.setState({
            showPlotAddpanel: false,
            showTempPlotPanel: false,
            showSymbolStorePanel: false,
          });
          polygonDrawing.createDrawing();
        },
      },
    ];
    this.state = {
      active: "",
      showPlotAddpanel: false,
      showTempPlotPanel: false,
      showSymbolStorePanel: false,
      plotType: "",
      isModifyPlot: false,
      tools: this.tools,
      transformStyle: {},
    };
  }
  componentDidMount() {
    if (!plotEdit.plottingLayer) {
      this.plotLayer = plotEdit.getPlottingLayer();
      const me = this;
      const { dispatch } = this.props;
      this.plotLayer.on(FeatureOperatorEvent.ACTIVATE, (e) => {
        if (!e.feature_operator.isScouting) {
          const featureOperator = e.feature_operator;
          window.featureOperator = featureOperator;
          me.child.changeOKBtnState(false);
          dispatch({
            type: "modal/updateData",
            payload: {
              responseData: featureOperator.responseData,
              featureName: featureOperator.attrs.name,
              selectName: featureOperator.attrs.selectName,
              featureType: featureOperator.attrs.featureType,
              remarks: featureOperator.attrs.remark,
              strokeColorStyle: featureOperator.attrs.strokeColor,
            },
          });
          dispatch({
            type: "plotting/setPotting",
            payload: {
              operator: featureOperator,
              type: featureOperator.attrs.plottingType,
            },
          });
        }
      });
      this.plotLayer.on(FeatureOperatorEvent.DEACTIVATE, (e) => {
        if (!e.feature_operator.isScouting) {
          window.featureOperator && delete window.featureOperator;
          me.child.changeOKBtnState(true);
          me.child.updateOperatorBeforeDeactivate();
          dispatch({
            type: "modal/updateData",
            payload: {
              responseData: null,
              featureName: null,
              selectName: null,
              featureType: null,
              remarks: null,
              strokeColorStyle: null,
            },
          });
          dispatch({
            type: "plotting/setPotting",
            payload: {
              operator: null,
              type: null,
            },
          });
        }
      });

      // 控制标绘字体大小
      mapApp.map.on("moveend", (e) => {
        const zoom = mapApp.map.getView().getZoom();
        this.plotLayer.feature_operators.forEach((operator, index) => {
          let style = operator.feature?.getStyle();
          const text = style.getText();
          if (zoom > 12) {
            text.setFont("15px sans-serif");
            text.setOffsetY(-40);
          } else {
            text.setFont("13px sans-serif");
            text.setOffsetY(-30);
          }
          style.setText(text);
          this.plotLayer.feature_operators[index].feature.setStyle(style);
        });
      });
    }
  }

  deactivate = () => {
    // this.plotLayer && this.plotLayer.plotDraw.deactivate();
    // this.plotLayer && this.plotLayer.plotEdit.deactivate();
    plotEdit.deactivate();
    this.child && this.child.handleOKClick();
    pointDrawing.deactivate();
    lineDrawing.deactivate();
    polygonDrawing.deactivate();
  };
  clearReduxModal = () => {
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
  };
  handleToolClick = (key) => {
    this.toggleActive(key);
    this.clearReduxModal();
  };
  toggleActive = (key) => {
    this.setState({
      active: key,
    });
  };
  hideTempPlotPanel = (value = false) => {
    this.setState({
      showTempPlotPanel: value,
    });
  };
  showPlotInfoPanel = (value = false) => {
    this.setState({
      showPlotAddpanel: value,
      showTempPlotPanel: false,
      showSymbolStorePanel: false,
    });
  };
  changePlotType = (type) => {
    this.setState({
      plotType: type,
      isModifyPlot: true,
    });
  };
  changeActiveBtn = (value) => {
    this.setState({
      active: value,
    });
  };
  onRef = (ref) => {
    this.child = ref;
  };
  render() {
    return (
      <div className={styles.wrap}>
        <div className={styles.siderbar}>
          <div
            className={`${styles.tool} ${styles.tempPlot} ${
              this.state.active === "tempPlot" ? styles.active : ""
            }`}
            onClick={() => {
              this.deactivate();
              this.handleToolClick("tempPlot");
              this.setState({
                showTempPlotPanel: true,
                showPlotAddpanel: false,
                showSymbolStorePanel: false,
              });
            }}
          >
            <span>临时</span>
            <span>标绘</span>
          </div>
          {this.state.tools.map((tool) => {
            return (
              <div
                key={tool.key}
                className={`${styles.tool} ${
                  this.state.active === tool.key ? styles.active : ""
                }`}
                onClick={tool.cb}
              >
                <i
                  className={globalStyle.global_icon + ` ${styles.icon}`}
                  dangerouslySetInnerHTML={{ __html: tool.icon }}
                ></i>
                <p>
                  <span>{tool.name}</span>
                </p>
              </div>
            );
          })}
          <div
            className={`${styles.tool}`}
            style={{ height: 30, ...this.state.transformStyle }}
            onClick={() => {
              if (
                this.state.tools.length <
                this.tools.length + this.otherTools.length
              ) {
                this.setState({
                  tools: [...this.tools, ...this.otherTools],
                  transformStyle: { transform: "rotateX(180deg)" },
                });
              } else {
                this.setState({
                  tools: this.tools,
                  transformStyle: {},
                });
              }
            }}
          >
            <i
              className={globalStyle.global_icon + ` ${styles.icon}`}
              dangerouslySetInnerHTML={{ __html: "&#xe629;" }}
            ></i>
          </div>
        </div>
        {this.state.showTempPlotPanel ? (
          <TempPlotPanel
            hideTempPlotPanel={this.hideTempPlotPanel}
            showPlotInfoPanel={this.showPlotInfoPanel}
            changePlotType={this.changePlotType}
          ></TempPlotPanel>
        ) : null}
        {this.state.showPlotAddpanel ? (
          <PlotToolPanel
            parent={this}
            onRef={this.onRef}
            plotType={this.state.plotType}
            isModifyPlot={this.state.isModifyPlot}
            showPlotInfoPanel={this.showPlotInfoPanel}
            hideTempPlotPanel={this.hideTempPlotPanel}
            changeActiveBtn={this.handleToolClick.bind(this)}
            changeOKBtnState={this.changeOKBtnState}
          ></PlotToolPanel>
        ) : null}
        {this.state.showSymbolStorePanel ? <SymbolStore></SymbolStore> : null}
      </div>
    );
  }
}
