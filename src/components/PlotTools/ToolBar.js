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

export default class ToolBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: "",
      showPlotAddpanel: false,
      showTempPlotPanel: false,
      showSymbolStorePanel: false,
      plotType: "",
      isModifyPlot: false,
      addOtherNum: 0,
    };
    this.tools = [
      {
        key: "symbolStore",
        icon: "&#xe621;",
        name: "符号库",
        cb: () => {
          this.handleToolClick("symbolStore");
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
          this.setState({
            showPlotAddpanel: true,
            showTempPlotPanel: false,
            showSymbolStorePanel: false,
            plotType: "Point",
            isModifyPlot: false,
          });
        },
      },
      {
        key: "linePlot",
        icon: "&#xe624;",
        name: "标记线",
        cb: () => {
          this.handleToolClick("linePlot");
          this.setState({
            showPlotAddpanel: true,
            showTempPlotPanel: false,
            showSymbolStorePanel: false,
            plotType: "LineString",
            isModifyPlot: false,
          });
        },
      },
      {
        key: "polygonPlot",
        icon: "&#xe625;",
        name: "标记面",
        cb: () => {
          this.handleToolClick("polygonPlot");
          this.setState({
            showPlotAddpanel: true,
            showTempPlotPanel: false,
            showSymbolStorePanel: false,
            plotType: "Polygon",
            isModifyPlot: false,
          });
        },
      },
      {
        key: "freePlygonPlot",
        icon: "&#xe631;",
        name: "自由面",
        cb: () => {
          this.handleToolClick("freePlygonPlot");
          this.setState({
            showPlotAddpanel: true,
            showTempPlotPanel: false,
            showSymbolStorePanel: false,
            plotType: "freePolygon",
            isModifyPlot: false,
          });
        },
      },
      {
        key: "arrowPlot",
        icon: "&#xe62d;",
        name: "箭头",
        cb: () => {
          this.handleToolClick("arrowPlot");
          this.setState({
            showPlotAddpanel: true,
            showTempPlotPanel: false,
            showSymbolStorePanel: false,
            plotType: "arrow",
            isModifyPlot: false,
          });
        },
      },
      {
        key: "rectPlot",
        icon: "&#xe62e;",
        name: "矩形",
        cb: () => {
          this.handleToolClick("rectPlot");
          this.setState({
            showPlotAddpanel: true,
            showTempPlotPanel: false,
            showSymbolStorePanel: false,
            plotType: "rect",
            isModifyPlot: false,
          });
        },
      },
      {
        key: "circlePlot",
        icon: "&#xe62f;",
        name: "圆",
        cb: () => {
          this.handleToolClick("circlePlot");
          this.setState({
            showPlotAddpanel: true,
            showTempPlotPanel: false,
            showSymbolStorePanel: false,
            plotType: "circle",
            isModifyPlot: false,
          });
        },
      },
    ];
    this.otherTools = [
      {
        key: "coordinateMeasure",
        icon: "&#xe627;",
        name: "坐标",
        cb: () => {
          this.toggleActive("coordinateMeasure");
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
          this.setState({
            showPlotAddpanel: false,
            showTempPlotPanel: false,
            showSymbolStorePanel: false,
          });
          polygonDrawing.createDrawing();
        },
      },
    ];
  }
  handleToolClick = (key) => {
    this.toggleActive(key);
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
  render() {
    return (
      <div className={styles.wrap}>
        <div className={styles.siderbar}>
          <div
            className={`${styles.tool} ${styles.tempPlot} ${
              this.state.active === "tempPlot" ? styles.active : ""
            }`}
            onClick={() => {
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
          {this.tools.map((tool) => {
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
            onClick={() => {
              if (this.state.addOtherNum < this.otherTools.length) {
                let num = this.state.addOtherNum
                num ++
                this.tools.push(this.otherTools[num -1])
                this.setState({
                  addOtherNum: num
                })
              }
            }}
            style={{ height: 30 }}
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
            plotType={this.state.plotType}
            isModifyPlot={this.state.isModifyPlot}
            showPlotInfoPanel={this.showPlotInfoPanel}
            hideTempPlotPanel={this.hideTempPlotPanel}
            changeActiveBtn={this.handleToolClick.bind(this)}
          ></PlotToolPanel>
        ) : null}
        {this.state.showSymbolStorePanel ? <SymbolStore></SymbolStore> : null}
      </div>
    );
  }
}
