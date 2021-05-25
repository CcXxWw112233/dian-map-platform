import React, { Component } from "react";
import { Dropdown, Button } from "antd";
// import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { SketchPicker } from "react-color";
import { Icon } from 'antd'

import btnStyles from "./btn.less";
import panelStyles from "./panel.less";

export default class ColorPicker extends Component {
  constructor(props) {
    super(props);
    this.defaultColor = {
      r: "168",
      g: "9",
      b: "10",
      a: "1",
    };
    this.defaultColorStyle = "rgba(168,9,10,1)";
    this.state = {
      visible: false,
      color: this.defaultColor,
      colorStyle: this.defaultColorStyle,
    };
  }
  updateProps = (props) => {
    const colorStr = props.colorStyle?.match(/\(([^)]*)\)/);
    if (colorStr) {
      const colorArr = colorStr[1].split(",");
      const colorObj = {
        r: colorArr[0] || 255,
        g: colorArr[1] || 255,
        b: colorArr[2] || 255,
        a: colorArr[3] || 1,
      };
      this.defaultColorStyle = props.colorStyle;
      this.defaultColor = colorObj;
      this.setState({
        colorStyle: props.colorStyle,
        color: colorObj,
      });
    }
  };
  componentDidMount() {
    this.updateProps(this.props);
  }
  componentWillUnmount() {
    this.updateProps(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.updateProps(nextProps);
  }
  handleCancelClick = () => {
    this.setState(
      {
        colorStyle: this.defaultColorStyle,
        color: this.defaultColor,
      },
      () => {
        this.handleOkClick();
      }
    );
  };
  //确定
  handleOkClick = () => {
    this.setState(
      {
        visible: false,
      },
      () => {
        const { handleOK } = this.props;
        const { colorStyle } = this.state;
        handleOK && handleOK(colorStyle);
      }
    );
  };

  onChange = (value) => {
    const rgb = value.rgb;
    this.setState({
      color: rgb,
      colorStyle: `rgba(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`,
    });
  };
  handleColorPickerBtnClick = (e) => {
    this.setState({
      visible: !this.state.visible,
    });
  };
  onMouseLeave = () => {
    this.setState({
      visible: false,
    });
  };
  render() {
    let disable = "",
      backgroundColor = this.state.colorStyle;
    if (this.props.disable) {
      disable = ` ${btnStyles.disable}`;
      backgroundColor = "rgba(0,0,0,0.1)";
    }
    const overlay = (
      <div className={panelStyles.wrap} onMouseLeave={this.onMouseLeave}>
        <SketchPicker
          className={panelStyles.sketch}
          color={this.state.color}
          onChange={this.onChange}
        ></SketchPicker>
        <div className={panelStyles.btnList}>
          <Button onClick={this.handleCancelClick}>取消</Button>
          <Button type="primary" onClick={this.handleOkClick}>
            确定
          </Button>
        </div>
      </div>
    );
    const position = this.props.position || "bottomLeft";
    return (
      <Dropdown
        overlay={overlay}
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.onVisibleChange}
        placement={position}
      >
        <div
          className={btnStyles.wrap + disable}
          onClick={this.handleColorPickerBtnClick}
        >
          <div style={{ backgroundColor: backgroundColor }}>
            {this.state.visible ? <Icon type="up" /> :  <Icon type="down" />}
          </div>
        </div>
      </Dropdown>
    );
  }
}
