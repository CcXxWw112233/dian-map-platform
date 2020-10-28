import React, { Fragment } from "react";
import { Modal, Button, Select } from "antd";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./permissionModal.less";
import systemManageServices from "../../../services/systemManage";

export default class PermissionModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectMemberArr: [],
      roleArr: [],
      addMember: false,
      orgUserArr: [],
      modal2Visible: false,
      allUser: false,
      selectedUserId: -1,
      projectMemeberRoleArr: [],
    };
    this.toggle = false;
  }

  componentDidMount() {
    const { data } = this.props;
    systemManageServices.getProjectMember(data.board_id).then((res) => {
      if (res && res.data) {
        let arr = [];
        res.data.forEach((item) => {
          arr.push(item.role.id);
        });
        this.setState({
          projectMemberArr: res.data,
          projectMemeberRoleArr: arr,
        });
      }
    });
    systemManageServices.getSystemRole().then((res) => {
      if (res && res.data) {
        this.setState({
          roleArr: res.data,
        });
      }
    });
  }

  hideModal = () => {
    const { parent } = this.props;
    parent.setState({
      permissionModalVisible: false,
    });
  };
  handleOk = () => {
    this.hideModal();
  };
  handleCancel = () => {
    this.hideModal();
  };

  handleOk2 = () => {
    this.setState(
      {
        modal2Visible: false,
      },
      () => {
        const { data } = this.props;

        const param = {
          board_id: data.board_id,
          user_id: this.state.selectedUserId,
        };
        systemManageServices.addProjectMember(param).then((res) => {
          if (res && res.code === "0") {
            const { projectMemberArr } = this.state;
            this.setState({
              projectMemberArr: [...projectMemberArr, res.data],
            });
          }
        });
      }
    );
  };
  handleCancel2 = () => {
    this.setState({
      modal2Visible: false,
    });
  };
  deleteMember = (id) => {
    const { data } = this.props;
    systemManageServices.deleteProjectMember(id, data.board_id).then((res) => {
      if (res && res.code === "0") {
        const index = this.state.projectMemberArr.findIndex(
          (item) => item.id === id
        );
        let arr = this.state.projectMemberArr;
        arr.splice(index, 1);
        this.setState({ projectMemberArr: arr });
      }
    });
  };
  handleAddMember = async () => {
    this.setState({
      modal2Visible: true,
    });
    const res = await systemManageServices.getOrgUser();
    if (res && res.code === "0") {
      let arr = res.data;
      let tmp = [];
      const { projectMemberArr } = this.state;
      arr.forEach((item) => {
        const index = projectMemberArr.findIndex(
          (item2) => item.id === item2.user.id
        );
        if (index < 0) {
          tmp.push(item);
        }
      });

      this.setState({
        orgUserArr: tmp,
      });
    }
  };
  onSelectChange = (roleId, user, index) => {
    const { data } = this.props;
    const param = {
      board_id: data.board_id,
      role_id: roleId,
      user_id: user.id,
    };
    systemManageServices.modifyProjectMember(param).then((res) => {
      if (res && res.code === "0") {
        let arr = this.state.projectMemeberRoleArr;
        arr[index] = roleId;
        this.setState({
          projectMemeberRoleArr: arr,
        });
      }
    });
  };
  handleSelectUser = (userId) => {
    this.setState({
      selectedUserId: userId,
    });
  };
  handleGoBack = () => {
    this.setState({
      modal2Visible: false,
    });
  };
  render() {
    let title = "";
    let footer = null;
    let cancelText = null,
      okText = null;
    if (!this.state.modal2Visible) {
      const { data } = this.props;
      title = data.board_name;
    }
    if (this.state.modal2Visible) {
      footer = undefined;
      cancelText = "取消";
      okText = "确定";
      title = (
        <div
          style={{ display: "flex", flexDirection: "row", lineHeight: "32px" }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "rgba(134, 179, 255, 1)",
              marginRight: "20px",
            }}
            onClick={this.handleGoBack}
          >
            <i
              className={`${globalStyle.global_icon} ${globalStyle.btn}`}
              style={{ color: "#fff", fontSize: 28 }}
            >
              &#xe7ba;
            </i>
          </div>
          <span>添加项目成员</span>
        </div>
      );
    }
    const { permissionModal } = this.props;
    const { Option } = Select;
    return (
      <div>
        {!this.state.modal2Visible ? (
          <Modal
            title={title}
            footer={footer}
            width={516}
            visible={permissionModal}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            cancelText={cancelText}
            okText={okText}
          >
            <div className={styles.wrapper}>
              <div className={styles.titleHeader}>
                <span style={{ width: "70%" }}>成员</span>
                <span>角色</span>
              </div>
              <div style={{ width: "100%" }}>
                {this.state.projectMemberArr.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      className={`${styles.titleHeader} ${styles.item}`}
                    >
                      <i
                        className={`${globalStyle.global_icon} ${globalStyle.btn}`}
                        style={{ fontSize: 24 }}
                        onClick={() => this.deleteMember(item.id)}
                      >
                        &#xe7d0;
                      </i>
                      <div className={styles.itemBody}>
                        <img src={item.user.avatar} alt="" />
                        <span>{item.user.name}</span>
                      </div>
                      <Select
                        style={{ width: 188, marginTop: 5 }}
                        placeholder="选择角色"
                        onChange={(value) =>
                          this.onSelectChange(value, item.user, index)
                        }
                        value={this.state.projectMemeberRoleArr[index]}
                      >
                        {this.state.roleArr.map((item) => {
                          return (
                            <Option key={item.id} value={item.id}>
                              {item.name}
                            </Option>
                          );
                        })}
                      </Select>
                    </div>
                  );
                })}
              </div>
              <Button
                style={{
                  background: "rgba(134, 179, 255, 1)",
                  float: "right",
                }}
                onClick={this.handleAddMember}
              >
                <i
                  className={globalStyle.global_icon}
                  style={{ color: "rgba(255, 255, 255, 1)" }}
                >
                  &#xe7dc;
                </i>
              </Button>
            </div>
          </Modal>
        ) : (
          <Modal
            title={title}
            footer={footer}
            width={516}
            visible={this.state.modal2Visible}
            onOk={this.handleOk2}
            onCancel={this.handleCancel2}
            cancelText={cancelText}
            okText={okText}
          >
            <div className={styles.wrapper}>
              <div></div>
              <div style={{ width: "100%" }}>
                {/* <div
                  className={`${styles.titleHeader} ${styles.item} ${styles.listItem}`}
                >
                  <div className={styles.profilePic}>
                    <i className={globalStyle.global_icon}>&#xe764;</i>
                  </div>
                  <div style={{ width: "calc(100% - 40px)" }}>
                    <span>所有人</span>
                  </div>
                  {this.state.allUser ? <i
                    className={globalStyle.global_icon}
                    style={{ float: "right" }}
                  >
                    &#xe75b;
                  </i>: null}
                </div> */}
                {this.state.orgUserArr.map((item) => {
                  return (
                    <div
                      className={`${styles.titleHeader} ${styles.item} ${styles.listItem}`}
                      key={item.id}
                      onClick={() => this.handleSelectUser(item.id)}
                    >
                      <div className={styles.profilePic}>
                        <img src={item.avatar} alt=""></img>
                      </div>
                      <div style={{ width: "calc(100% - 40px)" }}>
                        <span>{item.name}</span>
                      </div>
                      {this.state.selectedUserId === item.id ? (
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
            </div>
          </Modal>
        )}
      </div>
    );
  }
}