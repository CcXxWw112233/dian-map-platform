import React from "react";
import { Checkbox, Row, Button } from "antd";
import { connect } from "dva";
import styles from "./TempPlottingPanel.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
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

  getStyle = (attrs) => {
    debugger
    let style = {};
    if (attrs.featureType.indexOf("/") > -1) {
      const tempIconUrl = attrs.featureType.replace("img", "");
      const image = require("../../assets" + tempIconUrl);
      style = {
        ...style,
        backgroundImage: image,
        backgroundColor: "rgba(255,255,255,1)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
      };
    }
    if (attrs.featureType.indexOf("rgb") > -1) {
      style = { ...style, backgroundColor: attrs.featureType };
    }
    if (attrs.geom.indexOf("LINESTRING") > -1) {
      style = { ...style, height: 0, border: `1px solid ${attrs.featureType}` };
    }
    return style;
  };
  render() {
    const { panelVisible, featureOperatorList } = this.props;
    let style = panelVisible ? { display: "" } : { display: "none" };
    return (
      <div className={styles.wrap} style={style}>
        <div className={styles.header}>
          <span>临时标绘</span>
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
                  {featureOperator.name}
                </Row>
              );
            })}
          </div>
        </div>
        <div className={styles.footer}>
          <Button type="primary" block>
            转存到项目
          </Button>
        </div>
      </div>
    );
  }
}
