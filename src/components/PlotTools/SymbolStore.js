import React, { Component } from "react";
import { Tabs, Skeleton, Input, Button, Upload, message } from "antd";
import throttle from "lodash/throttle";

import styles from "./Styles.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import plotServices from "../../services/plot";
import { config } from "../../utils/customConfig";
import symbolStoreServices from "../../services/symbolStore";
import { formatSize } from "../../utils/utils";
import { BASIC } from "../../services/config";
export default class SymbolStore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publicSymbolStore: [],
      searchVal: "",
      searchLoading: false,
      orgSymbols: [],
      uploadSymbolName: "",
      startDelete: false,
      finishDelete: false,
    };
    this.symbols = [];
    this.handleSearchInputChange = throttle(this.handleSearchInputChange, 500);
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
    this.getOrgSymbol();
  }
  getOrgSymbol = () => {
    symbolStoreServices.GET_ICON().then((res) => {
      if (res.code === "0") {
        this.symbols = res.data;
        this.setState({
          orgSymbols: res.data,
        });
      }
    });
  };
  getSymbol = (data) => {
    if (!data) return;
    let style = {};
    let symbolUrl = data.value1;
    let src = null;
    if (symbolUrl) {
      if (symbolUrl.indexOf("/") > -1) {
        symbolUrl = symbolUrl.replace("img", "");
        src = require("../../assets" + symbolUrl);
      }
    } else {
      symbolUrl = data.icon_url;
      src = symbolUrl;
    }
    return {
      ...style,
      backgroundImage: `url(${src})`,
      backgroundColor: "rgba(255,255,255,1)",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
      backgroundSize: "100%",
    };
  };
  onSearch = () => {};
  handleSearchInputChange = (e) => {
    const value = e.target?.value.trim();
    let tempArr = [];
    if (value) {
      tempArr = this.symbols.filter((item) => {
        return item.icon_name.indexOf(value) > -1;
      });
    } else {
      this.setState({
        orgSymbols: this.symbols,
      });
      return;
    }
    this.setState({
      orgSymbols: tempArr,
    });
  };
  handleAddOrgSymbolClick = () => {};
  checkFileSize = (file) => {
    // console.log(file);
    let { size, text } = formatSize(file.size);
    text = text.trim();
    console.log(size, text);
    if (+size > 1 && text === "MB") {
      message.error("文件不能大于1MB");
      return false;
    }
    return true;
  };
  uploadChange = ({ file, fileList, event }) => {
    if (file.status === "done") {
      // 回调刷新
      this.getOrgSymbol();
    } else if (file.status === "error") {
      message.error("上传失败");
    }
  };
  beforeUpload = (file) => {
    const checked = this.checkFileSize(file);
    if (checked) {
      const index = file.name.lastIndexOf(".");
      this.setState({
        uploadSymbolName: file.name.substr(0, index),
      });
      return true;
    } else {
      return false;
    }
  };
  deleteSymbolClick = () => {
    this.setState({
      startDelete: !this.state.startDelete,
      finishDelete: !this.state.finishDelete,
    });
  };
  handleDeleteSymbolClick = (id) => {
    symbolStoreServices
      .DeL_ICON(id)
      .then((res) => {
        this.getOrgSymbol();
      })
      .catch((err) => {
        message.error("删除失败");
      });
  };
  render() {
    const { TabPane } = Tabs;
    return (
      <div className={styles.panel} style={{ paddingRight: 4 }}>
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
                      <div
                        className={styles.symbolBlock}
                        key={index}
                        title="系统符号仅支持查看"
                      >
                        <p
                          style={{
                            margin: 0,
                            textAlign: "left",
                            marginBottom: 4,
                          }}
                        >
                          {symbol.type}
                        </p>
                        <div
                          className={styles.symbolList}
                          style={{ pointerEvents: "none" }}
                        >
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
            <div className={styles.body} style={{ height: "100%" }}>
              <div
                className={`${styles.symbolPanel} ${globalStyle.autoScrollY}`}
              >
                <Input.Search
                  allowClear={true}
                  style={{ height: 32 }}
                  placeholder="搜索关键字或标绘名称"
                  loading={this.state.searchLoading}
                  onSearch={(value, event) => this.onSearch(value, event)}
                  onChange={(e) => this.handleSearchInputChange(e)}
                />
                {this.state.orgSymbols.length > 0 ? (
                  <div
                    className={styles.symbolBlock}
                    style={{ marginTop: 10, height: 330 }}
                  >
                    <div className={styles.symbolList}>
                      {this.state.orgSymbols.map((item) => {
                        return (
                          <div
                            title={item.icon_name}
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
                            >
                              {this.state.startDelete ? (
                                <i
                                  className={
                                    globalStyle.global_icon +
                                    ` ${styles.deleteBtn}`
                                  }
                                  dangerouslySetInnerHTML={{
                                    __html: "&#xe637;",
                                  }}
                                  onClick={() =>
                                    this.handleDeleteSymbolClick(item.id)
                                  }
                                ></i>
                              ) : null}
                            </div>
                            <span>{item.icon_name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p>
                    <span>请新增符号</span>
                  </p>
                )}
              </div>
              <div style={{ width: "100%", height: 40, display: "flex" }}>
                <Upload
                  action="/api/map/icon"
                  accept=".jpg, .jpeg, .png, .bmp"
                  data={{
                    icon_name: this.state.uploadSymbolName,
                    org_id: BASIC.getUrlParam.orgId,
                  }}
                  beforeUpload={this.beforeUpload}
                  headers={{ Authorization: BASIC.getUrlParam.token }}
                  onChange={(e) => this.uploadChange(e)}
                >
                  <Button type="primary" onClick={this.handleAddOrgSymbolClick}>
                    <i
                      className={globalStyle.global_icon}
                      dangerouslySetInnerHTML={{ __html: "&#xe636;" }}
                    ></i>
                  </Button>
                </Upload>
                <Button
                  style={{ marginLeft: 10, backgroundColor: "#D4D4D4" }}
                  onClick={this.deleteSymbolClick}
                >
                  {this.state.finishDelete ? (
                    <span>完成删除</span>
                  ) : (
                    <i
                      className={globalStyle.global_icon}
                      dangerouslySetInnerHTML={{ __html: "&#xe635;" }}
                    ></i>
                  )}
                </Button>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
