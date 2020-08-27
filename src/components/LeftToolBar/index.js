import React from "react";
import { Badge } from "antd";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./LeftToolBar.less";
import Plot from "./panels/Plot";
import Project from "./panels/Project";
import TempPlot from "./panels/TempPlot";
import ProjectList from "./panels/ProjectList";
import CustomSymbolStore from "./panels/CustomSymbolStore";
import Panel from "./panels/Panel";
import Event from "../../lib/utils/event";
import mapApp from "../../utils/INITMAP";
import { TransformCoordinate } from "../../lib/utils/index";
import { plotEdit } from "../../utils/plotEdit";

import { lineDrawing, pointDrawing, polygonDrawing } from "utils/drawing";
import ListAction from "@/lib/components/ProjectScouting/ScoutingList";
import { connect } from "dva";

@connect(({ openswitch: { isShowLeftToolBar, isInvalidToolBar } }) => ({
  isShowLeftToolBar,
  isInvalidToolBar,
}))
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
            hidePlot: false,
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
            hidePlot: false,
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
            hidePlot: false,
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
            hidePlot: false,
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
            hidePlot: false,
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
            hidePlot: false,
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
            hidePlot: false,
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
            hidePlot: false,
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
            hidePlot: false,
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
      hoveredIndex: -1,
      displayPlot: false,
      hidePlot: false,
      displayProject: true,
      displayTempPlot: false,
      displayCustomSymbolStore: false,
      displayTempPlotIcon: false,
      plotType: "point",
      featureOperatorList: [],
    };
    this.dic = {
      Point: "point",
      LineString: "line",
      Polygon: "polygon",
    };
    this.featureOperatorList = [];
    this.selectFeatureOperatorList = [];
    this.customSymbols = null;
    this.isModifyPlot = false;
    this.oldPlotName = "";
    this.oldRemark = "";
    this.systemDic = null;
    this.lastBaseMap = null;
    this.currentBaseMap = null;
    this.baseMapKeys = null;
    this.activeFeatureOperator = null;
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

  handleItemOver = () => {};

  handleItemLeave = () => {};

  render() {
    let tempPlotItemStyle = { bottom: 60, left: 4 };
    let customSymbolStoreStyle = { bottom: 0, left: 4 };
    const selectStyle = { background: "rgba(90, 134, 245, 1)" };
    if (this.state.displayTempPlot) {
      tempPlotItemStyle = { ...tempPlotItemStyle, ...selectStyle };
    }
    if (this.state.displayCustomSymbolStore) {
      customSymbolStoreStyle = { ...customSymbolStoreStyle, ...selectStyle };
    }
    return (
      <div
        className={`${styles.wrapper} ${
          this.props.isShowLeftToolBar ? "" : styles.hidden
        }`}
        style={{ position: "absolute", top: 0, left: 0 }}
        id="leftToolBar"
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#6a9aff",
            zIndex: 9,
          }}
        >
          <div
            className={`${styles.circle} ${
              this.props.isInvalidToolBar ? "invalid" : ""
            }`}
            style={{ background: "#fff" }}
          >
            {/* <img alt="" src=""></img> */}
            <i className={globalStyle.global_icon} style={{ fontSize: 26 }}>
              &#xe764;
            </i>
          </div>
          <div
            className={`${globalStyle.autoScrollY} ${
              this.props.isInvalidToolBar ? "invalid" : ""
            }`}
            style={{ height: "calc(100% - 210px)" }}
          >
            {this.leftTools.map((item, index) => {
              let displayText = true;
              if (
                item.displayText === false ||
                this.state.selectedIndex === index
              ) {
                displayText = false;
              }
              if (this.state.hoveredIndex === index) {
                displayText = false;
              }
              const divStyle = displayText ? {} : { display: "table" };
              const iStyle = displayText
                ? {}
                : { display: "table-cell", verticalAlign: "middle" };
              return (
                <div
                  key={`${item.iconfont}-${index}`}
                  className={`${styles.item} ${
                    this.state.selectedIndex === index ? styles.active : ""
                  }`}
                  style={divStyle}
                  onPointerOver={() => {
                    this.setState({
                      hoveredIndex: index,
                    });
                  }}
                  onPointerLeave={() => {
                    this.setState({
                      hoveredIndex: -1,
                    });
                  }}
                  onPointerDown={() => {
                    this.setState({
                      selectedIndex: index,
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
              );
            })}
          </div>
          <div
            className={`${styles.circle} ${styles.temp}`}
            onClick={() => {
              this.setState({
                selectedIndex: -1,
                displayPlot: false,
                hidePlot: false,
                displayProject: false,
                displayTempPlot: true,
                displayCustomSymbolStore: false,
                plotType: "",
              });
            }}
            style={{ ...tempPlotItemStyle, display: "table" }}
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
                hidePlot: false,
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
        <Panel>
          <Project hidden={this.state.displayProject}></Project>
          {this.state.displayPlot ? (
            <Plot
              parent={this}
              plotType={this.state.plotType}
              hidden={this.state.hidePlot}
              updateFeatureOperatorList={this.updateFeatureOperatorList}
              updateFeatureOperatorList2={this.updateFeatureOperatorList2}
              goBackProject={() => {
                this.setState({
                  hidePlot: true,
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
                  plotType: this.dic[attrs.geometryType],
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
            <CustomSymbolStore parent={this}></CustomSymbolStore>
          ) : null}
        </Panel>
      </div>
    );
  }
}
