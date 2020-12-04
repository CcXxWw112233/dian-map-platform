import React from "react";
import CommonPanel from "../CommonPanel/index";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import event from "../../lib/utils/event";
import styles from "./LocalPOI.less";
import { getDistance2, jumpToPoi, poiLayer } from "./lib";
import {
  createStyle,
  addFeature,
  createOverlay,
  TransformCoordinate,
  getPoint,
  Fit,
} from "../../lib/utils";
import { DragCircleRadius } from "../PublicOverlays";
import InitMap from "@/utils/INITMAP";

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
    this.keywords = this.selectTabPanels[0];
    this.circleRadius = 5000;
    this.searchAroundOverlay = null;
    this.getPoi(this.keywords);
    event.Evt.on("HouseDetailGetPoi", (housePoi) => {
      this.setState({
        pois: [],
      });
      this.clear();
      this.housePoi = housePoi;
      this.createPoiCircle();
      this.getPoi(this.selectTabPanel);
    });
    event.Evt.on("removeHousePOI", () => {
      this.setState({
        pois: [],
      });
      this.clear();
      this.removePoi();
    });
  }

  createPoiCircle = () => {
    let coords = this.housePoi.split(",");
    coords = TransformCoordinate(coords, "EPSG:4326", "EPSG:3857");
    this.searchAroundCircle = addFeature("defaultCircle", {
      coordinates: coords,
      radius: this.circleRadius,
    });
    let ele = new DragCircleRadius({
      format: this.formatUnit(this.circleRadius),
    });
    this.searchAroundOverlay = createOverlay(ele.element, {
      offset: [-20, 0],
    });
    let style = createStyle("Circle", {
      fillColor: "rgba(193, 232, 255, 0.3)",
      strokeColor: "rgba(99, 199, 255, 0.5)",
      strokeWidth: 2,
      radius: this.circleRadius,
      showName: false,
      text: this.formatUnit(this.circleRadius),
      offsetY: 0,
      textFillColor: "#ff0000",
      textStrokeColor: "#ffffff",
      textStrokeWidth: 2,
    });
    this.searchAroundCircle.setStyle(style);
    if (!poiLayer.layer) {
      poiLayer.init();
    }
    poiLayer.source.addFeature(this.searchAroundCircle);
    this.updateOverlayPosition();
    InitMap.map.addOverlay(this.searchAroundOverlay);
    this.bindDragCircleRadius(
      ele,
      coords,
      this.searchAroundCircle,
      this.keywords
    );
  };

  // 一级tab change回调
  handle1stTabChange = (e) => {
    const index = e.split("-")[0];
    this.selectTabPanel = this.selectTabPanels[index];
    this.keywords = this.selectTabPanels[index];
    this.getPoi(this.keywords);
  };

  // 二级tab change回调
  handle2ndTabChange = (e, index) => {
    this.selectTabPanel = e;
    this.selectTabPanels[index] = e;
    this.getPoi(e);
  };

  formatUnit = (size) => {
    if (size) {
      return size < 1000
        ? size.toFixed(2) + "米"
        : (size / 1000).toFixed(2) + "千米";
    }
    return null;
  };

  getPoi = (keywords) => {
    this.removePoi();
    this.circleRadius = Math.ceil(Number(this.circleRadius));
    const housePoi = this.housePoi || window.housePoi;
    if (!housePoi) return;
    window
      .CallWebMapFunction("searchNearByXY", {
        xy: housePoi,
        keywords: keywords,
        radius: this.circleRadius,
      })
      .then((res) => {
        if (Array.isArray(res)) {
          this.setState(
            {
              pois: res,
            },
            () => {
              res.forEach((item) => {
                if (item.name) {
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
                }
              });
            }
          );
        }
      });
  };

  updateRadius = (feature, radius) => {
    let f = this.formatUnit(radius);
    feature.getGeometry().setRadius(radius);
    let style = feature.getStyle();
    style.getText().setText(f);
  };

  updateOverlayPosition = () => {
    let extent = this.searchAroundCircle.getGeometry().getExtent();
    let rightTop = getPoint(extent, "topRight");
    let rightBottom = getPoint(extent, "bottomRight");
    let point = [rightTop[0], (rightTop[1] + rightBottom[1]) / 2];
    // console.log(coor,coord,overlayElement);
    this.searchAroundOverlay.setPosition(point);
  };

  bindDragCircleRadius = (ele, coordinates, f, keywords) => {
    let _pixel = InitMap.map.getPixelFromCoordinate(coordinates);
    let coord = null;
    let radius;
    ele.on = {
      mouseDown: () => {
        _pixel = InitMap.map.getPixelFromCoordinate(coordinates);
      },
      mouseMove: (evt, step) => {
        // poiLayer.source && poiLayer.source.clear();
        var pixel = [evt.clientX, _pixel[1]];
        coord = InitMap.map.getCoordinateFromPixel(pixel);
        radius = coord[0] - coordinates[0];
        if (radius <= 5 * 100 || radius > 50000) {
          return;
        }
        this.circleRadius = radius;
        this.searchAroundOverlay.setPosition(coord);
        let text = this.formatUnit(radius);
        ele.updateRadius(text);
        this.updateRadius(f, radius);
      },
      mouseUp: async () => {
        this.getPoi(this.keywords);
        Fit(InitMap.view, f.getGeometry().getExtent(), { duration: 300 });
      },
      change: (text) => {
        let t = +text;
        radius = t;
        this.circleRadius = radius;
        this.updateRadius(f, t);
        ele.updateRadius(this.formatUnit(t));
        this.updateOverlayPosition(this.searchAroundOverlay, f);
        Fit(InitMap.view, f.getGeometry().getExtent(), { duration: 300 });
      },
    };
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
    this.setState(
      {
        pois: [],
      },
      () => {
        poiLayer.removePoi();
      }
    );
  };
  closePanel = () => {
    this.props.closePanel();
    this.clear();
  };
  clear = () => {
    this.removePoi();
    poiLayer.poiList = [];
    poiLayer.source && poiLayer.source.clear();
    InitMap.map.removeOverlay(this.searchAroundOverlay);
  };
  render() {
    return (
      <CommonPanel panelName="周边" closePanel={this.closePanel}>
        <Tabs
          type="card"
          onChange={(e) => this.handle1stTabChange(e)}
          className={styles.wrapper + " LocalPOI"}
        >
          {this.setting.map((item, index) => {
            const tabBarStyle = { borderRadius: 20 };
            return (
              <TabPane
                tab={item.name}
                key={`${index}-${item.name}`}
                tabBarStyle={tabBarStyle}
              >
                <Tabs
                  onChange={(e) => this.handle2ndTabChange(e, index)}
                  className="LocalPOI2"
                >
                  {item.children &&
                    item.children.map((item2) => {
                      return (
                        <TabPane tab={item2.name} key={item2.name}>
                          <ul
                            style={{ height: "167px" }}
                            className={globalStyle.autoScrollY}
                          >
                            {this.state.pois.length > 0 ? (
                              this.state.pois.map((item3, index2) => {
                                if (item3.name) {
                                  return (
                                    <li
                                      key={`p-${index2}`}
                                      onClick={() => this.handleRowClick(item3)}
                                    >
                                      <div className={styles.row}>
                                        <i
                                          style={{
                                            color: "rgb(255, 255, 255)",
                                            fontSize: 16,
                                            marginRight: 6,
                                          }}
                                          className={globalStyle.global_icon}
                                          dangerouslySetInnerHTML={{
                                            __html: item2.icon,
                                          }}
                                        ></i>
                                        <div
                                          className={styles.firstDiv}
                                          style={{ width: "calc(100% - 70px)" }}
                                        >
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
                                }
                                return null;
                              })
                            ) : (
                              <div
                                style={{
                                  color: "#fff",
                                  display: "flex",
                                  flexDirection: "column",
                                  position: "relative",
                                  top: "30%",
                                }}
                              >
                                <i
                                  className={globalStyle.global_icon}
                                  style={{ fontSize: 50, lineHeight: "50px" }}
                                >
                                  &#xe7d1;
                                </i>
                                <span>暂无数据</span>
                              </div>
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
