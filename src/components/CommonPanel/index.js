import React from "react";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./CommonPanel.less";

export default class CommonPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPanel: false,
    };
  }

  handleCloseBtnClick = (key) => {
    this.props.closePanel(key);
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.title}>
          <span>{this.props.panelName}</span>
          <i
            className={`${globalStyle.global_icon} ${globalStyle.btn}`}
            style={{ float: "right" }}
            onClick={() => this.handleCloseBtnClick(this.props.key)}
          >
            &#xe606;
          </i>
        </div>
        <div className={styles.body} style={{ height: "calc(100% - 65px)"}}>{this.props.children}</div>
      </div>
    );
  }
}
