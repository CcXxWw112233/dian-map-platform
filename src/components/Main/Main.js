import React from "react";
import styles from "./Main.less";

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
    };
  }
  render(h) {
    const { row, visible, children, style } = this.props;
    let mainStyle = {
      flexDirection: "column",
    };
    if (row) {
      mainStyle.flexDirection = "row";
    }
    let visibleStyle = {
      display: "",
    };
    if (!visible) {
      visibleStyle.display = "none";
    }
    return (
      <div
        className={[styles.wrap].join(" ")}
        style={{
          ...mainStyle,
          ...(style || {}),
          background: "rgba(238,248,255,1)",
        }}
      >
        {children}
      </div>
    );
  }
}
