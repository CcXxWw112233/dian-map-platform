import React, { Component } from "react";
import { Modal, Row, Col, Input, Select, message } from "antd";
import styles from "./Modal.less";
import ColorPicker from "components/ColorPicker";
import Action from "../../lib/components/PlottingModal/Action";

import { connect } from "dva";

const { Option, OptGroup } = Select;
const { TextArea } = Input;

@connect(
  ({
    plotting: { operator, type },
    featureOperatorList: { featureOperatorList },
    modal: {
      visible,
      responseData,
      featureName,
      selectName,
      featureType,
      strokeColorStyle,
      remarks,
    },
  }) => ({
    operator,
    type,
    featureOperatorList,
    visible,
    responseData,
    featureName,
    selectName,
    featureType,
    strokeColorStyle,
    remarks,
  })
)
export default class PlottingModal extends Component {
  constructor(props) {
    super(props);
    this.isOK = false;
    this.strokeColorStyle = undefined;
    this.fillColorStyle = undefined;
  }
  handleOKClick = () => {
    if (!this.props.featureName?.trim()) {
      message.warn("请输入名称");
    } else {
      this.isOK = true;
      const {
        dispatch,
        type: plottingType,
        operator,
        featureOperatorList,
        responseData,
      } = this.props;
      operator.responseData = responseData;
      const attrs = {
        featureName: this.props.featureName, //名称
        featureSelectName: this.props.selectName, // 选择类型的名称
        remarks: this.props.remarks, // 备注
        strokeColorStyle: this.props.strokeColorStyle, // 边线颜色
        fillColorStyle: this.props.featureType, // 填充颜色
      };
      Action.setAttribute(attrs, {
        dispatch,
        plottingType,
        operator,
        featureOperatorList,
      });
      this.handleCancelClick();
    }
  };

