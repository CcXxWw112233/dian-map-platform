import React from "react";
import { connect } from "dva";
import styles from "./IndexPage.css";
import "antd/dist/antd.css";
import LayerMap from "../components/maps";

import { getMyPosition } from "../utils/getMyPosition";
import ScoutAction from "../lib/components/ProjectScouting/ScoutingList";
import ScoutDetail from "../lib/components/ProjectScouting/ScoutingDetail";
import Event from "../lib/utils/event";
// import { PublicData, ProjectScouting } from 'pages/index'
import { message } from "antd";

import PhotoSwipe from "../components/PhotoSwipe";
import FlutterComponents from "../pages/FlutterComponents";
import MatrixEdit from "../components/MatrixEdit";
import { BASIC } from "../services/config";
import UploadNotification from "../components/UploadNotification";
import ImagePreview from "../pages/ProjectScouting/components/CollectionDetail/imagePreview";

// new ui
// import BasemapGallery from "../components/BasemapGallery/BasemapGallery";
import Zoom from "../components/Zoom/index";
import RightTools from "../components/RightTools/index";

import LeftToolBar from "../components/LeftToolBar/index";

import SearchBtn from "../pages/publicMapData/searchBtn";
import BasemapGallery from "../components/BasemapGallery/BasemapGallery";

import MeetingSubscribe from "../pages/ProjectScouting/components/MeetingSubscribe/index";

