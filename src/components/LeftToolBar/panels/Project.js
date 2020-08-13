import React from "react";
import { Tabs, Spin } from "antd";

import animateCss from "../../../assets/css/animate.min.css";
import styles from "../LeftToolBar.less";
import ProjectScouting from "../../../pages/ProjectScouting/ScoutingList";
import PublicData from "../../../pages/publicMapData/publicMapData";
import ScoutingDetails from "../../../pages/ProjectScouting/ScoutingDetails";
import Main from "../../Main/Main";
import Search from "../../Search/Search";
import ScoutAction from "../../../lib/components/ProjectScouting/ScoutingList";
// import ScoutDetail from "../../../lib/components/ProjectScouting/ScoutingDetail";
import { connect } from "dva";

@connect(({ controller: { mainVisible } }) => ({ mainVisible }))
export default class Project extends React.Component {
  constructor(props) {
    super(props);
    this.queryStr = "";
    this.publicDataChild = null;
  }

  componentDidMount() {
    this.checkListCach();
  }

  tabChange = (val) => {
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
    return (
      <div
        className={styles.panel}
        style={{ position: "absolute", left: 56, top: 0 ,height:'100%'}}
      >
        {this.props.mainVisible === "list" ? (
          <div
            className={`${animateCss.animated} ${animateCss.slideInLeft}`}
            style={{ animationDuration: "0.3s", height: "100%" }}
          >
            <Main>
              <div style={{ flex: "0" }}>
                <Search changeQueryStr={this.changeQueryStr}></Search>
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
                  <TabPane tab={<span>项目踏勘</span>} key="1">
                    <ProjectScouting></ProjectScouting>
                  </TabPane>
                  <TabPane tab={<span>公共数据</span>} key="2">
                    <PublicData
                      getQueryStr={this.getQueryStr}
                      onRef={this.onRef}
                    />
                  </TabPane>
                </Tabs>
              </div>
            </Main>
          </div>
        ) : this.props.mainVisible === "loading" ? (
          <div className={styles.loadingPage} style={{height:'100vh'}}>
            <Spin />
          </div>
        ) : (
          <Main>
            <ScoutingDetails></ScoutingDetails>
          </Main>
        )}
      </div>
    );
  }
}
