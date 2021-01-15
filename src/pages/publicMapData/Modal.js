import react from "react";
import { message, Modal, Select } from "antd";

import SoutingAction from "../../../src/services/scouting";
import ScoutDetail from "../../lib/components/ProjectScouting/ScoutingDetail";
import publicData from "../../services/publicData";

export default class MyModal extends react.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectList: [],
      groupList: [],
      selectDisable: true,
      selectedGroupId: undefined,
    };
    this.projectId = "";
  }

  componentDidMount() {
    const orgId = SoutingAction.getUrlParam.orgId;
    SoutingAction.GET_SCOUTING_LIST(orgId).then((res) => {
      if (res.code === "0") {
        this.setState({
          projectList: res.data,
        });
      }
    });
  }

  hideModal = () => {
    const { parent } = this.props;
    parent &&
      parent.setState({
        modalVisible: false,
      });
  };
  onOk = () => {
    if (!this.projectId) {
      message.info("请选择项目。");
      return;
    } else {
      if (!this.state.selectedGroupId) {
        message.info("请选择组织。");
        return;
      }
    }
    const { data, parent } = this.props;
    if (parent.props.projectPermission) {
      let index = parent.props.projectPermission[this.projectId].findIndex(
        (item) => item === "map:collect:add:web"
      );
      if (index === -1) {
        message.info("您无权限引入,请联系管理员。");
        return;
      }
    } else {
      message.info("您无权限引入,请联系管理员。");
      return;
    }
    const { selectedGroupId } = this.state;
    let groupId = selectedGroupId;
    if (selectedGroupId === "other") {
      groupId = "";
    }
    publicData
      .setPublicDataIdsToProject(groupId, this.projectId, data)
      .then((res) => {
        if (res.code === "0") {
          message.info("已将所选内容引入到项目,请到项目中查看。");
        } else {
          message.info(res.message);
        }
      })
      .catch((e) => console.log(e));
    this.hideModal();
  };
  onCancel = () => {
    this.hideModal();
  };
  onProjectListChange = (value) => {
    let param = { board_id: value };
    this.projectId = value;
    this.setState(
      {
        selectedGroupId: undefined,
      },
      () => {
        ScoutDetail.fetchAreaList(param).then((resp) => {
          resp.data.push({
            id: "other",
            name: "未整理",
          });
          this.setState({
            selectDisable: false,
            groupList: resp.data,
          });
        });
      }
    );
  };
  onGroupListChange = (value) => {
    this.setState({
      selectedGroupId: value,
    });
  };
  render() {
    const { Option } = Select;
    return (
      <Modal
        centered
        mask={false}
        okText="确定"
        cancelText="取消"
        visible={this.props.visible}
        title="引用到项目"
        width={340}
        onOk={this.onOk}
        onCancel={this.onCancel}
      >
        <div
          style={{ width: "100%", display: "flex", flexDirection: "column" }}
        >
          <Select
            style={{ width: 300, marginBottom: 20 }}
            placeholder="选择项目"
            onChange={this.onProjectListChange}
          >
            {this.state.projectList.map((item) => {
              return (
                <Option key={item.board_id} value={item.board_id}>
                  {item.board_name}
                </Option>
              );
            })}
          </Select>
          <Select
            style={{ width: 300 }}
            placeholder="选择分组"
            disabled={this.state.selectDisable}
            value={this.state.selectedGroupId}
            onChange={this.onGroupListChange}
          >
            {this.state.groupList.map((item) => {
              return (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              );
            })}
          </Select>
        </div>
      </Modal>
    );
  }
}
