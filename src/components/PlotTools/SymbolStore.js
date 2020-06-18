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
import { reject } from "lodash";
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
    let symbolUrl = data.value1 || data.icon_url;
    let src = null;
    if (symbolUrl) {
      if (symbolUrl.indexOf("/") > -1) {
        if (symbolUrl.indexOf("https") === 0) {
          src = symbolUrl;
        } else {
          symbolUrl = symbolUrl.replace("img", "");
          src = require("../../assets" + symbolUrl);
        }
        return {
          ...style,
          backgroundImage: `url(${src})`,
          backgroundColor: "rgba(255,255,255,1)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "100%",
        };
      } else if (symbolUrl.indexOf("rgb") > -1) {
        return {
          ...style,
          backgroundColor: symbolUrl,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "100%",
        };
      }
    }
  };
  searchSymbol = (value) => {
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
  onSearch = (value, event) => {
    this.searchSymbol(value);
  };
  handleSearchInputChange = (e) => {
    const value = e.target?.value.trim();
    this.searchSymbol(value);
  };
  handleAddOrgSymbolClick = () => {};
  checkFileSize = (file) => {
    // console.log(file);
    let { size, text } = formatSize(file.size);
    text = text.trim();
    console.log(size, text);
    if (+size > 1 && text === "MB") {
      message.error("图片不能大于1MB");
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
  beforeUpload = async (file) => {
    const checked = this.checkFileSize(file);
    if (checked) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        const me = this;
        reader.onload = function () {
          let tempImg = new Image();
          tempImg.src = reader.result;
          tempImg.onload = function () {
            if (tempImg.width > 48 || tempImg.height > 48) {
              message.error("图片长宽不能超过48个像素");
              reject(false);
            } else {
              const index = file.name.lastIndexOf(".");
              me.setState({
                uploadSymbolName: file.name.substr(0, index),
              });
              resolve(true);
            }
          };
        };
      });
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
          <TabPane tab="组织符号" key="2">
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
                <div
                  className={styles.symbolBlock}
                  style={{ marginTop: 10, height: 330 }}
                >
                  {this.state.orgSymbols.length > 0 ? (
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
                  ) : (
                    <div style={{ width: "100%" }}>
                      <p
                        style={{
                          textAlign: "center",
                          color: "rgba(0,0,0,0.65)",
                          paddingTop: 120,
                          fontWeight: "inherit",
                        }}
                      >
                        <span>暂无符号</span>
                      </p>
                      <p
                        style={{
                          textAlign: "center",
                          color: "rgba(0,0,0,0.65)",
                          fontWeight: "inherit",
                        }}
                      >
                        <span>请上传符号</span>
                      </p>
                    </div>
                  )}
                </div>
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
