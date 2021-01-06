import React from "react"
import styles from "./styles.less"
import globalStyle from "@/globalSet/styles/globalStyles.less";
export default class MeetingSubscribe extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return <div className={styles.wrapper}>
      <p className={styles.title}>
        <i className={globalStyle.global_icon}>&#xe7d0;</i>
      </p>
      <div className={`${styles.body} ${globalStyle.autoScrollY}`} style={{height: "calc(100% - 30px)"}}>
        <p className={}><span>日期</span></p>
      </div>
    </div>
  }
}