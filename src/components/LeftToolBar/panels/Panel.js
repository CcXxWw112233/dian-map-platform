import React from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Icon } from 'antd'

import styles from "../LeftToolBar.less";
import BasemapGallery from "../../BasemapGallery/BasemapGallery";
import { connect } from "dva";

@connect(({ openswitch: { openPanel } }) => ({ openPanel }))
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // openPanel: true,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: "openswitch/updateDatas",
      payload: {
        panelDidMount: true,
      },
    });
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
    const { dispatch, openPanel } = this.props;
    const panelStyle = openPanel ? {} : { transform: "translateX(-100%)" };
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
                openPanel: !openPanel,
              },
            });
          }}
        >
          {openPanel ? (
            <Icon type="left" style={directionStyle} />
            ) : (
            <Icon type="right" style={directionStyle} />
          )}
        </div>
        {/* <a className={styles.changePackage} onClick={this.toOld} target="_self">
          切换旧版
        </a> */}
        {/* {this.props.isShowBasemapGallery && <BasemapGallery style={{left: "104%"}}/>} */}
      </div>
    );
  }
}
