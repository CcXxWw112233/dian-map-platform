import React from "react";
import { Checkbox, Row, Button } from "antd";
import { connect } from "dva";
import styles from "./TempPlotPanel.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import event from "../../lib/utils/event";
import { plotEdit } from "../../utils/plotEdit";
@connect(({ featureOperatorList: { featureOperatorList } }) => ({
  featureOperatorList,
}))
export default class TempPlotPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedList: [],
      indeterminate: false,
      checkAll: false,
      selectedGuid: -1,
    };
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
        const { featureOperatorList } = this.props;
        if (newCheckedList.length === featureOperatorList.length) {
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
  onCheckAllChange = (e) => {
    if (e.target.checked) {
      let newCheckedList = [];
      const { featureOperatorList } = this.props;
      featureOperatorList.forEach((item) => {
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
    const { hideTempPlotPanel } = this.props;
    hideTempPlotPanel();
  };

  handleEditClick = (featureOperator) => {
    window.featureOperator = featureOperator;
    plotEdit.plottingLayer.plotEdit.activate(featureOperator.feature);
    const { dispatch, showPlotInfoPanel, changePlotType } = this.props;
    // 更新模态框数据
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
    showPlotInfoPanel(true);
    changePlotType(featureOperator.attrs.geometryType);
  };

  handleDelClick = (featureOperator) => {
    const { dispatch, featureOperatorList } = this.props;
    let newList = [...featureOperatorList];
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
    dispatch({
      type: "featureOperatorList/updateList",
      payload: {
        featureOperatorList: newList2,
      },
    });
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
        if (attrs.featureType.indexOf("https") === 0) {
          image = attrs.featureType;
        } else {
          tempIconUrl = attrs.featureType.replace("img", "");
          image = require("../../assets" + tempIconUrl);
        }
        style = {
          ...style,
          backgroundImage: `url(${image})`,
          backgroundColor: "rgba(255,255,255,1)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "100%",
        };
      }
      if (attrs.featureType.indexOf("rgb") > -1) {
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
      return style;
    }
    return null;
  };

  getSelectedData = () => {
    let { featureOperatorList } = this.props;
    let { checkedList } = this.state;

    let list = checkedList.map((item) => {
      let obj = featureOperatorList.find((feature) => feature.guid === item);
      return obj;
    });
    return list;
  };

  // 转存到项目
  saveToProject = () => {
    const me = this;
    delete window.featureOperator;
    const { plottingLayer } = plotEdit;
    let { dispatch, featureOperatorList } = this.props;
    let arr = this.getSelectedData();
    if (arr.length) {
      // 转存
      event.Evt.firEvent("hasFeatureToProject", arr);
      // 转存之后的回调
      event.Evt.on("appendToProjectSuccess", (val) => {
        // console.log(val);
        let array = [...featureOperatorList];
        val.forEach((item) => {
          let index = array.findIndex((feature) => feature.guid === item.guid);
          if (index >= 0) {
            plottingLayer.removeFeature(array[index]);
            // 删除转存成功的数据
            array.splice(index, 1);
          }
        });
        me.setState({
          checkedList: [],
        });
        me.setState({
          indeterminate: false,
          checkAll: false,
        });
        let newList2 = [];
        array.forEach((item) => {
          if (item.attrs.name) {
            newList2.push(item);
          }
        });
        dispatch({
          type: "featureOperatorList/updateList",
          payload: {
            featureOperatorList: newList2,
          },
        });
      });
    }
  };
  handleRowClick = (featureOperator) => {
    this.setState({
      selectedGuid: featureOperator.guid,
    });
    if (featureOperator.feature) {
      plotEdit.map
        .getView()
        .fit(featureOperator.feature?.getGeometry().getExtent(), {
          size: plotEdit.map.getSize(),
          duration: 1000,
        });
    }
  };

  render() {
    const { featureOperatorList } = this.props;

    return (
      <div className={styles.wrap}>
        <div className={styles.header}>
          <span>临时标绘</span>
          <i
            className={`${globalStyle.global_icon} ${globalStyle.btn}`}
            style={{ fontSize: 14, float: "right" }}
            onClick={this.handleCloseClick}
          >
            &#xe632;
          </i>
        </div>
        {featureOperatorList.length > 0 ? (
          <div className={styles.body}>
            <div className={styles.checkAll} style={{ marginLeft: 10 }}>
              <Checkbox
                class={styles.row}
                onChange={this.onCheckAllChange}
                indeterminate={this.state.indeterminate}
                checked={this.state.checkAll}
              >
                全选
              </Checkbox>
            </div>
            <div className={`${styles.content} ${globalStyle.autoScrollY}`}>
              {featureOperatorList.map((featureOperator, index) => {
                return (
                  <Row
                    key={index}
                    className={`${styles.myRow} ${
                      this.state.selectedGuid === featureOperator.guid
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => this.handleRowClick(featureOperator)}
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
                    <div className={styles.text}>
                      <span>{featureOperator.attrs.name}</span>
                    </div>
                    <div
                      className={styles.edit}
                      onClick={() => this.handleEditClick(featureOperator)}
                    >
                      <span>编辑</span>
                    </div>
                    <div
                      className={styles.edit}
                      style={{
                        backgroundColor: "rgba(255,0,0,1)",
                        marginLeft: 10,
                      }}
                      onClick={() => this.handleDelClick(featureOperator)}
                    >
                      <span>删除</span>
                    </div>
                  </Row>
                );
              })}
            </div>
          </div>
        ) : null}

        {featureOperatorList.length > 0 ? (
          <div className={styles.footer}>
            <Button type="primary" block onClick={this.saveToProject}>
              转存到项目
            </Button>
          </div>
        ) : null}
        {featureOperatorList.length === 0 ? (
          <div style={{ marginTop: "60%" }}>
            <p style={{ margin: 0 }}>您还未创建标绘</p>
            <p>请选择相应工具开始创建</p>
          </div>
        ) : null}
      </div>
    );
  }
}
