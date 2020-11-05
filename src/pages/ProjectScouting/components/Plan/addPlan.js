import React from "react";
import { DatePicker } from "antd";

import globalStyle from "@/globalSet/styles/globalStyles.less";

import styles from "./addPlan.less";
export default class AddPlan extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <i className={globalStyle.global_icon}>&#xe758;</i>
        </div>
        <div
          className={`${styles.body} ${globalStyle.autoScrollY}`}
          style={{ height: "calc(100% - 30px)" }}
        >
          <div className={styles.content}>
            <div className={styles.item}>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(208, 211, 226, 1)" }}
              >
                &#xe7f2;
              </i>
              <div style={{ width: "calc(100% - 48px)", textAlign: "left" }}>
                <span>现场拍照</span>
              </div>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(209, 213, 228, 1)" }}
              >
                &#xe7f1;
              </i>
            </div>
            <div className={styles.item}>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(208, 211, 226, 1)" }}
              >
                &#xe7f2;
              </i>
              <div style={{ width: "calc(100% - 48px)", textAlign: "left" }}>
                <span>现场拍照</span>
              </div>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(209, 213, 228, 1)" }}
              >
                &#xe7d0;
              </i>
            </div>
            <div className={styles.item}>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(141, 185, 255, 1)" }}
              >
                &#xe685;
              </i>
              <div style={{ width: "calc(100% - 48px)", textAlign: "left" }}>
                <span>现场拍照</span>
              </div>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(209, 213, 228, 1)" }}
              >
                &#xe7d0;
              </i>
            </div>
            <div className={`${styles.item} ${styles.add}`}>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(101, 143, 255, 1)" }}
              >
                &#xe7dc;
              </i>
              <span style={{ color: "rgba(101, 143, 255, 1)" }}>添加步骤</span>
            </div>
            <div className={styles.item}>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(106, 154, 255, 1)" }}
              >
                &#xe7f4;
              </i>
              <span>提醒我</span>
            </div>
            <div className={styles.item}>
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgba(106, 154, 255, 1)" }}
              >
                &#xe7f6;
              </i>
              {/* <span>添加截止日期</span> */}
              <DatePicker
                size="small"
                placeholder="添加截止日期"
                bordered={false}
                mode="date"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
