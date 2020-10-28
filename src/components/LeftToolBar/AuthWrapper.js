import React from "react";
import systemManageServices from "../../services/systemManage";

export default class AuthWrapper {
  constructor(props) {
    super(props);
    this.projectPermission = null;
    this.globalPermission = null;
    if (!this.state.projectPermission) {
      systemManageServices.getPersonalPermission2Project().then((res) => {
        if (res && res.code === "0") {
          this.setState({
            projectPermission: res.data,
          });
        }
      });
    }
    if (!this.state.globalPermission) {
      systemManageServices.getPersonalPermission2Global().then((res) => {
        if (res && res.code === "0") {
          this.setState({
            globalPermission: res.data,
          });
        }
      });
    }
  }

  getStyle() {
    const { projectId } = this.props;
    const { globalPermission, projectPermission } = this.state;
    let index = -1;
    if (this.props.type === "org") {
      if (globalPermission !== null) {
        const keys = Object.keys(globalPermission);
        if (keys.length === 1) {
          let arr = globalPermission[keys[0]];
          index = arr.findIndex((item) => item === this.props.functionName);
        }
      }
    } else {
      let arr = [];
      if (projectId) {
        if (projectPermission) {
          arr = projectPermission[projectId];
          index = arr.findIndex((item) => item === this.props.functionName);
        }
      }
    }
    return index === -1 ? { pointerEvents: "none" } : {};
  }
}