@connect(
  ({
    controller: { mainVisible },
    openswitch: {
      isShowMap,
      isShowMobile,
      isShowBasemapGallery,
      isShowRightTools,
      isShowLeftToolBar,
      isShowPhotoSwipe,
      panelDidMount,
      openPanel,
      imagePreviewVisible,
    },
    editPicture: { editShow },
    meetingSubscribe: { panelVisible },
  }) => ({
    mainVisible,
    isShowMap,
    isShowMobile,
    editShow,
    isShowBasemapGallery,
    isShowRightTools,
    isShowLeftToolBar,
    isShowPhotoSwipe,
    panelDidMount,
    openPanel,
    imagePreviewVisible,
    panelVisible,
  })
)
class IndexPage extends React.Component {
  constructor(props) {
    super(...arguments);
    this.map = null;
    this.view = null;
    this.mySelfIcon = false;
    this.positionTimer = null;
    this.queryStr = "";
    this.publicDataChild = null;
    this.state = {
      visible: true,
      placement: "left",
      left: "0px",
      draw_visible: false,
      isMoveMapMoveedListen: true,
    };
  }
  componentDidMount() {
    this.checkListCach();
    Event.Evt.on("hasFeatureToProject", (data) => {
      console.log(data);
      this.addFeatureForProject(data);
    });
    Event.Evt.on("resetMoveMapMoveedListen", () => {
      this.setState({
        isMoveMapMoveedListen: true,
      });
    });
    const me = this;
    window.addEventListener("resize", function () {
      const width = document.getElementById("leftPanel").clientWidth;
      const transform = `translateX(${width}px)`;
      me.setState({
        transform: transform,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    const { openPanel, panelDidMount } = nextProps;
    let transform = "translateX(0px)";
    if (panelDidMount) {
      if (openPanel) {
        const width = document.getElementById("leftPanel").clientWidth;
        transform = `translateX(${width}px)`;
      }
    }
    this.setState({
      transform: transform,
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
              message.success(`?????????${res.data.board_name}????????????`);
              Event.Evt.firEvent("appendToProjectSuccess", val);
              Event.Evt.firEvent("addCollectionForFeature", resp);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          message.warning("???????????????????????????????????????????????????");
        }
      })
      .catch((err) => {
        console.log(err);
        message.warning("???????????????????????????????????????????????????");
      });
  };
  // ???????????????????????????id?????????????????????
  checkListCach = () => {
    let { dispatch } = this.props;
    ScoutAction.checkItem()
      .then((res = {}) => {
        dispatch({
          type: "scoutingDetail/updateDatas",
          payload: {
            board: res.code === 0 ? res.data : {},
          },
        });
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
  // ??????????????????
  MapOnload = ({ map, view }) => {
    this.map = map;
    this.view = view;
    if (BASIC.getUrlParam.isMobile === "1") return;
    let minResolution = this.view.getMinResolution();
    let tolerance = 0;
    // this.map.on("moveend", () => {
    //   let overlays = this.map.getOverlays();
    //   let arr = overlays.getArray();
    //   if (!arr.length) return;
    //   // ??????overlay?????????
    //   this.computedOverlayPosition(arr, minResolution, tolerance);
    // });
    // this.setCenter(map, view);
  };

  // ?????????????????????
  checkHasExtent = (data, extent) => {
    // console.log(data,extent)
    if (
      (data.w > extent.x &&
        data.w < extent.w &&
        data.h > extent.y &&
        data.h < extent.h) ||
      (data.h > extent.y &&
        data.x < extent.w &&
        data.h < extent.h &&
        data.x > extent.x) ||
      (data.w > extent.x &&
        data.y < extent.h &&
        data.w < extent.w &&
        data.y > extent.x) ||
      (data.x > extent.x &&
        data.x < extent.w &&
        data.y > extent.y &&
        data.y < extent.h)
    ) {
      return true;
    } else if (
      (data.w <= extent.w &&
        data.x >= extent.x &&
        data.y >= extent.y &&
        data.h <= extent.h) ||
      (data.w >= extent.w &&
        data.x <= extent.x &&
        data.y <= extent.y &&
        data.h >= extent.h)
      // || (data.w <= extent.extent.w && data.y >= extent.y && data.x <= extent.x && data.h >= extent.h)
    ) {
      return true;
    }
    return false;
  };

  computedOverlayPosition = (arr, min, tolerance) => {
    if (!arr.length) return;
    let resolution = this.view.getResolution();
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      let element = item.getElement().parentNode;
      if (!element) return;
      let style = window.getComputedStyle(element);
      let transform = style.transform;
      // ????????????overlay???????????????
      let x = parseInt(transform.substring(7).split(",")[4]);
      let y = parseInt(transform.substring(7).split(",")[5]);
      let h = element.clientHeight + y;
      let w = element.clientWidth + x;
      let visible = element.style.visibility || "visible";
      let text = element.textContent;
      let extent = { x, y, w, h, visible, text };

      let flag = [];
      arr.forEach((nitem) => {
        let nElement = nitem.getElement().parentNode;
        if (!nElement) return;
        let nstyle = window.getComputedStyle(nElement);
        let transform = nstyle.transform;
        // ????????????overlay???????????????
        let nx = parseInt(transform.substring(7).split(",")[4]);
        let ny = parseInt(transform.substring(7).split(",")[5]);
        let nh = nElement.clientHeight + ny;
        let nw = nElement.clientWidth + nx;
        let ntext = nElement.textContent;
        // let visible = nElement.style.visibility || 'visible';
        let ext = { x: nx, y: ny, w: nw, h: nh, text: ntext };
        // ???????????????????????????
        // ???????????????????????????????????????????????????
        // if(extent.text == ntext){
        //   if(extent.visible === 'hidden'){
        //     return ;
        //   }
        // }
        // ??????????????????????????????????????????
        if (extent.text != ntext) {
          if (this.checkHasExtent(ext, extent)) {
            // console.log(extent.text,extent.visible ,ext.text)
            if (extent.visible !== "hidden")
              nElement.style.visibility = "hidden";
          } else if (!this.checkHasExtent(ext, extent)) {
            nElement.style.visibility = "visible";
          }
        } else {
          // ??????????????????????????????????????????
        }
      });
    }
  };

  // ???????????????????????????????????????
  getMyCenter = (flag) => {
    // ????????????
    getMyPosition.getPosition().then((val) => {
      // let coor = [114.11533,23.66666]
      // ??????????????????EPSG:4326 ??? EPSG:3857
      let coordinate = getMyPosition.transformPosition(val);
      // ?????????????????????????????????
      getMyPosition.setViewCenter(coordinate, 200);
    });
  };

  setCenter = () => {
    // ??????icon???;
    // getMyPosition.drawPosition();
    // ????????????--????????????????????????
    if (AMap && AMap.Browser.mobile) {
      // alert("??????????????????????????????????????????????????????");
      // this.addWatchPosition();
    }
  };

  // ??????????????????????????????
  addWatchPosition = () => {
    this.positionTimer = setTimeout(() => {
      getMyPosition.getPosition().then((obj) => {
        let coordinate = getMyPosition.transformPosition(obj);
        // ?????????????????????
        getMyPosition.setPosition(obj);
        getMyPosition.setViewCenter(coordinate, 200);
        // ???????????????????????????
        getMyPosition.setPositionRadius(obj.accuracy);
      });
      // ????????????????????????
      this.addWatchPosition();
    }, 5 * 1000);
  };

  toOld = () => {
    let search = window.location.search || window.location.hash;
    let origin = window.location.origin;
    let href = origin + "/oldpage/" + search.replace("#/", "");
    setTimeout(() => {
      window.open(href, "_self");
    }, 500);
  };

  render() {
    window.addEventListener("resize", () => {
      this.setState({
        update: this.state.update + 1,
      });
    });
    let {
      isShowMap,
      isShowMobile,
      editShow,
      isShowBasemapGallery,
      isShowRightTools,
      isShowLeftToolBar,
      isShowPhotoSwipe,
      imagePreviewVisible,
      panelVisible,
    } = this.props;
    return (
      <div className={styles.normal} id="IndexPage">
        {/* ???????????? */}
        {isShowMap && <LayerMap onLoad={this.MapOnload} />}
        {/* {isShowBasemapGallery && <BasemapGallery />} */}
        {isShowRightTools && <RightTools />}
        <LeftToolBar isShowLeftToolBar={isShowLeftToolBar} />
        {isShowPhotoSwipe && <PhotoSwipe />}
        {/* ???????????????????????? */}
        {isShowMobile && <FlutterComponents />}
        {editShow && <MatrixEdit />}
        {/* {isShowRightTools && <Zoom />} */}
        {/* ?????????????????? */}
        {/* {!isShowMobile && } */}
        <UploadNotification />
        <SearchBtn></SearchBtn>
        {isShowBasemapGallery && <BasemapGallery />}
        {/* {isShowBasemapGallery && (
          <a
            // className={styles.changePackage}
            style={{
              position: "absolute",
              left: 66,
              padding: "4px 8px",
              borderRadius: "50px",
              backgroundColor: "#fff",
              top: "24px",
              color: "#595959",
              border: "1px solid #dedede",
              fontSize: "12px",
              width: "72px",
              transition: "transform 0.3s cubic-bezier(0.7, 0.3, 0.1, 1)",
              transform: this.state.transform,
            }}
            onClick={this.toOld}
            target="_self"
          >
            ????????????
          </a>
        )} */}
        {isShowBasemapGallery && (
          <a
            style={{
              position: "absolute",
              left: 66,
              padding: "4px 8px",
              borderRadius: "50px",
              backgroundColor: "#fff",
              bottom: "100px",
              color: "#595959",
              border: "1px solid #dedede",
              fontSize: "12px",
              width: "100px",
              transition: "transform 0.3s cubic-bezier(0.7, 0.3, 0.1, 1)",
              transform: this.state.transform,
            }}
            onClick={() => {
              this.setState(
                {
                  isMoveMapMoveedListen: !this.state.isMoveMapMoveedListen,
                },
                () => {
                  Event.Evt.firEvent(
                    "removeMapMoveEndListen",
                    this.state.isMoveMapMoveedListen
                  );
                }
              );
            }}
          >
            {this.state.isMoveMapMoveedListen ? "????????????" : "????????????"}
          </a>
        )}
        {imagePreviewVisible && <ImagePreview />}
        {panelVisible ? <MeetingSubscribe></MeetingSubscribe> : null}
      </div>
    );
  }
}

IndexPage.propTypes = {};

export default connect(({ maps: { mapMain, mapView } }) => ({
  mapMain,
  mapView,
}))(IndexPage);
