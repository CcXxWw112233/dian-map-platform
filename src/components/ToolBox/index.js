import React from "react";

import styles from "./ToolBox.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { lineDrawing, pointDrawing, polygonDrawing } from "utils/drawing";
import { myFullScreen, myDragZoom } from "utils/drawing/public";
import { downloadCapture } from "../../utils/captureMap";
import { plotEdit } from "../../utils/plotEdit";

export default class ToolBox extends React.Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.tools = [
      {
        name: "坐标",
        iconfont: "&#xe75c;",
        cb: () => {
          pointDrawing.createDrawing();
        },
      },
      {
        name: "距离",
        iconfont: "&#xe75e;",
        cb: () => {
          lineDrawing.createDrawing();
        },
      },
      {
        name: "面积",
        iconfont: "&#xe62c;",
        cb: () => {
          polygonDrawing.createDrawing();
        },
      },
      {
        name: "放大",
        iconfont: "&#xe75f;",
        cb: myDragZoom.setVal.bind(myDragZoom),
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
        name: "下载",
        iconfont: "&#xe761;",
        cb: () => {
          downloadCapture();
        },
      },
    ];
    this.state = {
      selectedIndex: -1,
      fullcreenIcon: "&#xe7f3;",
    };
  }
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
    return (
      <div className={`${styles.wrapper} ${globalStyle.global_icon}`}>
        {this.tools.map((item, index) => {
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
              {this.state.selectedIndex !== index ? (
                <span>{item.name}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }
}
