import React from "react";
import { Badge, Tooltip } from "antd";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./LeftToolBar.less";
import Event from "../../lib/utils/event";
import { connect } from "dva";

@connect(({openswitch: {openPanel}}) => ({openPanel}))
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
            displaySystemManage: false,
          });
          this.parent.deactivate();
          this.openPanel();
          this.hideSearchBtn();
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
            displaySystemManage: false,
          });
          this.parent.deactivate();
          this.hideSearchBtn();
          this.openPanel();
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
            displaySystemManage: false,
          });
          this.parent.deactivate();
          this.hideSearchBtn();
          this.openPanel();
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
            displaySystemManage: false,
          });
          this.parent.deactivate();
          this.hideSearchBtn();
          this.openPanel();
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
            displaySystemManage: false,
          });
          this.parent.deactivate();
          this.hideSearchBtn();
          this.openPanel();
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
            displaySystemManage: false,
          });
          this.parent.deactivate();
          this.hideSearchBtn();
          this.openPanel();
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
            displaySystemManage: false,
          });
          this.parent.deactivate();
          this.hideSearchBtn();
          this.openPanel();
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
            displaySystemManage: false,
          });
          this.parent.deactivate();
          this.hideSearchBtn();
          this.openPanel();
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
            displaySystemManage: false,
          });
          this.parent.deactivate();
          this.hideSearchBtn();
          this.openPanel();
        },
      },
    ];
    this.state = {
      selectedIndex: 0,
      hoveredIndex: -1,
      operatorListLength: 0,
      update: false,
    };
    Event.Evt.on("openModifyPointPanel", (icon) => {
      this.parent.setState({
        displayPlot: true,
        hidePlot: false,
        displayProject: false,
        displayTempPlot: false,
        displayCustomSymbolStore: false,
        plotType: "point",
        displaySystemManage: false,
      });
      this.parent.deactivate();
      this.parent.isGeojsonMifyIcon = true;
      this.hideSearchBtn();
      this.openPanel();
    })
  }

  openPanel = () => {
    const { dispatch, openPanel } = this.props;
    if (!openPanel) {
      dispatch({
        type: "openswitch/updateDatas",
        payload: {
          openPanel: true,
        },
      });
    }
  };

  hideSearchBtn = () => {
    Event.Evt.firEvent("displaySearchBtn", {
      visible: false,
      keywords: [],
    });
  };
  updateListLen = (len = 0) => {
    this.setState({
      operatorListLength: len,
    });
  };

  displayTempPlot = () => {
    this.setState({
      selectedIndex: -1,
    });
    this.parent.setState({
      displayPlot: false,
      hidePlot: false,
      displayProject: false,
      displayTempPlot: true,
      displaySystemManage: false,
      displayCustomSymbolStore: false,
      plotType: "",
    });
    this.hideSearchBtn();
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
        {/* {functionName="map:board:role:manage" type="org"} */}
        <div
          className={`${styles.circle} ${
            this.props.isInvalidToolBar ? "invalid" : ""
          }`}
          style={{
            // ...this.parent.getStyle("map:board:role:manage", "org"),
            ...{ background: "#fff" },
          }}
          disabled={this.parent.getDisabled("map:board:role:manage", "org")}
        >
          {/* <img crossOrigin="anonymous" alt="" src=""></img> */}
          <Tooltip title="权限管理" placement="right">
            <i
              className={globalStyle.global_icon}
              style={{ fontSize: 26 }}
              onClick={() => {
                this.parent.setState({
                  displayPlot: false,
                  hidePlot: false,
                  displayProject: false,
                  displayTempPlot: false,
                  displayCustomSymbolStore: false,
                  displayProjectList: false,
                  displaySystemManage: true,
                });
                this.setState({
                  selectedIndex: -1,
                });
                this.parent.deactivate();
                this.openPanel();
                this.hideSearchBtn();
              }}
            >
              &#xe764;
            </i>
          </Tooltip>
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
        <Badge
          count={this.state.operatorListLength}
          className={styles.temp}
          offset={[0, 20]}
        >
          <div
            className={`${styles.circle} ${styles.temp}`}
            onClick={() => {
              this.openPanel();
              this.displayTempPlot();
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
              displaySystemManage: false,
              plotType: "",
            });
            this.parent.deactivate();
            this.openPanel();
            this.hideSearchBtn();
          }}
          style={{
            ...customSymbolStoreStyle,
            ...this.parent.getStyle("map:plot:mark:custom", "org"),
          }}
          disabled={this.parent.getDisabled("map:plot:mark:custom", "org")}
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
