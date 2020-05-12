import React, { PureComponent } from "react";
import styles from "./LengedList.less";
import { Collapse } from "antd";
import config from "./config";
import globalStyle from "@/globalSet/styles/globalStyles.less";
const Lenged = ({ data }) => {
  const header = <span>{data.title || ""}</span>;
  return (
    <Collapse expandIconPosition="right">
      <Collapse.Panel header={header}>
        {data.content.map((item) => {
          let style = {
            marginRight: 10,
          };
          if (data && data.content) {
            if (item.bgColor) {
              style.backgroundColor = item.bgColor;
            }
            if (item.imgSrc) {
              style.backgroundImage = `url(${item.imgSrc})`;
              style.backgroundColor = "#fff";
              style.backgroundRepeat = "no-repeat";
              style.backgroundPosition = "center";
            }
            if (item.borderColor) {
              style.border = `1px solid ${item.borderColor}`;
            }
            if (item.type) {
              if (item.type === "line") {
                style.height = 0;
              }
              if (item.type === "point") {
                style.borderRadius = 7;
              }
            }
            if (data.content.style) {
              style = { ...style, ...data.content.style };
            }
          }
          return (
            <p>
              <div style={style}></div>
              <span>{item.font}</span>
            </p>
          );
        })}
      </Collapse.Panel>
    </Collapse>
  );
};
export default class LengedList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      transform: "",
    };
  }
  handleLengedListClick = () => {
    if (this.state.width === 0) {
      this.setState({
        width: 244,
      });
    } else {
      this.setState({
        transform: "",
        width: 0,
      });
    }
  };
  render() {
    const baseStyle = { position: "absolute", bottom: 0, right:0 };
    return (
      <div
        style={{ ...baseStyle, ...this.state }}
        className={styles.wrap + " transform"}
      >
        <div
          style={{ width: "100%", height: "100%" }}
          className={globalStyle.autoScrollY}
        >
          {config.map((item) => {
            return <Lenged data={item}></Lenged>;
          })}
        </div>
        <div className={styles.controller} onClick={this.handleLengedListClick}>
          <span>图例</span>
        </div>
      </div>
    );
  }
}
