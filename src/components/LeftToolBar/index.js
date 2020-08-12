import React from "react";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./LeftToolBar.less";
import Plot from "./panels/Plot";
import Project from "./panels/Project";
import TempPlot from "./panels/TempPlot";
import ProjectList from "./panels/ProjectList";
import CustomSymbolStore from "./panels/CustomSymbolStore";

import { lineDrawing, pointDrawing, polygonDrawing } from "utils/drawing";
import ListAction from "@/lib/components/ProjectScouting/ScoutingList";

export default class LeftToolBar extends React.Component {
  constructor(props) {
    super(props);
    this.leftTools = [
      {
        name: "项目",
        displayText: false,
        iconfont: "&#xe756;",
        cb: () => {
          this.setState({
            displayPlot: false,
            displayProject: true,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            displayProjectList: false,
          });
          this.deactivate();
        },
      },
      {
        name: "标记点",
        displayText: true,
        iconfont: "&#xe757;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "point",
          });
          this.deactivate();
        },
      },
      {
        name: "描绘",
        displayText: true,
        iconfont: "&#xe63b;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "freeLine",
          });
          this.deactivate();
        },
      },
      {
        name: "直线",
        displayText: true,
        iconfont: "&#xe624;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "line",
          });
          this.deactivate();
        },
      },
      {
        name: "自由面",
        displayText: true,
        iconfont: "&#xe631;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "freePolygon",
          });
          this.deactivate();
        },
      },
      {
        name: "标面",
        displayText: true,
        iconfont: "&#xe625;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "polygon",
          });
          this.deactivate();
        },
      },
      {
        name: "矩形",
        displayText: true,
        iconfont: "&#xe62e;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "rect",
          });
          this.deactivate();
        },
      },
      {
        name: "圆形",
        displayText: true,
        iconfont: "&#xe62f;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "circle",
          });
          this.deactivate();
        },
      },
      {
        name: "箭头",
        displayText: true,
        iconfont: "&#xe62d;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "arrow",
          });
          this.deactivate();
        },
      },
    ];
    this.state = {
      selectedIndex: 0,
      displayPlot: false,
      displayProject: true,
      displayTempPlot: false,
      displayCustomSymbolStore: false,
      plotType: "point",
    };
    this.featureOperatorList = [];
    this.selectFeatureOperatorList = [];
    ListAction.checkItem().then((res) => {
      if (res) {
        if (res.code === 0) {
          this.setState({
            displayTempPlot: false,
          });
        }
      } else {
        this.setState({
          displayTempPlot: true,
        });
      }
    });
  }

  deactivate = () => {
    pointDrawing.deactivate();
    lineDrawing.deactivate();
    polygonDrawing.deactivate();
  };

  updateFeatureOperatorList = (list) => {
    this.featureOperatorList = list;
  };

  updateSelectFeatureOperatorList = (list) => {
    this.selectFeatureOperatorList = list;
  };

  // 编辑标绘回调
  editPlot = (operator) => {
    const geometryType = operator.feature?.getGeometry().getType();
    switch (geometryType) {
      case "Point":
        break;
      case "LineString":
        break;
      case "Polygon":
        break;
      default:
        break;
    }
  };

  render() {
    let tempPlotItemStyle = { bottom: 60, left: 4, background: "none" };
    let customSymbolStoreStyle = { bottom: 0, left: 4, background: "none" };
    const selectStyle = { background: "#3863d0" };
    if (this.state.displayTempPlot) {
      tempPlotItemStyle = { ...tempPlotItemStyle, ...selectStyle };
    }
    if (this.state.displayCustomSymbolStore) {
      customSymbolStoreStyle = { ...customSymbolStoreStyle, ...selectStyle };
    }
    return (
      <div
        className={styles.wrapper}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <div className={styles.circle}>
          {/* <img alt="" src=""></img> */}
          <i className={globalStyle.global_icon} style={{ fontSize: 26 }}>
            &#xe764;
          </i>
        </div>
        <ul>
          {this.leftTools.map((item, index) => {
            let displayText = true;
            if (
              item.displayText === false ||
              this.state.selectedIndex === index
            ) {
              displayText = false;
            }
            const divStyle = displayText ? {} : { display: "table" };
            const iStyle = displayText
              ? {}
              : { display: "table-cell", verticalAlign: "middle" };
            return (
              <li key={`${item.iconfont}-${index}`}>
                <div
                  className={`${styles.item} ${
                    this.state.selectedIndex === index ? styles.active : ""
                  }`}
                  style={divStyle}
                  onClick={() => {
                    this.setState({
                      selectedIndex: index,
                      displayTempPlot: false,
                    });
                    item.cb && item.cb();
                  }}
                >
                  <i
                    className={globalStyle.global_icon}
                    dangerouslySetInnerHTML={{ __html: item.iconfont }}
                    style={iStyle}
                  ></i>
                  {displayText ? (
                    <p>
                      <span>{item.name}</span>
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        <div
          className={`${styles.circle} ${styles.temp}`}
          onClick={() => {
            this.setState({
              selectedIndex: -1,
              displayPlot: false,
              displayProject: false,
              displayTempPlot: true,
              displayCustomSymbolStore: false,
              plotType: "",
            });
          }}
          style={tempPlotItemStyle}
        >
          <i
            className={globalStyle.global_icon}
            style={{ fontSize: 30, color: "#fff" }}
          >
            &#xe765;
          </i>
        </div>
        <div
          className={`${styles.circle} ${styles.temp}`}
          onClick={() => {
            this.setState({
              selectedIndex: -1,
              displayPlot: false,
              displayProject: false,
              displayTempPlot: false,
              displayCustomSymbolStore: true,
              plotType: "",
            });
          }}
          style={customSymbolStoreStyle}
        >
          <i
            className={globalStyle.global_icon}
            style={{ fontSize: 30, color: "#fff" }}
          >
            &#xe7b6;
          </i>
        </div>
        {this.state.displayPlot ? (
          <Plot
            plotType={this.state.plotType}
            featureOperatorList={this.featureOperatorList}
            updateFeatureOperatorList={this.updateFeatureOperatorList}
            goBackProject={() => {
              this.setState({
                displayPlot: false,
                displayProject: true,
                selectedIndex: 0,
              });
            }}
          ></Plot>
        ) : null}
        {this.state.displayProject ? <Project></Project> : null}
        {this.state.displayTempPlot ? (
          <TempPlot
            featureOperatorList={this.featureOperatorList}
            updateFeatureOperatorList={this.updateFeatureOperatorList}
            updateSelectFeatureOperatorList={
              this.updateSelectFeatureOperatorList
            }
            displayProjctList={() => {
              this.setState({
                displayProjectList: true,
                displayTempPlot: false,
              });
            }}
            editPlot={this.editPlot}
          ></TempPlot>
        ) : null}
        {this.state.displayProjectList ? (
          <ProjectList
            featureOperatorList={this.featureOperatorList}
            selectFeatureOperatorList={this.selectFeatureOperatorList}
            goBackTempPlot={(list) => {
              this.setState({
                displayProjectList: false,
                displayTempPlot: true,
              });
            }}
          ></ProjectList>
        ) : null}
        {this.state.displayCustomSymbolStore ? (
          <CustomSymbolStore></CustomSymbolStore>
        ) : null}
      </div>
    );
  }
}
