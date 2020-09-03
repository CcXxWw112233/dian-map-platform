import React from "react";
import { Badge } from "antd";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./LeftToolBar.less";

export default class ToolBar extends React.Component {
  constructor(props) {
    super(props);
    this.parent = props.parent;
    this.props.onRef(this);
    this.leftTools = [
      {
        name: "项目",
        displayText: false,
        iconfont: "&#xe756;",
        cb: () => {
          this.parent.setState({
            displayPlot: false,
            hidePlot: false,
            displayProject: true,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            displayProjectList: false,
          });
          this.parent.deactivate();
        },
      },
      {
        name: "标记点",
        displayText: true,
        iconfont: "&#xe757;",
        cb: () => {
          this.parent.setState({
            displayPlot: true,
            hidePlot: false,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "point",
          });
          this.parent.deactivate();
        },
      },
      {
        name: "描绘",
        displayText: true,
        iconfont: "&#xe63b;",
        cb: () => {
          this.parent.setState({
            displayPlot: true,
            hidePlot: false,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "freeLine",
          });
          this.parent.deactivate();
        },
      },
      {
        name: "直线",
        displayText: true,
        iconfont: "&#xe624;",
        cb: () => {
          this.parent.setState({
            displayPlot: true,
            hidePlot: false,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "line",
          });
          this.parent.deactivate();
        },
      },
      {
        name: "自由面",
        displayText: true,
        iconfont: "&#xe631;",
        cb: () => {
          this.parent.setState({
            displayPlot: true,
            hidePlot: false,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "freePolygon",
          });
          this.parent.deactivate();
        },
      },
      {
        name: "标面",
        displayText: true,
        iconfont: "&#xe7cc;",
        cb: () => {
          this.parent.setState({
            displayPlot: true,
            hidePlot: false,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "polygon",
          });
          this.parent.deactivate();
        },
      },
      {
        name: "矩形",
        displayText: true,
        iconfont: "&#xe62e;",
        cb: () => {
          this.parent.setState({
            displayPlot: true,
            hidePlot: false,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "rect",
          });
          this.parent.deactivate();
        },
      },
      {
        name: "圆形",
        displayText: true,
        iconfont: "&#xe62f;",
        cb: () => {
          this.parent.setState({
            displayPlot: true,
            hidePlot: false,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "circle",
          });
          this.parent.deactivate();
        },
      },
      {
        name: "箭头",
        displayText: true,
        iconfont: "&#xe62d;",
        cb: () => {
          this.parent.setState({
            displayPlot: true,
            hidePlot: false,
            displayProject: false,
            displayTempPlot: false,
            displayCustomSymbolStore: false,
            plotType: "arrow",
          });
          this.parent.deactivate();
        },
      },
    ];
    this.state = {
      selectedIndex: 0,
      hoveredIndex: -1,
      operatorListLength: 0,
    };
  }
  updateListLen = (len = 0) => {
    this.setState({
      operatorListLength: len,
    });
  };
  render() {
    let tempPlotItemStyle = { bottom: 60, left: 4 };
    let customSymbolStoreStyle = { bottom: 0, left: 4 };
    const selectStyle = { background: "rgba(90, 134, 245, 1)" };
    if (this.parent.state.displayTempPlot) {
      tempPlotItemStyle = { ...tempPlotItemStyle, ...selectStyle };
    }
    if (this.parent.state.displayCustomSymbolStore) {
      customSymbolStoreStyle = { ...customSymbolStoreStyle, ...selectStyle };
    }
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#6a9aff",
          zIndex: 9,
        }}
      >
        <div
          className={`${styles.circle} ${
            this.props.isInvalidToolBar ? "invalid" : ""
          }`}
          style={{ background: "#fff" }}
        >
          {/* <img crossOrigin="anonymous" alt="" src=""></img> */}
          <i className={globalStyle.global_icon} style={{ fontSize: 26 }}>
            &#xe764;
          </i>
        </div>
        <div
          className={`${globalStyle.autoScrollY} ${
            this.props.isInvalidToolBar ? "invalid" : ""
          }`}
          style={{ height: "calc(100% - 210px)" }}
        >
          {this.leftTools.map((item, index) => {
            let displayText = true;
            if (
              item.displayText === false ||
              this.state.selectedIndex === index
            ) {
              displayText = false;
            }
            if (this.state.hoveredIndex === index) {
              displayText = false;
            }
            const divStyle = displayText ? {} : { display: "table" };
            const iStyle = displayText
              ? {}
              : { display: "table-cell", verticalAlign: "middle" };
            return (
              <div
                key={`${item.iconfont}-${index}`}
                className={`${styles.item} ${
                  this.state.selectedIndex === index ? styles.active : ""
                }`}
                style={divStyle}
                onPointerOver={() => {
                  this.setState({
                    hoveredIndex: index,
                  });
                }}
                onPointerLeave={() => {
                  this.setState({
                    hoveredIndex: -1,
                  });
                }}
                onPointerDown={() => {
                  this.setState({
                    selectedIndex: index,
                  });
                  item.cb && item.cb();
                }}
              >
                <i
                  className={globalStyle.global_icon}
                  dangerouslySetInnerHTML={{ __html: item.iconfont }}
                  style={iStyle}
                ></i>
                {displayText ? (
                  <p>
                    <span>{item.name}</span>
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        {/* 临时标绘 */}
        <Badge count={this.state.operatorListLength} className={styles.temp} offset={[0, 20]}>
          <div
            className={`${styles.circle} ${styles.temp}`}
            onClick={() => {
              this.setState({
                selectedIndex: -1,
              });
              this.parent.setState({
                displayPlot: false,
                hidePlot: false,
                displayProject: false,
                displayTempPlot: true,
                displayCustomSymbolStore: false,
                plotType: "",
              });
            }}
            style={{
              ...tempPlotItemStyle,
              display: "table",
              position: "unset",
            }}
          >
            <i
              className={globalStyle.global_icon}
              style={{
                fontSize: 30,
                color: "#fff",
                display: "table-cell",
                verticalAlign: "middle",
              }}
            >
              &#xe765;
            </i>
          </div>
        </Badge>
        {/* 自定符号 */}
        <div
          className={`${styles.circle} ${styles.temp}`}
          onClick={() => {
            this.setState({
              selectedIndex: -1,
            });
            this.parent.setState({
              displayPlot: false,
              hidePlot: false,
              displayProject: false,
              displayTempPlot: false,
              displayCustomSymbolStore: true,
              plotType: "",
            });
          }}
          style={customSymbolStoreStyle}
        >
          <i
            className={globalStyle.global_icon}
            style={{ fontSize: 30, color: "#fff" }}
          >
            &#xe7b6;
          </i>
        </div>
      </div>
    );
  }
}
