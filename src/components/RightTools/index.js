import React from "react";

import { Button, Tooltip } from "antd";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./RightTools.less";
import { getMyCenter } from "./lib";
import LengedList from "../LengedList/index";
import LocalPOI from "../LocalPOI/index";
import Zoom from "../Zoom/index";
import ToolBox from "../ToolBox/index";
import { myFullScreen } from "utils/drawing/public";

export default class RightTools extends React.Component {
  constructor(props) {
    super(props);
    this.isToolItem = false;
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
        name: "全屏",
        iconfont: "&#xe7f3;",
        cb: () => {
          myFullScreen.change();
          this.setState(
            {
              isFull: !this.state.isFull,
            },
            () => {
              if (this.state.isFull) {
                this.setState({
                  fullcreenIcon: "&#xe7f7;",
                });
              } else {
                this.setState({
                  fullcreenIcon: "&#xe7f3;",
                });
              }
            }
          );
        },
      },
      {
        name: "图例",
        hasPanel: true,
        cb: (args) => {
          this.toggleButtonStyle(args);
          let showToolBox = !this.state.POIPanelVisible;
          if (this.state.toolBoxPanelVisible) {
            showToolBox = false;
          }
          this.child &&
            this.child.setState({
              tools: [...this.child.newTools, ...this.child.tools],
            });
          this.isToolItem = false;
          this.setState(
            {
              lengedListPanelVisible: !this.state.lengedListPanelVisible,
              POIPanelVisible: false,
              tools: [],
              showToolBox: showToolBox,
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
          let showToolBox = !this.state.POIPanelVisible;
          if (this.state.toolBoxPanelVisible) {
            showToolBox = false;
          }
          this.child &&
            this.child.setState({
              tools: [...this.child.newTools, ...this.child.tools],
            });
          this.isToolItem = false;
          this.setState(
            {
              lengedListPanelVisible: false,
              POIPanelVisible: !this.state.POIPanelVisible,
              tools: [],
              showToolBox: showToolBox,
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
              hiddenIndex: 4,
            },
            () => {
              if (!this.state.toolBoxPanelVisible) {
                this.child && this.child.deactivate();
                this.setState({
                  selectedIndex: -1,
                });
              }
            }
          );
        },
      },
    ];
    this.divElement = null;
    this.newTools = [
      {
        name: "工具箱",
        iconfont: "&#xe763;",
        hasPanel: true,
        cb: (args) => {
          this.isToolItem = true;
          this.toggleButtonStyle(args);
          this.setState(
            {
              toolBoxPanelVisible: !this.state.toolBoxPanelVisible,
              hiddenIndex: 4,
            },
            () => {
              this.child &&
                this.child.setState({
                  tools: [...this.child.newTools, ...this.child.tools],
                });
              if (!this.state.toolBoxPanelVisible) {
                this.child && this.child.deactivate();
                this.setState({
                  selectedIndex: -1,
                });
              }
            }
          );
        },
      },
    ];
    this.state = {
      selectedIndex: -1,
      isFull: false,
      lengedListPanelVisible: false,
      POIPanelVisible: false,
      toolBoxPanelVisible: false,
      fullcreenIcon: "&#xe7f3;",
      hiddenIndex: -1,
      showToolBox: false,
      tools: this.tools,
      isToolItem: false,
    };
  }

  // 切换按钮样式
  toggleButtonStyle = (index) => {
    this.setState({
      selectedIndex: index,
    });
  };

  componentDidMount() {
    // const me = this
    // document.addEventListener("click", (e) => {
    //   const target = e.target;
    //   // 组件已挂载且事件触发对象不在div内
    //   debugger
    //   let toolboxRef = me.refs["toolbox"]
    //   if (me.divElement && !me.divElement.contains(target)) {
    //     me.setState({
    //       toolBoxPanelVisible: false,
    //     });
    //   }
    // });
  }
  onRef = (ref) => {
    this.child = ref;
  };
  render() {
    return (
      <div className={styles.wrapper} style={{ bottom: 16 }} ref="rightTools">
        <div className={styles.toolbar} ref="toolbar1">
          <ul>
            <li>
              <Zoom parent={this}></Zoom>
            </li>
            {this.state.tools.map((item, index) => {
              const icon = item.iconfont ? (
                <i
                  className={globalStyle.global_icon}
                  dangerouslySetInnerHTML={{
                    __html:
                      item.name !== "全屏"
                        ? item.iconfont
                        : this.state.fullcreenIcon,
                  }}
                  ref={item.name}
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
                <li
                  key={`${item.name}-${index}`}
                  style={
                    index === this.state.hiddenIndex
                      ? { visibility: "hidden" }
                      : {}
                  }
                >
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
        </div>
        {this.state.showToolBox === true ? (
          <div
            className={styles.toolbar}
            style={{ transform: "translateX(-270px)" }}
            ref="toolbar2"
          >
            <ul>
              {this.newTools.map((item, index) => {
                const icon = item.iconfont ? (
                  <i
                    className={globalStyle.global_icon}
                    dangerouslySetInnerHTML={{
                      __html:
                        item.name !== "全屏"
                          ? item.iconfont
                          : this.state.fullcreenIcon,
                    }}
                    ref={`${item.name}2`}
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
                  <li
                    key={`${item.name}-${index}`}
                    style={
                      index === this.state.hiddenIndex
                        ? { visibility: "hidden" }
                        : {}
                    }
                  >
                    <Tooltip title={item.name} placement="left">
                      <Button
                        shape="circle"
                        size="large"
                        icon={icon}
                        onClick={() => {
                          item.cb(index);
                          this.setState({
                            toolBoxPanelVisible: true,
                            showToolBox: false,
                            isToolItem: true,
                          });
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
          </div>
        ) : null}
        {this.state.lengedListPanelVisible ? (
          <LengedList
            closePanel={() => {
              this.setState({
                selectedIndex: -1,
                lengedListPanelVisible: false,
                tools: this.tools,
                showToolBox: false,
              });
              this.child &&
                this.child.setState({
                  tools: this.child.tools,
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
                tools: this.tools,
                showToolBox: false,
              });
              this.child &&
                this.child.setState({
                  tools: this.child.tools,
                });
            }}
          ></LocalPOI>
        ) : null}
        {this.state.toolBoxPanelVisible ? (
          <ToolBox
            onRef={this.onRef}
            parent={this}
            ref="toolbox"
            istoolItem={this.isToolItem}
          ></ToolBox>
        ) : null}
      </div>
    );
  }
}
