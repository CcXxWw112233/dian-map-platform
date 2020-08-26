import React from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import styles from "../LeftToolBar.less";
import { connect } from "dva";

@connect()
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openPanel: true,
    };
  }

  toOld = () => {
    let search = window.location.search || window.location.hash;
    let origin = window.location.origin;
    let href = origin + "/oldpage/" + search.replace("#/", "");
    setTimeout(() => {
      window.open(href, "_self");
    }, 500);
  };

  render() {
    const { dispatch } = this.props;
    const panelStyle = this.state.openPanel
      ? {}
      : { transform: "translateX(-100%)" };
    const directionStyle = { display: "table-cell", verticalAlign: "middle" };
    return (
      <div className={styles.panel} style={panelStyle} id="leftPanel">
        <div style={{ width: "100%", height: "100%" }}>
          {this.props.children}
        </div>
        <div
          className={styles.controller}
          onClick={() => {
            dispatch({
              type: "openswitch/updateDatas",
              payload: {
                openPanel: !this.state.openPanel,
              },
            });
            this.setState({
              openPanel: !this.state.openPanel,
            });
          }}
        >
          {this.state.openPanel ? (
            <LeftOutlined style={directionStyle} />
          ) : (
            <RightOutlined style={directionStyle} />
          )}
        </div>
        <a className={styles.changePackage} onClick={this.toOld} target="_self">
          切换旧版
        </a>
      </div>
    );
  }
}
