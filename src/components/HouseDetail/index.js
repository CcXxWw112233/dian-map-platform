import React from "react";


import globalStyle from "@/globalSet/styles/globalStyles.less";
import event from "../../lib/utils/event";
import styles from "./index.less";
import { getDistance, jumpToPoi, poiLayer } from "./lib"

import { Tabs } from "antd";
const { TabPane } = Tabs;

export default class HouseDetail extends React.Component {
  constructor(props) {
    super(props);
    this.setting = [
      {
        name: "交通",
        children: [
          { name: "地铁站", icon: "&#xe654;" },
          { name: "公交站", icon: "&#xe655;" },
        ],
      },
      {
        name: "教育",
        children: [
          { name: "幼儿园", icon: "&#xe656;" },
          { name: "小学", icon: "&#xe657;" },
          { name: "中学", icon: "&#xe658;" },
          { name: "大学", icon: "&#xe659;" },
        ],
      },
      {
        name: "医疗",
        children: [
          { name: "医院", icon: "&#xe65a;" },
          { name: "药店", icon: "&#xe660;" },
        ],
      },
      {
        name: "购物",
        children: [
          { name: "商场", icon: "&#xe661;" },
          { name: "超市", icon: "&#xe662;" },
          { name: "市场", icon: "&#xe663;" },
        ],
      },
      {
        name: "生活",
        children: [
          { name: "银行", icon: "&#xe665;" },
          { name: "ATM", icon: "&#xe666;" },
          { name: "餐厅", icon: "&#xe667;" },
          { name: "咖啡馆", icon: "&#xe668;" },
        ],
      },
      {
        name: "娱乐",
        children: [
          { name: "公园", icon: "&#xe669;" },
          { name: "电影院", icon: "&#xe66b;" },
          { name: "健身房", icon: "&#xe66c;" },
          { name: "体育馆", icon: "&#xe66d;" },
        ],
      },
    ];
    // 一级tab选中的panel
    // this.selectTabPanels = ["地铁站", "幼儿园", "医院", "商场", "银行", "公园"]
    this.selectTabPanels = []
    this.setting.forEach(item => {
      this.selectTabPanels.push(item.children[0]?.name)
    })
    this.state = {
      pois: [],
    };
    this.poiKeyVal = {
      "地铁站": "ditiezhan",
      "公交站": "gongjiaozhan",
      "幼儿园": "youeryuan",
      "小学": "xiaoxue",
      "中学": "zhongxue",
      "大学": "daxue",
      "医院": "yiyuan",
      "药店": "yaodian",
      "商场": "shangchang",
      "超市": "chaoshi",
      "市场": "shichang",
      "银行": "yinhang",
      "ATM": "ATM",
      "餐厅": "canting",
      "咖啡馆": "kafeiguan",
      "公园": "gongyuan",
      "电影院": "dianyingyuan",
      "健身房": "jianshenfang",
      "体育馆": "tiyuguan"
    }
    this.selectTabPanel = "地铁站"
    this.getPoi(this.selectTabPanels[0])
    event.Evt.on("HouseDetailGetPoi", () => {
      this.getPoi(this.selectTabPanel)
    })
    event.Evt.on("removeHousePOI", () => {
      this.setState({
        pois: [],
      })
      this.removePoi()
    })
  }

  // 一级tab change回调
  handle1stTabChange = (e) => {
    this.getPoi(this.selectTabPanels[e])
  }

  // 二级tab change回调
  handle2ndTabChange = (e, index) => {
    this.selectTabPanel = e
    this.selectTabPanels[index] = e
    this.getPoi(e)
  };

  getPoi = (keywords) => {
    if (!window.housePoi) return
    window
      .CallWebMapFunction("searchNearByXY", {
        xy: window.housePoi,
        keywords: keywords,
        radius: 5000,
      })
      .then((res) => {
        if (Array.isArray(res)) {
          this.setState({
            pois: res,
          }, () => {
            poiLayer.init()
            poiLayer.removePoi()
            res.forEach(item => {
              poiLayer.addPoiToMap(item.location.split(","), this.poiKeyVal[keywords], item.name)
            })
          });
        }
      });
  }
  getDistance = (pt) => {
    if (!pt) return
    const pt1 = window.housePoi.split(",")
    const pt2 = pt.split(",")
    return getDistance(pt1, pt2)
  }

  handleRowClick = (data) => {
    if (!data) return
    jumpToPoi(data.location)
  }

  removePoi = () => {
    poiLayer.removePoi()
  }
  render () {
    return (
      <div className={styles.wrap}>
        <Tabs type="card" onChange={(e) => this.handle1stTabChange(e)}>
          {this.setting.map((item, index) => {
            return (
              <TabPane tab={item.name} key={index}>
                <Tabs onChange={(e) => this.handle2ndTabChange(e, index)}>
                  {item.children &&
                    item.children.map((item2) => {
                      return (
                        <TabPane tab={item2.name} key={item2.name}>
                          <ul
                            style={{ height: "390px" }}
                            className={globalStyle.autoScrollY}
                          >
                            {this.state.pois.length > 0 ? this.state.pois.map((item3, index2) => {
                              return (
                                <li key={`p-${index2}`} onClick={() => this.handleRowClick(item3)}>
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
                                      <span>{this.getDistance(item3.location)}</span>
                                    </div>
                                  </div>
                                  <div className={styles.row} style={{ marginLeft: 36 }}>
                                    <span style={{ color: "rgba(0,0,0,0.45)" }}>
                                      {item3.address}
                                    </span>
                                  </div>
                                </li>
                              );
                            }) : <p style={{ position: "relative", top: "45%", fontSize: 15, fontWeight: 600 }}><span>请在地图上选择需要查看的楼盘点位</span></p>}
                          </ul>
                        </TabPane>
                      );
                    })}
                </Tabs>
              </TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }
}
