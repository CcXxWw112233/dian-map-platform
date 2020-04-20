import React, { PureComponent } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import styles from "./Sider.less";

export default class Sider extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      txt: "收起",
    };
  }

  showDrawer = () => {
    if (this.state.open) {
      this.setState({ open: false, txt: "展开" });
    } else {
      this.setState({ open: true, txt: "收起" });
    }
  }

  render() {
    const { width, children } = this.props;
    let style = {
      width: width,
    };
    if (!this.state.open) {
      style = { ...style, ...{ transform: "translateX(-100%)" } };
    }
    return (
      <div className={styles.wrap} style={style}>
        <div className={styles.main}>{children}</div>
        <div className={styles.conttroller} onClick={this.showDrawer}>
          {this.state.open ? (
            <LeftOutlined className={styles.myDirection} />
          ) : (
            <RightOutlined className={styles.myDirection} />
          )}
          <span className={styles.txt}>{this.state.txt}</span>
        </div>
      </div>
    );
  }
}
