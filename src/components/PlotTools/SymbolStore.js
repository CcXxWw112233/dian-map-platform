import React, { Component } from "react";
import { Tabs } from "antd";
import { Skeleton } from "antd";

import styles from "./Styles.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import plotServices from "../../services/plot";
import { config } from "../../utils/customConfig";
export default class SymbolStore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publicSymbolStore: [],
    };
  }
  componentDidMount() {
    const publicPointSymbolStorePromise = plotServices.GET_POINTSYMBOL();
    const publicPolylineSymbolStorePromise = plotServices.GET_POLYLINESYMBOL();
    const publicPolygonSymbolStorePromise = plotServices.GET_POLYGONSYMBOL();
    Promise.all([
      publicPointSymbolStorePromise,
      publicPolylineSymbolStorePromise,
      publicPolygonSymbolStorePromise,
    ]).then((res) => {
      let tempArr = [];
      res.forEach((item) => {
        item.data.forEach((item0) => {
          if (item0.type === "农产品") {
            item0.items = [...item0.items, ...config];
          }
        });
        tempArr = [...tempArr, ...item.data];
      });
      this.setState({
        publicSymbolStore: tempArr,
      });
    });
  }
  getSymbol = (data) => {
    if (!data) return;
    let style = {};
    let symbolUrl = data.value1;
    if (symbolUrl.indexOf("/") > -1) {
      symbolUrl = symbolUrl.replace("img", "");
      const src = require("../../assets" + symbolUrl);
      style = {
        ...style,
        backgroundImage: `url(${src})`,
        backgroundColor: "rgba(255,255,255,1)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
      };
    } else if (data.value1.indexOf("rgb") > -1) {
      style = {
        ...style,
        backgroundColor: symbolUrl,
      };
    }
    if (this.props.plotType === "Point") {
      style = { ...style, borderRadius: 8 };
    }
    if (
      this.props.plotType === "Polyline" ||
      this.props.plotType === "LineString"
    ) {
      style = { ...style, height: 0, border: `1px solid ${symbolUrl}` };
    }
    return style;
  };
  render() {
    const { TabPane } = Tabs;
    return (
      <div className={styles.panel}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="系统符号" key="1">
            <div className={styles.body} style={{ height: "100%" }}>
              <div
                className={`${styles.symbolPanel} ${globalStyle.autoScrollY}`}
                style={{ height: 410 }}
              >
                {this.state.publicSymbolStore.length > 0 ? (
                  this.state.publicSymbolStore.map((symbol, index) => {
                    return (
                      <div className={styles.symbolBlock} key={index}>
                        <p
                          style={{
                            margin: 0,
                            textAlign: "left",
                            marginBottom: 4,
                          }}
                        >
                          {symbol.type}
                        </p>
                        <div className={styles.symbolList}>
                          {symbol.items.map((item) => {
                            return (
                              <div
                                title={item.name}
                                className={`${styles.symbol} ${
                                  this.state.selectedSymbolId === item.id
                                    ? styles.symbolActive
                                    : ""
                                }`}
                                key={item.id}
                                // onClick={() => this.handleSymbolItemClick(item)}
                              >
                                <div
                                  className={styles.symbolColor}
                                  style={this.getSymbol(item)}
                                ></div>
                                <span>{item.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <Skeleton paragraph={{ rows: 10 }} />
                )}
              </div>
            </div>
          </TabPane>
          <TabPane tab="项目符号" key="2">
            <p style={{ marginBottom: 0, marginTop: "80%" }}>功能正在开发中</p>
            <p>敬请期待~</p>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
