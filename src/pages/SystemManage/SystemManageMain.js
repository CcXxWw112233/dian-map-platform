import React from "react";
import RoleManageMain from "./RoleManageMain";
import MemberManageMain from "./MemberManageMain";
import styles from "./SystemManageMain.less";
import Event from "../../lib/utils/event";

export default class SystemManageMain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 0,
    };
    Event.Evt.on("toggleSystemManagePage", (type) => {
      this.setState({
        show: type,
      });
    });
  }
  render() {
    return (
      <div className={styles.wrapper}>
        {this.state.show === 0 ? <RoleManageMain /> : <MemberManageMain />}
      </div>
    );
  }
}
