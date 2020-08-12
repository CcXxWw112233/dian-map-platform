import React from "react";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "../LeftToolBar.less";

export default class CustomSymbolStore extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div
        className={styles.panel}
        style={{ position: "absolute", left: 56, top: 0 }}
      >
        <div
          className={styles.header}
          style={{ padding: "0 20px", marginBottom: 10 }}
        >
          <span>自定义符号</span>
        </div>
        <div
          className={`${styles.body} ${globalStyle.autoScrollY}`}
          style={{
            height: "calc(100% - 30px)",
          }}
        ></div>
      </div>
    );
  }
}
