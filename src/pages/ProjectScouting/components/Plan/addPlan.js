import React, { Fragment } from "react";
import { message, DatePicker, Input, Dropdown, Button } from "antd";
import moment from "moment";

import globalStyle from "@/globalSet/styles/globalStyles.less";

import styles from "./addPlan.less";
import overlayStyles from "./overlay.less";

import "moment/locale/zh-cn";
import locale from "antd/lib/date-picker/locale/zh_CN";

import planServices from "../../../../services/planServices";

import systemManageServices from "../../../../services/systemManage";
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
      remindTime: null,
      projectMember: [],
      selectedUserArr: [],
      dropDownVisible: false,
      profilePhotos: [],
      selectAll: false,
    };
    this.planId = "";
    this.data = null;
    this.remindTimestamp = "";
    this.remindId = "";
  }

  componentDidMount() {
    this.getDetails();
    // document.addEventListener("click", this.saveToDB);
    document
      .getElementById("MapsView")
      .addEventListener("click", this.saveToDB);
    const { boardId, planId } = this.props;
    systemManageServices.getProjectMember(boardId).then((res0) => {
      if (res0 && res0.code === "0") {
        this.setState({
          projectMember: res0.data,
        });
        if (planId) {
          planServices.getTaskRemind(planId).then((res) => {
            if (res && res.code) {
              this.remindId = res.data.id;
              this.getRemindTime(res.data.remind_time || "");
              this.setState({
                selectedUserArr: res.data.remind_users || [],
                selectAll:
                  res0.data?.length === res.data.remind_users?.length
                    ? true
                    : false,
              });
            }
          });
        }
      }
    });
  }
  componentWillUnmount() {
    document
      .getElementById("MapsView")
      .removeEventListener("click", this.saveToDB);
  }

  saveToDB = (e) => {
    e.stopImmediatePropagation();
    if (this.state.isAdd) {
      if (!this.state.newPlan) return;
      this.handleSaveNewPlan(this.state.newPlan);
      this.setState({
        isAdd: false,
      });
    }
    if (this.state.addStepState) {
      if (!this.state.newStep) return;
      this.handleSaveNewStep(this.state.newStep);
    }
  };

  getRemindTime = (timestamp) => {
    if (timestamp) {
      this.remindTimestamp = timestamp;
      let date = new Date();
      date.setTime(timestamp);
      let y = date.getFullYear();
      let m = date.getMonth() + 1;
      m = m < 10 ? "0" + m : m;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      h = h < 10 ? "0" + h : h;
      let mi = date.getMinutes();
      mi = mi < 10 ? "0" + mi : mi;
      let s = date.getSeconds();
      s = s < 10 ? "0" + s : s;
      this.setState({
        remindTime:
          y.toString() +
          m.toString() +
          d.toString() +
          " " +
          h.toString() +
          mi.toString() +
          s.toString(),
      });
    } else {
      this.setState({
        remindTime: "",
      });
    }
  };

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
              if (res.data.remind_time) {
                const timestamp = res.data.remind_time;
                let date = new Date();
                date.setTime(timestamp);
                let y = date.getFullYear();
                let m = date.getMonth() + 1;
                m = m < 10 ? "0" + m : m;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                let h = date.getHours();
                let mi = date.getMinutes();
                let s = date.getSeconds();
                this.setState({
                  remindTime:
                    y.toString() +
                    m.toString() +
                    d.toString() +
                    h.toString() +
                    mi.toString() +
                    s.toString(),
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
    const { boardId, planGroupId } = this.props;
    let planId = this.planId || this.props.planId;
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
      })
      .catch((e) => {
        message.error(e.message);
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
    planServices
      .createBoardTask(boardId, planGroupId, value)
      .then((res) => {
        if (res && res.code === "0") {
          this.planId = res.data.id;
          planServices.getPlanDetail(res.data.id).then((res) => {
            if (res && res.code === "0") {
              this.setState({
                isAdd: false,
                data: res.data,
              });
            }
          });
        } else {
          message.warn(res.message);
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };
  handleDelPlanClick = (data) => {
    if (!data) return;
    let planId = this.planId || this.props.planId;
    planServices
      .deleteBoardTask(data.id)
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
        } else {
          message.warn(res.message);
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };

  // 提醒事件
  handleRemindTimeClick = (value) => {
    this.remindTimestamp = value._d.getTime();
    this.getRemindTime(this.remindTimestamp);
    this.handleRemindClick();
  };
  handleLastDateClick = (value) => {
    const timestamp = value._d.getTime();
    let planId = this.planId || this.props.planId;
    planServices
      .updateBoardTask(timestamp, planId, "")
      .then((res) => {
        if (res && res.code === "0") {
        } else {
          message.warn(res.message);
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };
  handleClearEndTime = () => {
    let planId = this.planId || this.props.planId;
    planServices
      .updateBoardTask("", planId, "", "1")
      .then((res) => {
        if (res && res.code === "0") {
          this.remindTimestamp = "";
          this.setState({
            endTime: "",
          });
        } else {
          message.warn(res.message);
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };
  handleCollectPlan = (e, data) => {
    e.stopPropagation();
    if (data.is_favorite !== "1") {
      planServices
        .collectFavoriteTask(data.id)
        .then((res) => {
          if (res && res.code === "0") {
            planServices.getPlanDetail(data.id).then((res) => {
              if (res && res.code === "0") {
                if (res.data) {
                  this.setState({
                    data: res.data,
                  });
                }
              }
            });
          } else {
            message.warn(res.message);
          }
        })
        .catch((e) => {
          message.error(e.message);
        });
    } else {
      planServices
        .cancelFavoriteTask(data.id)
        .then((res) => {
          if (res && res.code === "0") {
            planServices.getPlanDetail(data.id).then((res) => {
              if (res && res.code === "0") {
                if (res.data) {
                  this.setState({
                    data: res.data,
                  });
                }
              }
            });
          } else {
            message.warn(res.message);
          }
        })
        .catch((e) => {
          message.error(e.message);
        });
    }
  };
  handleProjectMemer = (item, index) => {
    let selectAll = false;
    let selectedUserArr = this.state.selectedUserArr;
    if (selectedUserArr[index]) {
      selectedUserArr[index] = null;
    } else {
      selectedUserArr[index] = item.user;
    }
    let tmpArr = selectedUserArr.filter((item) => item !== null);
    if (tmpArr.length === this.state.projectMember.length) {
      selectAll = true;
    }
    this.setState({
      selectedUser: selectedUserArr,
      selectAll: selectAll,
    });
  };
  ondropDownVisibleChange = (e) => {
    this.setState({
      dropDownVisible: e,
    });
  };

  handleSelectAll = () => {
    this.setState(
      {
        selectAll: !this.state.selectAll,
      },
      () => {
        if (this.state.selectAll) {
          let arr = [];
          this.state.projectMember.forEach((item) => {
            arr.push(item.user);
          });
          this.setState({
            selectedUserArr: arr,
          });
        } else {
          this.setState({
            selectedUserArr: [],
          });
        }
      }
    );
  };
  handleRemindClick = () => {
    if (!this.remindTimestamp) {
      message.warn("请选择提醒时间。");
      return;
    }
    this.setState({
      dropDownVisible: false,
    });
    let selectedUserIdsStr = "";
    if (this.state.selectedUserArr) {
      selectedUserIdsStr = this.state.selectedUserArr
        .map((item) => item.id)
        .join(",");
    }
    if (!this.remindId) {
      planServices
        .createTaskRemind(
          this.remindTimestamp,
          this.props.planId || this.planId,
          selectedUserIdsStr
        )
        .then((res) => {
          if (res && res.code === "0") {
            this.remindId = res.data?.id;
          } else {
            message.warn(res.message);
          }
        })
        .catch((e) => {
          message.error(e.message);
        });
    } else {
      planServices
        .updateTaskRemind(
          this.remindId,
          this.remindTimestamp,
          selectedUserIdsStr
        )
        .then((res) => {
          if (res && res.code === "0") {
          } else {
            message.warn(res.message);
          }
        })
        .catch((e) => {
          message.error(e.message);
        });
    }
  };
  handleClearRemindTime = () => {
    let selectedUserIdsStr = this.state.selectedUserArr
      .map((item) => item.id)
      .join(",");
    planServices
      .updateTaskRemind(this.remindId, "0", selectedUserIdsStr)
      .then((res) => {
        if (res && res.code === "0") {
          this.setState({
            remindTime: "",
          });
        } else {
          message.warn(res.message);
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };
  createDropDownOverlay = () => {
    return (
      <div className={overlayStyles.overlayContainer}>
        <div className={`${overlayStyles.body} ${globalStyle.autoScrollY}`}>
          <div
            className={overlayStyles.listItem}
            onClick={this.handleSelectAll}
          >
            <div className={overlayStyles.profilePhoto}>
              <i
                className={globalStyle.global_icon}
                style={{ fontSize: 24, marginRight: 10 }}
              >
                &#xe764;
              </i>
            </div>
            <div style={{ width: "calc(100% - 40px)" }}>
              <span>所有人</span>
            </div>
            {this.state.selectAll ? (
              <i className={globalStyle.global_icon} style={{ float: "right" }}>
                &#xe75b;
              </i>
            ) : null}
          </div>
          {this.state.projectMember.map((item, index) => {
            return (
              <div
                className={overlayStyles.listItem}
                onClick={() => this.handleProjectMemer(item, index)}
              >
                <div className={overlayStyles.profilePhoto}>
                  {item.user.avatar ? (
                    <img src={item.user.avatar} alt="" />
                  ) : (
                    <i
                      className={globalStyle.global_icon}
                      style={{ fontSize: 24, marginRight: 10 }}
                    >
                      &#xe764;
                    </i>
                  )}
                </div>
                <div style={{ width: "calc(100% - 40px)" }}>
                  <span>{item.user.name}</span>
                </div>
                {this.state.selectedUserArr &&
                this.state.selectedUserArr[index]?.id === item.user.id ? (
                  <i
                    className={globalStyle.global_icon}
                    style={{ float: "right" }}
                  >
                    &#xe75b;
                  </i>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className={overlayStyles.footer}>
          <div style={{ width: "calc(100% - 76px)" }}></div>
          <Button
            style={{
              marginRight: 12,
            }}
            onClick={() => {
              this.setState({
                selectedUserArr: [],
                selectAll: false,
              });
            }}
          >
            重选
          </Button>
          <Button
            style={{
              color: "#fff",
              background: "rgba(134, 179, 255, 1)",
            }}
            onClick={this.handleRemindClick}
          >
            确定
          </Button>
        </div>
      </div>
    );
  };
  render() {
    let is_favorite;
    if (this.props.data) {
      is_favorite = this.props.data.is_favorite;
    }
    if (this.state.data) {
      is_favorite = this.state.data.is_favorite;
    }
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
                  style={{
                    display: "flex",
                    width: "calc(100% - 36px)",
                    borderBottom: "1px rgba(230, 232, 241, 1) solid",
                  }}
                >
                  <div
                    style={{ width: "calc(100% - 36px)" }}
                    className={styles.text}
                  >
                    <span>{this.props.taskName || this.state.newPlan}</span>
                  </div>
                  <i
                    className={globalStyle.global_icon}
                    onClick={(e) =>
                      this.handleCollectPlan(e, this.props.data || this.data)
                    }
                    style={{
                      color:
                        is_favorite === "1"
                          ? "rgba(255, 183, 96, 1)"
                          : "rgba(209, 213, 228, 1)",
                    }}
                  >
                    &#xe7f1;
                  </i>
                </div>
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
                    style={{
                      display: "flex",
                      width: "calc(100% - 36px)",
                      borderBottom: "1px rgba(230, 232, 241, 1) solid",
                    }}
                  >
                    <div
                      style={{ width: "calc(100% - 36px)", textAlign: "left" }}
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
                  <div
                    style={{
                      display: "flex",
                      width: "calc(100% - 36px)",
                      borderBottom: "1px rgba(230, 232, 241, 1) solid",
                    }}
                  >
                    <span style={{ color: "rgba(101, 143, 255, 1)" }}>
                      添加步骤
                    </span>
                  </div>
                </Fragment>
              ) : (
                <Fragment>
                  <i
                    className={globalStyle.global_icon}
                    style={{ color: "rgb(208, 211, 226)" }}
                  >
                    &#xe7f2;
                  </i>
                  <div
                    style={{
                      display: "flex",
                      width: "calc(100% - 36px)",
                      borderBottom: "1px rgba(230, 232, 241, 1) solid",
                    }}
                  >
                    <Input
                      allowClear
                      placeholder="添加步骤"
                      value={this.state.newStep}
                      onChange={(e) => this.addStepInputChange(e.target.value)}
                      onPressEnter={(e) =>
                        this.handleSaveNewStep(e.target.value)
                      }
                    />
                  </div>
                </Fragment>
              )}
            </div>
            {/* <span>提醒我</span> */}
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
                &#xe7f4;
              </i>
              <div
                style={{
                  display: "flex",
                  width: "calc(100% - 36px)",
                  borderBottom: "1px rgba(230, 232, 241, 1) solid",
                }}
              >
                <DatePicker
                  allowClear={false}
                  size="small"
                  placeholder="选择提醒时间"
                  bordered={false}
                  style={{ width: "calc(100% - 36px", padding: 0 }}
                  format="YYYY年MM月DD日 HH时mm分ss秒"
                  locale={locale}
                  disabledDate={this.disabledDate}
                  disabledTime={this.disabledDateTime}
                  showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                  value={
                    this.state.remindTime
                      ? moment(this.state.remindTime)
                      : undefined
                  }
                  onChange={(value) => this.handleRemindTimeClick(value)}
                />
                <i
                  className={globalStyle.global_icon}
                  style={{ color: "rgba(209, 213, 228, 1)" }}
                  onClick={this.handleClearRemindTime}
                >
                  &#xe7d0;
                </i>
              </div>
            </div>
            {this.state.remindTime ? (
              <div className={styles.item}>
                <i
                  className={globalStyle.global_icon}
                  style={{ color: "rgba(106, 154, 255, 1)" }}
                >
                  &#xe764;
                </i>
                <Dropdown
                  trigger="click"
                  overlay={this.createDropDownOverlay()}
                  visible={this.state.dropDownVisible}
                  onVisibleChange={(e) => this.ondropDownVisibleChange(e)}
                >
                  <div
                    style={{
                      display: "flex",
                      width: "calc(100% - 36px)",
                      borderBottom: "1px rgba(230, 232, 241, 1) solid",
                    }}
                  >
                    {this.state.selectedUserArr &&
                    this.state.selectedUserArr.length > 0 ? (
                      <span>提醒人</span>
                    ) : (
                      <span>选择提醒人</span>
                    )}
                  </div>
                </Dropdown>
              </div>
            ) : null}
            {/* 提醒人头像样式 */}
            {this.state.remindTime ? (
              <div
                style={{
                  display: "flex",
                  flexFlow: "row wrap",
                  paddingLeft: 30,
                  margin: "5px auto",
                }}
              >
                {this.state.selectedUserArr &&
                  this.state.selectedUserArr.map((item) => {
                    if (item && item.avatar) {
                      return (
                        <div style={{ width: 32, height: 32, margin: 5 }}>
                          <img
                            src={item.avatar}
                            alt=""
                            style={{ width: 32, height: 32, borderRadius: 32 }}
                          />
                        </div>
                      );
                    }
                    return (
                      <i
                        className={globalStyle.global_icon}
                        style={{ fontSize: 24, marginRight: 10 }}
                      >
                        &#xe764;
                      </i>
                    );
                  })}
              </div>
            ) : null}
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
              <div
                style={{
                  display: "flex",
                  width: "calc(100% - 36px)",
                  borderBottom: "1px rgba(230, 232, 241, 1) solid",
                }}
              >
                {/* <span>添加截止日期</span> */}
                <DatePicker
                  allowClear={false}
                  size="small"
                  placeholder="添加截止日期"
                  bordered={false}
                  mode="date"
                  format="YYYY年MM月DD日"
                  locale={locale}
                  disabledDate={this.disabledDate}
                  disabledTime={this.disabledDateTime}
                  style={{ width: "calc(100% - 36px", padding: 0 }}
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
      </div>
    );
  }
}
