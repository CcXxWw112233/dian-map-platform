import React, { useState } from "react";
import { Input, Select, Button, Tooltip } from "antd";
import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "../LeftToolBar.less";
import ColorPicker from "../../ColorPicker/index";
import { guid } from "./lib";
import { symbols } from "./data";

const SymbolBlock = ({ data, cb }) => {
  let [show, toggle] = useState(true);
  const style = {
    transform: "translateX(-10px)",
    margin: "10px 0px",
  };
  return (
    <div>
      <div className={styles.header}>
        <span>{data.typeName}</span>
        {show ? (
          <CaretDownOutlined
            style={style}
            onClick={() => {
              toggle(false);
            }}
          />
        ) : (
          <CaretUpOutlined
            style={style}
            onClick={() => {
              toggle(true);
            }}
          />
        )}
      </div>
      {show ? (
        <div className={styles.block}>
          {data.content.map((item) => {
            return (
              <Tooltip
                key={guid(false)}
                title={item.name}
                trigger={["hover", "focus", "click"]}
                placement="top"
              >
                <i
                  onClick={() => {
                    cb(item);
                  }}
                  className={globalStyle.global_icon}
                  dangerouslySetInnerHTML={{ __html: item.iconfont }}
                ></i>
              </Tooltip>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
export default class Plot extends React.Component {
  constructor(props) {
    super(props);
    this.defeaultColors = [
      { fill: "rgba(255,84,86,1)", border: "rgba(255,84,86,1)" },
      { fill: "rgba(157, 104, 255, 1)", border: "rgba(157, 104, 255, 1)" },
      { fill: "rgba(126, 213, 255, 1)", border: "rgba(126, 213, 255, 1)" },
      { fill: "rgba(80, 130, 255, 1)", border: "rgba(80, 130, 255, 1)" },
      { fill: "rgba(2, 121, 107, 1)", border: "rgba(2, 121, 107, 1)" },
      { fill: "rgba(255, 201, 0, 1)", border: "rgba(255, 201, 0, 1)" },
      { fill: "rgba(245, 124, 0, 1)", border: "rgba(245, 124, 0, 1)" },
      { fill: "rgba(74, 80, 111, 1)", border: "rgba(74, 80, 111, 1)" },
      { fill: "rgba(106, 113, 145, 1)", border: "rgba(106, 113, 145, 1)" },
      { fill: "rgba(130, 138, 169, 1)", border: "rgba(130, 138, 169, 1)" },
      { fill: "rgba(208, 211, 226, 1)", border: "rgba(208, 211, 226, 1)" },
      { fill: "rgba(255, 255, 255, 1)", border: "rgba(208,211,226,1)" },
      { fill: "rgba(93, 64, 55, 1)", border: "rgba(93, 64, 55, 1)" },
      { fill: "rgba(141, 110, 99, 1)", border: "rgba(141, 110, 99, 1)" },
    ];
  }
  onTextAreaChange = () => {};
  render() {
    const { TextArea } = Input;
    const { Option } = Select;

    return (
      <div
        className={styles.panel}
        style={{ position: "absolute", left: 56, top: 0 }}
      >
        <div
          className={styles.header}
          style={{ padding: "0 20px", marginBottom: 10 }}
        >
          <i
            className={globalStyle.global_icon}
            onClick={() => this.props.closePanel()}
          >
            &#xe758;
          </i>
          <i className={globalStyle.global_icon}>&#xe759;</i>
        </div>
        <div
          className={`${styles.body} ${globalStyle.autoScrollY}`}
          style={{
            height: "calc(100% - 110px)",
          }}
        >
          <div className={styles.content}>
            <Input
              placeholder="输入名称"
              style={{
                width: "100%",
                height: 40,
                marginBottom: 20,
              }}
            />
            <TextArea
              style={{
                width: "100%",
                height: 120,
              }}
              placeholder="填写备注"
              allowClear
              onChange={(e) => this.onTextAreaChange(e)}
            />
            <div className={styles.header} style={{ marginTop: 20 }}>
              <span>自定义轮廓色</span>
              <ColorPicker style={{ margin: "auto" }}></ColorPicker>
              <div
                className={styles.colorbar}
                style={{ background: "rgba(245, 124, 0, 1)", margin: "auto" }}
              ></div>
              <Select defaultValue="1" style={{ width: 120 }} bordered={false}>
                <Option value="1">100%</Option>
                <Option value="0.75">75%</Option>
                <Option value="0.5">50%</Option>
                <Option value="0.25">25%</Option>
                <Option value="0">0%</Option>
              </Select>
            </div>
            <div className={styles.block}>
              {this.defeaultColors.map((item, index) => {
                return (
                  <div
                    className={styles.symbol}
                    key={item.fill}
                    style={{
                      background: item.fill,
                      border: `1px solid ${item.border}`,
                    }}
                  ></div>
                );
              })}
            </div>
            <div className={styles.header} style={{ marginTop: 20 }}>
              <span>自定义填充色</span>
              <ColorPicker style={{ margin: "auto" }}></ColorPicker>
              <div
                className={styles.colorbar}
                style={{ background: "rgba(245, 124, 0, 1)", margin: "auto" }}
              ></div>
              <Select defaultValue="1" style={{ width: 120 }} bordered={false}>
                <Option value="1">100%</Option>
                <Option value="0.75">75%</Option>
                <Option value="0.5">50%</Option>
                <Option value="0.25">25%</Option>
                <Option value="0">0%</Option>
              </Select>
            </div>
            <div className={styles.block}>
              {this.defeaultColors.map((item, index) => {
                return (
                  <div
                    className={styles.symbol}
                    key={item.fill}
                    style={{
                      background: item.fill,
                      border: `1px solid ${item.border}`,
                    }}
                  ></div>
                );
              })}
            </div>
            {/* <div className={styles.header}>
              <span>图标</span>
            </div> */}
            {symbols.map((item) => {
              if (item.type.indexOf(this.props.plotType) >= 0) {
                return (
                  <SymbolBlock
                    key={guid(false)}
                    data={item}
                    cb={() => {}}
                  ></SymbolBlock>
                );
              }
              return null;
            })}
          </div>
        </div>
        <div className={styles.footer}>
          <Button
            block
            style={{
              width: 260,
              height: 36,
              margin: "12px auto",
              background: "rgba(163,205,255,0.2)",
              borderRadius: 4,
              border: "1px solid rgba(127,167,255,1)",
            }}
          >
            重新设置
          </Button>
        </div>
      </div>
    );
  }
}
