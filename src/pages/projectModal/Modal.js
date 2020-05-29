import React from "react";
import { connect } from "dva";
import { Modal, Row, Col, Input, Select, message } from "antd";
import styles from "./Modal.less";
import { draw } from "../../utils/draw";
import { createStyle } from "@/lib/utils/index";
import { UpOutlined } from "@ant-design/icons";
import { SketchPicker } from "react-color";
import { Button } from "antd";
const { Option, OptGroup } = Select;
const { TextArea } = Input;

@connect(
  ({
    plotting: { type, layer, operator },
    modal: {
      visible,
      responseData,
      isEdit,
      featureName,
      selectName,
      featureType,
      remarks,
    },
    featureOperatorList: { featureOperatorList },
  }) => ({
    type,
    layer,
    operator,
    visible,
    responseData,
    featureOperatorList,
    isEdit,
    featureName,
    selectName,
    featureType,
    remarks,
  })
)
export default class ProjectModal extends React.Component {
  constructor(props) {
    super(props);
    this.setDefaultState();
    this.state = {
      isEdit: false,
      featureName: "", // 名称
      selectName: "",
      featureType: "rgba(168,9,10,0.7)", // 类型
      remarks: "", // 备注
      showCustom: this.showCustom,
      displayFillColorPicker: this.displayFillColorPicker,
      displayStrokeColorPicker: this.displayStrokeColorPicker,
      fillColor: this.fillColor,
      fillColorStyle: this.fillColorStyle,
      strokeColor: this.strokeColor,
      strokeColorStyle: this.strokeColorStyle,

      isSureFillColorStyle: this.isSureFillColorStyle,
      isSureStrokeColorStyle: this.isSureStrokeColorStyle,
    };
  }

  setDefaultState = () => {
    this.showCustom = false;
    this.displayFillColorPicker = false;
    this.displayStrokeColorPicker = false;
    this.isOk = false;
    this.fillColor = {
      r: "168",
      g: "9",
      b: "10",
      a: "0.7",
    };
    this.fillColorStyle = "rgba(168,9,10,0.7)";
    this.strokeColor = {
      r: "168",
      g: "9",
      b: "10",
      a: "1",
    };
    this.strokeColorStyle = "rgba(168,9,10,1)";
    this.isSureFillColorStyle = false;
    this.isSureStrokeColorStyle = false;
  };

  updateCustomState = () => {
    this.setState({
      showCustom: this.showCustom,
      displayFillColorPicker: this.displayFillColorPicker,
      displayStrokeColorPicker: this.displayStrokeColorPicker,
      fillColor: this.fillColor,
      fillColorStyle: this.fillColorStyle,
      strokeColor: this.strokeColor,
      strokeColorStyle: this.strokeColorStyle,
      isSureFillColorStyle: this.isSureFillColorStyle,
      isSureStrokeColorStyle: this.isSureStrokeColorStyle,
    });
  };

  checkStateChange = (state, attr) => {
    if (state !== attr) {
      return state;
    }
    return attr;
  };

  // 大写转换
  toChangedataType = (plottingType) => {
    let tempType = plottingType.toLowerCase();
    tempType = tempType[0].toUpperCase() + tempType.slice(1);
    return tempType;
  };

