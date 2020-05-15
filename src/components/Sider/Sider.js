import React, { PureComponent } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import styles from "./Sider.less";
import { connect } from 'dva'

@connect(({openswitch:{ slideSwitch }})=>({ slideSwitch }))
export default class Sider extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  showDrawer = () => {
    let { dispatch ,slideSwitch } = this.props;
    // 开关slide
    dispatch({
      type:"openswitch/updateDatas",
      payload:{
        slideSwitch: !slideSwitch
      }
    })
  }

  render() {
    const { width, children , slideSwitch} = this.props;
    let style = {
      width: width,
    };
    if (!slideSwitch) {
      style = { ...style, ...{ transform: "translateX(-100%)" } };
    }
    return (
      <div className={styles.wrap} style={style}>
        <div className={styles.main}>{children}</div>
        <div className={styles.conttroller} onClick={this.showDrawer}>
          {slideSwitch ? (
            <LeftOutlined className={styles.myDirection} />
          ) : (
            <RightOutlined className={styles.myDirection} />
          )}
          <span className={styles.txt}>{slideSwitch ? '收起':'展开'}</span>
        </div>
      </div>
    );
  }
}
