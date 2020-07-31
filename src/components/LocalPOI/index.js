import React from "react";
import CommonPanel from "../CommonPanel/index";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import event from "../../lib/utils/event";
import styles from "./LocalPOI.less";
import { getDistance2, jumpToPoi, poiLayer } from "./lib";

import { Tabs } from "antd";
const { TabPane } = Tabs;
export default class LocalPOI extends React.Component {
  constructor(props) {
    super(props);
    this.setting = [
      {
        name: "交通",
        children: [
          { name: "地铁站", icon: "&#xe63c;" },
          { name: "公交站", icon: "&#xe63e;" },
        ],
      },
      {
        name: "教育",
        children: [
          { name: "幼儿园", icon: "&#xe63f;" },
          { name: "小学", icon: "&#xe640;" },
          { name: "中学", icon: "&#xe641;" },
          { name: "大学", icon: "&#xe642;" },
        ],
      },
      {
        name: "医疗",
        children: [
          { name: "医院", icon: "&#xe643;" },
          { name: "药店", icon: "&#xe644;" },
        ],
      },
      {
        name: "购物",
        children: [
          { name: "商场", icon: "&#xe645;" },
          { name: "超市", icon: "&#xe646;" },
          { name: "市场", icon: "&#xe647;" },
        ],
      },
      {
        name: "生活",
        children: [
          { name: "银行", icon: "&#xe648;" },
          { name: "ATM", icon: "&#xe649;" },
          { name: "餐厅", icon: "&#xe64b;" },
          { name: "咖啡馆", icon: "&#xe64c;" },
        ],
      },
      {
        name: "娱乐",
        children: [
          { name: "公园", icon: "&#xe64d;" },
          { name: "电影院", icon: "&#xe64f;" },
          { name: "健身房", icon: "&#xe650;" },
          { name: "体育馆", icon: "&#xe651;" },
        ],
      },
    ];
    // 一级tab选中的panel
    // this.selectTabPanels = ["地铁站", "幼儿园", "医院", "商场", "银行", "公园"]
    this.selectTabPanels = [];
    this.setting.forEach((item) => {
      this.selectTabPanels.push(item.children[0]?.name);
    });
    this.state = {
      pois: [],
    };
    this.poiKeyVal = {
      地铁站: "ditiezhan",
      公交站: "gongjiaozhan",
      幼儿园: "youeryuan",
      小学: "xiaoxue",
      中学: "zhongxue",
      大学: "daxue",
      医院: "yiyuan",
      药店: "yaodian",
      商场: "shangchang",
      超市: "chaoshi",
      市场: "shichang",
      银行: "yinhang",
      ATM: "ATM",
      餐厅: "canting",
      咖啡馆: "kafeiguan",
      公园: "gongyuan",
      电影院: "dianyingyuan",
      健身房: "jianshenfang",
      体育馆: "tiyuguan",
    };
    this.selectTabPanel = this.setting[0].children[0].name;
    this.housePoi = null;
    this.getPoi(this.selectTabPanels[0]);
    event.Evt.on("HouseDetailGetPoi", (housePoi) => {
      this.housePoi = housePoi;
      this.getPoi(this.selectTabPanel);
    });
    event.Evt.on("removeHousePOI", () => {
      this.setState({
        pois: [],
      });
      this.removePoi();
    });
  }

  // 一级tab change回调
  handle1stTabChange = (e) => {
    const index = e.split("-")[0]
    this.selectTabPanel = this.selectTabPanels[index];
    this.getPoi(this.selectTabPanels[index]);
  };

  // 二级tab change回调
  handle2ndTabChange = (e, index) => {
    this.selectTabPanel = e;
    this.selectTabPanels[index] = e;
    this.getPoi(e);
  };

  getPoi = (keywords) => {
    const housePoi = this.housePoi || window.housePoi;
    if (!housePoi) return;
    window
      .CallWebMapFunction("searchNearByXY", {
        xy: housePoi,
        keywords: keywords,
        radius: 5000,
      })
      .then((res) => {
        if (Array.isArray(res)) {
          this.setState(
            {
              pois: res,
            },
            () => {
              poiLayer.init();
              poiLayer.removePoi();
              res.forEach((item) => {
                const distance = this.getDistance(item.location);
                poiLayer.addPoiToMap(
                  item.location.split(","),
                  this.poiKeyVal[keywords],
                  item.name,
                  {
                    name: item.name,
                    address: item.address,
                    keywords: keywords,
                    distance: distance,
                  }
                );
              });
            }
          );
        }
      });
  };
  getDistance = (pt) => {
    if (!pt) return;
    const housePoi = this.housePoi || window.housePoi;
    const pt1 = housePoi.split(",");
    const pt2 = pt.split(",");
    return getDistance2(pt1, pt2);
  };

  handleRowClick = (data) => {
    if (!data) return;
    jumpToPoi(data, this.selectTabPanel);
  };

  removePoi = () => {
    poiLayer.removePoi();
  };
  closePanel = () => {
    this.props.closePanel();
  };
  render() {
    return (
      <CommonPanel panelName="周边" closePanel={this.closePanel}>
        <Tabs
          type="card"
          onChange={(e) => this.handle1stTabChange(e)}
          className={styles.wrapper + ' LocalPOI'}
        >
          {this.setting.map((item, index) => {
            const tabBarStyle = { borderRadius: 20 };
            return (
              <TabPane
                tab={item.name}
                key={`${index}-${item.name}`}
                tabBarStyle={tabBarStyle}
              >
                <Tabs onChange={(e) => this.handle2ndTabChange(e, index)} className="LocalPOI2">
                  {item.children &&
                    item.children.map((item2) => {
                      return (
                        <TabPane tab={item2.name} key={item2.name}>
                          <ul
                            style={{ height: "270px" }}
                            className={globalStyle.autoScrollY}
                          >
                            {this.state.pois.length > 0 ? (
                              this.state.pois.map((item3, index2) => {
                                return (
                                  <li
                                    key={`p-${index2}`}
                                    onClick={() => this.handleRowClick(item3)}
                                  >
                                    <div className={styles.row}>
                                      <i
                                        style={{
                                          color: "rgb(254, 32, 66)",
                                          fontSize: 16,
                                          marginRight: 6,
                                        }}
                                        className={globalStyle.global_icon}
                                        dangerouslySetInnerHTML={{
                                          __html: item2.icon,
                                        }}
                                      ></i>
                                      <div className={styles.firstDiv}>
                                        <span>{item3.name}</span>
                                      </div>
                                      <div className={styles.secondDiv}>
                                        <span>
                                          {this.getDistance(item3.location)}
                                        </span>
                                      </div>
                                    </div>
                                    <div
                                      className={styles.row}
                                      style={{ marginLeft: 36 }}
                                    >
                                      <span>{item3.address}</span>
                                    </div>
                                  </li>
                                );
                              })
                            ) : (
                              <p
                                style={{
                                  position: "relative",
                                  top: "45%",
                                  fontSize: 15,
                                  fontWeight: 600,
                                }}
                              >
                                <span style={{ color: "#fff" }}>
                                  请在地图上选择需要查看的楼盘点位
                                </span>
                              </p>
                            )}
                          </ul>
                        </TabPane>
                      );
                    })}
                </Tabs>
              </TabPane>
            );
          })}
        </Tabs>
      </CommonPanel>
    );
  }
}
