import React, { Fragment } from "react";
import { DatePicker, Input } from "antd";
import moment from "moment";

import globalStyle from "@/globalSet/styles/globalStyles.less";

import styles from "./addPlan.less";

import "moment/locale/zh-cn";
import locale from "antd/lib/date-picker/locale/zh_CN";
export default class AddPlan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addStepState: false,
      newStep: "",
    };
  }
  disabledDate = (current) => {
    return current && current < moment().endOf("day");
  };
  range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };
  disabledDateTime = (_, type) => {
    if (type === "start") {
      return {
        disabledHours: () => this.range(0, 60).splice(4, 20),
        disabledMinutes: () => this.range(30, 60),
        disabledSeconds: () => [55, 56],
      };
    }
    return {
      disabledHours: () => this.range(0, 60).splice(20, 4),
      // disabledMinutes: () => this.range(0, 0),
      // disabledSeconds: () => [55, 56],
    };
  };
  addStep = (e) => {
    e.stopPropagation();
    if (this.state.addStepState === false) {
      this.setState({
        addStepState: true,
      });
    }
  };
  addStepInputChange = (value) => {
    this.setState({
      newStep: value,
    });
  };
  handleSaveNewStep = (value) => {
    this.setState({
      addStepState: false,
    });
  };
  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <i
            className={globalStyle.global_icon}
            onClick={() => {
              const { parent } = this.props;
              parent.setState({
                showAddPlan: false,
              });
            }}
          >
            &#xe758;
          </i>
        </div>
        <div
          className={`${styles.body} ${globalStyle.autoScrollY}`}
          style={{ height: "calc(100% - 30px)" }}
        >
          <div className={styles.content}>
            <div className={styles.item}>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(208, 211, 226, 1)" }}
              >
                &#xe7f2;
              </i>
              <div style={{ width: "calc(100% - 20px)", textAlign: "left" }}>
                <span>现场拍照</span>
              </div>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(209, 213, 228, 1)" }}
              >
                &#xe7f1;
              </i>
            </div>
            <div className={styles.item}>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(208, 211, 226, 1)" }}
              >
                &#xe7f2;
              </i>
              <div style={{ width: "calc(100% - 20px)", textAlign: "left" }}>
                <span>现场拍照</span>
              </div>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(209, 213, 228, 1)" }}
              >
                &#xe7d0;
              </i>
            </div>
            <div className={styles.item}>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(209, 213, 228, 1)" }}
              >
                &#xe7f2;
              </i>
              <div style={{ width: "calc(100% - 20px)", textAlign: "left" }}>
                <span>现场拍照</span>
              </div>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(209, 213, 228, 1)" }}
              >
                &#xe7d0;
              </i>
            </div>
            <div
              className={`${styles.item} ${styles.add}`}
              onClick={this.addStep}
            >
              {!this.state.addStepState ? (
                <Fragment>
                  <i
                    className={globalStyle.global_icon}
                    style={{ color: "rgba(101, 143, 255, 1)" }}
                  >
                    &#xe7dc;
                  </i>
                  {/* <Input placeholder="添加步骤" bordered={false}/> */}
                  <span style={{ color: "rgba(101, 143, 255, 1)" }}>
                    添加步骤
                  </span>
                </Fragment>
              ) : (
                <Fragment>
                  <i
                    className={globalStyle.global_icon}
                    style={{ color: "rgb(208, 211, 226)" }}
                  >
                    &#xe7f2;
                  </i>
                  <Input
                    allowClear
                    placeholder="添加步骤"
                    value={this.state.newStep}
                    onChange={(e) => this.addStepInputChange(e.target.value)}
                    onPressEnter={(e) => this.handleSaveNewStep(e.target.value)}
                  />
                </Fragment>
              )}
            </div>
            <div className={styles.item}>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(106, 154, 255, 1)" }}
              >
                &#xe7f4;
              </i>
              {/* <span>提醒我</span> */}
              <DatePicker
                allowClear
                size="small"
                placeholder="提醒我"
                bordered={false}
                style={{ width: "calc(100% - 50px", padding: 0 }}
                format="YYYY年MM月DD日 HH时mm分ss秒"
                locale={locale}
                disabledDate={this.disabledDate}
                disabledTime={this.disabledDateTime}
                showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
              />
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(209, 213, 228, 1)" }}
              >
                &#xe7d0;
              </i>
            </div>
            <div className={styles.item}>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(106, 154, 255, 1)" }}
              >
                &#xe7f6;
              </i>
              {/* <span>添加截止日期</span> */}
              <DatePicker
                allowClear
                size="small"
                placeholder="添加截止日期"
                bordered={false}
                mode="date"
                format="YYYY年MM月DD日"
                locale={locale}
                style={{ width: "calc(100% - 50px", padding: 0 }}
              />
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(209, 213, 228, 1)" }}
              >
                &#xe7d0;
              </i>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
