import React from "react";

import styles from "../LeftToolBar.less";
import sysMange from "./SystemManage.less";
import Event from "../../../lib/utils/event"
export default class SystemManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
    };
  }

  handleEntryClick = (type) => {
    debugger
    this.setState({
      index: type,
    });
    Event.Evt.firEvent("toggleSystemManagePage", type)
  };
  render() {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <div
          className={styles.header}
          style={{ padding: "0 20px", marginBottom: 10 }}
        >
          <span>权限管理</span>
        </div>
        <div
          className={styles.body}
          style={{
            height: "calc(100% - 30px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className={`${sysMange.entry} ${
              this.state.index === 0 ? sysMange.on : ""
            }`}
            onClick={() => this.handleEntryClick(0)}
          >
            <span>角色管理</span>
          </div>
          <div
            className={`${sysMange.entry} ${
              this.state.index === 1 ? sysMange.on : ""
            }`}
            onClick={() => this.handleEntryClick(1)}
          >
            <span>成员管理</span>
          </div>
        </div>
      </div>
    );
  }
}
