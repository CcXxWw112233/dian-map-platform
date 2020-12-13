import React, { Fragment } from "react";
import styles from "./index.less";
import panelStyle from "./panel.less";
import ReactDOM from "react-dom";
import animateCss from "../../../../assets/css/animate.min.css";
import { connect } from "dva";
import { MyIcon } from "../../../../components/utils";
import MapMain from "../../../../utils/INITMAP";
import DetailAction from "../../../../lib/components/ProjectScouting/ScoutingDetail";
import { Fit, getExtentIsEmpty } from "../../../../lib/utils";
import Event from "../../../../lib/utils/event";
import EditImage from "./EditImg";
import ReactPlayer from "react-player";
import { message, Tooltip } from "antd";
import { Pannellum, PannellumVideo } from "pannellum-react";
import { Dropdown, Button } from "antd";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import panoramaServices from "@/services/panoramaServices";
import { PanoramaOverlay, ImagePanel } from "./panels";

@connect(
  ({ openswitch: { openPanel }, scoutingDetail: { collections, board } }) => ({
    openPanel,
    collections,
    board,
  })
)
export default class CollectionPreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      updateStyle: {},
      datas: [],
      active: null,
      update: 0,
      isEdit: false,
      isOverallView: true,
      imageUrl: "",
      overlayVisible: false,
      activeIndex: -1,
      isAddPanorama: false,
      isModifyPanorama: false,
      isShowImagePanel: false,
      hotspot: [],
      panoramaList: [],
      selectedPitch: null,
      selectedYaw: null,
    };
    this.imgContent = React.createRef();
    this.touchStart = false;
    this.startEvent = {};
    this.windowHeight = document.body.clientHeight;
    this.minImgHeight = 400;
    this.map = MapMain.map;
    this.view = MapMain.view;
    this.isOutside = true;
  }
  static getDerivedStateFromProps(nextProps) {
    let { openPanel } = nextProps;
    let obj = {
      // datas: nextProps.currentGroup,
      // active: nextProps.currentData
    };
    if (openPanel) {
      let width = 0;
      let dom1 = document.querySelector("#leftToolBar");
      let dom2 = document.querySelector("#leftPanel");
      if (dom1) {
        width += dom1.clientWidth;
      }
      if (dom2) {
        width += dom2.clientWidth;
      }
      return {
        updateStyle: {
          width: document.body.clientWidth - width,
        },
        ...obj,
      };
    } else {
      let dom1 = document.querySelector("#leftToolBar");
      return {
        updateStyle: {
          width: document.body.clientWidth - (dom1 ? dom1.clientWidth : 0),
        },
        ...obj,
      };
    }
    return null;
  }

  componentDidMount() {
    // console.log(this.state)
    setTimeout(() => {
      this.initPadding();
      this.props.dispatch({
        type: "collectionDetail/updateDatas",
        payload: {
          selectData: this.state.active,
          type: "view",
        },
      });
      const { currentData } = this.props;
      if (currentData) {
        this.getList(currentData.id);
      }
      // const me = this;
      // document.querySelector(".pnlm-container").onclick = function (evt) {
      //   let pannellumRef = me.refs["pannellum"];
      //   let [pitch, yaw] = pannellumRef.getViewer().mouseEventToCoords(evt);
      //   if (me.state.isAddPanorama) {
      //     // let obj = { top: evt.x, left: evt.y };
      //     let obj = {
      //       pitch: pitch,
      //       yaw: yaw,
      //       cssClass: styles.panorama_add,
      //       isAdd: true,
      //     };
      //     let arr = me.state.hotspot;
      //     me.setState(
      //       {
      //         hotspot: [...arr, obj],
      //         isAddPanorama: false,
      //         isShowImagePanel: true,
      //         selectedPitch: pitch,
      //         selectedYaw: yaw,
      //       },
      //       () => {
      //         // pannellumRef.getViewer().setHfov()
      //         pannellumRef.getViewer().setPitch(pitch);
      //         pannellumRef.getViewer().setYaw(yaw);
      //       }
      //     );
      //   }
      // };
    }, 500);

    window.addEventListener("resize", () => {
      this.setState({
        update: this.state.update + 1,
      });
    });
  }

  // componentWillReceiveProps(nextProps) {
  //   const { currentData } = nextProps;
  //   this.getList(currentData.id);
  // }

  handleMoveToPanoramaLink = (item) => {
    let pannellumRef = this.refs["pannellum"];
    let viewer = pannellumRef.getViewer();
    viewer.setPitch(item.pitch);
    viewer.setYaw(item.yaw);
    let arr = this.state.hotspot;
    let selectIndex = arr.findIndex((item0) => item0.id === item.id);
    arr[selectIndex].cssClass = styles.panorama_modify;
    this.setState({
      hotspot: arr,
      isModifyPanorama: true,
    });
  };

  getList = (id) => {
    panoramaServices.getList(id).then((res) => {
      if (res && res.code === "0") {
        let datas = res.data;
        // datas.forEach((item) => {
        //   item.cssClass = styles.panorama_arrow;
        // });
        datas.map((item) => (item.cssClass = styles.panorama_arrow));
        const { timeData } = this.props;
        const keys = Object.keys(timeData);
        let datas2 = [];
        keys.forEach((item) => {
          if (timeData[item].length > 0) {
            timeData[item].forEach((item0) => {
              datas2.push(item0.data);
            });
          }
        });
        datas.forEach((item0) => {
          let data = datas2.filter((item) => item.id === item0.target_id);
          if (data.length > 0) {
            item0.imageUrl = data[0].resource_url;
          }
        });

        let hotspot = this.state.hotspot.filter((item) => item.isAdd === true);

        hotspot = [...hotspot, ...datas];
        this.setState({
          panoramaList: res.data,
          hotspot: hotspot,
        });
      }
    });
  };
  // 简化坐标
  getPointer = (e) => {
    return { x: e.pageX, y: e.pageY };
  };

  initPadding = () => {
    let { current } = this.imgContent;
    let height = current.clientHeight;
    let padding = [
      height + 60,
      100,
      40,
      Math.abs(this.state.updateStyle.width - document.body.clientWidth),
    ];
    this.fitview({ padding });
  };

  fitview = ({ padding, duration = 300 }) => {
    let extent = DetailAction.Source.getExtent();
    if (!getExtentIsEmpty(extent))
      Fit(
        this.view,
        extent,
        {
          padding,
        },
        duration
      ).then((res) => {});
  };

  pointerdown = (e) => {
    if (e.target) {
      if (e.target.id === "slidebar_preview") {
        this.touchStart = true;
        this.startEvent = this.getPointer(e);
      }
    }
  };

  pointermove = (e) => {
    let { onFull } = this.props;
    if (!this.touchStart) return;
    let { current } = this.imgContent;
    let targetHeight = current.clientHeight;
    // console.log(current.clientHeight)
    let moveEvent = this.getPointer(e);
    let y = this.startEvent.y - moveEvent.y;
    if (targetHeight >= this.windowHeight - 100 && y < 0) {
      // console.log('到底了');
      onFull && onFull();
      this.touchStart = false;
      return;
    }
    if (targetHeight <= this.minImgHeight && y > 0) {
      // console.log('到了最小高度了');
      return;
    }

    targetHeight -= y;
    this.fitview({
      padding: [
        targetHeight + 60,
        100,
        40,
        Math.abs(this.state.updateStyle.width - document.body.clientWidth),
      ],
    });
    let percent = (targetHeight / this.windowHeight).toFixed(4);
    // current.style.height = targetHeight +'px';
    current.style.height = percent * 100 + "%";
    this.startEvent = moveEvent;
  };

  pointerout = () => {
    this.touchStart = false;
    this.startEvent = {};
  };

  onChageEdit = () => {
    let { onFull, dispatch } = this.props;
    this.setState({
      isEdit: true,
    });
    dispatch({
      type: "openswitch/updateDatas",
      payload: {
        openPanel: false,
      },
    });
    onFull && onFull();
  };

  exit = () => {
    this.setState({
      isEdit: false,
    });
  };

  handleSavePanoramaName = (id, newName) => {
    panoramaServices.modify({ id: id, name: newName }).then((res) => {
      if (res && res.code === "0") {
      }
    });
  };

  // 保存全景链接
  handleSavePanoramaLink = (selectData) => {
    const { currentData } = this.props;
    panoramaServices
      .add(
        currentData.id,
        selectData.data.id,
        this.state.selectedPitch,
        this.state.selectedYaw
      )
      .then((res) => {
        if (res && res.code === "0") {
          const { currentData } = this.props;
          panoramaServices.getList(currentData.id).then((res) => {
            if (res && res.code === "0") {
              let index = this.state.hotspot.findIndex(
                (item) => item.isAdd === true
              );
              let newHotspot = this.state.hotspot;
              newHotspot.splice(index, 1);
              let arr = res.data;
              arr.map((item) => (item.cssClass = styles.panorama_arrow));
              this.setState({
                panoramaList: res.data,
                hotspot: [...newHotspot, ...arr],
              });
              this.handleCloseImagePanel();
            }
          });
        }
      });
  };

  handlePannellumMouseUp = (evt, args) => {
    let pannellumRef = this.refs["pannellum"];
    let [pitch, yaw] = pannellumRef.getViewer().mouseEventToCoords(evt);
    if (this.state.isAddPanorama) {
      // let obj = { top: evt.x, left: evt.y };
      let obj = {
        pitch: pitch,
        yaw: yaw,
        cssClass: styles.panorama_add,
        isAdd: true,
      };
      let arr = this.state.hotspot;
      this.setState(
        {
          hotspot: [...arr, obj],
          isAddPanorama: false,
          isShowImagePanel: true,
          selectedPitch: pitch,
          selectedYaw: yaw,
        },
        () => {
          pannellumRef.getViewer().setPitch(pitch);
          pannellumRef.getViewer().setYaw(yaw);
        }
      );
    }
  };

  handleImageClick = (evt, args, item) => {
    if (this.state.isAddPanorama) {
    } else if (this.state.isModifyPanorama) {
    } else {
      // this.oldImageUrl = this.state.imageUrl;
      this.isOutside = false;
      this.setState(
        {
          imageUrl: item.imageUrl,
        },
        () => {
          const { parent } = this.props;
          parent.toggleSelectResource(item);
          // const { currentData } = this.props;
          this.getList(item.id);
        }
      );
      this.getList(item.target_id);
    }
  };
  checkRender = (data = {}, isOverallView = false) => {
    let imageUrl = data?.resource_url;
    if (!this.isOutside) {
      imageUrl = this.state.imageUrl;
    }
    let type = DetailAction.checkCollectionType(data.target);
    if (type === "pic") {
      return this.state.isOverallView && data.collect_type === "10" ? (
        <Pannellum
          width="100%"
          height="100%"
          image={imageUrl}
          pitch={10}
          yaw={180}
          hfov={110}
          ref="pannellum"
          autoLoad
          showZoomCtrl={false}
          onLoad={() => {
            this.isOutside = true;
            const { currentData } = this.props;
            this.getList(currentData.id);
          }}
          onTouchend={(evt, args) => this.handlePannellumMouseUp(evt, args)}
          onMouseup={(evt, args) => this.handlePannellumMouseUp(evt, args)}
        >
          {this.state.hotspot.map((item, index) => {
            return (
              <Pannellum.Hotspot
                key={index}
                type="custom"
                pitch={item.pitch}
                yaw={item.yaw}
                title={item.name}
                cssClass={item.cssClass}
                handleClick={(evt, args) =>
                  this.handleImageClick(evt, args, item)
                }
              ></Pannellum.Hotspot>
            );
          })}
        </Pannellum>
      ) : (
        <img crossOrigin="anonymous" src={data?.resource_url} alt="" />
      );
    } else if (type === "video" || type === "interview") {
      let config = {
        file: {
          forceVideo: type === "video",
          forceAudio: type === "interview",
        },
      };
      return (
        <Fragment>
          <div
            style={{
              width: "100%",
              height: "100%",
              paddingTop: 20,
              ...(this.state.isOverallView && data.collect_type === "10"
                ? { display: "" }
                : { display: "none" }),
            }}
          >
            <PannellumVideo
              video={data.resource_url}
              loop={true}
              controls={true}
              width="100%"
              height="600px"
              pitch={10}
              yaw={180}
              hfov={140}
              minHfov={50}
              maxHfov={180}
            ></PannellumVideo>
          </div>
          <div
            style={{
              width: "100%",
              height: "100%",
              paddingTop: 20,
              ...(this.state.isOverallView
                ? { display: "none" }
                : { display: "" }),
            }}
          >
            <ReactPlayer
              config={config}
              url={data.resource_url}
              width="100%"
              controls={true}
              height="80%"
            />
          </div>
        </Fragment>
      );
    } else return "";
  };

  saveImg = (data, url, resource_id) => {
    let arr = Array.from(this.props.collections);
    let param = {
      id: data.id,
      resource_id: resource_id,
    };
    // 修改采集数据的resource_id 并且更新列表
    DetailAction.editCollection(param).then((res) => {
      message.success("保存成功");
      this.exit();
      arr = arr.map((item) => {
        if (item.id === data.id) {
          item.resource_id = resource_id;
          item.resource_url = url;
        }
        return item;
      });
      this.props.dispatch({
        type: "openswitch/updateDatas",
        payload: {
          openPanel: true,
        },
      });
      Event.Evt.firEvent("CollectionUpdate:reload", arr);
    });
  };

  onSaveAs = async (data, file_resource_id, suffix, name) => {
    const { board, collections } = this.props;
    let params = {
      board_id: board.board_id,
      area_type_id: data.area_type_id,
      collect_type: 3,
      resource_id: file_resource_id,
      target: suffix && suffix.replace(".", ""),
      title: name,
    };
    DetailAction.addCollection(params).then((res) => {
      message.success("保存成功");
      let arr = Array.from(collections);
      arr = arr.concat(res.data);
      Event.Evt.firEvent("CollectionUpdate:reload", arr);
      this.props.dispatch({
        type: "openswitch/updateDatas",
        payload: {
          openPanel: true,
        },
      });
      this.exit();
    });
  };

  addNextPanoramaScene = () => {
    message.info('点击图片添加"坐标定位"');
    this.setState({
      overlayVisible: false,
      isAddPanorama: true,
    });
  };

  handleCloseImagePanel = () => {
    let arr = this.state.hotspot;
    let index = arr.findIndex((item) => item.isAdd === true);
    arr.splice(index, 1);
    this.setState({
      isShowImagePanel: false,
      hotspot: arr,
    });
  };

  handleDelPanoramaScene = (id) => {
    panoramaServices.delete(id).then((res) => {
      if (res && res.code === "0") {
        message.info("删除成功");
        const { currentData } = this.props;
        if (currentData) {
          panoramaServices.getList(currentData.id).then((res) => {
            if (res && res.code === "0") {
              let arr = res.data;
              arr.map((item) => (item.cssClass = styles.panorama_arrow));
              this.setState({
                panoramaList: res.data,
                hotspot: arr,
              });
            }
          });
        }
      }
    });
  };

  handleDropdownClick = () => {
    this.setState({
      overlayVisible: !this.state.overlayVisible,
    });
  };

  render() {
    let { updateStyle, isEdit } = this.state;
    const { dispatch, onExitFull, Full, currentData } = this.props;
    return ReactDOM.createPortal(
      <div
        className={`${styles.viewBoxContainer} ${
          Full ? styles.imgContentIsFull : styles.imgContentNotFull
        }`}
        ref={this.imgContent}
        onPointerDown={this.pointerdown}
        onPointerMove={this.pointermove}
        onPointerUp={this.pointerout}
        style={updateStyle}
      >
        <span
          className={styles.closeModal}
          onClick={() => {
            dispatch({
              type: "collectionDetail/updateDatas",
              payload: {
                showCollectionsModal: false,
                selectData: null,
                zIndex: 10,
                type: "view",
                isImg: true,
              },
            });
          }}
        >
          <MyIcon type="icon-guanbi2" />
        </span>
        <span className={styles.slidebar} id="slidebar_preview"></span>

        <div className={styles.contentTitle}>
          <div className={styles.title_name}>{currentData?.title}</div>
          <div className={styles.title_remark}>{currentData?.description}</div>
        </div>

        <div className={styles.tools}>
          {DetailAction.checkCollectionType(currentData?.target) === "pic" && (
            <span className={styles.edit} onClick={this.onChageEdit}>
              <MyIcon type="icon-huabi" />
            </span>
          )}
          {currentData?.collect_type === "10" ? (
            <Dropdown
              overlay={
                <PanoramaOverlay
                  list={this.state.panoramaList}
                  parent={this}
                  timeData={this.props.timeData}
                />
              }
              placement="topLeft"
              trigger="click"
              visible={this.state.overlayVisible}
            >
              <span onClick={this.handleDropdownClick}>
                <MyIcon type="icon-bianzu45" />
              </span>
            </Dropdown>
          ) : null}
          {/* {currentData?.collect_type === "10" ? (
            <span
              onClick={() =>
                this.setState({
                  isOverallView: !this.state.isOverallView,
                  overlayVisible: false,
                })
              }
            >
              {this.state.isOverallView ? "退出" : "全景"}
            </span>
          ) : null} */}
          <span
            className={styles.prevImg}
            onClick={() => {
              this.props.onPrev && this.props.onPrev();
            }}
          >
            <MyIcon type="icon-bianzu681" />
          </span>
          <span
            className={styles.nextImg}
            onClick={() => {
              this.props.onNext && this.props.onNext();
            }}
          >
            <MyIcon type="icon-bianzu671" />
          </span>
        </div>

        {Full && (
          <span
            className={`${styles.goBackMap} ${animateCss.animated} ${animateCss.fadeInUp}`}
            onClick={() => {
              onExitFull && onExitFull();
            }}
          >
            <img
              crossOrigin="anonymous"
              src={require("../../../../assets/backmap.png")}
              alt=""
            />
          </span>
        )}
        {isEdit ? (
          <div className={styles.editImg}>
            <EditImage
              onExit={this.exit}
              data={currentData}
              onSave={this.saveImg}
              onSaveAs={this.onSaveAs}
            />
          </div>
        ) : (
          <div className={`${styles.CollectionPreviewContainer}`}>
            <div className={styles.activeMedia}>
              {this.state.isShowImagePanel ? (
                <ImagePanel timeData={this.props.timeData} parent={this} />
              ) : null}
              {this.checkRender(currentData)}
            </div>
          </div>
        )}
      </div>,
      document.body.querySelector("#IndexPage")
    );
  }
}
