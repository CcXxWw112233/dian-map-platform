import React from "react";
import { Tabs, Spin } from "antd";
import throttle from "lodash/throttle";

import animateCss from "../../../assets/css/animate.min.css";
import styles from "../LeftToolBar.less";
import ProjectScouting from "../../../pages/ProjectScouting/ScoutingList";
import PublicData from "../../../pages/publicMapData/publicMapData";
import ScoutingDetails from "../../../pages/ProjectScouting/ScoutingDetails";
import Main from "../../Main/Main";
import Search from "../../Search/Search";
import ScoutAction from "../../../lib/components/ProjectScouting/ScoutingList";
import mapApp from "utils/INITMAP";
import { TransformCoordinate } from "@/lib/utils";

import { connect } from "dva";

@connect(({ controller: { mainVisible }, openswitch: { openPanel } }) => ({
  mainVisible,
  openPanel,
}))
export default class Project extends React.Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.queryStr = "";
    this.publicDataChild = null;
    this.searchChild = null;
    this.publicDataTree = null;
    this.publicDataCheckedKeys = [];
    this.publicDataExpandedKeys = [];
    this.publicDataLastKeywords = [];
    this.publicDataLastKeywords2 = [];
    this.lastSingle = null;
    this.singleNodes = null;
    this.hasRenderPublicData = false;
    this.activePanelKey = "1";
    this.state = {
      openPanel: true,
      update: false,
    };
    this.getLoaction = throttle(this.getLoaction, 1000);
  }

  componentDidMount() {
    this.checkListCach();
    // if (mapApp) {
    //   mapApp.map.on("moveend", (e) => {
    //     this.getLoaction();
    //   });
    // }
  }

  getLoaction = () => {
    const map = mapApp.map;
    const view = map.getView();
    const center = view.getCenter();
    const zoom = view.getZoom();
    const newCoord = TransformCoordinate(center, "EPSG:3857", "EPSG:4326");
    window
      .CallWebMapFunction("getCityByLonLat", {
        lon: newCoord[0],
        lat: newCoord[1],
      })
      .then((res) => {
        if (res) {
          let locationName = "";
          if (Math.round(zoom) <= 6) {
            locationName = "全国";
          } else if (Math.round(zoom) > 6 && Math.round(zoom) <= 12) {
            locationName = res.addressComponent.province;
          } else {
            locationName = res.addressComponent.city;
          }
          const options = {
            type: "districtcode",
            adcode: res.addressComponent?.adcode,
            locationName: locationName,
          };
          mapApp.adcode = options.adcode;
          this.searchChild && this.searchChild.updateState(options, true);
        }
      });
  };

  tabChange = (val) => {
    this.activePanelKey = val;
    if (val === "1") {
      ScoutAction.fitToCenter();
    }
  };

  changeQueryStr = (value) => {
    this.queryStr = value;
    this.publicDataChild && this.publicDataChild.getAllData(this.queryStr);
  };

  getQueryStr = () => {
    return this.queryStr;
  };

  onRef = (ref) => {
    this.publicDataChild = ref;
  };

  onSearchRef = (ref) => {
    this.searchChild = ref;
  };

  // 检查缓存中是否存在id，进行判断渲染
  checkListCach = () => {
    let { dispatch } = this.props;
    ScoutAction.checkItem()
      .then((res) => {
        dispatch({
          type: "controller/updateMainVisible",
          payload: {
            mainVisible: res.code === 0 ? "detail" : "list",
          },
        });
      })
      .catch((err) => {
        dispatch({
          type: "controller/updateMainVisible",
          payload: {
            mainVisible: "list",
          },
        });
      });
  };

  render() {
    const { TabPane } = Tabs;
    const { hidden, parent } = this.props;
    return (
      <div
        style={{ width: "100%", height: "100%" }}
        className={hidden ? "" : styles.hidden}
      >
        {this.props.mainVisible === "list" ? (
          <div
            className={`${animateCss.animated} ${animateCss.slideInLeft}`}
            style={{ animationDuration: "0.3s", height: "100%" }}
          >
            <Main>
              <div style={{ flex: "0" }}>
                <Search
                  changeQueryStr={this.changeQueryStr}
                  parent={this}
                  onRef={this.onSearchRef}
                ></Search>
              </div>
              <div
                style={{ overflow: "hidden", height: "100%" }}
                className="panels"
              >
                <Tabs
                  className="HomeTabs"
                  defaultActiveKey="1"
                  // tabBarGutter={60}
                  animated={true}
                  onChange={this.tabChange}
                  tabBarStyle={{
                    textAlign: "center",
                  }}
                  style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    height: "100%",
                  }}
                >
                  <TabPane tab={<span>项目数据</span>} key="1">
                    <ProjectScouting
                      toolParent={this.props.parent}
                      update={this.state.update}
                    ></ProjectScouting>
                  </TabPane>
                  <TabPane
                    tab={<span>公共数据</span>}
                    key="2"
                    style={{
                      ...this.props.parent.getStyle(
                        "map:collect:poi:view",
                        "org"
                      ),
                    }}
                    disabled={this.props.parent.getDisabled(
                      "map:collect:poi:view",
                      "org"
                    )}
                  >
                    <PublicData
                      parent={this}
                      toolParent={parent}
                      getQueryStr={this.getQueryStr}
                      onRef={this.onRef}
                    />
                  </TabPane>
                </Tabs>
              </div>
            </Main>
          </div>
        ) : this.props.mainVisible === "loading" ? (
          <div className={styles.loadingPage} style={{ height: "100vh" }}>
            <Spin />
          </div>
        ) : (
          <Main>
            <ScoutingDetails
              displayPlotPanel={this.props.displayPlotPanel}
              parentTool={this.props.parent}
            ></ScoutingDetails>
          </Main>
        )}
      </div>
    );
  }
}
