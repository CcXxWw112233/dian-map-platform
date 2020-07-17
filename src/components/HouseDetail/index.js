import React from "react";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./index.less";
import { Tabs } from "antd";
const { TabPane } = Tabs;
export default class HouseDetail extends React.Component {
  constructor(props) {
    super(props);
    this.setting = [
      {
        name: "交通",
        children: [
          { name: "地铁站", icon: "&#xe671;" },
          { name: "公交站", icon: "&#xe672;" },
        ],
      },
      {
        name: "教育",
        children: [
          { name: "幼儿园", icon: "&#xe63f;" },
          { name: "小学", icon: "&#xe63f;" },
          { name: "中学", icon: "&#xe675;" },
          { name: "大学", icon: "&#xe676;" },
        ],
      },
      {
        name: "医疗",
        children: [
          { name: "医院", icon: "&#xe677;" },
          { name: "药店", icon: "&#xe678;" },
        ],
      },
      {
        name: "购物",
        children: [
          { name: "商场", icon: "&#xe679;" },
          { name: "超市", icon: "&#xe67a;" },
          { name: "市场", icon: "&#xe67b;" },
        ],
      },
      {
        name: "生活",
        children: [
          { name: "银行", icon: "&#xe67c;" },
          { name: "ATM", icon: "&#xe67d;" },
          { name: "餐厅", icon: "&#xe67e;" },
          { name: "咖啡馆", icon: "&#xe67f;" },
        ],
      },
      {
        name: "娱乐",
        children: [
          { name: "公园", icon: "&#xe680;" },
          { name: "电影院", icon: "&#xe681;" },
          { name: "健身房", icon: "&#xe682;" },
          { name: "体育馆", icon: "&#xe683;" },
        ],
      },
    ];
    this.state = {
      pois: [],
    };
  }
  handleTabChange = (e) => {
    window
      .CallWebMapFunction("searchNearByXY", {
        xy: window.housePoi,
        keywords: e,
        radius: 5000,
      })
      .then((res) => {
        if (Array.isArray(res)) {
          this.setState({
            pois: res,
          });
        }
      });
  };
  render() {
    return (
      <div className={styles.wrap}>
        <Tabs type="card">
          {this.setting.map((item, index) => {
            return (
              <TabPane tab={item.name} key={index}>
                <Tabs onChange={(e) => this.handleTabChange(e)}>
                  {item.children &&
                    item.children.map((item2) => {
                      return (
                        <TabPane tab={item2.name} key={item2.name}>
                          <ul
                            style={{ height: "390px" }}
                            className={globalStyle.autoScrollY}
                          >
                            {this.state.pois.map((item3) => {
                              return (
                                <li>
                                  <p>
                                    <i
                                      style={{
                                        color: "rgba(24,155,255,1)",
                                        marginRight: 6,
                                      }}
                                      className={globalStyle.global_icon}
                                      dangerouslySetInnerHTML={{
                                        __html: item2.icon,
                                      }}
                                    ></i>
                                    <span>{item3.name}</span>
                                    <span>333m</span>
                                  </p>
                                  <p style={{ marginLeft: 36 }}>
                                    <span style={{ color: "rgba(0,0,0,0.45)" }}>
                                      {item3.address}
                                    </span>
                                  </p>
                                </li>
                              );
                            })}
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
