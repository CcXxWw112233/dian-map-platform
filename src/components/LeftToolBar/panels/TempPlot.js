import React from "react";

import { Checkbox, Row, Button, message } from "antd";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "../LeftToolBar.less";
import { plotEdit } from "../../../utils/plotEdit";
import ListAction from "../../../lib/components/ProjectScouting/ScoutingList";
import FeatureOperatorEvent from "../../../utils/plot2ol/src/events/FeatureOperatorEvent";

export default class TempPlot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedList: [],
      indeterminate: false,
      checkAll: false,
      selectedGuid: -1,
      featureOperatorList: [],
      displayCreateProject: false,
      openPanel: true,
      isInProject: false,
    };
    this.plotLayer = null;
  }
  componentDidMount() {
    this.plotLayer = plotEdit.getPlottingLayer();
    const { parent } = this.props;
    this.plotLayer &&
      this.plotLayer.on(FeatureOperatorEvent.DEACTIVATE, this.operatorDeactive);
    let newFeatureOperatorList = [];
    parent.featureOperatorList.forEach((operator, index) => {
      let feature = operator.feature;
      if (feature && feature.getGeometry()) {
        feature.getGeometry().updatePlot &&
          feature.getGeometry().updatePlot(false);
        newFeatureOperatorList.push(operator);
      }
    });
    parent.updateFeatureOperatorList2(newFeatureOperatorList);
    this.setState({
      featureOperatorList: newFeatureOperatorList,
    });
    const projects = ListAction.projects;
    if (projects.length > 0) {
      this.setState({
        displayCreateProject: true,
      });
    } else {
      this.setState({
        displayCreateProject: false,
      });
    }
  }
  componentWillUnmount() {
    plotEdit.deactivate();
    this.state.featureOperatorList.forEach((operator) => {
      operator.feature.getGeometry().updatePlot &&
        operator.feature.getGeometry().updatePlot(true);
    });
  }
  onChange = (e) => {
    const oldCheckedList = [...this.state.checkedList];
    let newCheckedList = [];
    if (e.target.checked) {
      newCheckedList = oldCheckedList.concat(e.target.value);
    } else {
      for (let i = 0; i < oldCheckedList.length; i++) {
        if (oldCheckedList[i] === e.target.value) {
          oldCheckedList.splice(i, 1);
          newCheckedList = oldCheckedList;
          break;
        }
      }
    }
    this.setState(
      {
        checkedList: newCheckedList,
      },
      () => {
        const { parent } = this.props;
        if (newCheckedList.length === parent.featureOperatorList.length) {
          this.setState({
            checkAll: true,
            indeterminate: false,
          });
        } else if (newCheckedList.length === 0) {
          this.setState({
            checkAll: false,
            indeterminate: false,
          });
        } else {
          this.setState({
            checkAll: false,
            indeterminate: true,
          });
        }
      }
    );
  };

  saveToProject = () => {
    let arr = this.getSelectedData();
    if (arr.length > 0) {
      const { parent } = this.props;
      parent.updateSelectFeatureOperatorList(arr);
      this.props.displayProjctList();
    } else {
      message.info("请先选择需要保存的标绘。");
    }
  };

  onCheckAllChange = (e) => {
    if (e.target.checked) {
      let newCheckedList = [];
      const { parent } = this.props;
      parent.featureOperatorList.forEach((item) => {
        newCheckedList.push(item.guid);
      });
      this.setState({
        checkAll: true,
        indeterminate: false,
        checkedList: newCheckedList,
      });
    } else {
      this.setState({
        checkAll: false,
        indeterminate: false,
        checkedList: [],
      });
    }
  };
  handleCloseClick = () => {
    const { parent } = this.props;
    parent.hideTempPlotPanel();
  };

  handleEditClick = (e, featureOperator) => {
    e.stopPropagation();
    const { parent } = this.props;
    parent.activeFeatureOperator = featureOperator;
    this.props.displayPlotPanel(featureOperator.attrs, featureOperator, true);
  };

  handleDelClick = (e, featureOperator) => {
    e.stopPropagation();
    if (featureOperator && featureOperator.guid) {
      let newList = [...this.state.featureOperatorList];
      const index = newList.findIndex((item) => {
        return featureOperator.guid === item.guid;
      });
      plotEdit.plottingLayer.removeFeature(newList[index]);
      newList.splice(index, 1);
      let newList2 = [];
      newList.forEach((item) => {
        if (item.attrs.name) {
          newList2.push(item);
        }
      });
      this.setState({
        featureOperatorList: newList2,
      });
      const { parent } = this.props;
      parent.updateFeatureOperatorList2(newList2);
    }
  };

  getStyle = (featureOperator) => {
    if (!featureOperator) return;
    const attrs = featureOperator.attrs;
    const geometryType = featureOperator.feature?.getGeometry().getType();
    if (!geometryType) return;
    let tempIconUrl, image;
    if (attrs && attrs.featureType) {
      let style = {};
      if (attrs.featureType.indexOf("/") > -1) {
        if (
          attrs.featureType.indexOf("https") === 0 ||
          attrs.featureType.indexOf("data:image") > -1
        ) {
          image = attrs.featureType;
        } else {
          tempIconUrl = attrs.featureType.replace("img", "");
          image = require("../../../assets" + tempIconUrl);
        }
        style = {
          ...style,
          backgroundImage: `url(${image})`,
          backgroundColor: "rgba(255,255,255,1)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "100%",
        };
      } else if (attrs.featureType.indexOf("rgb") > -1) {
        style = {
          ...style,
          backgroundColor: attrs.featureType,
          border: `1px solid ${attrs.strokeColor}`,
        };
      }
      if (geometryType?.indexOf("Point") > -1) {
        style = { ...style, borderRadius: 10 };
      }
      if (geometryType?.indexOf("LineString") > -1) {
        style = {
          ...style,
          height: 0,
          border: `1px solid ${attrs.featureType}`,
        };
      }
      if (geometryType?.indexOf("Polygon") > -1) {
        let sigleImage = featureOperator.attrs.sigleImage;
        if (sigleImage) {
          // sigleImage = sigleImage.replace("img", "");
          // sigleImage = require(sigleImage);
          style = {
            ...style,
            backgroundImage: `url(${sigleImage})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "100%",
          };
        }
      }
      return style;
    }
    return null;
  };

  deleteSelectedFeature = () => {
    let arr = this.getSelectedData();
    if (arr.length > 0) {
      let arr = this.getSelectedData();
      arr.forEach((operator) => {
        this.handleDelClick(operator);
      });
    } else {
      message.info("请先选择需要删除的标绘。");
    }
  };

  getSelectedData = () => {
    let { parent } = this.props;
    let { checkedList } = this.state;

    let list = checkedList.map((item) => {
      let obj = parent.featureOperatorList.find(
        (feature) => feature.guid === item
      );
      return obj;
    });
    return list;
  };

  handleRowClick = (e, featureOperator) => {
    e.stopPropagation();
    if (featureOperator && featureOperator.guid) {
      this.setState({
        selectedGuid: featureOperator.guid,
      });
      if (featureOperator.feature) {
        this.plotLayer.setToTop(featureOperator);
        plotEdit.map
          .getView()
          .fit(featureOperator.feature?.getGeometry().getExtent(), {
            size: plotEdit.map.getSize(),
            duration: 1000,
          });
      }
    }
  };

  render() {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <div
          className={styles.header}
          style={{ padding: "0 20px", marginBottom: 10 }}
        >
          <span>临时标绘</span>
        </div>
        <div
          className={styles.body}
          style={{
            height: "calc(100% - 30px)",
          }}
        >
          {this.state.featureOperatorList.length > 0 ? (
            <div
              className={`${styles.content} ${globalStyle.autoScrollY}`}
              style={{ height: "calc(100% - 80px)", padding: 0 }}
            >
              <div className={styles.checkAll} style={{ marginLeft: 10 }}>
                <Checkbox
                  className={styles.row}
                  onChange={this.onCheckAllChange}
                  indeterminate={this.state.indeterminate}
                  checked={this.state.checkAll}
                  style={{ textAlign: "left" }}
                >
                  全选
                </Checkbox>
              </div>
              {this.state.featureOperatorList.map((featureOperator, index) => {
                return (
                  <Row
                    key={featureOperator.guid}
                    className={`${styles.myRow} ${
                      this.state.selectedGuid === featureOperator.guid
                        ? styles.active
                        : ""
                    }`}
                    onClick={(e) => this.handleRowClick(e, featureOperator)}
                  >
                    <div
                      style={{
                        width: 60,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Checkbox
                        key={featureOperator.guid}
                        value={featureOperator.guid}
                        onChange={this.onChange}
                        style={{ marginLeft: 10 }}
                        checked={
                          this.state.checkedList.indexOf(featureOperator.guid) >
                          -1
                        }
                      ></Checkbox>
                      <div
                        className={styles.icon}
                        style={this.getStyle(featureOperator)}
                      ></div>
                    </div>
                    <div
                      className={styles.text}
                      style={{ width: "calc(100% - 116px)" }}
                    >
                      <span>{featureOperator.attrs.name}</span>
                    </div>
                    <div className={styles.edit} style={{ width: 56 }}>
                      <i
                        className={globalStyle.global_icon}
                        style={{
                          fontSize: 18,
                          marginRight: 5,
                          color: "rgba(134,140,164,1)",
                        }}
                        onClick={(e) =>
                          this.handleEditClick(e, featureOperator)
                        }
                      >
                        &#xe759;
                      </i>
                      <i
                        className={globalStyle.global_icon}
                        style={{
                          fontSize: 18,
                          color: "rgba(134,140,164,1)",
                        }}
                        onClick={(e) => this.handleDelClick(e, featureOperator)}
                      >
                        &#xe75a;
                      </i>
                    </div>
                  </Row>
                );
              })}
            </div>
          ) : null}
          {this.state.featureOperatorList.length > 0 ? (
            <div
              className={styles.footer}
              style={{ display: "flex", flexDirection: "row" }}
            >
              <Button
                block
                onClick={this.deleteSelectedFeature}
                style={{
                  width: 140,
                  height: 36,
                  margin: "12px auto",
                  background: "rgba(255,85,85,0.2)",
                  borderRadius: 4,
                  border: "2px solid rgba(255,85,85,0.2)",
                  color: "rgba(255, 85, 85, 1)",
                }}
              >
                删除
              </Button>
              <Button
                block
                onClick={this.saveToProject}
                style={{
                  width: 140,
                  height: 36,
                  margin: "12px auto",
                  background: "rgba(163,205,255,0.2)",
                  borderRadius: 4,
                  border: "2px solid rgba(127,167,255,1)",
                  color: "rgba(102, 144, 255, 1)",
                }}
              >
                转存项目/分组
              </Button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                top: "30%",
              }}
            >
              <i
                className={globalStyle.global_icon}
                style={{ fontSize: 50, lineHeight: "50px" }}
              >
                &#xe7d1;
              </i>
              <span>暂无数据</span>
              <span>请先使用标绘工具创建</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}
