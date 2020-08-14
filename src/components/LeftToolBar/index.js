import React from "react";
import { Badge } from "antd";

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
        iconfont: "&#xe7cc;",
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
      displayTempPlotIcon: false,
      plotType: "point",
      featureOperatorList: [],
    };
    this.featureOperatorList = [];
    this.selectFeatureOperatorList = [];
    this.customSymbols = null;
    this.isModifyPlot = false;
    this.oldPlotName = "";
    this.oldRemark = "";
    this.maxZIndex = 0;
    ListAction.checkItem()
      .then((res) => {
        if (res) {
          if (res.code === 0) {
            this.setState({
              displayTempPlotIcon: false,
            });
          } else {
            this.setState({
              displayTempPlotIcon: true,
            });
          }
        }
      })
      .catch((e) => {
        this.setState({
          displayTempPlotIcon: true,
        });
      });
    // if (this.customSymbols === null) {
    //   this.getCustomSymbol();
    // }
  }

  deactivate = () => {
    pointDrawing.deactivate();
    lineDrawing.deactivate();
    polygonDrawing.deactivate();
  };

  updateFeatureOperatorList = (operator) => {
    ListAction.checkItem()
      .then((res) => {
        if (res) {
          if (res.code !== 0) {
            this._updateFeatureOperatorList(operator);
          }
        }
      })
      .catch((e) => {
        this._updateFeatureOperatorList(operator);
      });
  };

  _updateFeatureOperatorList = (operator) => {
    this.featureOperatorList = Array.from(new Set(this.featureOperatorList));
    const index = this.findOperatorFromList(operator.guid);
    if (index < 0) {
      this.featureOperatorList.push(operator);
    } else {
      this.featureOperatorList[index] = operator;
    }
    if (!this.state.displayTempPlotIcon) {
      this.setState({
        displayTempPlotIcon: true,
      });
    }
  };

  updateFeatureOperatorList2 = (list) => {
    this.featureOperatorList = Array.from(new Set(list));
  };

  // 从数组中找到operator
  findOperatorFromList = (id) => {
    let index = -1;
    for (let i = 0; i < this.featureOperatorList.length; i++) {
      if (this.featureOperatorList[i].guid === id) {
        index = i;
        break;
      }
    }
    return index;
  };

  updateSelectFeatureOperatorList = (list) => {
    this.selectFeatureOperatorList = list;
  };

  getArrDifference = (arr1, arr2) => {
    return arr1.concat(arr2).filter((v, i, arr) => {
      return arr.indexOf(v) === arr.lastIndexOf(v);
    });
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
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#6a9aff",
            zIndex: 9,
          }}
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
          {this.state.displayTempPlotIcon ? (
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
          ) : null}
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
        </div>
        {this.state.displayProject ? <Project></Project> : null}
        {this.state.displayPlot ? (
          <Plot
            parent={this}
            plotType={this.state.plotType}
            customSymbols={this.customSymbols}
            updateFeatureOperatorList={this.updateFeatureOperatorList}
            updateFeatureOperatorList2={this.updateFeatureOperatorList2}
            goBackProject={() => {
              this.setState({
                displayPlot: false,
                displayProject: true,
                selectedIndex: 0,
              });
            }}
          ></Plot>
        ) : null}
        {this.state.displayTempPlot ? (
          <TempPlot
            parent={this}
            displayProjctList={() => {
              this.setState({
                displayProjectList: true,
                displayTempPlot: false,
              });
            }}
            displayPlotPanel={(attrs) => {
              this.isModifyPlot = true;
              this.oldPlotName = attrs.name;
              this.oldRemark = attrs.remark;
              this.setState({
                plotType: attrs.plotType,
                displayPlot: true,
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
              this.featureOperatorList = this.getArrDifference(
                list,
                this.featureOperatorList
              );
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