  // 取消
  handleCancelClick = () => {
    if (!this.isOK) {
      const { featureOperatorList } = this.props;
      const index = featureOperatorList.findIndex((item) => {
        return item.guid === window.featureOperator.guid;
      });
      if (index === -1) {
        const { dispatch } = this.props;
        Action.delCallBack({ dispatch });
      }
    }
    this.isOK = false;
    this.strokeColorStyle = undefined;
    this.fillColorStyle = undefined;
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        featureName: undefined,
        selectName: undefined,
        featureType: undefined,
        remarks: undefined,
        strokeColorStyle: undefined,
      },
    });
    dispatch({
      type: "modal/setVisible",
      payload: {
        visible: false,
      },
    });
  };

  // 名称
  handleNameInputChange = (value) => {
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        featureName: value,
      },
    });
  };
  // 名称
  handleTypeSelectChange = (value) => {
    let featureSelectName = "";
    let fillColorStyle = "";
    const { dispatch } = this.props;
    this.strokeColorStyle = undefined;
    this.fillColorStyle = undefined;
    if (value === "custom") {
      featureSelectName = "自定义类型";
    } else {
      const { responseData } = this.props;
      const arr = value.split(",");
      const index0 = Number(arr[0]);
      const index1 = Number(arr[1]);
      const selectValue = responseData.data[index0 - 1].items[index1];
      featureSelectName = selectValue.name;
      fillColorStyle = selectValue.value1;
    }
    dispatch({
      type: "modal/updateData",
      payload: {
        selectName: featureSelectName,
        featureType: fillColorStyle,
        strokeColorStyle: fillColorStyle,
      },
    });
  };
  // 线框颜色
  handleStrokeColorOkClick = (value) => {
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        strokeColorStyle: value,
      },
    });
  };

  // 填充颜色
  handleFillColorOkClick = (value) => {
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        featureType: value,
      },
    });
  };

  // 备注
  handleRemarksInputChange = (value) => {
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        remarks: value,
      },
    });
  };
  render() {
    let title = "新增备注";
    if (this.props.operator) {
      if (this.props.operator.name !== "未命名") {
        title = "修改备注";
      }
    }
    let selectOptions = [];
    if (this.props.responseData) {
      const customTypeOption = { type: "自定义类型", value: "custom" };
      const responseData = this.props.responseData.data;
      selectOptions = [customTypeOption, ...responseData];
    }
    let strokeColorStyle = null,
      fillColorStyle = null,
      disableStyle = null;
    if (this.props.type === "POLYLINE") {
      strokeColorStyle = this.props.featureType;
      if (strokeColorStyle && this.props.selectName === "自定义类型") {
        this.strokeColorStyle = strokeColorStyle;
      }
      fillColorStyle = null;
      disableStyle = { color: "rgba(0,0,0,0.2)" };
    } else {
      strokeColorStyle = this.props.strokeColorStyle;
      fillColorStyle = this.props.featureType;
      if (strokeColorStyle && this.props.selectName === "自定义类型") {
        this.strokeColorStyle = strokeColorStyle;
      }
      if (fillColorStyle && this.props.selectName === "自定义类型") {
        this.fillColorStyle = fillColorStyle;
      }
    }
    return (
      <Modal
        className={styles.wrap}
        width={310}
        title={title}
        visible={this.props.visible}
        onOk={() => this.handleOKClick()}
        onCancel={() => this.handleCancelClick()}
        okText="确定"
        cancelText="取消"
        centered={true}
        // mask={false}
        getContainer={document.getElementById("MapsView")}
        destroyOnClose={true}
        maskClosable={false}
      >
        <Row className={styles.row}>
          <Col className={styles.firstCol}>
            <label>名称</label>
          </Col>
          <Col className={styles.secondCol}>
            <Input
              placeholder="请输入名称"
              defaultValue={this.props.featureName}
              onChange={(e) => this.handleNameInputChange(e.target.value)}
            />
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col className={styles.firstCol}>
            <label>类型</label>
          </Col>
          <Col className={styles.secondCol}>
            <Select
              style={{ width: "100%" }}
              onChange={(e) => this.handleTypeSelectChange(e)}
              value={this.props.selectName}
              placeholder="请选择类型"
            >
              {selectOptions.map((data, index0) => {
                if (!data.items) {
                  return (
                    <Option value={data.value} key={data.value}>
                      {data.type}
                    </Option>
                  );
                } else {
                  return (
                    <OptGroup label={data.type} key={data.type}>
                      {data.items.map((item, index1) => {
                        return (
                          <Option value={`${index0},${index1}`} key={item.id}>
                            {item.name}
                          </Option>
                        );
                      })}
                    </OptGroup>
                  );
                }
              })}
            </Select>
          </Col>
        </Row>
        {this.props.selectName === "自定义类型" ? (
          <Row className={styles.row}>
            <Col className={styles.firstCol}></Col>
            <Col className={styles.secondCol}>
              <div className={styles.customList}>
                <div className={styles.customItem}>
                  <span className={styles.span}>线框颜色</span>
                  <ColorPicker
                    colorStyle={strokeColorStyle || this.strokeColorStyle}
                    handleOK={this.handleStrokeColorOkClick}
                  ></ColorPicker>
                </div>
                <div className={styles.customItem} style={{ marginLeft: 8 }}>
                  <span className={styles.span} style={disableStyle}>
                    填充颜色
                  </span>
                  <ColorPicker
                    colorStyle={fillColorStyle || this.fillColorStyle}
                    disable={this.props.type === "POLYLINE" ? true : false}
                    handleOK={this.handleFillColorOkClick}
                  ></ColorPicker>
                </div>
              </div>
            </Col>
          </Row>
        ) : null}
        <Row className={styles.row}>
          <Col className={styles.firstCol}>
            <label>备注</label>
          </Col>
          <Col className={styles.secondCol}>
            <TextArea
              defaultValue={this.props.remarks}
              onChange={(e) => this.handleRemarksInputChange(e.target.value)}
            ></TextArea>
          </Col>
        </Row>
      </Modal>
    );
  }
}
