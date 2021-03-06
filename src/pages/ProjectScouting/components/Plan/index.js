import React, { useState, Fragment } from "react";
import { Collapse, Col, Input, Button, message, Upload, Tooltip, Icon } from "antd";
// import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { MyIcon } from "components/utils";
import styles from "./style.less";
import services from "../../../../services/planServices";
import planServices from "../../../../services/planServices";
import { formatSize } from "../../../../utils/utils";
import { BASIC } from "../../../../services/config";
import Cookies from 'js-cookie'

const CreatePanelHeader = ({
  data,
  index: dataIndex,
  delGroup,
  boardId,
  parent,
  isAddGroup,
  scoutingDetail,
}) => {
  let displayEdit = true,
    displayDel = true;
  if (!isAddGroup) {
    displayEdit = false;
    displayDel = false;
  }
  if (data.canNotDel) {
    displayDel = true;
  }
  if (data.canNotEdit) {
    displayEdit = true;
  }
  let [isEdit, setIsEdit] = useState((isAddGroup ? true : false) || false);
  let [groupName, setGroupName] = useState(data.name);
  let [showEdit, setHideEdit] = useState(displayEdit);
  let [showDel, setHideDel] = useState(displayDel);
  let [file, setFiles] = useState([]);
  const onupload = (e) => {
    let { size, text } = formatSize(e.file.size);
    text = text.trim();
    if (!(+size > 60 && text === "MB")) {
      setFiles(e.fileList);
      // onChange(e);
      // planServices.uploadProjetFile(boardId, e.fileList[0].name, )
    }
  };
  const checkFileSize = (file) => {
    let { size, text } = formatSize(file.size);
    text = text.trim();
    if (+size > 60 && text === "MB") {
      message.error("文件不能大于60MB---" + file.name);
      return false;
    }
    // uploadFiles.push(file);
    return true;
  };

  const updateParent = (res, isModify) => {
    if (isModify) {
      let oldPanles = parent.state.panels;
      // oldPanles.forEach((item) => {
      //   if (item.id === res.data.id) {
      //     item = res.data;
      //     item.type = "plan";
      //   }
      // });
      let index = oldPanles.findIndex((item) => item.id == res.data.id);
      oldPanles[index] = res.data;
      oldPanles[index].type = "plan";
      parent.setState({
        panels: oldPanles,
      });
    } else {
      if (res && res.code === "0") {
        scoutingDetail.setState({
          addGroupDisabled: true,
        });
        let oldPanles = [];
        parent.state.panels.forEach((item) => {
          if (item.iconfont) {
            oldPanles.push(item);
          }
        });
        res.data.forEach((item) => {
          item.type = "plan";
        });
        parent.setState({
          panels: [...oldPanles, ...res.data],
        });
      }
    }
  };
  const addGroup = (e) => {
    e.stopPropagation();
    // this.onModifyOk();
    setIsEdit(false);
    setHideEdit(false);
    setHideDel(false);
    if (isAddGroup) {
      planServices.createBoardTaskGroup(boardId, groupName).then((res) => {
        if (res && res.code === "0") {
          planServices.getBoardTaskGroupList(boardId).then((res) => {
            updateParent(res);
          });
        } else {
          message.warn(res.message);
        }
      });
    } else {
      planServices.updateBoardTaskGroup(data.id, groupName).then((res) => {
        updateParent(res, true);
      });
    }
  };
  const uploadFileAction = (file) => {
    return new Promise((resolve) => {
      planServices.uploadFileCommon(file).then((res) => {
        if (res && res.code === "0") {
          message.success("文件上传成功。");
          let file_name = res.data.original_file_name;
          let resource_id = res.data.file_resource_id;
          planServices
            .uploadProjetFile(boardId, file_name, resource_id)
            .then((res) => {
              if (res && res.code === "0") {
                parent && parent.getFileList();
              }
            });
        } else {
          message.warn(res.message);
        }
        resolve(res);
      });
    });
  };
  return (
    <div
      style={{
        width: "100%",
        height: 28,
        lineHeight: "28px",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div
        style={{
          width: "calc(100% - 48px)",
          textAlign: "left",
          display: "flex",
          flexDirection: "row",
        }}
      >
        {data.iconfont ? (
          <i
            className={globalStyle.global_icon}
            style={{ marginRight: 10, color: data.color }}
            dangerouslySetInnerHTML={{ __html: data.iconfont }}
          ></i>
        ) : null}
        {!isEdit ? (
          <span>{data.name}</span>
        ) : (
          <Fragment>
            <Col>
              <Input
                style={{ borderRadius: "5px" }}
                placeholder="请输入名称"
                size="small"
                autoFocus
                onChange={(e) => setGroupName(e.target.value.trim())}
                onPressEnter={(e) => {
                  e.stopPropagation();
                  setIsEdit(false);
                  addGroup(e);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                allowClear
                value={groupName}
              />
            </Col>
            <Col span={3} style={{ textAlign: "right" }}>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEdit(false);
                  setHideEdit(false);
                  setHideDel(false);
                  if (isAddGroup) {
                    parent.resetGroup();
                  } else {
                    setGroupName(data.name);
                  }
                  scoutingDetail.setState({
                    addGroupDisabled: true,
                  });
                }}
                size="small"
                shape="circle"
                >
                <Icon type="close"></Icon>
                {/* <CloseOutlined /> */}
              </Button>
            </Col>
            <Col span={3} style={{ textAlign: "center" }}>
              <Button
                size="small"
                onClick={(e) => {
                  addGroup(e, true);
                }}
                shape="circle"
                type="primary"
                >
                  <Icon type="check"></Icon>
                {/* <CheckOutlined /> */}
              </Button>
            </Col>
          </Fragment>
        )}
      </div>
      {!showEdit ? (
        <i
          className={globalStyle.global_icon}
          style={{ fontSize: 24, color: "rgb(158, 166, 194)" }}
          onClick={(e) => {
            e.stopPropagation();
            setIsEdit(true);
            setHideEdit(true);
            setHideDel(true);
          }}
        >
          &#xe7b7;
        </i>
      ) : null}
      {!showDel ? (
        <i
          className={globalStyle.global_icon}
          style={{ fontSize: 24, color: "rgb(158, 166, 194)" }}
          onClick={(e) => {
            e.stopPropagation();
            delGroup && delGroup(dataIndex, data);
          }}
        >
          &#xe7b8;
        </i>
      ) : null}
      {data.genExtraIconFont ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Upload
            action={(file) => uploadFileAction(file)}
            beforeUpload={checkFileSize}
            multiple
            headers={{ Authorization: Cookies.get('Authorization') }}
            onChange={(e) => {
              onupload(e);
            }}
            showUploadList={false}
            fileList={file}
          >
            <i
              className={globalStyle.global_icon}
              dangerouslySetInnerHTML={{ __html: data.genExtraIconFont }}
              style={{
                fontSize: 24,
                color: "rgb(158, 166, 194)",
                marginLeft: 30,
              }}
            ></i>
          </Upload>
        </div>
      ) : null}
    </div>
  );
};
export default class Plan extends React.Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.state = {
      panels: [
        {
          iconfont: "&#xe616;",
          type: "plan",
          name: "我的计划",
          color: "rgba(106, 154, 255, 1)",
          canNotDel: true,
          canNotEdit: true,
        },
        {
          iconfont: "&#xe7c6;",
          type: "file",
          name: "文件",
          color: "rgba(98, 148, 255, 1)",
          canNotDel: true,
          canNotEdit: true,
          genExtraIconFont: "&#xe7f5;",
          genExtraCallBack: (data) => {},
        },
      ],
      fileList: [],
      datas: [],
    };
    this.suffixArr = [
      { type: "icon-bianzu851", suffix: ["doc", "docx"] },
      { type: "icon-bianzu871", suffix: ["ppt", "pptx"] },
      { type: "icon-bianzu811", suffix: ["rar"] },
      { type: "icon-bianzu801", suffix: ["mov"] },
      { type: "icon-bianzu831", suffix: ["mp3"] },
      { type: "icon-bianzu921", suffix: ["mp4"] },
      { type: "icon-bianzu911", suffix: ["avi"] },
      { type: "icon-bianzu901", suffix: ["zip"] },
      { type: "icon-bianzu891", suffix: ["png"] },
      { type: "icon-bianzu881", suffix: ["jpg"] },
      { type: "icon-bianzu861", suffix: ["pdf"] },
      { type: "icon-bianzu841", suffix: ["xls", "xlsx"] },
      { type: "icon-bianzu791", suffix: ["txt"] },
    ];
    this.panels = [
      {
        iconfont: "&#xe616;",
        type: "plan",
        name: "我的计划",
        color: "rgba(106, 154, 255, 1)",
        canNotDel: true,
        canNotEdit: true,
      },
      {
        iconfont: "&#xe7c6;",
        type: "file",
        name: "文件",
        color: "rgba(98, 148, 255, 1)",
        canNotDel: true,
        canNotEdit: true,
        genExtraIconFont: "&#xe7f5;",
        genExtraCallBack: (data) => {},
      },
    ];
  }

  componentDidMount() {
    const { board } = this.props;
    services.getBoardTaskDefaultList(board.board_id).then((res) => {
      if (res && res.code === "0") {
        let datas = [];
        res.data.forEach((item) => {
          item.type = "plan";
          datas.push(item);
        });
        this.setState({
          datas: datas,
        });
      }
    });
    planServices.getBoardTaskGroupList(board.board_id).then((res) => {
      if (res && res.code === "0") {
        let oldPanles = this.state.panels;
        res.data.forEach((item) => {
          item.type = "plan";
          if (item.tasks) {
            item.tasks.forEach((item2) => {
              item2.type = "plan";
            });
          }
        });
        this.setState({
          panels: [...oldPanles, ...res.data],
        });
      }
    });
    this.getFileList(board);
  }

  componentWillReceiveProps(nextProps) {
    const { showAddPlan, board } = nextProps;
    const { showAddPlan: oldShowAddPlan } = this.props;
    if (showAddPlan !== oldShowAddPlan) {
      services.getBoardTaskDefaultList(board.board_id).then((res) => {
        if (res && res.code === "0") {
          let datas = [];
          res.data.forEach((item) => {
            item.type = "plan";
            datas.push(item);
          });
          this.setState({
            datas: datas,
          });
        }
      });
      planServices.getBoardTaskGroupList(board.board_id).then((res) => {
        if (res && res.code === "0") {
          res.data.forEach((item) => {
            item.type = "plan";
            if (item.tasks) {
              item.tasks.forEach((item2) => {
                item2.type = "plan";
              });
            }
          });
          let oldPanles = [];
          this.state.panels.forEach((item) => {
            if (item.iconfont) {
              oldPanles.push(item);
            }
          });
          this.setState({
            panels: [...oldPanles, ...res.data],
          });
        }
      });
      this.getFileList(board);
    }
  }

  addGroup = () => {
    let panels = this.state.panels;
    this.setState({
      panels: [
        ...panels,
        {
          type: "plan",
          name: "",
          color: "rgba(106, 154, 255, 1)",
          canNotDel: false,
          canNotEdit: false,
          isAdd: true,
        },
      ],
    });
  };

  resetGroup = () => {
    let panels = [];
    let oldPanels = this.state.panels;
    oldPanels.forEach((item) => {
      if (item.iconfont) {
        panels.push(item);
      }
      if (item.id) {
        panels.push(item);
      }
    });
    this.setState({
      panels: panels,
    });
  };

  delGroup = (index, item) => {
    planServices.deleteBoardTaskGroup(item.id).then((res) => {
      if (res && res.code === "0") {
        let panels = this.state.panels;
        panels.splice(index, 1);
        this.setState({
          panels: panels,
        });
      } else {
        message.warn(res.message);
      }
    });
  };

  addPlan = (groupId) => {
    return (
      <div
        className={`${styles.item} ${styles.addPlan}`}
        onClick={() => {
          const { parent, board } = this.props;
          parent.setState(
            {
              showAddPlan: true,
              isAdd: true,
              planId: "",
              boardId: board.board_id,
              planGroupId: groupId,
            },
            () => {}
          );
        }}
      >
        <i className={globalStyle.global_icon}>&#xe7dc;</i>
        <div style={{ width: "calc(100% - 44px)" }} className={styles.content}>
          <span>添加计划</span>
        </div>
      </div>
    );
  };

  handleDelClick = (e, id, type) => {
    e.stopPropagation();
    if (type === "plan") {
      planServices.deleteBoardTask(id).then((res) => {
        if (res && res.code === "0") {
          let datas = this.state.datas;
          let index = datas.findIndex((item) => item.id === id);
          if (index > -1) {
            datas.splice(index, 1);
            this.setState({
              datas: datas,
            });
          } else {
            let panels = this.state.panels;
            for (let i = 0; i < panels.length; i++) {
              if (panels[i].tasks) {
                for (let j = 0; j < panels[i].tasks.length; j++) {
                  if (panels[i].tasks[j].id === id) {
                    panels[i].tasks.splice(j, 1);
                    break;
                  }
                }
              }
            }
            this.setState({
              panels: panels,
            });
          }
        }
      });
    } else {
      planServices.deleteBoardFile(id).then((res) => {
        if (res && res.code === "0") {
          let datas = this.state.fileList;
          let index = datas.findIndex((item) => item.id === id);
          datas.splice(index, 1);
          this.setState({
            fileList: datas,
          });
        }
      });
    }
  };

  regetData = (groupId) => {
    const { board } = this.props;
    if (groupId === "0") {
      services.getBoardTaskDefaultList(board.board_id).then((res) => {
        if (res && res.code === "0") {
          let datas = [];
          res.data.forEach((item) => {
            item.type = "plan";
            datas.push(item);
          });
          this.setState({
            datas: datas,
          });
        }
      });
    } else {
      planServices.getBoardTaskGroupList(board.board_id).then((res) => {
        if (res && res.code === "0") {
          // let oldPanles = this.state.panels;
          res.data.forEach((item) => {
            item.type = "plan";
            if (item.tasks) {
              item.tasks.forEach((item2) => {
                item2.type = "plan";
              });
            }
          });
          this.setState({
            panels: [...this.panels, ...res.data],
          });
        }
      });
    }
  };

  finishBoardTask = (item) => {
    planServices.finishBoardTask(item.id).then((res) => {
      if (res && res.code === "0") {
        this.regetData(item.group_id);
      } else {
        message.warn(res.message);
      }
    });
  };

  cancelFinishBoardTask = (item) => {
    planServices.cancelBoardTask(item.id).then((res) => {
      if (res && res.code === "0") {
        this.regetData(item.group_id);
      } else {
        message.warn(res.message);
      }
    });
  };

  handleCompletePlan = (e, item) => {
    e.stopPropagation();
    if (item.complete_time) {
      this.cancelFinishBoardTask(item);
    } else {
      this.finishBoardTask(item);
    }
  };

  getIcon = (item) => {
    let iconfont = "icon-weizhileixing";
    if (item.file_name) {
      let suffixIndex = item.file_name.lastIndexOf(".");
      const suffixName = item.file_name.substring(
        suffixIndex + 1,
        item.file_name.length
      );
      for (let i = 0; i < this.suffixArr.length; i++) {
        if (
          this.suffixArr[i].suffix.includes(suffixName) ||
          this.suffixArr[i].suffix
            .map((item) => item.toUpperCase())
            .includes(suffixName)
        ) {
          iconfont = this.suffixArr[i].type;
          break;
        }
      }
    }
    return iconfont;
  };

  getTime = (timestamp, isComplete) => {
    let date = new Date();
    date.setTime(timestamp);
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    m = m < 10 ? "0" + m : m;
    let d = date.getDate();
    d = d < 10 ? "0" + d : d;

    let currentTimestamp = new Date().getTime();
    if (!isComplete) {
      if (Number(currentTimestamp) > Number(timestamp)) {
        return `已逾期 ${m}月${d}日 ${this.getWeek(timestamp)}`;
      }
    }
    return `${m}月${d}日 ${this.getWeek(timestamp)}`;
  };

  // 获取星期
  getWeek = (timestamp) => {
    let date = new Date();
    date.setTime(timestamp);
    let week;
    if (date.getDay() === 0) week = "周日";
    if (date.getDay() === 1) week = "周一";
    if (date.getDay() === 2) week = "周二";
    if (date.getDay() === 3) week = "周三";
    if (date.getDay() === 4) week = "周四";
    if (date.getDay() === 5) week = "周五";
    if (date.getDay() === 6) week = "周六";
    return week;
  };

  // 逾期样式
  getOverdueStyle = (timestamp) => {
    let currentTimestamp = new Date().getTime();
    if (Number(currentTimestamp) > Number(timestamp)) {
      return { color: "rgba(249, 84, 85, 1)" };
    }
    return {};
  };

  handleCollectPlan = (e, data) => {
    e.stopPropagation();
    if (data.is_favorite !== "1") {
      services.collectFavoriteTask(data.id).then((res) => {
        if (res && res.code === "0") {
          this.regetData(data.group_id);
        } else {
          message.warn(res.message);
        }
      });
    } else {
      services.cancelFavoriteTask(data.id).then((res) => {
        if (res && res.code === "0") {
          this.regetData(data.group_id);
        } else {
          message.warn(res.message);
        }
      });
    }
  };

  getRemindTime = (timestamp) => {
    if (timestamp) {
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
      return (
        y.toString() +
        "年" +
        m.toString() +
        "月" +
        d.toString() +
        "日" +
        " " +
        h.toString() +
        "时" +
        mi.toString() +
        "分" +
        s.toString() +
        "秒"
      );
    }
  };

  createItem = (item, type) => {
    return (
      <div
        key={item.id}
        className={`${styles.item} ${styles.planItem}`}
        onClick={() => {
          const { parent, board } = this.props;
          if (item.type === "plan") {
            parent.setState({
              showAddPlan: true,
              isAdd: false,
              planId: item.id,
              data: item,
              boardId: board.board_id,
              planGroupId: "",
            });
          } else {
            planServices.downLoadFile(item.resource_id).then((res) => {
              window.open(res.message, "_blank");
            });
          }
        }}
      >
        <div className={styles.contentPart1}>
          {item.type === "plan" ? (
            <i
              className={`${globalStyle.global_icon} ${
                !item.complete_time ? styles.style1 : styles.style2
              }`}
              dangerouslySetInnerHTML={{
                __html: !item.complete_time ? "&#xe7f2;" : "&#xe7f8;",
              }}
              onClick={(e) => this.handleCompletePlan(e, item)}
            ></i>
          ) : (
            <MyIcon type={this.getIcon(item)} style={{ fontSize: 24 }}></MyIcon>
          )}
        </div>
        <div
          className={styles.contentPart2}
          style={{
            width: "calc(100% - 85px)",
            // ...(item.complete_time ||
            // item.end_time ||
            // item.task_remind?.remind_time
            //   ? {}
            //   : { lineHeight: "50px" }),
            ...(type !== "file" ? {} : { lineHeight: "50px" }),
          }}
        >
          <span
            style={{
              ...(item.complete_time
                ? { color: "rgba(210, 212, 222, 1)" }
                : {}),
              ...(item.complete_time ? { textDecoration: "line-through" } : {}),
            }}
          >
            {item.name || item.file_name}
          </span>
          {item.end_time ||
          item.complete_time ||
          item.task_remind?.remind_time ? (
            <span
              className={styles.date}
              style={{
                ...(item.complete_time
                  ? { color: "rgba(210, 212, 222, 1)" }
                  : {}),
                ...this.getOverdueStyle(item.end_time),
              }}
            >
              {item.end_time
                ? this.getTime(item.end_time, item.complete_time ? true : false)
                : "请设置截止时间"}
              {item.task_remind?.remind_time ? (
                <Tooltip
                  placement="top"
                  title={this.getRemindTime(item.task_remind?.remind_time)}
                >
                  <i
                    className={globalStyle.global_icon}
                    style={{
                      color:
                        Date.parse(new Date()) >
                        Number(item.task_remind?.remind_time)
                          ? "rgb(209, 213, 228)"
                          : "rgba(106, 154, 255, 1)",
                      marginLeft: 10,
                      fontSize: 14,
                      paddingTop: 6,
                    }}
                  >
                    &#xe7f4;
                  </i>
                </Tooltip>
              ) : null}
            </span>
          ) : null}
          {!item.end_time &&
          !item.complete_time &&
          !item.task_remind?.remind_time &&
          type !== "file" ? (
            <span className={styles.date}>{"请设置截止时间"}</span>
          ) : null}
        </div>
        <div className={styles.contentPart3}>
          <i
            className={globalStyle.global_icon}
            onClick={(e) => this.handleCollectPlan(e, item)}
            style={{
              fontSize: 24,
              visibility: item.type === "plan" ? "visible" : "hidden",
              color:
                item.is_favorite === "1"
                  ? "rgba(255, 183, 96, 1)"
                  : "rgba(209, 213, 228, 1)",
            }}
          >
            &#xe7f1;
          </i>
          <i
            className={globalStyle.global_icon}
            onClick={(e) => this.handleDelClick(e, item.id, type)}
            style={{
              fontSize: 24,
              color: "rgba(158, 166, 194, 1)",
            }}
          >
            &#xe7b8;
          </i>
        </div>
      </div>
    );
  };

  onModifyOk = () => {};

  genExtra = (data) => {
    if (data && data.genExtraIconFont) {
      return (
        <i
          className={globalStyle.global_icon}
          dangerouslySetInnerHTML={{ __html: data.genExtraIconFont }}
          style={{ color: "rgba(158, 166, 194, 1)", fontSize: "18px" }}
          onClick={(e) => {
            e.stopPropagation();
            data.genExtraCallBack(data);
          }}
        ></i>
      );
    }
    return null;
  };

  getFileList = (board) => {
    if (!board) {
      board = this.props.board;
    }
    services.getBoardFileList(board.board_id).then((res) => {
      if (res && res.code === "0") {
        if (res.data) {
          this.setState({
            fileList: res.data,
          });
        }
      }
    });
  };

  handleAddGroupClick = () => {};
  render() {
    const { board, scoutingDetail } = this.props;
    const { Panel } = Collapse;
    return (
      <div className={styles.wrapper}>
        <div
          className={`${styles.body} ${globalStyle.autoScrollY}`}
          style={{ height: "100%" }}
        >
          <Collapse defaultActiveKey={[0, 1]}>
            {this.state.panels.map((item, index) => {
              return (
                <Panel
                  key={index}
                  header={
                    <CreatePanelHeader
                      boardId={board.board_id}
                      data={item}
                      index={index}
                      parent={this}
                      delGroup={this.delGroup}
                      isAddGroup={item.isAdd}
                      scoutingDetail={scoutingDetail}
                      resetGroup={this.resetGroup}
                    ></CreatePanelHeader>
                  }
                  // extra={this.genExtra(item)}
                >
                  <div style={{ padding: 16 }}>
                    {item.type === "plan" ? this.addPlan(item.id) : null}
                    {item.canNotDel
                      ? this.state.datas.map((item2) => {
                          if (item.type === item2.type) {
                            if (!item2.complete_time && item2.type === "plan") {
                              return this.createItem(item2, "plan");
                            }
                          }
                          return null;
                        })
                      : item.tasks &&
                        item.tasks.map((item2) => {
                          if (!item2.complete_time) {
                            return this.createItem(item2, "plan");
                          }
                          return null;
                        })}
                    {item.type === "file" &&
                      this.state.fileList.map((item2) => {
                        return this.createItem(item2, "file");
                      })}
                  </div>
                  {item.type === "plan" ? (
                    <Collapse>
                      <Panel
                        header={
                          <div style={{ textAlign: "left", width: "80%" }}>
                            <span>已完成</span>
                          </div>
                        }
                        className="finish"
                      >
                        <div style={{ padding: 16 }}>
                          {item.canNotDel
                            ? this.state.datas.map((item2) => {
                                if (item.type === item2.type) {
                                  if (
                                    item2.complete_time &&
                                    item2.type === "plan"
                                  ) {
                                    return this.createItem(item2, "plan");
                                  }
                                }
                                return null;
                              })
                            : item.tasks &&
                              item.tasks.map((item2) => {
                                if (item2.complete_time) {
                                  return this.createItem(item2, "plan");
                                }
                                return null;
                              })}
                        </div>
                      </Panel>
                    </Collapse>
                  ) : null}
                </Panel>
              );
            })}
          </Collapse>
        </div>
      </div>
    );
  }
}
