import React from "react";
import styles from "./Search.less";
import { Row } from "antd";
import globalStyle from "@/globalSet/styles/globalStyles.less";
export default class LocationPanel extends React.Component {
  render() {
    return (
      <div className={styles.locatePanel}>
        <div style={{ maxHeight: 300, width: "100%" }}>
          <Row>
            <i className={globalStyle.global_icon}>&#xe72a;</i>
            <div style={{ marginRight: 10 }}>
              <span>少聊村</span>
            </div>
            <div style={{ marginRight: 10 }}>
              <span>清远市阳山县</span>
            </div>
          </Row>
        </div>
      </div>
    );
  }
}
