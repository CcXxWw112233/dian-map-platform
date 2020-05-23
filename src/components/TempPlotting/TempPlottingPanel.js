import React from "react";
import { Checkbox, Row, Button } from "antd";
import { connect } from "dva";
import styles from "./TempPlottingPanel.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import event from "../../lib/utils/event";
import { draw } from "../../utils/draw";
@connect(
  ({
    tempPlotting: { panelVisible, iconVisible },
    featureOperatorList: { featureOperatorList },
  }) => ({
    panelVisible,
    iconVisible,
    featureOperatorList,
  })
)
export default class TempPlottingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedList: [],
      indeterminate: false,
      checkAll: false,
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
    const { dispatch } = this.props;
    dispatch({
      type: "tempPlotting/updateVisible",
      payload: {
        panelVisible: false,
        iconVisible: true,
      },
    });
  };

  handleEditClick = (featureOperator) => {
    window.featureOperator = featureOperator;
    const { dispatch } = this.props;
    // 更新模态框数据
    dispatch({
      type: "modal/updateData",
      payload: {
        isEdit: true,
        featureName: featureOperator.attrs.name || "", // 名称
        selectName: featureOperator.attrs.selectName || "",
        featureType: featureOperator.attrs.featureType || "", // 类型
        remarks: featureOperator.attrs.remark || "", // 备注
        responseData: featureOperator.responseData,
      },
    });
    dispatch({
      type: "modal/setVisible",
      payload: {
        visible: true,
      },
    });
    dispatch({
      type: "plotting/setPotting",
      payload: {
        operator: featureOperator,
        type: featureOperator.attrs.plottingType,
      },
    });
  };

  getStyle = (attrs) => {
    if (attrs && attrs.featureType) {
      let style = {};
      if (attrs.featureType.indexOf("/") > -1) {
        const tempIconUrl = attrs.featureType.replace("img", "");
        const image = require("../../assets" + tempIconUrl);
        style = {
          ...style,
          backgroundImage: `url(${image})`,
          backgroundColor: "rgba(255,255,255,1)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        };
      }
      if (attrs.featureType.indexOf("rgb") > -1) {
        style = { ...style, backgroundColor: attrs.featureType };
      }
      if (attrs.geom.indexOf("POINT") > -1) {
        style = { ...style, borderRadius: 8 };
      }
      if (attrs.geom.indexOf("LINESTRING") > -1) {
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
    const { plottingLayer } = draw;
    let { dispatch, featureOperatorList } = this.props;
    let arr = this.getSelectedData();
    // 转存
    event.Evt.firEvent("hasFeatureToProject", arr);
    // 转存之后的回调
    event.Evt.on("appendToProjectSuccess", (val) => {
      // console.log(val);
      let array = [...featureOperatorList];
      val.forEach((item) => {
        let index = array.findIndex((feature) => feature.guid === item.guid);
        if (index >= 0) {
          // plottingLayer.removeFeature(array[index]);
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
      dispatch({
        type: "featureOperatorList/updateList",
        payload: {
          featureOperatorList: array,
        },
      });
    });
  };

  render() {
    const { panelVisible, featureOperatorList } = this.props;
    let style = panelVisible ? { display: "" } : { display: "none" };
    if (featureOperatorList.length === 0) {
      style = { display: "none" };
    }
    return (
      <div className={styles.wrap} style={style}>
        <div className={styles.header}>
          <span>标绘记录</span>
          <i
            className={`${globalStyle.global_icon} ${globalStyle.btn}`}
            style={{ fontSize: 14, float: "right" }}
            onClick={this.handleCloseClick}
          >
            &#xe626;
          </i>
        </div>
        <div className={styles.body}>
          <div className={styles.checkAll}>
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
                <Row key={index} className={styles.myRow}>
                  <Checkbox
                    key={featureOperator.guid}
                    value={featureOperator.guid}
                    onChange={this.onChange}
                    checked={
                      this.state.checkedList.indexOf(featureOperator.guid) > -1
                    }
                  ></Checkbox>
                  <div
                    className={styles.icon}
                    style={this.getStyle(featureOperator.attrs)}
                  ></div>
                  <div className={styles.text}>
                    <span>{featureOperator.name}</span>
                  </div>
                  <div
                    className={styles.edit}
                    onClick={() => this.handleEditClick(featureOperator)}
                  >
                    <span>编辑</span>
                  </div>
                </Row>
              );
            })}
          </div>
        </div>
        <div className={styles.footer}>
          <Button type="primary" block onClick={this.saveToProject}>
            转存到项目
          </Button>
        </div>
      </div>
    );
  }
}
