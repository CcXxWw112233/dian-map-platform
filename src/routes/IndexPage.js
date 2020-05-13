import React from "react";
import { connect } from "dva";
import styles from "./IndexPage.css";
import "antd/dist/antd.css";
import LayerMap from "../components/maps";
import { ChangeMap } from "../utils/utils";

import { getMyPosition } from "../utils/getMyPosition";
import PublicData from "../pages/publicMapData/publicMapData";
import ProjectScouting from "../pages/ProjectScouting/ScoutingList";
import ScoutingDetails from "../pages/ProjectScouting/ScoutingDetails";
// import { PublicData, ProjectScouting } from 'pages/index'
import { Tabs } from "antd";

import { Main } from "components";
import {
  ToolBar,
  Location,
  BasemapGallery,
  Sider,
  Search,
  CityPanel,
} from "components/index";
import Overlay from "components/Overlay/Overlay";

import LengedList from "components/LengedList/LengedList"

import BottomToolBar from "components/BottomToolBar/BottomToolBar"

@connect(({ controller: { mainVisible } }) => ({ mainVisible }))
class IndexPage extends React.Component {
  constructor(props) {
    super(...arguments);
    this.map = null;
    this.view = null;
    this.mySelfIcon = false;
    this.positionTimer = null;
    // this.state = {
    //   draw_
    // }
  }
  state = {
    visible: true,
    placement: "left",
    left: "0px",
    draw_visible: false,
  };

  showDrawer = () => {
    const { draw_visible } = this.state;
    this.setState({
      draw_visible: !draw_visible,
    });
  };
  onClose = () => {
    this.setState({
      visible: false,
    });
  };
  componentDidMount() {}
  // 地图加载完成
  MapOnload = ({ map, view }) => {
    this.map = map;
    this.view = view;
    this.setCenter(map, view);
  };

  // 通过高德地图获得自己的定位
  getMyCenter = (flag) => {
    // 获取定位
    getMyPosition.getPosition().then((val) => {
      // let coor = [114.11533,23.66666]
      // 转换地理坐标EPSG:4326 到 EPSG:3857
      let coordinate = getMyPosition.transformPosition(val);
      // 将视图平移到坐标中心点
      getMyPosition.setViewCenter(coordinate, 200);
    });
  };

  setCenter = () => {
    // 渲染icon等;
    getMyPosition.drawPosition();
    // 启动监听--移动端才启用监听
    if (AMap && AMap.Browser.mobile) {
      alert("当前是手机端页面，将启动移动位置更新");
      this.addWatchPosition();
    }
  };

  // 监听移动端的位置变化
  addWatchPosition = () => {
    this.positionTimer = setTimeout(() => {
      getMyPosition.getPosition().then((obj) => {
        let coordinate = getMyPosition.transformPosition(obj);
        // 改变自身的位置
        getMyPosition.setPosition(obj);
        getMyPosition.setViewCenter(coordinate, 200);
        // 改变自身的精准范围
        getMyPosition.setPositionRadius(obj.accuracy);
      });
      // 无限回调监听位置
      this.addWatchPosition();
    }, 5 * 1000);
  };

  // 切换底图
  changeMap = (val, showkeys) => {
    let map = this.map;
    let layers = map.getLayers();
    // 进行切换
    ChangeMap(val, layers, map, showkeys);
  };
  render() {
    const { TabPane } = Tabs;
    return (
      <div className={styles.normal}>
        {/* 地图主体 */}
        <LayerMap onLoad={this.MapOnload} />
        {/* 切换底图组件 */}
        {/* <ChangeBaseMap onChange={this.changeMap}/> */}
        {/* <BasemapGallery></BasemapGallery> */}
        {/* 工具栏 */}
        <ToolBar></ToolBar>
        <BottomToolBar></BottomToolBar>
        <LengedList></LengedList>
        {/* <Location></Location> */}
        <Sider width={360}>
          <Main visible={this.props.mainVisible}>
            <div style={{ flex: "0" }}>
              <Search onInputChange={this.handleInput}></Search>
            </div>
            <div
              style={{ overflow: "hidden", height: "100%" }}
              className="panels"
            >
              <Tabs
                defaultActiveKey="2"
                tabBarGutter={60}
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
                  <PublicData />
                </TabPane>
                <TabPane tab={<span>远程协作</span>} key="3">
                  远程协作
                </TabPane>
              </Tabs>
            </div>
          </Main>
          <Main visible={!this.props.mainVisible}>
            <ScoutingDetails></ScoutingDetails>
          </Main>
        </Sider>
        {/* <CityPanel></CityPanel> */}
        <Overlay />
      </div>
    );
  }
}

IndexPage.propTypes = {};

export default connect(({ maps: { mapMain, mapView } }) => ({
  mapMain,
  mapView,
}))(IndexPage);
