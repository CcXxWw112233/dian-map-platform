import React from "react";

import styles from "./ToolBox.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { lineDrawing, pointDrawing, polygonDrawing } from "utils/drawing";
import { myFullScreen, myDragZoom } from "utils/drawing/public";
import { downloadCapture } from "../../utils/captureMap";
import { plotEdit } from "../../utils/plotEdit";
import { getMyCenter } from "../RightTools/lib";
import throttle from "lodash/throttle";

export default class ToolBox extends React.Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.newTools = [
      {
        name: "定位",
        iconfont: "&#xe688;",
        hasPanel: false,
        cb: (args) => {
          this.hidden();
          getMyCenter();
        },
      },
    ];
    this.tools = [
      {
        name: "坐标",
        iconfont: "&#xe75c;",
        cb: () => {
          this.hidden();
          pointDrawing.createDrawing();
        },
      },
      {
        name: "距离",
        iconfont: "&#xe75e;",
        cb: () => {
          this.hidden();
          lineDrawing.createDrawing();
        },
      },
      {
        name: "面积",
        iconfont: "&#xe62c;",
        cb: () => {
          this.hidden();
          polygonDrawing.createDrawing();
        },
      },
      {
        name: "放大",
        iconfont: "&#xe75f;",
        cb: () => {
          this.hidden();
          myDragZoom.setVal();
        },
      },
      {
        name: "全屏",
        iconfont: "&#xe7f3;",
        cb: () => {
          this.hidden();
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
        name: "下载",
        iconfont: "&#xe761;",
        cb: () => {
          this.hidden();
          downloadCapture();
        },
      },
    ];
    this.state = {
      selectedIndex: -1,
      fullcreenIcon: "&#xe7f3;",
      tools: this.tools,
    };
    this.documentClickCallBak = throttle(this.documentClickCallBak, 1000);
  }
  componentDidMount() {
    // document.addEventListener("click", (e) => this.documentClickCallBak(e));
  }
  documentClickCallBak = (e) => {
    e.stopPropagation();
    if (
      this.props.parent.state.lengedListPanelVisible &&
      !this.props.parent.state.toolBoxPanelVisible
    ) {
      return;
    }
    if (
      this.props.parent.state.POIPanelVisible &&
      !this.props.parent.state.toolBoxPanelVisible
    ) {
      return;
    }
    if (this.props.parent.isToolItem) {
      this.props.parent.isToolItem = false;
      return;
    }
    let node = e.target;
    let toolBoxRef = this.props.parent.refs.toolbox;
    let flag = true;
    if (node === toolBoxRef) {
      flag = false;
    }
    if (node === this.props.parent.refs["定位"]) {
      flag = false;
    }
    if (node === this.props.parent.refs["全屏"]) {
      flag = false;
    }
    if (node === this.props.parent.refs["图例"]) {
      flag = false;
    }
    if (node === this.props.parent.refs["周边"]) {
      flag = false;
    }
    if (node === this.props.parent.refs["工具箱"]) {
      flag = false;
    }
    if (node === this.props.parent.refs["工具箱2"]) {
      flag = false;
    }
    if (flag) {
      let flag2 = false;
      if (this.props.parent.state.lengedListPanelVisible) {
        flag2 = true;
      }
      if (this.props.parent.state.POIPanelVisible) {
        flag2 = true;
      }
      this.props.parent.setState({
        toolBoxPanelVisible: false,
        hiddenIndex: -1,
        selectedIndex: -1,
        showToolBox: flag2,
      });
    }
  };
  hidden = () => {
    let showToolBox = false;
    if (this.props.parent.state.lengedListPanelVisible) {
      showToolBox = true;
    }
    if (this.props.parent.state.POIPanelVisible) {
      showToolBox = true;
    }
    this.props &&
      this.props.parent.setState({
        toolBoxPanelVisible: false,
        showToolBox: showToolBox,
        hiddenIndex: -1,
        selectedIndex: -1,
      });
  };
  deactivate = () => {
    plotEdit.deactivate();
    pointDrawing.deactivate();
    lineDrawing.deactivate();
    polygonDrawing.deactivate();
  };

  handleToolClick = () => {
    this.setState({
      selectedIndex: -1,
      fullcreenIcon: "&#xe7f3;",
    });
  };

  render() {
    const style = { display: "table" },
      style2 = { display: "table-cell", verticalAlign: "middle" };
    let newStyle = {};
    if (
      this.props.parent.state.lengedListPanelVisible === true ||
      this.props.parent.state.POIPanelVisible === true
    ) {
      newStyle = {
        padding: "10px 5px",
        height: "220px",
        maxWidth: "40px",
        flexDirection: "column",
        right: "270px",
      };
    }
    return (
      <div
        className={`${styles.wrapper} ${globalStyle.global_icon}`}
        style={newStyle}
        ref="toolbox"
        onPointerLeave={() => {
          let flag = false;
          if (this.props.parent.state.lengedListPanelVisible) {
            flag = true;
          }
          if (this.props.parent.state.POIPanelVisible) {
            flag = true;
          }
          if (flag) {
            this.props.parent.setState({
              toolBoxPanelVisible: false,
              hiddenIndex: -1,
              selectedIndex: -1,
              showToolBox: true,
            });
          } else {
            this.props.parent.setState({
              toolBoxPanelVisible: false,
              hiddenIndex: -1,
              selectedIndex: -1,
            });
          }
        }}
      >
        {this.state.tools.map((item, index) => {
          return (
            <div
              style={this.state.selectedIndex === index ? style : {}}
              key={`${item.name}-${index}`}
              className={styles.content}
              onPointerDown={() => {
                this.deactivate();
                item.cb();
              }}
              onPointerOver={() => {
                this.setState({
                  selectedIndex: index,
                });
              }}
              onPointerLeave={() => {
                this.setState({
                  selectedIndex: -1,
                });
              }}
            >
              <i
                style={this.state.selectedIndex === index ? style2 : {}}
                className={globalStyle.global_icon}
                dangerouslySetInnerHTML={{
                  __html:
                    item.name === "全屏"
                      ? this.state.fullcreenIcon
                      : item.iconfont,
                }}
              ></i>
              {/* {this.state.selectedIndex !== index ? (
                <span>{item.name}</span>
              ) : null} */}
            </div>
          );
        })}
      </div>
    );
  }
}
