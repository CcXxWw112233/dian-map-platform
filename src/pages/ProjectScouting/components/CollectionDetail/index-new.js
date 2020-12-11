import React from "react";
import ReactDOM from "react-dom";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./styles.less";
export default class NewCollectionDetai extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return ReactDOM.createPortal(
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <i className={globalStyle.global_icon}>&#xe7d0;</i>
        </div>
        <div className={styles.body}>
          <div styles={styles.imgContainer}>
            <img alt="" src=""/>
          </div>
          <p className={styles.title}></p>
          <p className={styles.describe}></p>
          <p></p>
        </div>
      </div>,
      document.body
    );
  }
}
