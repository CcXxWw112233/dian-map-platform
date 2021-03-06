import React from "react";
import { connect } from "dva";

import styles from "./LeftToolBar.less";
import Plot from "./panels/Plot";
import Project from "./panels/Project";
import AdvancedSearch from "./panels/AdvancedSearch";
import TempPlot from "./panels/TempPlot";
import ProjectList from "./panels/ProjectList";
import CustomSymbolStore from "./panels/CustomSymbolStore";
import SystemManage from "./panels/SystemManage";
import Panel from "./panels/Panel";
import ToolBar from "./toolbar";
import Event from "../../lib/utils/event";
import systemManageServices from "../../services/systemManage";

import { lineDrawing, pointDrawing, polygonDrawing } from "utils/drawing";
import { message } from "antd";

@connect(
  ({ openswitch: { isShowLeftToolBar, isInvalidToolBar, openPanel } }) => ({
    isShowLeftToolBar,
    isInvalidToolBar,
    openPanel
  })
)
export default class LeftToolBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayPlot: false,
      hidePlot: false,
      displayProject: true,
      displaySystemManage: false,
      displayTempPlot: false,
      displayCustomSymbolStore: false,
      displayTempPlotIcon: false,
      plotType: "point",
      featureOperatorList: [],
      projectPermission: null,
      globalPermission: null,
      needUpdate: false,
      displayAdvancedSearch: false
    };
    this.dic = {
      Point: "point",
      LineString: "line",
      Polygon: "polygon"
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
    this.plotRef = null;
    this.projectRef = null;
    this.returnPanel = null;
    this.isGeojsonMifyIcon = false;

    this.selectedAreas = [];
    this.selectedBrands = [];
    this.keywordState = "";
    this.selectedStarKeys = [];
    this.personNum = 20;
    this.lowerLimitPrice = 0;
    this.upperLimitPrice = 1000;
    this.rangeTime = [];

    this.getPersonalPermission();
    Event.Evt.on("displayAdvancedSearchPanel", () => {
      this.setState({
        displayAdvancedSearch: true,
        displayPlot: false,
        displayProject: false,
        displaySystemManage: false,
        displayTempPlot: false,
        displayCustomSymbolStore: false,
        displayTempPlotIcon: false
      });
    });
    Event.Evt.on("displayProjectPanel", () => {
      this.setState({
        displayAdvancedSearch: false,
        displayProject: true
      });
    });
  }

  // ????????????
  getPersonalPermission = () => {
    let promise1 = systemManageServices.getPersonalPermission2Global();
    let promise2 = systemManageServices.getPersonalPermission2Project();
    Promise.all([promise1, promise2])
      .then(res => {
        if (res.length > 0) {
          let globalPermission = {},
            projectPermission = {};
          if (res[0]["code"] === "0") {
            globalPermission = res[0]?.data;
          } else {
            message.error(res[0]?.message);
          }
          if (res[1]["code"] === "0") {
            projectPermission = res[1]?.data;
          } else {
            message.error(res[1]?.message);
          }
          this.setState(
            {
              globalPermission: globalPermission,
              projectPermission: projectPermission
            },
            () => {
              const { dispatch } = this.props;
              dispatch({
                type: "permission/updateDatas",
                payload: {
                  globalPermission: globalPermission,
                  projectPermission: projectPermission
                }
              });
              this.leftToolBarRef &&
                this.leftToolBarRef.setState({
                  update: !this.leftToolBarRef.state.update
                });
              this.projectRef &&
                this.projectRef.setState({
                  update: !this.projectRef.state.update
                });
            }
          );
        }
      })
      .catch(e => {
        console.error(e)
        // message.error(e.message);
      });
  };

  // ??????
  getIndex = (functionCode, type, projectId) => {
    const { globalPermission, projectPermission } = this.state;
    let index = -1;
    let permissionArr = null;
    if (type === "org") {
      if (globalPermission !== null) {
        const keys = Object.keys(globalPermission);
        if (keys.length === 1) {
          permissionArr = globalPermission[keys[0]];
          index =
            permissionArr &&
            permissionArr.findIndex(item => item === functionCode);
        }
      }
    } else {
      if (projectId) {
        if (projectPermission) {
          permissionArr = projectPermission[projectId];
          if (!permissionArr) {
            this.getPersonalPermission();
          }
          index =
            permissionArr &&
            permissionArr.findIndex(item => item === functionCode);
        }
      }
    }
    return index;
  };

  // ??????????????????
  getCollectVisible = (functionCode, projectId) => {
    if (!functionCode) return;
    if (!projectId) return;
    const { projectPermission } = this.state;
    if (!projectPermission) return;
    let arr = projectPermission[projectId];
    let visible = false;
    if (arr && arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        let index = functionCode.findIndex(item => item === arr[i]);
        if (index !== -1) {
          visible = true;
          break;
        }
      }
    }
    return visible;
  };

  getDisabled = (functionCode, type, projectId) => {
    const index = this.getIndex(functionCode, type, projectId);
    return index > -1 ? false : true;
  };

  // ??????
  getStyle = (functionCode, type, projectId) => {
    const index = this.getIndex(functionCode, type, projectId);
    return index === -1
      ? {
          // pointerEvents: "none",
          // cursor: "not-allowed",
          display: "none"
          // background: "hsla(0,0%,100%,.1)",
        }
      : {};
  };

  deactivate = () => {
    pointDrawing.deactivate();
    lineDrawing.deactivate();
    polygonDrawing.deactivate();
  };

  updateFeatureOperatorList = operator => {
    this._updateFeatureOperatorList(operator);
  };

  _updateFeatureOperatorList = operator => {
    this.featureOperatorList = Array.from(new Set(this.featureOperatorList));
    const index = this.findOperatorFromList(operator.guid);
    if (index < 0) {
      this.featureOperatorList.push(operator);
    } else {
      this.featureOperatorList[index] = operator;
    }
    this.leftToolBarRef.updateListLen(this.featureOperatorList.length);
  };

  updateFeatureOperatorList2 = list => {
    this.featureOperatorList = Array.from(new Set(list));
    this.leftToolBarRef.updateListLen(this.featureOperatorList.length);
  };

  // ??????????????????operator
  findOperatorFromList = id => {
    let index = -1;
    for (let i = 0; i < this.featureOperatorList.length; i++) {
      if (this.featureOperatorList[i].guid === id) {
        index = i;
        break;
      }
    }
    return index;
  };

  updateSelectFeatureOperatorList = list => {
    this.selectFeatureOperatorList = list;
  };

  getArrDifference = (arr1, arr2) => {
    return arr1.concat(arr2).filter((v, i, arr) => {
      return arr.indexOf(v) === arr.lastIndexOf(v);
    });
  };

  // ??????????????????
  editPlot = operator => {
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

  onRef = ref => {
    this.leftToolBarRef = ref;
  };

  onPlotRef = ref => {
    this.plotRef = ref;
  };

  onProjectRef = ref => {
    this.projectRef = ref;
  };

  displayPlotPanel = (attrs, operator, returnPanel) => {
    this.isModifyPlot = true;
    this.returnPanel = returnPanel;
    this.activeFeatureOperator = operator;
    if (operator.data) {
      operator.attrs.name = operator.data.title || "";
      operator.setName(operator.attrs.name);
    }
    this.oldPlotName = operator.getName() || operator.attrs.name;
    this.oldRemark = operator.attrs.remark;
    this.leftToolBarRef.updateSelectedPlotType(attrs.plotType);
    if (!this.state.displayPlot) {
      this.setState({
        plotType: this.dic[attrs.geometryType || attrs.geoType],
        displayPlot: true,
        hidePlot: false,
        displayTempPlot: false,
        displayProject: false
      });
    } else {
      this.setState({
        plotType: this.dic[attrs.geometryType || attrs.geoType],
        hidePlot: false,
        displayTempPlot: false,
        displayProject: false
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
          {/* ???????????? */}
          {this.state.displaySystemManage ? (
            <SystemManage></SystemManage>
          ) : null}
          <Project
            hidden={this.state.displayProject}
            parent={this}
            onRef={this.onProjectRef}
            displayPlotPanel={(attrs, operator) =>
              this.displayPlotPanel(attrs, operator)
            }
            projectPermission={this.state.projectPermission}
          ></Project>
          {this.state.displayAdvancedSearch ? (
            <AdvancedSearch parent={this}></AdvancedSearch>
          ) : null}
          {this.state.displayPlot ? (
            <Plot
              parent={this}
              isGeojsonMifyIcon={this.state.isGeojsonMifyIcon}
              plotType={this.state.plotType}
              hidden={this.state.hidePlot}
              onRef={this.onPlotRef}
              updateFeatureOperatorList={this.updateFeatureOperatorList}
              updateFeatureOperatorList2={this.updateFeatureOperatorList2}
              goBackProject={() => {
                this.leftToolBarRef.setState({
                  selectedIndex: 0
                });
                this.setState({
                  hidePlot: true,
                  displayProject: true
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
                  displayTempPlot: false
                });
              }}
              displayPlotPanel={(attrs, operator, returnPanel) =>
                this.displayPlotPanel(attrs, operator, returnPanel)
              }
              editPlot={this.editPlot}
            ></TempPlot>
          ) : null}
          {this.state.displayProjectList ? (
            <ProjectList
              parent={this}
              featureOperatorList={this.featureOperatorList}
              selectFeatureOperatorList={this.selectFeatureOperatorList}
              goBackTempPlot={list => {
                this.featureOperatorList = this.getArrDifference(
                  list,
                  this.featureOperatorList
                );
                this.setState({
                  displayProjectList: false,
                  displayTempPlot: true
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
