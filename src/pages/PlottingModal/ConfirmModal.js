import React, { Component } from "react";
import { Modal } from "antd";
import styles from "./Modal.less";
import { connect } from "dva";

import Event from "../../lib/utils/event";

@connect(({ modal: { confirmVidible } }) => ({ confirmVidible }))
export default class ConfirmModal extends Component {
  constructor(props) {
    super(props);
  }

  handleOk = () => {
    Event.Evt.firEvent("saveFeatureToDB", true);
    this.hide();
  };
  handleCancel = () => {
    Event.Evt.firEvent("saveFeatureToDB", false);
    this.hide();
  };
  hide = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        confirmVidible: false,
      },
    });
  };
  render() {
    return (
      <Modal
        width={250}
        okText="确定"
        cancelText="取消"
        centered={true}
        className={styles.wrap}
        title="保存提示"
        visible={this.props.confirmVidible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <p>系统检测到图形已修改，是否保存？</p>
      </Modal>
    );
  }
}
