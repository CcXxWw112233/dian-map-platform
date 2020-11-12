import React, { useState, Fragment } from "react";
import { Collapse, Col, Input, Button, message, Upload } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { MyIcon } from "components/utils";
import styles from "./style.less";
import services from "../../../../services/planServices";
import planServices from "../../../../services/planServices";
import { formatSize } from "../../../../utils/utils";
import { BASIC } from "../../../../services/config";
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
                <CloseOutlined />
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
                <CheckOutlined />
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
        <Upload
          // action="/api/map/file/upload"
          action={(file) => uploadFileAction(file)}
          beforeUpload={checkFileSize}
          multiple
          headers={{ Authorization: BASIC.getUrlParam.token }}
          onChange={(e) => {
            onupload(e);
          }}
          showUploadList={false}
          fileList={file}
          // customRequest={customRequest}
        >
          <i
            className={globalStyle.global_icon}
            dangerouslySetInnerHTML={{ __html: data.genExtraIconFont }}
            style={{
              fontSize: 24,
              color: "rgb(158, 166, 194)",
              marginLeft: 30,
            }}
            // onClick={(e) => {
            //   e.stopPropagation();
            //   data.genExtraCallBack(data);
            // }}
          ></i>
        </Upload>
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
          name: "未命名",
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

  finishBoardTask = (item) => {
    planServices.finishBoardTask(item.id).then((res) => {
      if (res && res.code === "0") {
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
      } else {
        message.warn(res.message);
      }
    });
  };

  cancelFinishBoardTask = (item) => {
    planServices.cancelBoardTask(item.id).then((res) => {
      if (res && res.code === "0") {
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
        if (this.suffixArr[i].suffix.includes(suffixName)) {
          iconfont = this.suffixArr[i].type;
          break;
        }
      }
    }
    return iconfont;
  };

  createItem = (item, type) => {
    return (
      <div
        className={`${styles.item} ${styles.planItem}`}
        onClick={() => {
          const { parent, board } = this.props;
          if (item.type === "plan") {
            parent.setState({
              showAddPlan: true,
              isAdd: false,
              planId: item.id,
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
            ...(item.date ? {} : { lineHeight: "50px" }),
            ...(item.type !== "file" ? {} : { lineHeight: "50px" }),
          }}
        >
          <span
            style={{
              ...(item.complete_time
                ? { color: "rgba(210, 212, 222, 1)" }
                : {}),
            }}
          >
            {item.name || item.file_name}
          </span>
          {item.end_time ? (
            <span
              className={styles.date}
              style={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {item.end_time}
              {item.remind === "1" ? (
                <i
                  className={globalStyle.global_icon}
                  style={{
                    color:
                      item.overdue === "1"
                        ? "rgba(249, 84, 85, 1)"
                        : "rgba(106, 154, 255, 1)",
                    marginLeft: 10,
                    fontSize: 14,
                    paddingTop: 6,
                  }}
                >
                  &#xe7f4;
                </i>
              ) : null}
            </span>
          ) : null}
        </div>
        <div className={styles.contentPart3}>
          <i
            className={globalStyle.global_icon}
            style={{
              fontSize: 24,
              visibility: item.star === undefined ? "hidden" : "visible",
              color:
                item.star === "1"
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