  delCallBack = () => {
    delete window.featureOperator;
    const { plottingLayer } = draw;
    const { dispatch } = this.props;
    let featureOperatorList = this.props.featureOperatorList;
    plottingLayer.removeFeature(this.props.operator);
    for (let i = 0; i < featureOperatorList.length; i++) {
      if (featureOperatorList[i].guid === this.props.operator.guid) {
        featureOperatorList.splice(i, 1);
        break;
      }
    }
    dispatch({
      type: "featureOperatorList/updateList",
      payload: {
        featureOperatorList: [...featureOperatorList],
      },
    });
  };
  handleOKClick = () => {
    this.isOk = true;
    const state = this.checkInputState();
    if (state) {
      if (this.props.isEdit) {
        let plottingType = this.props.type;
        let tempType = this.toChangedataType(plottingType);
        let defaultOptions = {
          radius: 8,
          // fillColor: "rgba(168,9,10,0.7)",
          fillColor: this.fillColorStyle,
          strokeColor: this.strokeColorStyle,
          // strokeColor: "rgba(168,9,10,1)",
          text: this.props.featureName,
        };
        if (this.state.isSureFillColorStyle) {
          defaultOptions.fillColor = this.state.fillColorStyle;
        }
        if (this.state.isSureStrokeColorStyle) {
          defaultOptions.strokeColor = this.state.strokeColorStyle;
        }
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
        const featureType = this.props.featureType || defaultOptions.fillColor;
        const operator = this.props.operator;
        const featureTypeState =
          this.checkStateChange(
            this.props.featureType,
            operator.attrs.featureType
          ) || defaultOptions.fillColor;
        const featureNameState = this.checkStateChange(
          this.props.featureName,
          operator.attrs.name
        );
        const plottingLayer = draw.plottingLayer;
        plottingLayer.plotEdit.setDelCallback(this.delCallBack.bind(this));
        plottingLayer.plotEdit.setUpdateCallback(
          this.updateOperatorToList.bind(this)
        );
        if (tempType === "Point") {
          this.updateFeatureType(defaultOptions.fillColor);
          options = { ...defaultOptions, ...commonStyleOption };
          let tempIconUrl = featureTypeState;
          if (tempIconUrl.indexOf("/") > -1) {
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
          if (this.state.isSureStrokeColorStyle) {
            options.strokeColor = this.state.strokeColorStyle;
          }
        }
        if (
          tempType === "Polygon" ||
          tempType === "Fine_arrow" ||
          tempType === "Rectangle" ||
          tempType === "Circle" ||
          tempType === "Freehandpolygon"
        ) {
          tempType = "Polygon";
          options = {
            ...commonStyleOption,
            ...{ fillColor: featureType, text: featureNameState },
          };
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
                  text: me.props.featureName,
                },
              };
              const style = createStyle(tempType, options);
              window.featureOperator.feature.setStyle(style);
              return;
            };
          } else {
            let strokeColor = featureType.replace("0.7", 1);
            if (this.state.isSureStrokeColorStyle) {
              strokeColor = this.state.strokeColorStyle;
            }
            let fillColor = featureType;
            if (this.state.isSureFillColorStyle) {
              fillColor = this.state.fillColorStyle;
            }
            options = {
              ...commonStyleOption,
              ...{
                fillColor: fillColor,
                strokeColor: strokeColor,
                text: featureNameState,
              },
            };
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

  updateFeatureType = (val) => {
    const { dispatch } = this.props;
    this.setState(
      {
        featureType: val,
      },
      () => {
        dispatch({
          type: "modal/updateData",
          payload: {
            featureType: val,
          },
        });
      }
    );
  };

  updateOperatorToList = (featureOperator) => {
    let { dispatch, featureOperatorList } = this.props;
    let arr = [...featureOperatorList];
    let isExist = false,
      index = -1;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].guid === featureOperator.guid) {
        isExist = true;
        index = i;
        break;
      }
    }
    if (!isExist) {
      arr.push(featureOperator);
    } else {
      arr[index] = featureOperator;
    }
    draw.featureOperatorList = arr;
    dispatch({
      type: "featureOperatorList/updateList",
      payload: {
        featureOperatorList: arr,
      },
    });
  };

  // 给featureOperator设置attribute
  setAttribute = () => {
    const featureOperator = window.featureOperator;
    const feature = featureOperator.feature.clone();
    const geometry = feature.getGeometry();
    geometry.transform("EPSG:3857", "EPSG:4326");
    const points = geometry.getCoordinates();
    const featureType = this.props.type;
    let newGeom = this.getPointStr(points);
    let attr = {};
    let featureTypeState = this.checkStateChange(
      this.props.featureType || this.state.featureType,
      featureOperator.attrs.featureType
    );
    if (this.state.isSureFillColorStyle) {
      featureTypeState = this.state.fillColorStyle;
    }
    let featureNameState = this.checkStateChange(
      this.props.featureName,
      featureOperator.attrs.featureName
    );
    let remarksState = this.checkStateChange(
      this.props.remarks || this.state.remarks,
      featureOperator.attrs.remarks
    );
    let selectNameState = this.checkStateChange(
      this.props.selectName,
      featureOperator.attrs.selectName
    );
    switch (featureType) {
      case "POINT":
        attr = {
          geom: `POINT(${newGeom})`,
          icon_url: featureTypeState,
          featureType: featureTypeState,
          strokeColor: this.state.isSureStrokeColorStyle
            ? this.state.strokeColorStyle
            : "",
          main_id: "",
          name: featureNameState,
          remark: remarksState,
          selectName: selectNameState,
          plottingType: featureType,
        };
        break;
      case "POLYLINE":
        if (this.state.isSureStrokeColorStyle) {
          featureTypeState = this.state.strokeColorStyle;
        }
        attr = {
          geom: `LINESTRING(${newGeom})`,
          style: `${featureTypeState};${featureTypeState}`,
          featureType: featureTypeState,
          main_id: "",
          name: featureNameState,
          remark: remarksState,
          selectName: selectNameState,
          plottingType: featureType,
        };
        break;
      case "POLYGON":
      case "FINE_ARROW":
      case "RECTANGLE":
      case "CIRCLE":
      case "FREEHANDPOLYGON":
        let style = null;
        let strokeColor;
        if (featureTypeState.indexOf("/") > -1) {
          style = `${featureTypeState};icon`;
        } else {
          const fillColor = featureOperator.feature
            .getStyle()
            .getFill()
            .getColor();
          strokeColor = featureOperator.feature
            .getStyle()
            .getStroke()
            .getColor();
          style = `${fillColor};${strokeColor}`;
          featureTypeState = fillColor;
        }
        attr = {
          geom: `POLYGON((${newGeom}))`,
          style: style,
          featureType: featureTypeState,
          strokeColor: strokeColor,
          main_id: "",
          name: featureNameState,
          remark: remarksState,
          selectName: selectNameState,
          plottingType: featureType,
        };
        break;
      default:
        break;
    }
    if (window.featureOperator && !window.featureOperator.responseData) {
      window.featureOperator.responseData = this.props.responseData;
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
      if (typeof points[0] === "number") {
        points.forEach((item, index) => {
          pointStr += `${item},`;
        });
      } else {
        points.forEach((point, index) => {
          pointStr += `${point[0]} ${point[1]},`;
        });
      }
    }
    return pointStr.substr(0, pointStr.length - 1);
  };
  checkInputState = () => {
    if (this.props.featureName.length === 0) {
      return false;
    }
    return true;
  };
  handleCancelClick = () => {
    this.hideModal();
  };

  // 关闭模态框
  hideModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "modal/setVisible",
      payload: {
        visible: false,
      },
    });
    this.updateCustomState();
    if (!this.isOk && !this.props.featureName) {
      this.delCallBack();
    } else {
      this.isOk = false;
    }
  };
  handleNameInputChange = (value) => {
    const { dispatch } = this.props;
    dispatch({
      type: "modal/updateData",
      payload: {
        featureName: value,
      },
    });
  };
  handleTypeSelectChange = (val) => {
    const { responseData } = this.props;
    if (val === "custom") {
      this.setState({
        showCustom: true,
      });
    } else {
      const arr = val.split(",");
      const index0 = Number(arr[0]);
      const index1 = Number(arr[1]);
      const value = responseData.data[index0 - 1].items[index1];
      const { dispatch } = this.props;
      dispatch({
        type: "modal/updateData",
        payload: {
          selectName: value.name,
          featureType: value.value1,
        },
      });
    }
  };
  handleRemarksInputChange = (value) => {
    const { dispatch } = this.props;
    this.setState(
      {
        remarks: value,
      },
      () => {
        dispatch({
          type: "modal/updateData",
          payload: {
            remarks: value,
          },
        });
      }
    );
  };
  handleFillColorPickerClick = () => {
    this.setState({
      displayFillColorPicker: !this.state.displayFillColorPicker,
      displayStrokeColorPicker: false,
    });
  };
  handleStrokeColorPickerClick = () => {
    this.setState({
      displayStrokeColorPicker: !this.state.displayStrokeColorPicker,
      displayFillColorPicker: false,
    });
  };
  handleFillColorChange = (color) => {
    this.setState({
      fillColor: color.rgb,
      fillColorStyle: `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},0.7)`,
    });
  };
  handleStrokeColorChange = (color) => {
    this.setState({
      strokeColor: color.rgb,
      strokeColorStyle: `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`,
    });
  };
  clearStrokeColor = () => {
    this.setState({
      fillColor: null,
      fillColorStyle: null,
    });
  };
  clearStrokeColor = () => {
    this.setState({
      strokeColor: null,
      fillColorStyle: null,
    });
  };
  updateSureFillColor = () => {
    const { dispatch } = this.props;
    this.setState(
      {
        isSureFillColorStyle: true,
        displayFillColorPicker: false,
      },
      () => {
        dispatch({
          type: "modal/updateData",
          payload: {
            selectName: "自定义类型",
            featureType: this.state.fillColorStyle,
          },
        });
      }
    );
  };
  updateSureStrokeColor = () => {
    const { dispatch } = this.props;
    this.setState(
      {
        isSureStrokeColorStyle: true,
        displayStrokeColorPicker: false,
      },
      () => {
        dispatch({
          type: "modal/updateData",
          payload: {
            selectName: "自定义类型",
            strokeColorStyle: this.state.strokeColorStyle,
          },
        });
      }
    );
  };
  closeFillColorPicker = () => {
    this.setState({
      displayFillColorPicker: false
    })
  }
  closeStrokeColorPicker = () => {
    this.setState({
      displayStrokeColorPicker: false
    })
  }
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
    if (dataArray.length > 0) {
      const customType = { type: "自定义类型", value: "custom" };
      dataArray = [customType, ...dataArray];
    }
    // 自定义线框颜色、填充颜色
    // let customStrokeColor = this.strokeColor,
    //   customFillColor = this.fillColor;
    //   let customStrokeColorStyle = this.strokeColorStyle,
    //   customFillColorStyle = this.fillColorStyle;
    // if (operator && operator.attrs) {
    //   const attribute = operator.attrs;
    //   customStrokeColorStyle = attribute.strokeColor
    //   customFillColorStyle = attribute.featureType
    //   const tempFillColorStr =
    //     attribute.featureType &&
    //     attribute.featureType.replace("rgba(", "").replace(")", "");
    //   const tempStrokeColorStr =
    //     attribute.strokeColor &&
    //     attribute.strokeColor.replace("rgba(", "").replace(")", "");
    //   if (tempFillColorStr) {
    //     const tempFillColorArr = tempFillColorStr.split(",");
    //     customFillColor = {
    //       r: tempFillColorArr[0],
    //       g: tempFillColorArr[1],
    //       b: tempFillColorArr[2],
    //       a: tempFillColorArr[3],
    //     };
    //   }
    //   if (tempStrokeColorStr) {
    //     const tempStrokeColorArr = tempStrokeColorStr.split(",");
    //     customFillColor = {
    //       r: tempStrokeColorArr[0],
    //       g: tempStrokeColorArr[1],
    //       b: tempStrokeColorArr[2],
    //       a: tempStrokeColorArr[3],
    //     };
    //   }
    //   if (attribute.plottingType === "POLYLINE") {
    //     customFillColor = customStrokeColor;
    //   }
    // }
    return (
      <Modal
        destroyOnClose
        className={styles.wrap}
        width={310}
        title={title}
        visible={visible}
        onOk={this.handleOKClick}
        onCancel={this.handleCancelClick}
        okText="确定"
        cancelText="取消"
        centered={true}
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
        {this.state.showCustom ? (
          <Row className={styles.row}>
            <Col className={styles.firstCol}></Col>
            <Col className={styles.secondCol}>
              <div className={styles.customList}>
                <div className={styles.customItem}>
                  <span className={styles.span}>线框颜色</span>
                  <div className={styles.colorpickerBtnBorder}>
                    <div
                      className={styles.colorpickerBtn}
                      style={{ backgroundColor: this.state.strokeColorStyle }}
                      onClick={this.handleStrokeColorPickerClick}
                    >
                      <UpOutlined />
                    </div>
                  </div>
                </div>
                <div className={styles.customItem} style={{ marginLeft: 8 }}>
                  <span className={styles.span}>填充颜色</span>
                  <div className={styles.colorpickerBtnBorder}>
                    <div
                      className={styles.colorpickerBtn}
                      style={{ backgroundColor: this.state.fillColorStyle }}
                      onClick={this.handleFillColorPickerClick}
                    >
                      <UpOutlined />
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        ) : null}
        {this.state.displayFillColorPicker ? (
          <div className={styles.customPanel}>
            <SketchPicker
              className={styles.sketch}
              color={this.state.fillColor}
              onChange={this.handleFillColorChange}
            />
            <div className={styles.customBtn}>
              <Button
                className={styles.customBtn}
                onClick={this.closeFillColorPicker}
              >
                取消
              </Button>
              <Button
                className={styles.customBtn}
                type="primary"
                onClick={this.updateSureFillColor}
              >
                确定
              </Button>
            </div>
          </div>
        ) : null}
        {this.state.displayStrokeColorPicker ? (
          <div className={styles.customPanel}>
            <SketchPicker
              className={styles.sketch}
              color={this.state.strokeColor}
              onChange={this.handleStrokeColorChange}
            />
            <div className={styles.customBtn}>
              <Button
                className={styles.customBtn}
                onClick={this.closeStrokeColorPicker}
              >
                取消
              </Button>
              <Button
                className={styles.customBtn}
                type="primary"
                onClick={this.updateSureStrokeColor}
              >
                确定
              </Button>
            </div>
          </div>
        ) : null}
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
