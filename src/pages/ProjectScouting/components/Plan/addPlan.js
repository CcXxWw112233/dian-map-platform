import React, { Fragment } from "react";
import { message, DatePicker, Input } from "antd";
import moment from "moment";

import globalStyle from "@/globalSet/styles/globalStyles.less";

import styles from "./addPlan.less";

import "moment/locale/zh-cn";
import locale from "antd/lib/date-picker/locale/zh_CN";

import planServices from "../../../../services/planServices";
export default class AddPlan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addStepState: false,
      newStep: "",
      newPlan: "",
      isAdd: true,
      taskDetails: [],
      endTime: null,
    };
  }

  componentDidMount() {
    this.getDetails();
  }

  getDetails = () => {
    const { isAdd, planId } = this.props;
    if (!isAdd) {
      this.setState({
        isAdd: isAdd,
      });
      if (planId) {
        planServices.getPlanDetail(planId).then((res) => {
          if (res && res.code === "0") {
            if (res.data) {
              if (res.data.end_time) {
                const timestamp = res.data.end_time;
                let date = new Date();
                date.setTime(timestamp);
                let y = date.getFullYear();
                let m = date.getMonth() + 1;
                m = m < 10 ? "0" + m : m;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;

                this.setState({
                  endTime: y.toString() + m.toString() + d.toString(),
                });
              }
              this.setState({
                newPlan: res.data.name,
                taskDetails: res.data.child_tasks || [],
              });
            }
          }
        });
      }
    }
  };

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

  getPlanDetail = () => {};
  handleSaveNewStep = (value) => {
    // planServices.updateBoardTask("", )
    this.setState({
      addStepState: false,
    });
    if (!value) return;
    if (value.trim() === "") return;
    const { boardId, planId, planGroupId } = this.props;
    planServices
      .createBoardTask(boardId, planGroupId, value, planId)
      .then((res) => {
        if (res && res.code === "0") {
          planServices.getPlanDetail(planId).then((res) => {
            if (res && res.code === "0") {
              if (res.data) {
                this.setState({
                  newPlan: res.data.name,
                  taskDetails: res.data.child_tasks || [],
                });
              }
            }
          });
          this.setState({
            isAdd: false,
            newStep: "",
          });
        } else {
          message.warn(res.message);
        }
      });
  };
  addPlanInputChange = (value) => {
    this.setState({
      newPlan: value,
    });
  };
  handleSaveNewPlan = (value) => {
    if (!value) return;
    if (value.trim() === "") return;
    const { boardId, planGroupId } = this.props;
    planServices.createBoardTask(boardId, planGroupId, value).then((res) => {
      if (res && res.code === "0") {
        this.setState({
          isAdd: false,
        });
      } else {
        message.warn(res.message);
      }
    });
  };
  handleDelPlanClick = (data) => {
    if (!data) return;
    const { planId } = this.props;
    planServices.deleteBoardTask(data.id).then((res) => {
      if (res && res.code === "0") {
        planServices.getPlanDetail(planId).then((res) => {
          if (res && res.code === "0") {
            if (res.data) {
              this.setState({
                newPlan: res.data.name,
                taskDetails: res.data.child_tasks || [],
              });
            }
          }
        });
      } else {
        message.warn(res.message);
      }
    });
  };
  handleLastDateClick = (value) => {
    const timestamp = value._d.getTime();
    const { planId } = this.props;
    planServices.updateBoardTask(timestamp, planId, "").then((res) => {
      if (res && res.code === "0") {
      } else {
        message.warn(res.message);
      }
    });
  };
  handleClearEndTime = () => {
    const { planId } = this.props;
    planServices.updateBoardTask("", planId, "", "1").then((res) => {
      if (res && res.code === "0") {
        this.setState({
          endTime: undefined,
        });
      } else {
        message.warn(res.message);
      }
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
            {this.state.isAdd ? (
              <div className={styles.item}>
                <i
                  className={globalStyle.global_icon}
                  style={{ color: "rgba(208, 211, 226, 1)" }}
                >
                  &#xe7f2;
                </i>
                <Input
                  allowClear
                  placeholder="添加计划"
                  value={this.state.newPlan}
                  onChange={(e) => this.addPlanInputChange(e.target.value)}
                  onPressEnter={(e) => this.handleSaveNewPlan(e.target.value)}
                />
              </div>
            ) : (
              <div className={styles.item}>
                <i
                  className={globalStyle.global_icon}
                  style={{ color: "rgba(208, 211, 226, 1)" }}
                >
                  &#xe7f2;
                </i>
                <div
                  style={{ width: "calc(100% - 48px)" }}
                  className={styles.text}
                >
                  <span>{this.props.taskName || this.state.newPlan}</span>
                </div>
                <i
                  className={globalStyle.global_icon}
                  style={{ color: "rgba(209, 213, 228, 1)" }}
                >
                  &#xe7f1;
                </i>
              </div>
            )}
            {this.state.taskDetails.map((item, index) => {
              return (
                <div className={styles.item} key={index}>
                  <i
                    className={globalStyle.global_icon}
                    style={{ color: "rgba(208, 211, 226, 1)" }}
                  >
                    &#xe7f2;
                  </i>
                  <div
                    style={{ width: "calc(100% - 48px)", textAlign: "left" }}
                  >
                    <span>{item.name}</span>
                  </div>
                  <i
                    className={globalStyle.global_icon}
                    style={{ color: "rgba(209, 213, 228, 1)" }}
                    onClick={() => this.handleDelPlanClick(item)}
                  >
                    &#xe7d0;
                  </i>
                </div>
              );
            })}

            <div
              className={`${styles.item} ${styles.add}`}
              onClick={this.addStep}
              style={{
                ...(this.state.isAdd
                  ? { pointerEvents: "none", cursor: "not-allowed" }
                  : {}),
              }}
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
            {/* <span>提醒我</span> */}
            {/* <div className={styles.item}>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(106, 154, 255, 1)" }}
              >
                &#xe7f4;
              </i>
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
            </div> */}
            <div
              className={styles.item}
              style={{
                ...(this.state.isAdd
                  ? { pointerEvents: "none", cursor: "not-allowed" }
                  : {}),
              }}
            >
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(106, 154, 255, 1)" }}
              >
                &#xe7f6;
              </i>
              {/* <span>添加截止日期</span> */}
              <DatePicker
                // allowClear
                size="small"
                placeholder="添加截止日期"
                bordered={false}
                mode="date"
                format="YYYY年MM月DD日"
                locale={locale}
                disabledDate={this.disabledDate}
                disabledTime={this.disabledDateTime}
                style={{ width: "calc(100% - 50px", padding: 0 }}
                value={
                  this.state.endTime ? moment(this.state.endTime) : undefined
                }
                onChange={(value) => this.handleLastDateClick(value)}
              />
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(209, 213, 228, 1)" }}
                onClick={this.handleClearEndTime}
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
