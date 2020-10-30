import React from "react";
import { Modal, Button, Tree } from "antd";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./SystemMnageModal.less";
import systemManageServices from "../../../services/systemManage";
import { guid } from "./lib";

export default class SystemManageModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      modalVisible: true,
      treeCheckedKeys: [],
      treeSelectedKeys: [],
      treeExpandedKeys: [],
      autoTreeExpandParent: true,
      roleUsers: [],
    };
  }
  componentDidMount() {
    const { type, selectedData } = this.props;
    if (type === "project") {
      systemManageServices.getPermissionTree().then((res) => {
        if (res.code === "0") {
          let data = res.data;
          this.updateTreeData(data);
        }
      });
    }
    if (type === "application") {
      systemManageServices.getGlobalPermissionTree().then((res) => {
        if (res.code === "0") {
          let data = res.data;
          this.updateTreeData(data);
        }
      });
      systemManageServices
        .getGlobalRoleUser({ role_id: selectedData.id })
        .then((res) => {
          if (res.code === "0") {
            this.setState({
              roleUsers: res.data,
            });
          }
        });
    }
  }

  updateTreeData = (data) => {
    const { selectedData } = this.props;
    if (data && data.length > 0) {
      data.forEach((item) => {
        item.title = item.name;
        item.key = item.id || guid();
        if (item.children) {
          item.children.forEach((item2) => {
            item2.title = item2.name;
            item2.key = item2.id || guid();
          });
        }
      });
      this.setState({
        treeData: data,
        treeCheckedKeys: selectedData.function_ids,
      });
    }
  };

  onOk = () => {
    const { parent, type } = this.props;
    parent.onModalOk(this.state.treeCheckedKeys, type);
  };

  onCancel = () => {
    const { parent } = this.props;
    parent.setState({
      modalVisible: false,
    });
  };

  onTreeSelect = (selectedKeys) => {};
  onTreeCheck = (checkedKeys) => {
    this.setState({
      treeCheckedKeys: checkedKeys,
    });
  };
  onTreeExpand = (expandedKeys) => {
    this.setState({
      treeExpandedKeys: expandedKeys,
      autoExpandParent: false,
    });
  };
  render() {
    const { selectedData } = this.props;
    return (
      <Modal
        centered
        okText="确定"
        cancelText="取消"
        visible={this.state.modalVisible}
        title="配置权限"
        width={400}
        className={styles.wrapper}
        onOk={this.onOk}
        onCancel={this.onCancel}
      >
        <div style={{ height: 400 }}>
          <p style={{ height: 40, lineHeight: "40px", background: "#F5F7FA" }}>
            <span style={{ marginLeft: 24 }}>{selectedData.name}</span>
          </p>
          <div
            style={{ padding: "0 24px", height: 340 }}
            className={globalStyle.autoScrollY}
          >
            <Tree
              checkable
              expandedKeys={this.state.treeExpandedKeys}
              onCheck={this.onTreeCheck}
              onSelect={this.onTreeSelect}
              checkedKeys={this.state.treeCheckedKeys}
              selectedKeys={this.state.treeSelectedKeys}
              onExpand={this.onTreeExpand}
              treeData={this.state.treeData}
              autoExpandParent={this.state.autoTreeExpandParent}
            ></Tree>
            {this.state.roleUsers.length > 0 ? (
              <div>
                <p style={{ marginBottom: 20, marginTop: 20 }}>参与成员</p>
                {this.state.roleUsers.map((item) => {
                  return (
                    <div className={styles.infoItem} key={guid()}>
                      <div className={styles.profilePic}>
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: 20,
                            }}
                          />
                        ) : (
                          <i
                            className={globalStyle.global_icon}
                            style={{ fontSize: 20 }}
                          >
                            &#xe764;
                          </i>
                        )}
                      </div>
                      <div className={styles.text}>
                        <span>{item.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </Modal>
    );
  }
}
