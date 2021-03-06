import React, { Fragment } from "react";

import styles from "./LengedList.less";
import CommonPanel from "../CommonPanel/index";
import globalStyle from "@/globalSet/styles/globalStyles.less";

import { Collapse, Row } from "antd";
import { connect } from "dva";

@connect(({ lengedList: { config } }) => ({ config }))
export default class LengedList extends React.Component {
  constructor(props) {
    super(props);
  }
  closePanel = () => {
    this.props.closePanel();
  };

  createNULL = () => {
    return (
      <div
        style={{
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          top: "30%"
        }}
      >
        <i
          className={globalStyle.global_icon}
          style={{ fontSize: 50, lineHeight: "50px" }}
        >
          &#xe7d1;
        </i>
        <span>暂无图例</span>
      </div>
    );
  };
  render() {
    let { config: lengedList } = this.props;
    if (!Array.isArray(lengedList)) {
      lengedList = [lengedList];
    }
    lengedList = Array.from(new Set(lengedList));
    let content = [];
    lengedList.forEach(item => {
      if (Array.isArray(item.content)) {
        content = [...content, ...item.content];
      }
    });
    return (
      <CommonPanel
        panelName="图例"
        closePanel={() => this.closePanel(this.panelKey)}
      >
        {lengedList.length > 0 ? (
          <Fragment>
            {content.map((itemContent, index) => {
              let style = {
                marginRight: 10,
                height: 20,
                width: 20
              };
              if (itemContent.bgColor) {
                style.backgroundColor = itemContent.bgColor;
              }
              if (itemContent.imgSrc) {
                style.backgroundImage = `url(${itemContent.imgSrc})`;
                // style.backgroundColor = "#fff";
                style.backgroundRepeat = "no-repeat";
                style.backgroundPosition = "center";
                style.backgroundSize = "100%";
              }
              if (itemContent.borderColor) {
                style.border = `1px solid ${itemContent.borderColor}`;
              }
              if (itemContent.sigleImage) {
                style.backgroundImage = `url(${itemContent.sigleImage})`;
                style.backgroundRepeat = "no-repeat";
                style.backgroundPosition = "center";
                style.backgroundSize = "100%";
              }
              if (itemContent.type) {
                if (itemContent.type.indexOf("line") > -1) {
                  style.height = 0;
                  style.border = `1px solid ${itemContent.bgColor}`;
                  style.marginTop = 10;
                }
                if (itemContent.type.indexOf("point") > -1) {
                  style.borderRadius = 10;
                }
              }
              if (itemContent.style) {
                style = { ...style, ...itemContent.style };
              }
              return (
                <Row
                  className={styles.row}
                  key={index}
                  style={{ paddingLeft: 20, marginBottom: 5, display: "flex" }}
                >
                  <div style={style}></div>
                  <div
                    style={{
                      textAlign: "left",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      width: "calc(100% - 30px)",
                      color: "#fff"
                    }}
                  >
                    <span>{itemContent.font}</span>
                  </div>
                </Row>
              );
            })}
          </Fragment>
        ) : (
          this.createNULL()
        )}
        {/* {lengedList.length > 0 ? (
          <Collapse
            expandIconPosition="right"
            className={`${styles.wrapper} ${globalStyle.autoScrollY}`}
            defaultActiveKey={lengedList[0].key}
            style={{
              height: "100%",
              background: "rgba(255,255,255,0)",
              color: "#fff",
            }}
          >
            {lengedList.map((item, index) => {
              const header = <span>{item.title || ""}</span>;
              return (
                <Collapse.Panel header={header} key={item.key}>
                  {item.content.map((itemContent, index) => {
                    let style = {
                      marginRight: 10,
                      height: 20,
                      width: 20,
                    };
                    if (itemContent.bgColor) {
                      style.backgroundColor = itemContent.bgColor;
                    }
                    if (itemContent.imgSrc) {
                      style.backgroundImage = `url(${itemContent.imgSrc})`;
                      // style.backgroundColor = "#fff";
                      style.backgroundRepeat = "no-repeat";
                      style.backgroundPosition = "center";
                      style.backgroundSize = "100%";
                    }
                    if (itemContent.borderColor) {
                      style.border = `1px solid ${itemContent.borderColor}`;
                    }
                    if (itemContent.sigleImage) {
                      style.backgroundImage = `url(${itemContent.sigleImage})`;
                      style.backgroundRepeat = "no-repeat";
                      style.backgroundPosition = "center";
                      style.backgroundSize = "100%";
                    }
                    if (itemContent.type) {
                      if (itemContent.type.indexOf("line") > -1) {
                        style.height = 0;
                        style.border = `1px solid ${itemContent.bgColor}`;
                        style.marginTop = 10;
                      }
                      if (itemContent.type.indexOf("point") > -1) {
                        style.borderRadius = 10;
                      }
                    }
                    if (itemContent.style) {
                      style = { ...style, ...itemContent.style };
                    }
                    return (
                      <Row className={styles.row} key={item.key + index}>
                        <div style={style}></div>
                        <div
                          style={{
                            textAlign: "left",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            width: "calc(100% - 30px)"
                          }}
                        >
                          <span>{itemContent.font}</span>
                        </div>
                      </Row>
                    );
                  })}
                </Collapse.Panel>
              );
            })}
          </Collapse>
        ) : (
          this.createNULL()
        )} */}
      </CommonPanel>
    );
  }
}
