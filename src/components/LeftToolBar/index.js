import React from "react";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./LeftToolBar.less";
import Plot from "./panels/Plot";
import Project from "./panels/Project";

import { lineDrawing, pointDrawing, polygonDrawing } from "utils/drawing";

export default class LeftToolBar extends React.Component {
  constructor(props) {
    super(props);
    this.leftTools = [
      {
        name: "项目",
        displayText: false,
        iconfont: "&#xe756;",
        cb: () => {
          this.setState({
            displayPlot: false,
            displayProject: true,
          });
          this.deactivate();
        },
      },
      {
        name: "标记点",
        displayText: true,
        iconfont: "&#xe757;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            plotType: "point",
          });
          this.deactivate();
        },
      },
      // {
      //   name: "坐标",
      //   displayText: true,
      //   iconfont: "&#xe620;",
      //   cb: () => {
      //     this.setState({
      //       displayPlot: false,
      //       displayProject: false,
      //     });
      //     this.deactivate();
      //     pointDrawing.createDrawing();
      //   },
      // },
      {
        name: "描绘",
        displayText: true,
        iconfont: "&#xe63b;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            plotType: "freeLine",
          });
          this.deactivate();
        },
      },
      {
        name: "直线",
        displayText: true,
        iconfont: "&#xe624;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            plotType: "line",
          });
          this.deactivate();
        },
      },
      // {
      //   name: "距离",
      //   displayText: true,
      //   iconfont: "&#xe62a;",
      //   cb: () => {
      //     this.setState({
      //       displayPlot: false,
      //       displayProject: false,
      //     });
      //     this.deactivate();
      //     lineDrawing.createDrawing();
      //   },
      // },
      {
        name: "自由面",
        displayText: true,
        iconfont: "&#xe631;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            plotType: "freePolygon",
          });
          this.deactivate();
        },
      },
      {
        name: "标面",
        displayText: true,
        iconfont: "&#xe625;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            plotType: "polygon",
          });
          this.deactivate();
        },
      },
      // {
      //   name: "面积",
      //   displayText: true,
      //   iconfont: "&#xe62c;",
      //   cb: () => {
      //     this.setState({
      //       displayPlot: false,
      //       displayProject: false,
      //     });
      //     this.deactivate();
      //     polygonDrawing.createDrawing();
      //   },
      // },
      {
        name: "矩形",
        displayText: true,
        iconfont: "&#xe62e;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            plotType: "rect",
          });
          this.deactivate();
        },
      },
      {
        name: "圆形",
        displayText: true,
        iconfont: "&#xe62f;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            plotType: "circle",
          });
          this.deactivate();
        },
      },
      {
        name: "箭头",
        displayText: true,
        iconfont: "&#xe62d;",
        cb: () => {
          this.setState({
            displayPlot: true,
            displayProject: false,
            plotType: "arrow",
          });
          this.deactivate();
        },
      },
    ];
    this.state = {
      selectedIndex: 0,
      displayPlot: false,
      displayProject: true,
      plotType: "point",
    };
  }

  deactivate = () => {
    pointDrawing.deactivate();
    lineDrawing.deactivate();
    polygonDrawing.deactivate();
  };

  render() {
    return (
      <div
        className={styles.wrapper}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <div className={styles.user}>
          <img alt="" src=""></img>
        </div>
        <ul>
          {this.leftTools.map((item, index) => {
            let displayText = true;
            if (
              item.displayText === false ||
              this.state.selectedIndex === index
            ) {
              displayText = false;
            }
            const divStyle = displayText ? {} : { display: "table" };
            const iStyle = displayText
              ? {}
              : { display: "table-cell", verticalAlign: "middle" };
            return (
              <li key={`${item.iconfont}-${index}`}>
                <div
                  className={`${styles.item} ${
                    this.state.selectedIndex === index ? styles.active : ""
                  }`}
                  style={divStyle}
                  onClick={() => {
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
              </li>
            );
          })}
        </ul>
        {this.state.displayPlot ? (
          <Plot
            plotType={this.state.plotType}
            goBackProject={() => {
              this.setState({
                displayPlot: false,
                displayProject: true,
                selectedIndex: 0,
              });
            }}
          ></Plot>
        ) : null}
        {this.state.displayProject ? <Project></Project> : null}
      </div>
    );
  }
}
