import React from "react";
import { connect } from "dva";
import { Modal, Row, Col, Input, Select, message } from "antd";
import styles from "./Modal.less";
import { draw } from "../../utils/draw";
import { createStyle } from "@/lib/utils/index";
const { Option, OptGroup } = Select;
const { TextArea } = Input;

@connect(({ plotting: { type, layer, operator } }) => ({
  type,
  layer,
  operator,
}))
@connect(({ modal: { visible, responseData } }) => ({ visible, responseData }))
@connect(({ featureOperatorList: { featureOperatorList } }) => ({
  featureOperatorList,
}))
export default class ProjectModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      featureName: "", // 名称
      selectName: "",
      featureType: "", // 类型
      remarks: "", // 备注
      pointTypes: [], // 点的类型
      polylineTypes: [], // 线的类型
      polygonTypes: [], // 面的类型
    };
  }

  checkStateChange = (state, attr) => {
    if (state !== attr) {
      return state
    }
    return attr
  }

  // 大写转换
  toChangedataType = (plottingType) => {
    let tempType = plottingType.toLowerCase();
    tempType = tempType[0].toUpperCase() + tempType.slice(1);
    return tempType;
  };
  handleOKClick = () => {
    const state = this.checkInputState();
    const { dispatch } = this.props
    if (state) {
      if (this.state.isEdit) {
        // message.success("保存成功");
        let plottingType = this.props.type;
        const tempType = this.toChangedataType(plottingType);
        const defaultOptions = {
          radius: 8,
          fillColor: "#a8090a",
          strokeColor: "#000000",
          text: this.state.featureName,
        };
        const commonStyleOption = {
          textFillColor: "rgba(255,0,0,1)",
          textStrokeColor: "#fff",
          textStrokeWidth: 3,
          font: "13px sans-serif",
          placement: "point",
          iconScale: 0.6,
          pointColor: "#fff",
          showName: true,
        };
        let options = {};
        const featureType = this.state.featureType;
        const operator = this.props.operator
        const featureTypeState = this.checkStateChange(this.state.featureType, operator.attrs.featureType)
        const featureNameState = this.checkStateChange(this.state.featureName, operator.attrs.name)
        const plottingLayer = draw.plottingLayer
        const me = this
        const cb = function() {
          let featureOperatorList = me.props.featureOperatorList
          plottingLayer.removeFeature(me.props.operator)
          for (let i = 0; i< featureOperatorList.length;i++) {
            if (featureOperatorList[i].guid === me.props.operator.guid) {
              featureOperatorList.splice(i, 1)
              break
            }
          }
          dispatch({
            type: "featureOperatorList/updateList",
            payload: {
              featureOperatorList: featureOperatorList,
            },
          });
        }
        plottingLayer.plotEdit.setCallback(cb)
        if (tempType === "Point") {
          // 如果没有选择类型
          if (!featureTypeState) {
            options = { ...defaultOptions, ...commonStyleOption };
          } else {
            let tempIconUrl = featureTypeState;
            tempIconUrl = tempIconUrl.replace("img", "");
            const iconUrl = require("../../assets" + tempIconUrl);
            options = {
              ...commonStyleOption,
              iconUrl: iconUrl,
              iconScale: 1,
              text: featureNameState,
            };
          }
        }
        if (tempType === "Polyline") {
          options = {
            ...commonStyleOption,
            ...{
              strokeColor: featureTypeState,
              strokeWidth: 3,
              text: featureNameState,
            },
          };
        }
        if (tempType === "Polygon") {
          if (!featureType) {
            options = {
              ...commonStyleOption,
              ...{ fillColor: "#a8090a", text: featureNameState },
            };
          } else {
            let tempIconUrl = featureType;
            if (tempIconUrl.indexOf("/") > -1) {
              tempIconUrl = tempIconUrl.replace("img", "");
              const iconUrl = require("../../assets" + tempIconUrl);
              let canvas = document.createElement("canvas");
              let context = canvas.getContext("2d");
              let img = new Image();
              img.src = iconUrl;
              const me = this;
              img.onload = function () {
                const pat = context.createPattern(img, "repeat");
                options = {
                  ...commonStyleOption,
                  ...{
                    fillColor: pat,
                    text: me.state.featureName,
                  },
                };
                const style = createStyle(tempType, options);
                window.featureOperator.feature.setStyle(style);
                return;
              };
            } else {
              let strokeColor = featureType.replace("0.7", 1);
              options = {
                ...commonStyleOption,
                ...{
                  fillColor: featureType,
                  strokeColor: strokeColor,
                  text: featureNameState,
                },
              };
            }
          }
        }
        const style = createStyle(tempType, options);
        window.featureOperator.feature.setStyle(style);
        window.featureOperator.setName(featureNameState);
        this.setAttribute();
        this.updateOperatorToList(window.featureOperator);
      }
      this.hideModal();
    } else {
      message.warn("请输入名称");
    }
  };

  updateOperatorToList = (featureOperator) => {
    const { dispatch, featureOperatorList } = this.props;
    console.log(featureOperatorList);
    featureOperatorList.push(featureOperator);
    dispatch({
      type: "featureOperatorList/updateList",
      payload: {
        featureOperatorList: featureOperatorList,
      },
    });
  };

  // 给featureOperator设置attribute
  setAttribute = () => {
    const featureOperator = window.featureOperator
    const feature = featureOperator.feature.clone();
    const geometry = feature.getGeometry();
    geometry.transform("EPSG:3857", "EPSG:4326");
    const points = geometry.getCoordinates();
    const featureType = this.props.type;
    let newGeom = this.getPointStr(points);
    let attr = {};
    const featureTypeState = this.checkStateChange(this.state.featureType, featureOperator.attrs.featureType)
    const featureNameState = this.checkStateChange(this.state.featureName, featureOperator.attrs.featureName)
    const remarksState = this.checkStateChange(this.state.remarks, featureOperator.attrs.remarks)
    const selectNameState = this.checkStateChange(this.state.selectName, featureOperator.attrs.selectName)
    switch (featureType) {
      case "POINT":
        attr = {
          geom: `POINT(${newGeom})`,
          icon_url: featureTypeState,
          featureType: featureTypeState,
          main_id: "",
          name: featureNameState,
          remark: remarksState,
          selectName: selectNameState,
        };
        break;
      case "POLYLINE":
        attr = {
          geom: `LINESTRING(${newGeom})`,
          style: `${featureTypeState};${featureTypeState}`,
          featureType: featureTypeState,
          main_id: "",
          name: featureNameState,
          remark: remarksState,
          selectName: selectNameState,
        };
        break;
      case "POLYGON":
        let style = null;
        if (featureTypeState.indexOf("/") > -1) {
          style = `${featureTypeState};icon`;
        } else {
          const fillColor = featureOperator.feature
            .getStyle()
            .getFill()
            .getColor();
          const strokeColor = featureOperator.feature
            .getStyle()
            .getStroke()
            .getColor();
          style = `${fillColor};${strokeColor}`;
        }
        attr = {
          geom: `POLYGON((${newGeom}))`,
          style: style,
          featureType: featureTypeState,
          main_id: "",
          name: selectNameState,
          remark: remarksState,
          selectName: selectNameState,
        };
        break;
      default:
        break;
    }
    const keyArray = Object.keys(attr);
    keyArray.forEach((key) => {
      window.featureOperator.setAttribute(key, attr[key]);
    });
  };

  // 拼接poiStr
  getPointStr = (points) => {
    let pointStr = "";
    if (points && points.length) {
      points.forEach((point, index) => {
        pointStr += `${point[0]} ${point[1]},`;
        if (index === points.length - 1) {
          pointStr = pointStr.slice(0, pointStr.length - 1);
        }
      });
    }
    return pointStr;
  };
  checkInputState = () => {
    if (this.state.featureName.length === 0) {
      return false;
    }
    return true;
  };
  handleCancelClick = () => {
    this.hideModal();
  };
  hideModal = () => {
    const { dispatch } = this.props;
    this.setState({
      isEdit: false,
    });
    dispatch({
      type: "modal/setVisible",
      payload: {
        visible: false,
      },
    });
  };
  handleNameInputChange = (value) => {
    this.setState({
      featureName: value,
      isEdit: true,
    });
  };
  handleTypeSelectChange = (val) => {
    const { responseData } = this.props;
    const arr = val.split(",");
    const index0 = Number(arr[0]);
    const index1 = Number(arr[1]);
    const value = responseData.data[index0].items[index1];
    this.setState({
      isEdit: true,
      selectName: value.name,
      featureType: value.value1,
    });
  };
  handleRemarksInputChange = (value) => {
    this.setState({
      remarks: value,
      isEdit: true,
    });
  };
  clearState = () => {
    this.setState({});
  };
  render() {
    const { visible, responseData, operator } = this.props;
    let title = "添加备注";
    let remark = "";
    let name = "";
    let selectDefaultVal = "请选择类型";
    if (operator && operator.attrs.name) {
      name = operator.name;
      title = "修改备注";
    }
    if (operator && operator.attrs.remark) {
      remark = operator.attrs.remark;
    }
    if (operator && operator.attrs.selectName) {
      selectDefaultVal = operator.attrs.selectName;
    }
    let dataArray = [];
    if (responseData && responseData.data) {
      dataArray = responseData.data;
    }
    console.log(dataArray);
    return (
      <Modal
        destroyOnClose
        className={styles.wrap}
        width={300}
        title={title}
        visible={visible}
        onOk={this.handleOKClick}
        onCancel={this.handleCancelClick}
        okText="确定"
        cancelText="取消"
        centered={true}
        afterClose={this.clearState}
      >
        <Row className={styles.row}>
          <Col className={styles.firstCol}>
            <label>名称</label>
          </Col>
          <Col className={styles.secondCol}>
            <Input
              placeholder="请输入名称"
              defaultValue={name}
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
              placeholder={selectDefaultVal}
            >
              {dataArray.map((data, index0) => {
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
              })}
            </Select>
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col className={styles.firstCol}>
            <label>备注</label>
          </Col>
          <Col className={styles.secondCol}>
            <TextArea
              defaultValue={remark}
              onChange={(e) => this.handleRemarksInputChange(e.target.value)}
            ></TextArea>
          </Col>
        </Row>
      </Modal>
    );
  }
}
