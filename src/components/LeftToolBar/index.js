import React from "react";
import { connect } from "dva";

import styles from "./LeftToolBar.less";
import Plot from "./panels/Plot";
import Project from "./panels/Project";
import TempPlot from "./panels/TempPlot";
import ProjectList from "./panels/ProjectList";
import CustomSymbolStore from "./panels/CustomSymbolStore";
import Panel from "./panels/Panel";
import ToolBar from "./toolbar";

import { lineDrawing, pointDrawing, polygonDrawing } from "utils/drawing";

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
    this.leftToolBarRef = null;
    this.projectPlot = null;
  }

  deactivate = () => {
    pointDrawing.deactivate();
    lineDrawing.deactivate();
    polygonDrawing.deactivate();
  };

  updateFeatureOperatorList = (operator) => {
    this._updateFeatureOperatorList(operator);
  };

  _updateFeatureOperatorList = (operator) => {
    this.featureOperatorList = Array.from(new Set(this.featureOperatorList));
    const index = this.findOperatorFromList(operator.guid);
    if (index < 0) {
      this.featureOperatorList.push(operator);
    } else {
      this.featureOperatorList[index] = operator;
    }
    this.leftToolBarRef.updateListLen(this.featureOperatorList.length);
  };

  updateFeatureOperatorList2 = (list) => {
    this.featureOperatorList = Array.from(new Set(list));
    this.leftToolBarRef.updateListLen(this.featureOperatorList.length);
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

  onRef = (ref) => {
    this.leftToolBarRef = ref;
  };
  displayPlotPanel = (attrs, operator) => {
    this.isModifyPlot = true;
    this.activeFeatureOperator = operator;
    if (operator.data) {
      operator.attrs.name = operator.data.title || "";
      operator.setName(operator.attrs.name);
    }
    this.oldPlotName = operator.getName() || operator.attrs.name;
    this.oldRemark = operator.attrs.remark;
    if (!this.state.displayPlot) {
      this.setState({
        plotType: this.dic[attrs.geometryType || attrs.geoType],
        displayPlot: true,
        hidePlot: false,
        displayTempPlot: false,
        displayProject: false,
      });
    } else {
      this.setState({
        plotType: this.dic[attrs.geometryType || attrs.geoType],
        hidePlot: false,
        displayTempPlot: false,
        displayProject: false,
      });
    }
  };
  render() {
    return (
      <div
        className={`${styles.wrapper} ${
          this.props.isShowLeftToolBar ? "" : styles.hidden
        }`}
        style={{ position: "absolute", top: 0, left: 0 }}
        id="leftToolBar"
      >
        <ToolBar
          parent={this}
          onRef={this.onRef}
          selectIndex={this.toolBarSelectedIndex}
        ></ToolBar>
        <Panel>
          <Project
            hidden={this.state.displayProject}
            displayPlotPanel={(attrs, operator) =>
              this.displayPlotPanel(attrs, operator)
            }
          ></Project>
          {this.state.displayPlot ? (
            <Plot
              parent={this}
              plotType={this.state.plotType}
              hidden={this.state.hidePlot}
              updateFeatureOperatorList={this.updateFeatureOperatorList}
              updateFeatureOperatorList2={this.updateFeatureOperatorList2}
              goBackProject={() => {
                this.leftToolBarRef.setState({
                  selectedIndex: 0,
                });
                this.setState({
                  hidePlot: true,
                  displayProject: true,
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
              displayPlotPanel={(attrs, operator) =>
                this.displayPlotPanel(attrs, operator)
              }
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
