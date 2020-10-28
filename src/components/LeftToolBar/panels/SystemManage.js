import React, { Fragment } from "react";
import { Collapse, Dropdown, Menu, Input, Col, Button, message } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { MyIcon } from "../../../components/utils";
import SystemManageModal from "./SystemManageModal";
import styles from "./SystemManage.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import systemManageServices from "../../../services/systemManage";
import { guid } from "./lib";
const { Panel } = Collapse;

export class ContentItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownVisible: false,
      modalVisible: false,
      isModify: false,
      roleName: "",
    };
    this.newRoleName = "";
  }

  componentDidMount() {
    const { data } = this.props;
    this.setState({
      roleName: data.name,
    });
  }

  setDropDownVisible = (val) => {
    this.setState({
      dropdownVisible: val,
    });
  };
  controlMenu = (type) => {
    const { data } = this.props;
    if (type === "rename") {
      this.setIsEdit(true);
      this.setState({
        dropdownVisible: false,
      });
    } else if (type === "copy") {
    } else if (type === "del") {
      systemManageServices
        .deleteSystemRole(data && data.id)
        .then((res) => {
          if (res && res.code === "0") {
            const { parent } = this.props;
            parent.onDelRoleClick(data.id);
          } else {
            message.info("管理员权限不允许修改");
          }
        })
        .catch((e) => {
          message.info(e);
        });
    }
  };
  handleContentItemClick = () => {
    const { parent, type, data } = this.props;
    parent.handleContentItemClick(type, data);
  };

  setIsEdit = (value) => {
    const { data } = this.props;
    this.setState({
      isModify: value,
      roleName: this.newRoleName || data.name,
    });
  };

  setRoleName = (value) => {
    this.newRoleName = value;
    this.setState({
      roleName: value,
    });
  };

  onModifyCancel = (e) => {
    e.stopPropagation();
    this.setIsEdit(false);
    const { data } = this.props;
    this.setRoleName(data.name);
  };

  onModifyOk = (e) => {
    e.stopPropagation();
    this.setIsEdit(false);
    const { data } = this.props;
    systemManageServices
      .modifySystemRoleName(data.id, {
        name: this.state.roleName,
      })
      .then((res) => {
        this.setState({
          roleName: this.newRoleName,
        });
      });
  };

  render() {
    const menu = (
      <Menu onClick={(e) => this.controlMenu(e.key)}>
        <Menu.Item key="rename">重命名</Menu.Item>
        {/* <Menu.Item key="copy">复制</Menu.Item> */}
        <Menu.Item key="del">
          <span style={{ color: "rgb(255,0,0)" }}>删除</span>
        </Menu.Item>
      </Menu>
    );
    return (
      <div className={styles.contentItem}>
        <div
          style={{
            width: "90%",
            textAlign: "left",
            display: "flex",
            flexDirection: "row",
          }}
          onClick={this.handleContentItemClick}
        >
          {this.state.isModify ? (
            <Fragment>
              <Col span={15}>
                <Input
                  style={{ borderRadius: "5px" }}
                  placeholder="请输入名称"
                  size="small"
                  autoFocus
                  onChange={(e) => this.setRoleName(e.target.value.trim())}
                  onPressEnter={(e) => {
                    e.stopPropagation();
                    this.setIsEdit(false);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  allowClear
                  value={this.state.roleName}
                />
              </Col>
              <Col span={3} style={{ textAlign: "right" }}>
                <Button
                  onClick={(e) => this.onModifyCancel(e)}
                  size="small"
                  shape="circle"
                >
                  <CloseOutlined />
                </Button>
              </Col>
              <Col span={3} style={{ textAlign: "center" }}>
                <Button
                  size="small"
                  onClick={(e) => this.onModifyOk(e)}
                  shape="circle"
                  type="primary"
                >
                  <CheckOutlined />
                </Button>
              </Col>
            </Fragment>
          ) : (
            <span>{this.state.roleName}</span>
          )}
        </div>
        {!this.props.moreDisable ? (
          <div>
            <Dropdown
              trigger="click"
              overlay={menu}
              onVisibleChange={(val) => this.setDropDownVisible(val)}
              visible={this.state.dropdownVisible}
            >
              <MyIcon type="icon-gengduo2" />
            </Dropdown>
          </div>
        ) : null}
      </div>
    );
  }
}
export default class SystemManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      addRolePanelVisible: false,
      topPosition: 0,
      newRoleName: undefined,
      permissionType: "project",
      globalSystemRole: [],
      systemRole: [],
      selectedId: "",
      selectedData: null,
      loginUserName: "",
      loginUserEmail: "",
      loginUserAvatar: "",
    };
  }

  componentDidMount() {
    this.getAllData();
  }

  getAllData = () => {
    systemManageServices.getLoginUser().then((res) => {
      if (res && res.data) {
        this.setState({
          loginUserName: res.data.name,
          loginUserEmail: res.data.email,
          loginUserAvatar: res.data.avatar,
        });
      }
    });
    systemManageServices.getSystemRole().then((res) => {
      if (res && res.code === "0") {
        this.setState({
          systemRole: res.data,
        });
      }
    });
    systemManageServices.getGlobalSystemRole().then((res) => {
      if (res && res.code === "0") {
        this.setState({
          globalSystemRole: res.data,
        });
      }
    });
  };

  onDelRoleClick = (id) => {
    let arr = this.state.systemRole;
    const index = arr.findIndex((item) => item.id === id);
    arr.splice(index, 1);
    this.setState({
      systemRole: arr,
    });
  };

  handleAddRoleClick = () => {
    const addNewRoleDom = this.refs["addNewRole"];
    this.setState({
      addRolePanelVisible: true,
      topPosition: addNewRoleDom.offsetTop - 80 || 200,
    });
  };
  handleAddNewRolePanelCancelClick = () => {
    this.setState({
      addRolePanelVisible: false,
    });
  };
  handleAddNewRolePanelSaveClick = () => {
    const param = {
      name: this.state.newRoleName,
    };
    systemManageServices.addSystemRole(param).then((res) => {
      if (res && res.code === "0") {
        let arr = this.state.systemRole;
        arr = [...arr, res.data];
        this.setState({
          systemRole: arr,
          addRolePanelVisible: false,
          modalVisible: true,
          selectedId: res.data.id,
          selectedData: res.data,
        });
      }
    });
  };

  onModalOk = (keys, type) => {
    let newKeys = [];
    keys.forEach((item) => {
      if (!item.includes("-")) {
        newKeys.push(item);
      }
    });
    this.setState(
      {
        modalVisible: false,
      },
      () => {
        const param = {
          function_ids: newKeys,
          role_id: this.state.selectedId,
        };
        systemManageServices.addPermission2Role(param).then((res) => {
          if (res && res.code === "0") {
            if (type === "project") {
              systemManageServices.getSystemRole().then((res) => {
                if (res && res.code === "0") {
                  this.setState({
                    systemRole: res.data,
                  });
                }
              });
            } else {
              systemManageServices.getGlobalSystemRole().then((res) => {
                if (res && res.code === "0") {
                  this.setState({
                    globalSystemRole: res.data,
                  });
                }
              });
            }
          }
        });
      }
    );
  };
  onModalCancel = () => {};
  handleNewRoleNameInputChange = (value) => {
    this.setState({
      newRoleName: value,
    });
  };
  handleContentItemClick = (type, data) => {
    this.setState({
      modalVisible: true,
      permissionType: type,
      selectedId: data.id,
      selectedData: data,
    });
  };
  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.profilePic}>
            <img
              src={this.state.loginUserAvatar}
              alt=""
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <div className={styles.info}>
            <span>{this.state.loginUserName}</span>
            <span>{this.state.loginUserEmail}</span>
          </div>
        </div>
        <p className={styles.title}>
          <span>权限控制</span>
        </p>
        <div
          className={`${styles.body} ${globalStyle.autoScrollY}`}
          style={{ height: "calc(100% - 140px)" }}
        >
          <Collapse expandIconPosition="right" activeKey={["1", "2"]}>
            <Panel header={<span>项目角色管理</span>} key="1">
              {this.state.systemRole.map((item) => {
                return (
                  <ContentItem
                    key={guid()}
                    parent={this}
                    type="project"
                    data={item}
                  ></ContentItem>
                );
              })}
              <div className={styles.contentItem} ref="addNewRole">
                <div
                  style={{
                    width: "90%",
                    textAlign: "left",
                    color: "rgba(158, 166, 194, 1)",
                  }}
                >
                  <span>创建新角色</span>
                </div>
                <i
                  className={`${globalStyle.global_icon} ${globalStyle.btn}`}
                  onClick={this.handleAddRoleClick}
                >
                  &#xe7dc;
                </i>
              </div>
              {this.state.addRolePanelVisible ? (
                <div
                  className={styles.addRolePanel}
                  style={{ top: this.state.topPosition }}
                >
                  <div className={styles.addRoleTitle}>
                    <div
                      style={{ width: "calc(100% - 90px)", textAlign: "left" }}
                    >
                      <span>角色名称</span>
                    </div>
                    <div style={{ width: 90 }}>
                      <span
                        style={{ marginRight: "10px" }}
                        className={globalStyle.btn}
                        onClick={this.handleAddNewRolePanelCancelClick}
                      >
                        取消
                      </span>
                      <span
                        style={{ color: "rgba(102, 144, 255, 1)" }}
                        className={globalStyle.btn}
                        onClick={this.handleAddNewRolePanelSaveClick}
                      >
                        下一步
                      </span>
                    </div>
                  </div>
                  <Input
                    placeholder="输入角色名称"
                    style={{ width: "92%", margin: "0 12px" }}
                    value={this.state.newRoleName}
                    onChange={(e) =>
                      this.handleNewRoleNameInputChange(e.target.value)
                    }
                    onPressEnter={(e) =>
                      this.handleNewRoleNameInputChange(e.target.value)
                    }
                  />
                </div>
              ) : null}
            </Panel>
            <Panel header={<span>应用管理</span>} key="2">
              {this.state.globalSystemRole.map((item) => {
                return (
                  <ContentItem
                    key={guid()}
                    moreDisable={true}
                    parent={this}
                    type="application"
                    data={item}
                  ></ContentItem>
                );
              })}
            </Panel>
          </Collapse>
        </div>
        {this.state.modalVisible ? (
          <SystemManageModal
            type={this.state.permissionType}
            modalVisible={this.state.modalVisible}
            parent={this}
            roleId={this.state.selectedId}
            selectedData={this.state.selectedData}
          ></SystemManageModal>
        ) : null}
      </div>
    );
  }
}
