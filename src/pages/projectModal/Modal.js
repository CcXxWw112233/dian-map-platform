import React from "react";
import { connect } from "dva";
import { Modal, Row, Col, Input, Select } from "antd";
import styles from "./Modal.less";
const { Option, OptGroup } = Select;
const { TextArea } = Input;
@connect(({ modal: { visible, data } }) => ({ visible, data }))
export default class ProjectModal extends React.Component {
  constructor(props) {
    super(props);
  }
  hideModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "modal/setVisible",
      payload: {
        visible: false,
      },
    });
  };
  handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  render() {
    const { visible, data } = this.props;
    return (
      <Modal
        className={styles.wrap}
        width={300}
        title="添加标注"
        visible={visible}
        onOk={this.hideModal}
        onCancel={this.hideModal}
        okText="确定"
        cancelText="取消"
        centered={true}
      >
        <Row className={styles.row}>
          <Col className={styles.firstCol}>
            <label>名称</label>
          </Col>
          <Col className={styles.secondCol}>
            <Input placeholder="请输入名称" />
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col className={styles.firstCol}>
            <label>类型</label>
          </Col>
          <Col className={styles.secondCol}>
            <Select style={{ width: "100%" }} onChange={this.handleChange}>
              <OptGroup label="常用">
                <Option value="综合文化活动中心">综合文化活动中心</Option>
                <Option value="幼儿园">幼儿园</Option>
              </OptGroup>
              <OptGroup label="城镇">
                <Option value="直辖市">直辖市</Option>
                <Option value="镇">镇</Option>
              </OptGroup>
              <OptGroup label="给排水">
                <Option value="水库">水库</Option>
              </OptGroup>
              <OptGroup label="交通">
                <Option value="码头">码头</Option>
                <Option value="机场">机场</Option>
              </OptGroup>
            </Select>
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col className={styles.firstCol}>
            <label>备注</label>
          </Col>
          <Col className={styles.secondCol}>
            <TextArea></TextArea>
          </Col>
        </Row>
      </Modal>
    );
  }
}
