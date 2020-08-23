import React from "react";

import { Button, Tooltip } from "antd";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./RightTools.less";
import { getMyCenter } from "./lib";
import LengedList from "../LengedList/index";
import LocalPOI from "../LocalPOI/index";
import Zoom from "../Zoom/index";
import ToolBox from "../ToolBox/index";

export default class RightTools extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: -1,
      lengedListPanelVisible: false,
      POIPanelVisible: false,
      toolBoxPanelVisible: false,
    };
    this.tools = [
      {
        name: "定位",
        iconfont: "&#xe688;",
        hasPanel: false,
        cb: (args) => {
          this.toggleButtonStyle(args);
          getMyCenter();
        },
      },
      {
        name: "图例",
        hasPanel: true,
        cb: (args) => {
          this.toggleButtonStyle(args);
          this.setState(
            {
              lengedListPanelVisible: !this.state.lengedListPanelVisible,
              POIPanelVisible: false,
            },
            () => {
              if (!this.state.lengedListPanelVisible) {
                this.setState({
                  selectedIndex: -1,
                });
              }
            }
          );
        },
      },
      {
        name: "周边",
        hasPanel: true,
        cb: (args) => {
          this.toggleButtonStyle(args);
          this.setState(
            {
              lengedListPanelVisible: false,
              POIPanelVisible: !this.state.POIPanelVisible,
            },
            () => {
              if (!this.state.POIPanelVisible) {
                this.setState({
                  selectedIndex: -1,
                });
              }
            }
          );
        },
      },
      {
        name: "工具箱",
        iconfont: "&#xe763;",
        hasPanel: true,
        cb: (args) => {
          this.toggleButtonStyle(args);
          this.setState(
            {
              toolBoxPanelVisible: !this.state.toolBoxPanelVisible,
            },
            () => {
              if (!this.state.toolBoxPanelVisible) {
                this.child.deactivate();
                this.setState({
                  selectedIndex: -1,
                });
              }
            }
          );
        },
      },
    ];
  }

  // 切换按钮样式
  toggleButtonStyle = (index) => {
    this.setState({
      selectedIndex: index,
    });
  };
  onRef = (ref) => {
    this.child = ref;
  };
  render() {
    return (
      <div className={styles.wrapper}>
        <ul>
          <li>
            <Zoom></Zoom>
          </li>
          {this.tools.map((item, index) => {
            const icon = item.iconfont ? (
              <i
                className={globalStyle.global_icon}
                dangerouslySetInnerHTML={{ __html: item.iconfont }}
              ></i>
            ) : null;
            const btnSelectedStyle =
              this.state.selectedIndex === index && item.hasPanel === true
                ? {
                    color: "#fff",
                    backgroundColor: "rgba(106,113,145,1)",
                    border: "none",
                  }
                : {};
            return (
              <li key={`${item.name}-${index}`}>
                <Tooltip title={item.name} placement="left">
                  <Button
                    shape="circle"
                    size="large"
                    icon={icon}
                    onClick={() => {
                      item.cb(index);
                    }}
                    style={btnSelectedStyle}
                  >
                    {item.iconfont ? "" : item.name}
                  </Button>
                </Tooltip>
              </li>
            );
          })}
        </ul>
        {this.state.lengedListPanelVisible ? (
          <LengedList
            closePanel={() => {
              this.setState({
                selectedIndex: -1,
                lengedListPanelVisible: false,
              });
            }}
          ></LengedList>
        ) : null}
        {this.state.POIPanelVisible ? (
          <LocalPOI
            closePanel={() => {
              this.setState({
                selectedIndex: -1,
                POIPanelVisible: false,
              });
            }}
          ></LocalPOI>
        ) : null}
        {this.state.toolBoxPanelVisible ? (
          <ToolBox onRef={this.onRef}></ToolBox>
        ) : null}
      </div>
    );
  }
}
