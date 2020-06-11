import React, { Fragment } from "react";
import { connect } from "dva";
import styles from "./IndexPage.css";
import animateCss from "../assets/css/animate.min.css";
import "antd/dist/antd.css";
import LayerMap from "../components/maps";
import { ChangeMap } from "../utils/utils";

import { getMyPosition } from "../utils/getMyPosition";
import PublicData from "../pages/publicMapData/publicMapData";
import ProjectScouting from "../pages/ProjectScouting/ScoutingList";
import ScoutingDetails from "../pages/ProjectScouting/ScoutingDetails";
import PlottingModal from "../pages/PlottingModal/PlottingModal";
import ConfirmModal from "../pages/PlottingModal/ConfirmModal";
import ScoutAction from "../lib/components/ProjectScouting/ScoutingList";
import ScoutDetail from "../lib/components/ProjectScouting/ScoutingDetail";
import SearchToolBar from "../components/Search/Search";
import Event from "../lib/utils/event";
// import { PublicData, ProjectScouting } from 'pages/index'
import { Tabs, Spin, message } from "antd";

import { Main } from "components";
import {
  ToolBar,
  // Location,
  // BasemapGallery,
  Sider,
  Search,
  // CityPanel,
} from "components/index";
import Overlay from "components/Overlay/Overlay";

import LengedList from "components/LengedList/LengedList";

import BottomToolBar from "components/BottomToolBar/BottomToolBar";

import TempPlottingIcon from "components/TempPlotting/TempPlottingIcon";
import TempPlottingPanel from "components/TempPlotting/TempPlottingPanel";
import PhotoSwipe from '../components/PhotoSwipe'
import FlutterComponents from '../pages/FlutterComponents'
import PlotTools from "../components/PlotTools/ToolBar"
import MatrixEdit from '../components/MatrixEdit'

@connect(
  ({
    controller: { mainVisible },
    openswitch: { toolBars, bottomTools, searchTools ,isShowMobile },
    editPicture:{ editShow }
  }) => ({
    mainVisible,
    toolBars,
    bottomTools,
    searchTools,
    isShowMobile,
    editShow
  })
)
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
  componentDidMount() {
    this.checkListCach();
    Event.Evt.on("hasFeatureToProject", (data) => {
      console.log(data);
      this.addFeatureForProject(data);
    });
  }

  addFeatureForProject = (val) => {
    ScoutAction.checkItem()
      .then((res) => {
        if (res.code === 0) {
          let promise = val.map((item) => {
            let { feature } = item;
            let param = {
              coordinates: feature.getGeometry().getCoordinates(),
              geoType: feature.getGeometry().getType(),
              ...item.attrs,
            };
            let obj = {
              collect_type: 4,
              title: item.name,
              target: "feature",
              area_type_id: "",
              board_id: res.data.board_id,
              content: JSON.stringify(param),
            };
            return ScoutDetail.addCollection(obj);
          });
          Promise.all(promise)
            .then((resp) => {
              // console.log(resp);
              message.success(`添加到${res.data.board_name}项目成功`);
              Event.Evt.firEvent("appendToProjectSuccess", val);
              Event.Evt.firEvent("addCollectionForFeature", resp);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          message.warning("未选择项目，无法保存标绘数据到项目");
        }
      })
      .catch((err) => {
        console.log(err);
        message.warning("未选择项目，无法保存标绘数据到项目");
      });
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
  // 地图加载完成
  MapOnload = ({ map, view }) => {
    this.map = map;
    this.view = view;
    // this.setCenter(map, view);
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
    // getMyPosition.drawPosition();
    // 启动监听--移动端才启用监听
    if (AMap && AMap.Browser.mobile) {
      // alert("当前是手机端页面，将启动移动位置更新");
      // this.addWatchPosition();
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
  tabChange = (val) => {
    if (val === "1") {
      ScoutAction.fitToCenter();
    }
  };

  render() {
    const { TabPane } = Tabs;
    let { bottomTools, toolBars, searchTools ,isShowMobile ,editShow} = this.props;
    const SearchToolBarStyle = {
      position: "absolute",
      top: 20,
      boxShadow: "0px 2px 16px 0px rgba(0, 0, 0, 0.09)",
    };
    return (
      <div className={styles.normal}>
        {/* 地图主体 */}
        <LayerMap onLoad={this.MapOnload} />
        {/* <PlottingModal /> */}
        <ConfirmModal />
        {/* <SketchPicker></SketchPicker> */}
        {/* {toolBars && <ToolBar></ToolBar>} */}
        {bottomTools && <BottomToolBar></BottomToolBar>}
        {searchTools && (
          <SearchToolBar
            style={SearchToolBarStyle}
            isOnMap={true}
          ></SearchToolBar>
        )}
        <TempPlottingIcon></TempPlottingIcon>
        <TempPlottingPanel></TempPlottingPanel>
        <PlotTools></PlotTools>
        <LengedList></LengedList>
        {/* <Location></Location> */}
        <Sider width={360}>
          {this.props.mainVisible === "list" ? (
            <div
              className={`${animateCss.animated} ${animateCss.slideInLeft}`}
              style={{ animationDuration: "0.3s", height: "100%" }}
            >
              <Main>
                <div style={{ flex: "0" }}>
                  <Search onInputChange={this.handleInput}></Search>
                </div>
                <div
                  style={{ overflow: "hidden", height: "100%" }}
                  className="panels"
                >
                  <Tabs
                    className='HomeTabs'
                    defaultActiveKey="1"
                    // tabBarGutter={60}
                    animated={true}
                    onChange={this.tabChange}
                    tabBarStyle={{
                      textAlign:"center"
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
                      <PublicData />
                    </TabPane>
                    <TabPane tab={<span>远程协作</span>} key="3">
                      远程协作
                    </TabPane>
                  </Tabs>
                </div>
              </Main>
            </div>
          ) : this.props.mainVisible === "loading" ? (
            <div className={styles.loadingPage}>
              <Spin />
            </div>
          ) : (
            <Main>
              <ScoutingDetails></ScoutingDetails>
            </Main>
          )}
        </Sider>
        {/* <CityPanel></CityPanel> */}
        <Overlay />
        <PhotoSwipe/>
        {/* 是否显示手机页面 */}
        {
          isShowMobile && <FlutterComponents/>
        }
        {
          editShow && 
          <MatrixEdit/>
        }
      </div>
    );
  }
}

IndexPage.propTypes = {};

export default connect(({ maps: { mapMain, mapView } }) => ({
  mapMain,
  mapView,
}))(IndexPage);
