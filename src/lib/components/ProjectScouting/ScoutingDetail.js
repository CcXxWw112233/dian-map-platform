import { setSession } from "../../../utils/sessionManage";
import listAction from "./ScoutingList";
import PhotoSwipe from "../../../components/PhotoSwipe/action";
import config from "../../../services/scouting";
import { dateFormat, Different } from "../../../utils/utils";
import { Pointer as PointerInteraction } from "ol/interaction";
// import Select from 'ol/interaction/Select';
import InitMap from "../../../utils/INITMAP";
import {
  drawPoint,
  createStyle,
  Source,
  Layer,
  TransformCoordinate,
  addFeature,
  createOverlay,
  getPoint,
  Fit,
  drawBox,
  ImageStatic,
  setSelectInteraction,
  fitPadding,
  SourceStatic,
  getExtentIsEmpty,
  animate,
  loadFeatureJSON,
  getExtent,
} from "../../utils/index";
import {
  CollectionOverlay,
  settingsOverlay,
  areaDetailOverlay,
  SetCoordinateForCollection,
  DragCircleRadius
} from "../../../components/PublicOverlays";
import { Modify } from "ol/interaction";
import { extend } from "ol/extent";
import { always, never } from "ol/events/condition";
import Event from "../../utils/event";
import { message } from "antd";
import { createPlottingFeature, createPopupOverlay } from "./createPlotting";
import { plotEdit } from "utils/plotEdit";
import INITMAP from "../../../utils/INITMAP";
import AboutAction from './AroundAbout';
// import { out_of_china } from "../../../utils/transCoordinateSystem";
import Axios from "axios";
import Metting from './meetting';
import nProgress from "nprogress";

function Action() {
  const {
    GET_AREA_LIST,
    ADD_AREA_BOARD,
    ADD_COLLECTION,
    GET_COLLECTION_LIST,
    DELETE_COLLECTION,
    EDIT_COLLECTION,
    DELETE_AREA,
    EDIT_AREA_NAME,
    GET_PLAN_PIC,
    PLAN_IMG_URL,
    SAVE_EDIT_PLAN_IMG,
    SORT_COLLECTION_DATA,
    MERGE_COLLECTION,
    CANCEL_COLLECTION_MERGE,
    GET_DOWNLOAD_URL,
    EDIT_AREA_MESSAGE,
  } = config;
  this.activeFeature = {};
  this.layerId = "scoutingDetailLayer";
  this.Layer = Layer({ id: this.layerId, zIndex: 40, declutter: true });
  this.Source = Source();
  this.features = [];
  this.overlays = [];
  this.drawBox = null;
  this.currentData = null;
  this.currentSet = null;
  this.mounted = false;
  this.geoFeatures = [];
  this.searchAroundCircle = null;
  this.searchPageIndex = 1;
  Event.Evt.addEventListener("basemapchange", (key) => {
    if (!this.mounted) return;
    if(InitMap.checkUpdateMapSystem(key)){
      if(this.searchAroundOverlay){
        updateOverlayPosition();
      }
      let needReload = false;
      // 此图层的纠偏操作
      let features = this.Layer.getSource().getFeatures();
      let dic = InitMap.systemDic[key];
      features.forEach(item => {
        let type = item.getGeometry().getType()
        if( type === 'Point'){
          let coordinate = this.transform(item.getGeometry().getCoordinates());
          let coor = dic(coordinate[0],coordinate[1]);
          item.getGeometry().setCoordinates(TransformCoordinate(coor));
        }else if( type === 'Circle'){
          let center = item.getGeometry().getCenter();
          center = this.transform(center);
          center = dic(center[0], center[1]);
          center = TransformCoordinate(center);
          item.getGeometry().setCenter(center);
        }else if(type === 'MultiPolygon' || type === 'MultiLineString'){
          needReload = true;
        }
      })
      // 标绘图层的纠偏操作
      if(this.layer && this.layer.showLayer && this.layer.showLayer.getSource){
        let source = this.layer.showLayer.getSource();
        let fs = source.getFeatures();

        fs.forEach(item => {
          let type = item.getGeometry().getType();
          if(type === 'Point'){
            let coor = item.getGeometry().getCoordinates();
            item.getGeometry().setCoordinates(this.changeCoordinate(coor, dic));
          }
          if(type === 'Circle'){
            let coor = item.getGeometry().getCenter();
            item.getGeometry().setCoordinates(this.changeCoordinate(coor, dic));
          }else if(type === 'Polygon'){
            let coor = item.getGeometry().getCoordinates();
            let list = coor[0];
            list = list.map(cor => this.changeCoordinate(cor, dic));
            item.getGeometry().setCoordinates([list]);
          }else if(type === 'LineString'){
            let coor = item.getGeometry().getCoordinates();
            coor = coor.map(cor => this.changeCoordinate(cor, dic));
            item.getGeometry().setCoordinates(coor);
          }else if(type === 'MultiPolygon' || type === 'MultiLineString'){
            needReload = true;
          }
        })
      }
      if(this.imgs && this.imgs.length) needReload = true;
      if(needReload){
        this.renderCollection(this.currentData, this.currentSet);
      }
    }
    // const baseMapKey = INITMAP.baseMapKey;
    // const lastBaseMapKey = INITMAP.lastBaseMapKey;
    // const baseMapKeys = INITMAP.baseMapKeys;
    // const isSame =
    //   baseMapKeys[0].indexOf(baseMapKey) ===
    //   baseMapKeys[0].indexOf(lastBaseMapKey);
    // if (this.currentData && this.currentSet && isSame === false) {
    //   this.renderCollection(this.currentData, this.currentSet);
    // }
  });
  const pointUnselect = (isMulti) =>
    createStyle("Point", {
      icon: {
        src: isMulti
          ? require("../../../assets/multiunselect.png")
          : require("../../../assets/unselectlocation.png"),
        crossOrigin: "anonymous",
        anchor: [0.5, 0.8],
      },
    });
  const pointSelect = (isMulti) =>
    createStyle("Point", {
      icon: {
        src: isMulti
          ? require("../../../assets/multiselect.png")
          : require("../../../assets/selectlocation.png"),
        crossOrigin: "anonymous",
        anchor: [0.5, 0.8],
      },
      iconScale: 1,
    });

  this.changeCoordinate = (coordinates, dic )=>{
    if(coordinates && dic){
      let center = this.transform(coordinates);
      let coor = dic(center[0], center[1]);
      return TransformCoordinate(coor);
    }
  }
  this.init = (dispatch) => {
    this.mounted = true;
    this.Layer.setSource(this.Source);
    const layers = InitMap.map.getLayers().getArray();
    const layer = layers.filter((layer) => {
      return layer.get("id") === this.Layer.get("id");
    });
    this.layer = plotEdit.getPlottingLayer(dispatch);

    if (!layer[0]) {
      InitMap.map.on("click", (evt) => {
        let obj = evt.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
          return { feature, layer };
        });
        if (!obj) return;
        if (!obj.feature) return;
        if (this.isActivity) return;
        this.clearSelectPoint();
        if (obj && obj.layer && obj.layer.get("id") === this.layerId) {
          if (obj.feature.get("ftype") === "collection") {
            this.handleFeatureCollectionPoint(obj.feature);
            Event.Evt.firEvent(
              "handleCollectionFeature",
              obj.feature.get("data"),
            );
          }
        }
      });
      InitMap.map.addLayer(this.Layer);
    }
  };
  this.boxFeature = {};
  this.draw = null;
  this.lenged = null;
  this.oldData = [];
  this.CollectionGroup = [];
  this.groupPointer = [];
  let requestTime = 80 * 1000;
  this.selectedFeatureOperator = null;
  this.groupCollectionPointer = [];
  this.meetting = new Metting();

  // 通过范围获取坐标点
  let getBoxCoordinates = (extent) => {
    if (extent.length) {
      let LT = getPoint(extent, "topLeft");
      let RT = getPoint(extent, "topRight");
      let BL = getPoint(extent, "bottomLeft");
      let BR = getPoint(extent, "bottomRight");

      return [LT, RT, BR, BL, LT];
    }
    return [];
  };

  this.removeListPoint = () => {
    // 删除已经存在的项目列表
    listAction.clear();
  };

  this.checkCollectionType = (suffix = "") => {
    if (!suffix) return "unknow";
    const itemKeyVals = {
      paper: [], // 图纸
      interview: ["aac", "mp3", "语音", "m4a", "flac"], // 访谈
      pic: ["jpg", "PNG", "gif", "jpeg", "bmp"].map((item) =>
        item.toLocaleLowerCase()
      ),
      video: ["MP4", "WebM", "Ogg", "avi"].map((item) =>
        item.toLocaleLowerCase()
      ),
      word: [
        "ppt",
        "pptx",
        "xls",
        "xlsx",
        "doc",
        "docx",
        "zip",
        "rar",
        "txt",
        "xmind",
        "pdf",
      ].map((item) => item.toLocaleLowerCase()),
      annotate: [], // 批注
      plotting: ["feature"], // 标绘
      planPic: ["plan"], // 规划图
      address: ["board_xlsx"],
    };

    let keys = Object.keys(itemKeyVals);
    for (let i = 0; i < keys.length; i++) {
      let item = keys[i];
      let data = itemKeyVals[item];
      if (data.indexOf(suffix.toLocaleLowerCase()) !== -1) {
        return item;
      }
    }

    return "unknow";
    // let arr = ["paper", "interview" , "pic" , "video" , "word" , "annotate" , "plotting", ];
  };

  this.dateFormat = dateFormat;
  this.onBack = () => {
    this.layer.projectScoutingArr &&
      this.layer.projectScoutingArr.forEach((item) => {
        INITMAP.map.removeOverlay(item.feature && item.feature.overlay);
        if (item.feature) this.layer.removeFeature(item);
      });
    this.layer.projectScoutingArr = [];
    this.layer.plotEdit.plotClickCb = null;
    setSession(listAction.sesstionSaveKey, "");
  };
  // 获取区域列表
  this.fetchAreaList = async (data) => {
    return await GET_AREA_LIST(data);
  };
  // 添加区域
  this.addArea = async (data) => {
    return await ADD_AREA_BOARD(data);
  };

  // 添加踏勘列表
  this.addCollection = async (data) => {
    return await ADD_COLLECTION(data);
  };
  // 获取采集列表
  this.getCollectionList = async (data) => {
    return await GET_COLLECTION_LIST(data);
  };
  // 删除采集数据
  this.removeCollection = async (id) => {
    return await DELETE_COLLECTION(id);
  };

  // 添加分类的坐标点
  this.setGropCoordinates = async (id, data) => {
    let { coordinate } = data;
    coordinate = TransformCoordinate(coordinate, "EPSG:3857", "EPSG:4326");
    let param = {
      longitude: coordinate[0],
      latitude: coordinate[1],
    };
    // console.log(coordinate)
    return await EDIT_AREA_MESSAGE(id, param);
  };

  const Drag = /*@__PURE__*/ (function (PointerInteraction) {
    function Drag() {
      PointerInteraction.call(this, {
        handleDownEvent: () => { }, //handleDownEvent
        handleDragEvent: () => { }, //handleDragEvent,
        handleMoveEvent: () => { }, //handleMoveEvent,
        handleUpEvent: () => { }, //handleUpEvent,
      });

      /**
       * @type {import("../src/ol/coordinate.js").Coordinate}
       * @private
       */
      this.coordinate_ = null;

      /**
       * @type {string|undefined}
       * @private
       */
      this.cursor_ = "pointer";

      /**
       * @type {Feature}
       * @private
       */
      this.feature_ = null;

      /**
       * @type {string|undefined}
       * @private
       */
      this.previousCursor_ = undefined;
    }

    if (PointerInteraction) Drag.__proto__ = PointerInteraction;
    Drag.prototype = Object.create(
      PointerInteraction && PointerInteraction.prototype
    );
    Drag.prototype.constructor = Drag;

    return Drag;
  })(PointerInteraction);

  // 添加坐标点
  this.addCollectionCoordinates = (isMultiple, data) => {
    this.dragEvt = new Drag();
    this.hideCollectionOverlay();
    this.isActivity = true;
    return new Promise((resolve, reject) => {
      InitMap.map.once("click", (event) => {
        let { coordinate } = event;
        let handlefeature = InitMap.map.forEachFeatureAtPixel(
          event.pixel,
          (feature) => feature
        );
        if (handlefeature) {
          let type = handlefeature.getGeometry().getType();
          if (type === "Point") {
            coordinate = handlefeature.getGeometry().getCoordinates();
            message.success(`选择了关联已有的坐标点`);
          }
        }
        let style = createStyle("Point", {
          icon: {
            src: require("../../../assets/unselectlocation.png"),
            crossOrigin: "anonymous",
            anchor: [0.5, 0.8],
          },
          text: !isMultiple && data.title,
          showName: !isMultiple,
          textFillColor: "#ff0000",
          textStrokeColor: "#ffffff",
          zIndex: 20,
        });
        let f = addFeature("Point", {
          coordinates: coordinate,
          ftype: "select_coordinates",
        });
        f.setStyle(style);
        this.Layer.setZIndex(50);
        this.Source.addFeature(f);

        let ele = new SetCoordinateForCollection({});
        let overlay = createOverlay(ele.element, {
          position: coordinate,
          positioning: "bottom-center",
          offset: [0, -40],
        });
        InitMap.map.addOverlay(overlay);

        let p = this.transform(coordinate);
        ele.setLong(p[0]);
        ele.setLat(p[1]);

        InitMap.map.addInteraction(this.dragEvt);
        this.dragEvt.handleDownEvent = (evt) => {
          let map = evt.map;

          let feature = map.forEachFeatureAtPixel(evt.pixel, function (
            feature
          ) {
            return feature;
          });

          if (feature && feature.get("ftype") === "select_coordinates") {
            this.coordinate_ = evt.coordinate;
            overlay.setPosition(null);
            let styles = feature.getStyle();
            let imgstyle = createStyle("Point", {
              icon: {
                src: require("../../../assets/selectlocation.png"),
                crossOrigin: "anonymous",
                anchor: [0.5, 0.8],
              },
            });
            styles.setImage(imgstyle.getImage());
            feature.setStyle(styles);
            this.feature_ = feature;
          }
          return !!feature;
        };
        this.dragEvt.handleDragEvent = (evt) => {
          if (this.coordinate_) {
            let deltaX = evt.coordinate[0] - this.coordinate_[0];
            let deltaY = evt.coordinate[1] - this.coordinate_[1];
            if (this.feature_) {
              let geometry = this.feature_.getGeometry();
              geometry.translate(deltaX, deltaY);
              this.coordinate_ = evt.coordinate;
            }
          }
        };
        this.dragEvt.handleMoveEvent = (evt) => {
          if (this.cursor_) {
            let map = evt.map;
            let feature = map.forEachFeatureAtPixel(evt.pixel, function (
              feature
            ) {
              return feature;
            });
            let element = evt.map.getTargetElement();
            if (feature && feature.get("ftype") === "select_coordinates") {
              if (element.style.cursor != this.cursor_) {
                this.previousCursor_ = element.style.cursor;
                element.style.cursor = this.cursor_;
              }
            } else if (this.previousCursor_ !== undefined) {
              element.style.cursor = this.previousCursor_;
              this.previousCursor_ = undefined;
            }
          }
        };
        this.dragEvt.handleUpEvent = () => {
          if (this.feature_) {
            let geo = this.feature_.getGeometry();
            let coor = geo.getCoordinates();
            overlay.setPosition(coor);
            let styles = this.feature_.getStyle();
            let imgstyle = createStyle("Point", {
              icon: {
                src: require("../../../assets/unselectlocation.png"),
                crossOrigin: "anonymous",
                anchor: [0.5, 0.8],
              },
            });

            styles.setImage(imgstyle.getImage());
            this.feature_.setStyle(styles);
            // 更新显示的内容
            let position = this.transform(coor);
            ele.setLong(position[0]);
            ele.setLat(position[1]);
          }
          this.coordinate_ = null;
          this.feature_ = null;
          return false;
        };
        ele.on = {
          save: (val) => {
            // console.log(val)
            resolve(val);
            cancelAdd();
            this.isActivity = false;
          },
          cancel: () => {
            cancelAdd();
            reject();
            this.isActivity = false;
          },
        };
        const cancelAdd = () => {
          InitMap.map.removeInteraction(this.dragEvt);
          this.dragEvt = null;
          this.Source.removeFeature(f);
          InitMap.map.removeOverlay(overlay);
        };
      });
    });
  };

  // 添加关联点的交互 ---废弃 已有 addCollectionCoordinate 代替
  this.addCollectionPosition = (data) => {
    return new Promise((resolve, reject) => {
      let style = createStyle("Point", {
        iconUrl: require("../../../assets/addPointLocation.png"),
        text: data.title,
        showName: true,
        textFillColor: "#ff0000",
        textStrokeColor: "#ffffff",
      });
      this.draw = drawPoint(this.Source, { style });
      this.draw.on("drawend", (e) => {
        let { feature } = e;

        feature.setStyle(style);
        this.activeFeature = feature;
        InitMap.map.removeInteraction(this.draw);
        resolve(e);
      });
      InitMap.map.addInteraction(this.draw);
    });
  };
  // 清除分组的点
  this.clearGroupPointer = () => {
    this.groupPointer.forEach((item) => {
      if (this.Source.getFeatureByUid(item.ol_uid)) {
        this.Source.removeFeature(item);
      }
    });
    this.groupPointer = [];
  };
  // 点击事件
  const mapClick = (evt) => {
    const obj = InitMap.map.forEachFeatureAtPixel(
      evt.pixel,
      (feature, layer) => {
        return { feature, layer };
      }
    );
    if (obj && obj.layer && obj.layer.get("id") === this.layerId) {
      let { feature } = obj;
      let p_type = feature.get("p_type");
      if (p_type === "group") {
        Event.Evt.firEvent("handleGroupFeature", feature.get("p_id"));
      }
      // console.log(p_type)
    }
  };

  // 地图点击
  const LookingBackPointClick = (evt) => {
    const obj = InitMap.map.forEachFeatureAtPixel(
      evt.pixel,
      (feature, layer) => {
        return { feature, layer };
      }
    );
    if (obj && obj.layer && obj.layer.get("id") === this.layerId) {
      let { feature } = obj;
      let collections = feature.get("collections");
      if (collections && collections.length) {
        Event.Evt.firEvent("handleGroupCollectionFeature", collections);
      }
    }
  };

  // 设置active的坐标点
  this.setGroupCollectionActive = (data) => {
    this.groupCollectionPointer.forEach((item) => {
      let style = item.getStyle();
      style.setZIndex(1);
      // style.getImage().getFill().setColor("#577DFF");
      // style.getImage().setRadius(9);
      style.setImage(pointUnselect().getImage())
      item.setStyle(style);
    });
    if (!data) return;
    let coordinate = data.location &&
      data.location.latitude &&
      data.location.longitude && [
        +data.location.longitude,
        +data.location.latitude,
      ];
    if (!coordinate) return undefined;
    let coor = TransformCoordinate(coordinate);
    let feature = this.Source.getFeaturesAtCoordinate(coor);
    // console.log(feature)

    feature.forEach((item) => {
      let style = item.getStyle();
      style.setZIndex(10);
      if (style.getImage()) {
        // style.getImage().getFill().setColor("#FE2042");
        // style.getImage().setRadius(12);
        style.setImage(pointSelect().getImage())
      }
      item.setStyle(style);
    });
  };

  this.renderGoupCollectionForLookingBack = (data) => {
    this.clearGroupCollectionPoint();
    InitMap.map.un("click", LookingBackPointClick);
    if (data && data.length) {
      let obj = {};
      data.forEach((d) => {
        let item = d.data || d;
        if (
          item.location &&
          item.location.hasOwnProperty("longitude") &&
          item.location.hasOwnProperty("latitude")
        ) {
          let coor = [+item.location.longitude, +item.location.latitude];
          let key = coor.join("/");
          !obj[key] && (obj[key] = []);
          obj[key].push(item);
        }
      });
      // 提取相同坐标点的数据
      let objkeys = Object.keys(obj);
      objkeys.forEach((item) => {
        let collections = obj[item];
        let coordinate = item.split("/").map((i) => +i);
        let feature = addFeature("Point", {
          coordinates: TransformCoordinate(coordinate),
          collections,
        });
        let style = createStyle("Point", {
          radius: 8,
          fillColor: "#577DFF",
          strokeColor: "#ffffff",
          strokeWidth: 2,
          showName: true,
          text: "回看集合点",
          offsetY: -30,
          icon: {
            src: require('../../../assets/unselectlocation.png'),
            anchor: [0.5, 0.8],
            crossOrigin: "anonymous",
          },
          // text: item.title || item.name,
          textFillColor: "rgba(255,255,255,0)",
          textStrokeColor: "rgba(255,255,255,0)",
          textStrokeWidth: 1,
          font: 10,
        });
        feature.setStyle(style);
        this.groupCollectionPointer.push(feature);
        // console.log(coordinate)
      });
      if (this.groupCollectionPointer.length) {
        this.Source.addFeatures(this.groupCollectionPointer);
        Fit(InitMap.view, this.Source.getExtent(), {
          size: InitMap.map.getSize(),
          padding: fitPadding,
        });
        InitMap.map.on("click", LookingBackPointClick);
      }
      // console.log(obj)
    }
  };
  // 清除坐标点的数据
  this.clearGroupCollectionPoint = () => {
    if (this.groupCollectionPointer.length) {
      this.groupCollectionPointer.forEach((item) => {
        if (this.Source.getFeatureByUid(item.ol_uid)) {
          this.Source.removeFeature(item);
        }
      });
      this.groupCollectionPointer = [];
    }
  };

  // 设置选中的样式
  this.setActiveGoupPointer = (id) => {
    this.groupPointer.map((item) => {
      let style = item.getStyle();
      if (item.get("p_id") === id) {
        style.getImage().getFill().setColor("#FE2042");
        style.getImage().setRadius(12);
      } else {
        style.getImage().getFill().setColor("#577DFF");
        style.getImage().setRadius(9);
      }
      item.setStyle(style);
      return item;
    });
  };

  // 渲染分组的点
  this.renderGroupPointer = (data) => {
    InitMap.map.un("click", mapClick);
    this.clearGroupPointer();
    if (data.length) {
      data = data.filter(
        (item) =>
          item.hasOwnProperty("longitude") && item.hasOwnProperty("latitude")
      );
      let fs = [];
      InitMap.map.on("click", mapClick);
      data.forEach((item) => {
        let coordinate = TransformCoordinate([+item.longitude, +item.latitude]);
        let feature = addFeature("Point", {
          coordinates: coordinate,
          p_id: item.id,
          p_type: "group",
        });
        let style = createStyle("Point", {
          radius: 8,
          fillColor: "#577DFF",
          strokeColor: "#ffffff",
          strokeWidth: 2,
          showName: true,
          text: item.name,
          textFillColor: "#FF4628",
          textStrokeColor: "#ffffff",
          textStrokeWidth: 1,
          font: 14,
        });
        feature.setStyle(style);
        fs.push(feature);
        this.groupPointer.push(feature);
      });
      if (fs.length) {
        this.Source.addFeatures(fs);
        Fit(InitMap.view, this.Source.getExtent(), {
          size: InitMap.map.getSize(),
          padding: fitPadding,
        });
      }
    }
  };

  this.transform = (coor) => {
    return TransformCoordinate(coor, "EPSG:3857", "EPSG:4326");
  };
  // 发送修改的坐标点
  this.editCollection = async (data) => {
    return await EDIT_COLLECTION(data);
  };
  // 去除添加交互的方法
  this.removeDraw = () => {
    InitMap.map.removeInteraction(this.draw);
    if (this.Source.getFeatureByUid(this.activeFeature.ol_uid)) {
      this.Source.removeFeature(this.activeFeature);
    }
  };

  // 查找数据中，有存在效坐标的资料
  const findHasLocationData = (data) => {
    let arr = data.filter(
      (item) => !!item.location && Object.keys(item.location).length >= 2
    );
    return arr;
  };
  this.removeOverlay = () => {
    this.overlays.forEach((item) => {
      InitMap.map.removeOverlay(item);
    });
    this.overlays = [];
    if (this.polygonOverlay) {
      this.polygonOverlay.setPosition(null);
      InitMap.map.removeOverlay(this.polygonOverlay);
    }
  };
  this.removeFeatures = () => {
    this.removeOverlay();
    this.clearGeoFeatures();
    this.removePlanPicCollection();
    // 删除元素
    this.features.forEach((item) => {
      if (this.Source.getFeatureByUid(item.ol_uid)) {
        this.Source.removeFeature(item);
      }
    });
    // 删除绘制的元素
    // console.log(this.layer, "77777777777777777777");
    if (this.layer) {
      this.layer.projectScoutingArr &&
        this.layer.projectScoutingArr.forEach((item) => {
          INITMAP.map.removeOverlay(item.feature && item.feature.overlay);
          if (item.feature) this.layer.removeFeature(item);
        });
      this.layer.projectScoutingArr = [];
    }

    this.features = [];
    this.currentData = [];
  };

  this.renderPointCollection = (data, addOverlay = true) => {
    let array = findHasLocationData(data);
    const baseMapKey = InitMap.baseMapKey;
    const baseMapKeys = InitMap.baseMapKeys;
    const systemDic = InitMap.systemDic;
    // console.log(array)
    let features = [];
    let coordinate = {};
    array.forEach((item) => {
      let key = [+item.location.longitude, +item.location.latitude];
      key = key.join("/");

      let pointType = this.checkCollectionType(item.target);
      item.pointType = pointType;

      !coordinate[key] && (coordinate[key] = []);
      coordinate[key].push(item);
    });
    Object.keys(coordinate).forEach((item) => {
      let coor = item.split("/").map((c) => +c);
      let d = coordinate[item][0];
      if (!Number(d.location.coordSysType)) {
        if (baseMapKeys[0].indexOf(baseMapKey) > -1) {
          coor = TransformCoordinate(coor);
        } else if (baseMapKeys[1].indexOf(baseMapKey) > -1) {
          coor = TransformCoordinate(systemDic[baseMapKey](coor[0], coor[1]));
        }
      }
      // wgs84
      else if (Number(d.location.coordSysType) === 1) {
        if (baseMapKeys[1].indexOf(baseMapKey) > -1) {
          coor = TransformCoordinate(coor);
        } else if (baseMapKeys[0].indexOf(baseMapKey) > -1) {
          coor = TransformCoordinate(systemDic[baseMapKey](coor[0], coor[1]));
        }
      }

      let moreStyle = () => {
        if (coordinate[item].length === 1) {
          return {
            strokeWidth: 2,
            strokeColor: "#fff",
            zIndex: 10,
            showName: true,
            textFillColor: "#5A86F5",
            textStrokeColor: "#fff",
            textStrokeWidth: 2,
            font: 14,
            offsetY: -30,
            text: coordinate[item][0].title,
            icon: {
              src: require("../../../assets/unselectlocation.png"),
              anchor: [0.5, 0.8],
              crossOrigin: "anonymous",
            },
          };
        } else
          return {
            strokeWidth: 2,
            strokeColor: "#fff",
            zIndex: 10,
            showName: true,
            font: coordinate[item].length < 10 ? 12 : 10,
            offsetY: -12,
            textFillColor: "#ffffff",
            textStrokeWidth: 1,
            textStrokeColor: "#fff",
            text: coordinate[item].length + "",
            icon: {
              src: require("../../../assets/multiunselect.png"),
              anchor: [0.5, 0.8],
              crossOrigin: "anonymous",
            },
          };
      };
      let feature = addFeature("Point", {
        coordinates: coor,
        id: d.id,
        ftype: "collection",
        data: coordinate[item],
        multi: coordinate[item].length > 1,
        ...coordinate[item][0] || null
      });
      let style = createStyle("Point", moreStyle());

      feature.setStyle(style);

      features.push(feature);
    });
    return features;
  };

  // 查找feature
  this.findFeature = (id) => {
    for (let i = 0; i < this.layer.projectScoutingArr.length; i++) {
      const feature = this.layer.projectScoutingArr[i].feature;
      if (feature?.get("id") && feature?.get("id") === id) {
        this.selectedFeatureOperator = this.layer.projectScoutingArr[i];
        return feature;
      }
    }
  };

  this.modifyFeature = (data, displayPlotPanel) => {
    const feature = this.findFeature(data.id);
    InitMap.map.removeOverlay(feature && feature.overlay);
    feature.hasPopup = false;
    const plot = feature?.getGeometry();
    // if (plot && !plot.isActive) {
      if (plot) {
      plot.updatePlot(true);
      feature.isScouting = true;
      // this.layer.plotEdit.activate(feature);
      displayPlotPanel(JSON.parse(data.content), this.selectedFeatureOperator);
    }
  };

  this.stopModifyFeature = () => {
    this.layer.plotEdit.deactivate();
  };

  // 修改图形后保存
  this.updateFeatueToDB = async (data, content) => {
    let newData = { ...data };
    newData.content = content;
    newData.create_by && delete newData.create_by;
    newData.create_time && delete newData.create_time;
    newData.update_time && delete newData.update_time;
    newData.sort && delete newData.sort;
    newData.properties_map && delete newData.properties_map;
    await this.editCollection(newData);
  };

  //修改备注
  this.modifyRemark = async (data) => {
    let newData = { ...data };
    newData.create_by && delete newData.create_by;
    newData.create_time && delete newData.create_time;
    newData.update_time && delete newData.update_time;
    return await this.editCollection(newData);
  };

  // 查找规划图
  this.findImgLayer = (id) => {
    for (let i = 0; i < this.imgs.length; i++) {
      let item = this.imgs[i];
      if (item.get("id") && item.get("id") === id) {
        return item;
      }
    }
  };

  this.handlePlotClick = (feature, pixel) => {
    if (this.isActivity) return;
    Event.Evt.firEvent('handleFeatureToLeftMenu', feature.get('id'));
    Event.Evt.firEvent('handlePlotFeature', { feature, pixel })
    return;
    createPopupOverlay(feature, pixel);
  };

  this.renderGeoJson = async (data) => {
    // return new Promise((resolve) => {
    let promise = [];
    if (data && data.length) {
      nProgress.start();
      data.forEach((item) => {
        if (item.resource_url) {
          promise.push(
            Axios.get(item.resource_url, {
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
              },
            })
          );
        }
      });
    }
    let res = await Promise.all(promise);
    nProgress.done();
    res.forEach((item) => {
      let geojson = item.data;
      let features = loadFeatureJSON(geojson, "GeoJSON");
      features.forEach((feature, index) => {
        let type = feature.getGeometry().getType();
        let icon = feature.get("iconUrl");
        icon = icon && icon.replace("../../../assets", "");
        let style = createStyle(type, {
          showName: (type !== "Point" && index < 15) || type === "Point",
          text: feature.get("name") || geojson.name,
          iconUrl: icon ? require("../../../assets" + icon) : null,
          strokeColor: feature.get("strokeColor") || "rgba(255,0,0,0.3)",
          fillColor: feature.get("fillColor") || "rgba(255,0,0,0.3)",
          textFillColor: "rgba(255,0,0,0.9)",
          textStrokeColor: "#FFFFFF",
          font: 14,
        });
        feature.setStyle(style);
        this.geoFeatures.push(feature);
      });
      this.Source.addFeatures(features);
    });
    return res;
  };
  this.clearGeoFeatures = () => {
    if (this.geoFeatures.length) {
      this.geoFeatures.forEach((item) => {
        if (this.Source.getFeatureByUid(item.ol_uid)) {
          this.Source.removeFeature(item);
        }
      });
      this.geoFeatures = [];
    }
  };
  // 渲染标绘数据
  this.renderFeaturesCollection = async (
    data,
    { lenged, dispatch, addSource = true, showFeatureName }
  ) => {
    const commonStyleOption = {
      textFillColor: "rgba(255,0,0,1)",
      textStrokeColor: "#fff",
      textStrokeWidth: 3,
      font: "13px sans-serif",
      placement: "point",
      iconScale: 1,
      pointColor: "#fff",
      showName: showFeatureName,
    };
    this.lenged = {
      title: "项目踏勘",
      key: "map:projectScouting",
      content: [],
    };
    if (addSource) {
      this.layer.projectScoutingArr.forEach((item) => {
        if (item && item.feature) {
          InitMap.map.removeOverlay(item.feature.overlay);
          this.layer.removeFeature(item);
        }
      });
      this.layer.projectScoutingArr = [];
      this.layer.plotEdit.updateCb = null;
    }

    let hasImages = [];
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      let content = item.content;
      // console.log(item)
      if (!content) continue;
      content = content && JSON.parse(content);
      let featureType = content.featureType || "";
      let strokeColor = content.strokeColor || "";
      let isImage = false;
      let iconUrl = "";
      let obj = null;
      const hasIndex = this.lenged.content.findIndex(
        (item0) => item0.font === content.selectName
      );
      const featureLowerType = content.geoType.toLowerCase();
      if (featureType.indexOf("&#") > -1) {
        continue;
      }
      if (featureType.indexOf("/") > -1) {
        isImage = true;
        if (featureType.indexOf("https") === 0) {
          iconUrl = featureType;
        } else if (featureType.indexOf("data:image") > -1) {
          iconUrl = featureType;
        } else {
          featureType = featureType.replace("img", "");
          iconUrl = require("../../../assets" + featureType);
        }
        if (hasIndex < 0) {
          obj = {
            imgSrc: iconUrl,
            font:
              content.selectName === "自定义类型"
                ? item.title
                : content.selectName,
            type: featureLowerType,
          };
          this.lenged.content.push(obj);
        }
      } else {
        if (hasIndex < 0) {
          obj = {
            bgColor: featureType,
            borderColor: strokeColor,
            font:
              content.selectName === "自定义类型" ||
                content.selectName === "" ||
                !content.selectName
                ? item.title
                : content.selectName,
            type: featureLowerType,
          };
          if (content.sigleImage) {
            if (content.sigleImage.indexOf("data:image") > -1) {
              obj.sigleImage = content.sigleImage;
            } else if (content.sigleImage.indexOf("/") > -1) {
              if (content.sigleImage.indexOf("http") > -1) {
                obj.sigleImage = content.sigleImage;
              } else {
                let sigleImage = content.sigleImage.replace("img", "");
                sigleImage = require("../../../assets" + sigleImage);
                obj.sigleImage = sigleImage;
              }
            }
          }
          this.lenged.content.push(obj);
        }
      }
      // code by liulaian
      let feature = createPlottingFeature({ ...item, ...content });
      let myStyle = null;
      if (content.geoType === "Point") {
        myStyle = createStyle(content.geoType, {
          radius: 8,
          fillColor: featureType,
          strokeWidth: 2,
          strokeColor: strokeColor,
          iconUrl: iconUrl,
          text: item.title,
          ...commonStyleOption,
        });
      }
      if (content.geoType === "LineString") {
        myStyle = createStyle(content.geoType, {
          strokeWidth: 4,
          strokeColor: featureType,
          text: item.title,
          ...commonStyleOption,
        });
      }
      if (content.geoType === "Polygon") {
        if (isImage) {
          let canvas = document.createElement("canvas");
          let context = canvas.getContext("2d");
          let img = new Image();
          img.crossorigin = "anonymous";
          img.src = iconUrl;
          // const me = this;
          let promise = new Promise((resolve, reject) => {
            img.onload = function () {
              const pat = context.createPattern(img, "repeat");
              let options = {
                strokeWidth: 2,
                strokeColor: "",
                fillColor: pat,
                text: item.title,
                ...commonStyleOption,
              };
              myStyle = createStyle(content.geoType, options);
              feature.setStyle(myStyle);

              resolve(feature);
              // me.features.push(feature);
              return;
            };
          });
          hasImages.push(promise);
          // return;
          continue;
        }

        myStyle = createStyle(content.geoType, {
          ...commonStyleOption,
          strokeWidth: 2,
          strokeColor: strokeColor,
          fillColor: featureType,
          text: item.title,
        });
      }

      feature.setStyle(myStyle);
      if (addSource) {
        let operator = this.layer._addFeature(feature);
        operator.setName(content.name);
        operator.isScouting = true;
        operator.attrs = content;
        this.layer.addProjectScouting(operator);
        this.layer.plotEdit.plotClickCb = this.handlePlotClick.bind(this);
        operator.data = item;
        operator.updateFeatueToDB = this.updateFeatueToDB.bind(this);

        // 单个图片的多边形
        if (content.sigleImage) {
          let iconUrl = "";
          if (content.sigleImage.indexOf("https") === 0) {
            iconUrl = content.sigleImage;
          } else if (content.sigleImage.indexOf("data:image") > -1) {
            iconUrl = content.sigleImage;
          } else {
            iconUrl = content.sigleImage.replace("img", "");
            iconUrl = require("../../../assets" + iconUrl);
          }
          plotEdit.plottingLayer.plotEdit.createPlotOverlay(iconUrl, operator);
        }
      }
      this.features.push(feature);
    }

    let lst = await Promise.all(hasImages);
    this.features = this.features.concat(lst);

    if (!addSource) {
      return this.features;
    }
    lst.forEach((item) => {
      let obj = data.find((d) => d.id === item.get("id"));
      let operator = this.layer._addFeature(item);
      operator.isScouting = true;
      operator.data = obj;
      operator.updateFeatueToDB = this.updateFeatueToDB.bind(this);
      this.layer.addProjectScouting(operator);
      this.layer.plotEdit.plotClickCb = this.handlePlotClick.bind(this);
    });
    let newConfig = [];
    if (!lenged) {
      lenged = [];
    }
    if (!Array.isArray(lenged)) {
      lenged = [lenged];
    }
    const lengedIndex = lenged.findIndex(
      (lenged) => lenged.key === this.lenged.key
    );
    if (lengedIndex > -1) {
      lenged[lengedIndex] = this.lenged;
      newConfig = [...lenged];
    } else {
      newConfig = [...lenged.concat(this.lenged)];
    }
    if (newConfig.length === 1 && !newConfig[0].content.length) {
      newConfig = [];
    }
    dispatch &&
      dispatch({
        type: "lengedList/updateLengedList",
        payload: {
          config: newConfig,
        },
      });

    // 添加区域选择
    this.addAreaSelect();
    return this.layer.showLayer.getSource();
  };
  // 渲染feature
  this.renderCollection = async (
    data,
    { lenged, dispatch, animation = true, showFeatureName = true }
  ) => {
    this.currentSet = { lenged, dispatch, animation, showFeatureName };
    // 删除元素
    this.removeFeatures();
    if (!data.length) {
      dispatch({
        type: "lengedList/updateLengedList",
        payload: {
          config: [],
        },
      });
      return;
    }
    // 取出有子集的数据，合并到列表展示中
    let arr = [];
    data.forEach((item) => {
      if (item.type !== "groupCollection") {
        arr.push(item);
      } else {
        arr = arr.concat(item.child);
      }
    });
    // 将所有数据更新
    data = arr;
    // 过滤不显示的数据
    data = data.filter((item) => item.is_display === "1");

    let ponts = data.filter(
      (item) =>
        item.collect_type !== "4" &&
        item.collect_type !== "5" &&
        item.collect_type !== "group"
    );
    let features = data.filter((item) => item.collect_type === "4");
    let planPic = data.filter((item) => item.collect_type === "5");
    let geoData = data.filter((item) => item.collect_type === "8");

    // 清除变量
    this.layer.style = null;
    this.layer.attrs = null;
    // this.layer.responseData = null;
    // this.layer.saveCb = null;
    // this.layer.deleteCb = null;
    this.layer.isDefault = null;

    // 渲染geo数据
    await this.renderGeoJson(geoData).catch((err) => console.log(err));
    // 渲染标绘数据
    await this.renderFeaturesCollection(features, {
      lenged,
      dispatch,
      showFeatureName,
    });

    const sou = this.layer.showLayer.getSource();
    // 渲染规划图
    let ext = await this.renderPlanPicCollection(planPic);
    // 渲染点的数据
    let pointCollection = this.renderPointCollection(ponts);

    this.features = this.features.concat(pointCollection);
    this.Source.addFeatures(pointCollection);
    this.currentData = data;
    if (!animation) return this.features;

    let sourceExtent = this.Source.getExtent();
    let subExtent = [Infinity, Infinity, -Infinity, -Infinity];
    let sourceFlag = getExtentIsEmpty(sourceExtent);
    let souFlag = getExtentIsEmpty(
      this.layer.showLayer.getSource().getExtent()
    );
    let extFlag = getExtentIsEmpty(ext);
    // 规划图和元素都有范围的时候
    if (!souFlag && !extFlag) {
      // 合并范围
      subExtent = extend(sou.getExtent(), ext);
      // console.log(sou.getExtent(),ext)
      // 如果也有点的数据，就一起合并
      if (!sourceFlag) {
        sourceExtent = extend(subExtent, sourceExtent);
      } else {
        // 如果没有点的数据，就只有规划图和标注范围
        sourceExtent = subExtent;
      }
    }
    // 如果只有一个类型的有范围
    else if (!extFlag || !souFlag) {
      // 如果是规划图有范围，说明标注没有范围
      if (!extFlag) {
        // 合并规划图的范围
        if (!sourceFlag) {
          sourceExtent = extend(ext, sourceExtent);
        } else {
          // 说明没有点的数据
          sourceExtent = ext;
        }
      }
      // 只有标注的数据
      if (!souFlag) {
        // 有标点数据，要合并
        if (!sourceFlag) sourceExtent = extend(sou.getExtent(), sourceExtent);
        else {
          // 没有就直接赋值
          sourceExtent = sou.getExtent();
        }
      }
    }

    data &&
      data.length &&
      setTimeout(() => {
        // 当存在feature的时候，才可以缩放 需要兼容规划图，规划图不存在source的元素中
        if (!getExtentIsEmpty(sourceExtent)) {
          // let points = [
          //   this.transform([sourceExtent[0], sourceExtent[3]]),
          //   this.transform([sourceExtent[2], sourceExtent[1]]),
          // ];
          // if (
          //   out_of_china(points[0][0], points[0][1]) ||
          //   out_of_china(points[1][0], points[1][1])
          // ) {
          //   return;
          // }
          this.toCenter({ center: sourceExtent, type: "extent" });
        }
        // else if (ext.length) {
        //   Fit(
        //     InitMap.view,
        //     ext,
        //     {
        //       size: InitMap.map.getSize(),
        //       padding: fitPadding,
        //     },
        //     800
        //   );
        // }
      });
  };

  // type coordinate or extent
  this.toCenter = ({
    center,
    type = "coordinate",
    duration = 800,
    zoom,
    transform = true,
  }) => {
    this.selectedFeatureOperator &&
      this.layer.setToTop(this.selectedFeatureOperator);
    if (type === "coordinate") {
      if (transform) center = TransformCoordinate(center);

      InitMap.view.animate({
        center: center,
        zoom: zoom ? zoom : InitMap.view.getMaxZoom() - 2,
        duration,
      });
    } else if (type === "extent") {
      Fit(InitMap.view, center, {
        size: InitMap.map.getSize(),
        padding: fitPadding,
        duration,
      });
    }
    this.selectedFeatureOperator = null;
  };

  // 添加规划图编辑功能
  this.setEditPlanPicLayer = (val, staticImg, dispatch, collection) => {
    return new Promise((resolve, reject) => {
      if (staticImg) {
        // console.log(staticImg)
        let oldZindex = staticImg.getZIndex();
        staticImg.setZIndex(50);
        this.hideCollectionOverlay();
        // 保存老的source源
        let oldSource = staticImg.getSource();
        let oldOpacity = staticImg.getOpacity();
        // 保存图片地址
        let url = oldSource.getUrl();
        // 如果编辑了图片
        let file = null;
        // 保存图层的范围
        let extent = oldSource.getImageExtent();
        // 通过范围获取到坐标绘制polygon
        let coor = getBoxCoordinates(extent);
        // 创建polygon
        let box = addFeature("Polygon", {
          coordinates: [coor],
          ftype: "editImageLayer",
        });
        // 添加元素
        this.Source.addFeature(box);
        // 添加select
        let select = setSelectInteraction({
          // 做一个判断过滤不需要交互的元素
          filter: (feature, layer) => {
            if (layer && layer.get("id") !== "scoutingDetailLayer") {
              return false;
            }
            if (feature.get("ftype") === "editImageLayer") {
              return true;
            }
          },
        });
        // 添加交互
        InitMap.map.addInteraction(select);
        // 添加修改功能
        let modify = new Modify({
          features: select.getFeatures(),
          condition: always,
          insertVertexCondition: never,
        });
        // 添加修改交互
        InitMap.map.addInteraction(modify);

        // 添加右上角的弹框
        let ele = new settingsOverlay();
        // 创建overlay
        let overlay = createOverlay(ele.element, {
          position: coor[1],
        });
        // 添加overlay
        InitMap.map.addOverlay(overlay);

        // 修改的事件
        modify.on("modifyend", (e) => {
          // console.log(e)
          let { features } = e;
          let feature = features.getArray()[0];
          if (feature) {
            let ext = feature.getGeometry().getExtent();
            // 如果有修改,更新新的source,
            let source = SourceStatic(url, ext);
            // 更新右上角设置弹框
            let point = getPoint(ext, "topRight");
            // 更新弹框位置
            overlay.setPosition(point);
            // 更新数据源
            staticImg.setSource(source);
          }
        });

        // 设置默认值
        staticImg.setOpacity(ele.opacityValue);
        // 弹框上面的交互事件
        ele.on = {
          change: (opacity) => {
            staticImg.setOpacity(opacity);
          },
          enter: (val) => {
            closeAll();
            // console.log(val)
            let ext = staticImg.getSource().getImageExtent();
            let opacity = val.opacity;
            let obj = { extent: ext, opacity, url: url, blobFile: file };
            staticImg.setZIndex(oldZindex);
            this.showCollectionOverlay();
            resolve(obj);
          },
          cancel: () => {
            // 更新回原来的数据源
            staticImg.setSource(oldSource);
            staticImg.setOpacity(oldOpacity);
            staticImg.setZIndex(oldZindex);
            reject({ code: -1, message: "取消编辑" });
            closeAll();
            this.showCollectionOverlay();
          },
          editImg: async () => {
            // 等待视图移动到合适地点
            let center = getPoint(box.getGeometry().getExtent(), "center");
            await animate({ center: center });
            let resp = await GET_PLAN_PIC(collection.content || collection.resource_id);
            let respdata = resp.data;
            let imgUrl = PLAN_IMG_URL(respdata.id);
            // 隐藏页面中的元素
            staticImg && staticImg.setVisible(false);
            overlay.setPosition(null);
            // console.log('开始编辑图片');
            // Event.Evt.firEvent('editPlanImg',{resolve, reject});
            let ex = box.getGeometry().getExtent();
            let topLeft = getPoint(ex, "topLeft");
            let br = getPoint(ex, "bottomRight");
            this.Source.removeFeature(box);

            topLeft = InitMap.map.getPixelFromCoordinate(topLeft);
            br = InitMap.map.getPixelFromCoordinate(br);
            let w = br[0] - topLeft[0],
              h = br[1] - topLeft[1];
            dispatch &&
              dispatch({
                type: "editPicture/updateDatas",
                payload: {
                  editShow: true,
                  pictureUrl: imgUrl,
                  position: { x: topLeft[0], y: topLeft[1] },
                  pictureWidth: w,
                  pictureHeight: h,
                },
              });

            // 保存新的图层
            Event.Evt.on("ImgEditComplete", (data) => {
              url = data.url;
              let title =
                collection.title.indexOf(respdata.layer_format) !== -1
                  ? collection.title
                  : collection.title + respdata.layer_format;
              file = new File([data.blob], title, {
                type: "image/png",
                lastModified: Date.now(),
              });
              let tl = [data.extent[0], data.extent[1]];
              let rb = [data.extent[2], data.extent[3]];
              // 将图片中的最小x,y 和最大x,y组成一个矩形,渲染在地图中
              let ctl = InitMap.map.getCoordinateFromPixel(tl);
              let crb = InitMap.map.getCoordinateFromPixel(rb);
              // console.log(ctl,crb);
              // 组合图片编辑后的范围
              let ext = ctl.concat(crb);
              // 右上角位置
              let tr = getPoint(ext, "topRight");

              // 确定保存之后,更新source,试页面渲染
              let source = SourceStatic(data.url, ext);
              staticImg.setSource(source);
              staticImg.setVisible(true);
              // 更新设置的透明度
              staticImg.setOpacity(data.opacity);
              // 设置设置弹窗的透明度,同步更新
              ele.setOpacity(data.opacity);
              // 显示弹窗
              overlay.setPosition(tr);
              // 更新显示元素
              let coordinates = getBoxCoordinates(ext);
              box.getGeometry().setCoordinates([coordinates]);
              this.Source.addFeature(box);
              // 隐藏编辑窗口
              dispatch &&
                dispatch({
                  type: "editPicture/updateDatas",
                  payload: {
                    editShow: false,
                  },
                });
            });
            // 点击了取消保存
            Event.Evt.on("ImgEditCancel", () => {
              // console.log(data);
              staticImg && staticImg.setVisible(true);
              this.Source.addFeature(box);
              let p = getPoint(box.getGeometry().getExtent(), "topRight");
              overlay.setPosition(p);
              dispatch &&
                dispatch({
                  type: "editPicture/updateDatas",
                  payload: {
                    editShow: false,
                  },
                });
            });
          },
        };

        // 释放所有事件
        let closeAll = () => {
          InitMap.map.removeInteraction(select);
          select = null;
          InitMap.map.removeInteraction(modify);
          modify = null;
          InitMap.map.removeOverlay(overlay);
          overlay = null;
          this.Source.removeFeature(box);
          box = null;
        };
      } else {
        reject({ code: -1, message: "缺少规划图的图层" });
      }
    });
  };

  // 保存编辑的规划图数据
  this.saveEditPlanPic = async (id, data) => {
    return await SAVE_EDIT_PLAN_IMG(id, data);
  };

  //   删除已存在的规划图
  this.removePlanPicCollection = () => {
    this.imgs && this.imgs.forEach((item) => InitMap.map.removeLayer(item));
    // if(this.imgs && this.imgs.length)
    // window.stop();
    this.imgs = [];
  };

  let _that = this;

  // 加载规划图,可以自定义
  let loading = function (staticimg, extent, resp) {
    // 规划图加载状态
    this.box = "";
    staticimg.on("imageloadstart", (e) => {
      let coor = getBoxCoordinates(extent);
      this.box = addFeature("Polygon", {
        coordinates: [coor],
      });
      this.box.setStyle(
        createStyle("Polygon", {
          showName: true,
          text: "加载中...",
          textFillColor: "rgb(255,0,0)",
          textStrokeColor: "rgba(255,255,255,0.8)",
          font: 16,
          fillColor: "rgba(0,0,0,0.25)",
        })
      );
      _that.Source.addFeature(this.box);
    });
    staticimg.on("imageloadend", (e) => {
      _that.Source.removeFeature(this.box);
      this.box = null;
    });

    staticimg.on("imageloaderror", () => {
      _that.Source.removeFeature(this.box);
      this.box = null;
    });
  };

  this.getNewExtent = (extent) => {
    if (extent && extent.length === 4) {
      const baseMapKey = InitMap.baseMapKey;
      const systemDic = InitMap.systemDic;
      let tmp = TransformCoordinate(
        [extent[0], extent[1]],
        "EPSG:3857",
        "EPSG:4326"
      );
      let tmp2 = TransformCoordinate(
        [extent[2], extent[3]],
        "EPSG:3857",
        "EPSG:4326"
      );
      tmp = systemDic[baseMapKey](tmp[0], tmp[1]);
      tmp2 = systemDic[baseMapKey](tmp2[0], tmp2[1]);
      tmp = TransformCoordinate(tmp, "EPSG:4326", "EPSG:3857");
      tmp2 = TransformCoordinate(tmp2, "EPSG:4326", "EPSG:3857");
      return [...tmp, ...tmp2];
    }
    return null;
  };

  //   渲染规划图
  this.renderPlanPicCollection = async (data) => {
    this.imgs.forEach((item) => {
      //   console.log(item)
      InitMap.map.removeLayer(item);
    });
    const baseMapKey = InitMap.baseMapKey;
    const baseMapKeys = InitMap.baseMapKeys;
    //   console.log(data);
    // 所有规划图加载的范围
    let ext = [Infinity, Infinity, -Infinity, -Infinity];

    let promise = data.map((item) => {
      if (item.resource_id) {
        return GET_PLAN_PIC(item.resource_id);
      }
    });
    let res = await Promise.all(promise);
    this.removePlanPicCollection();
    // .then((res) => {
    this.imgs = [];
    res.forEach((item) => {
      let resp = item.data;
      let extent = resp.extent
        ? resp.extent.split(",").map((e) => parseFloat(e))
        : [];

      // 数据为gcj02坐标系 并且当前坐标系非gcj02坐标系时要转换
      if (
        !Number(resp.coord_sys_type || 0) &&
        baseMapKeys[0].indexOf(baseMapKey) === -1
      ) {
        extent = this.getNewExtent(extent) || extent;
      } else if (Number(resp.coord_sys_type)) {
        if (baseMapKeys[0].indexOf(baseMapKey) > -1) {
          extent = this.getNewExtent() || extent;
        }
      }

      // let url = config.BASE_URL + PLAN_IMG_URL(resp.id);
      let img = ImageStatic(PLAN_IMG_URL(resp.id), extent, {
        opacity: +resp.transparency,
        minZoom: 10,
      });
      let stati = img.getSource();
      // 添加规划图加载状态
      new loading(stati, extent, resp);
      img.set("id", resp.id);
      // 保存规划图
      this.imgs.push(img);
      // 合并范围-使缩放的时候，可以适应到规划图的位置
      if (!ext.length) {
        ext = [...extent];
      } else {
        ext = extend(ext, [...extent]);
      }
    });

    this.imgs.forEach((item) => {
      //   console.log(item)
      InitMap.map.addLayer(item);
    });

    return ext;
    // });
  };


  // 设置overlay层叠问题
  this.editZIndexOverlay = (id) => {
    let overlay = InitMap.map.getOverlayById(id);
    // console.log(overlay)
    if (!overlay) return;
    let className = "activeOverlayDefault";
    let activeOverlays = document.querySelectorAll("." + className);
    activeOverlays.forEach((item) => {
      item.classList.remove(className);
    });

    let element = overlay.getElement();
    element.parentNode && element.parentNode.classList.add(className);
    setTimeout(() => {
      element.parentNode && (element.parentNode.style.visibility = "visible");
    }, 850);
    return element;
  };

  //   添加元素坐标的overlay
  this.addOverlay = (coor, data) => {
    let isLoading = false;
    let ele = new CollectionOverlay({
      ...data,
      angleColor: "#fff",
      placement: "bottomCenter",
    });
    let overlay = createOverlay(ele.element, {
      positioning: "bottom-center",
      offset: [0, -25],
      id: data.id,
    });
    InitMap.map.addOverlay(overlay);
    this.overlays.push(overlay);
    overlay.setPosition(coor);

    if (ele.audio) {
      ele.audio.addEventListener("play", (e) => {
        Event.Evt.firEvent("hasAudioStart", {
          ele: e.target,
          ...data,
        });
      });
      ele.audio.addEventListener("pause", (e) => {
        // console.log(e,'pause')
      });
      ele.audio.ontimeupdate = (e) => {
        // console.log(e.target.currentTime)
      };
    }
    if (ele.video) {
      ele.video.onplay = (e) => { };
    }

    ele.on = {
      imgClick: ({ target, name }) => {
        if (isLoading) return;
        isLoading = true;
        message.success("加载中...", 0);
        let img = new Image();
        img.crossorigin = "anonymous";
        img.src = target.src;
        img.onload = () => {
          console.dir(target);
          isLoading = false;
          message.destroy();
          // console.log(img.width)
          let w = img.width;
          let h = img.height;
          let src = target.src;
          let title = name || "图片";
          PhotoSwipe.show([{ w, h, src, title }]);
          // message.success('加载完成');
        };
        img.onerror = () => {
          isLoading = false;
        };
      },
      preview: async (val) => {
        // console.log(val)
        let { target, resource_url, resource_id } = val;
        let ty = this.checkCollectionType(target);
        if (ty === "word") {
          if (target === "pdf") {
            // pdf只需要打开
            window.open(resource_url, "_blank");
          } else {
            let data = await GET_DOWNLOAD_URL(resource_id);
            let message = data.message;
            window.open(message, "_blank");
          }
        }
      },
    };
  };

  //   删除元素坐标的overlay
  this.removeLayer = (flag = 1) => {
    this.removeOverlay();
    this.removeFeatures();
    this.removeAreaSelect();
    this.removePlanPicCollection();
    // if (!flag) InitMap.map.removeLayer(this.Layer);
  };
  this.RemoveArea = async (id) => {
    return await DELETE_AREA(id);
  };
  this.editAreaName = async (id, data) => {
    return await EDIT_AREA_NAME(id, data);
  };

  // 中断绘制
  this.stopDrawBox = () => {
    this.drawBox && this.drawBox.abortDrawing && this.drawBox.abortDrawing();
    InitMap.map.removeInteraction(this.drawBox);
    if (this.Source && this.Source.getFeatureByUid(this.boxFeature.ol_uid)) {
      this.Source.removeFeature(this.boxFeature);
    }
  };

  this.createImg = (url, extent, data = {}) => {
    this.staticimg && InitMap.map.removeLayer(this.staticimg);

    this.staticimg = ImageStatic(url, extent, {
      className: "staticImg",
      ...data,
      zIndex: 18,
    });
    InitMap.map.addLayer(this.staticimg);
  };

  let removeSelect = () => {
    InitMap.map.removeInteraction(this.select);
    InitMap.map.removeInteraction(this.modify);
    this.stopDrawBox();
    InitMap.map.removeLayer(this.staticimg);
  };

  // 删除select选择器
  this.removeAreaSelect = () => {
    this.polygonOverlay && this.polygonOverlay.setPosition(null);
    InitMap.map.removeOverlay(this.polygonOverlay);
    InitMap.map.removeInteraction(this.areaSelect);
  };
  // 添加select选择器
  this.addAreaSelect = () => {
    return;
    // this.removeAreaSelect();
    // this.areaSelect = setSelectInteraction({
    //   filter: (feature, layer) => {
    //     if (layer && layer.get("id") !== "scoutingDetailLayer") {
    //       return false;
    //     }
    //     if (
    //       (feature && !feature.get("collect_type")) ||
    //       !feature.get("remark")
    //     ) {
    //       return false;
    //     }

    //     return true;
    //   },
    // });
    // InitMap.map.addInteraction(this.areaSelect);

    // this.areaSelect.on("select", (e) => {
    //   let selected = e.selected[0];
    //   if (selected) {
    //     if (this.polygonOverlay) {
    //       this.polygonOverlay.setPosition(null);
    //       InitMap.map.removeOverlay(this.polygonOverlay);
    //     }
    //     this.addSelectOverlay(selected);
    //   } else {
    //     if (this.polygonOverlay) {
    //       this.polygonOverlay.setPosition(null);
    //       InitMap.map.removeOverlay(this.polygonOverlay);
    //     }
    //   }
    // });
    //
  };

  // 点击的时候添加overlay
  this.addSelectOverlay = (feature) => {
    let type = feature.getGeometry().getType();
    let coor = feature.getGeometry().getExtent();
    let point = getPoint(coor, "topRight");
    let remark = feature.get("remark") || "";
    if (remark) {
      let name = feature.get("name");
      let style = feature.get("featureType");
      let fill = style && style.split(";")[0];
      let ele = new areaDetailOverlay({
        name,
        remark,
        placement: "rightTop",
        angleColor: "#fff",
        titleColor: fill,
      });
      // 缩放
      Fit(InitMap.view, coor, {
        padding: [200, 220, 80, 400],
      });

      this.polygonOverlay = createOverlay(ele.element, {
        offset: type === "Point" ? [10, 0] : [0, 0],
      });
      ele.on = {
        close: () => {
          this.areaSelect.dispatchEvent({ type: "select", selected: [] });
          // 重新加载select选择器
          this.addAreaSelect();
        },
      };
      InitMap.map.addOverlay(this.polygonOverlay);
      this.polygonOverlay.setPosition(point);
    }
  };

  // 编辑功能
  this.setSelect = () => {
    this.modify = "";
    let snap = "";
    this.select = setSelectInteraction({ layers: [this.Layer] });

    this.modify = new Modify({
      features: this.select.getFeatures(),
      condition: always,
      insertVertexCondition: never,
    });
    // snap = new Snap({features:this.select.getFeatures()});
    InitMap.map.addInteraction(this.modify);
    // InitMap.map.addInteraction(snap);
    InitMap.map.addInteraction(this.select);
    return { modify: this.modify, snap };
  };

  // 隐藏显示的资料overlay
  this.hideCollectionOverlay = () => {
    if (!this.overlays.length) return;
    this.overlays.map((item) => {
      item.set("oldPosition", item.getPosition());

      item.setPosition(null);
      return item;
    });
  };

  // 显示采集资料的overlay
  this.showCollectionOverlay = () => {
    if (!this.overlays.length) return;
    this.overlays.map((item) => {
      // console.log(item);
      let oldPosition = item.get("oldPosition");
      item.setPosition(oldPosition);
      return item;
    });
  };
  // 添加规划图范围
  this.addPlanPictureDraw = (url, files, dispatch) => {
    // console.log(files);
    // 删除已有的select事件，防止冲突
    this.removeAreaSelect();
    this.hideCollectionOverlay();
    return new Promise((resolve, reject) => {
      let globalurl = url,
        file = null;
      this.drawBox = drawBox(this.Source, {});
      this.drawBox.on("drawend", (e) => {
        this.boxFeature = e.feature;
        // console.log(e.feature.getGeometry().getCoordinates())
        let extent = this.boxFeature.getGeometry().getExtent();
        // 设置功能项的位置
        let ele = new settingsOverlay();
        let drawImgOpacity = ele.opacityValue;
        let overlay = createOverlay(ele.element);
        // 获取范围的右上角
        let center = getPoint(
          this.boxFeature.getGeometry().getExtent(),
          "topRight"
        );
        // 添加设置项
        InitMap.map.addOverlay(overlay);
        // 显示设置项
        overlay.setPosition(center);
        // 删除绘制功能
        InitMap.map.removeInteraction(this.drawBox);
        this.createImg(globalurl, extent, { opacity: drawImgOpacity });

        let { modify } = this.setSelect();

        modify.on("modifyend", (e) => {
          let features = e.features;
          let f = features.getArray()[0];
          this.boxFeature = f;
          let ext = f.getGeometry().getExtent();
          let point = getPoint(ext, "topRight");
          overlay.setPosition(point);
          this.createImg(globalurl, ext, { opacity: drawImgOpacity });
        });
        //
        ele.on = {
          change: (val) => {
            // console.log(val)
            drawImgOpacity = val;
            this.staticimg && this.staticimg.setOpacity(val);
          },
          enter: (val) => {
            // console.log(val)
            resolve({
              feature: e.feature,
              ...val,
              extent: e.feature.getGeometry().getExtent(),
              url: globalurl,
              blobFile: file,
            });
            overlay.setPosition(null);
            InitMap.map.removeOverlay(overlay);
            removeSelect();
            this.addAreaSelect();
            this.showCollectionOverlay();
          },
          cancel: () => {
            // console.log('取消规划图')
            reject({ message: "您已取消上传规划图" });
            overlay.setPosition(null);
            InitMap.map.removeOverlay(overlay);
            removeSelect();
            this.addAreaSelect();
            this.showCollectionOverlay();
          },
          editImg: async () => {
            // 等待视图移动到合适地点
            let center = getPoint(
              this.boxFeature.getGeometry().getExtent(),
              "center"
            );
            await animate({ center: center });
            // 隐藏页面中的元素
            this.staticimg && this.staticimg.setVisible(false);
            this.Source.removeFeature(e.feature);
            overlay.setPosition(null);
            // console.log('开始编辑图片');
            // Event.Evt.firEvent('editPlanImg',{resolve, reject});
            let ex = this.boxFeature.getGeometry().getExtent();
            let topLeft = getPoint(ex, "topLeft");
            let br = getPoint(ex, "bottomRight");

            topLeft = InitMap.map.getPixelFromCoordinate(topLeft);
            br = InitMap.map.getPixelFromCoordinate(br);
            let w = br[0] - topLeft[0],
              h = br[1] - topLeft[1];
            dispatch &&
              dispatch({
                type: "editPicture/updateDatas",
                payload: {
                  editShow: true,
                  pictureUrl: url,
                  position: { x: topLeft[0], y: topLeft[1] },
                  pictureWidth: w,
                  pictureHeight: h,
                },
              });

            // 保存新的图层
            Event.Evt.on("ImgEditComplete", (data) => {
              globalurl = data.url;
              file = new File([data.blob], files.name, {
                type: files.type,
                lastModified: Date.now(),
              });
              let tl = [data.extent[0], data.extent[1]];
              let rb = [data.extent[2], data.extent[3]];
              // 将图片中的最小x,y 和最大x,y组成一个矩形,渲染在地图中
              let ctl = InitMap.map.getCoordinateFromPixel(tl);
              let crb = InitMap.map.getCoordinateFromPixel(rb);
              // console.log(ctl,crb);
              // 组合图片编辑后的范围
              let ext = ctl.concat(crb);
              // 右上角位置
              let tr = getPoint(ext, "topRight");

              // 确定保存之后,更新source,试页面渲染
              let source = SourceStatic(data.url, ext);
              this.staticimg.setSource(source);
              this.staticimg.setVisible(true);
              // 更新设置的透明度
              this.staticimg.setOpacity(data.opacity);
              // 设置设置弹窗的透明度,同步更新
              ele.setOpacity(data.opacity);
              // 显示弹窗
              overlay.setPosition(tr);
              // 更新显示元素
              let coordinates = getBoxCoordinates(ext);
              this.boxFeature.getGeometry().setCoordinates([coordinates]);
              this.Source.addFeature(this.boxFeature);
              // 隐藏编辑窗口
              dispatch &&
                dispatch({
                  type: "editPicture/updateDatas",
                  payload: {
                    editShow: false,
                  },
                });
            });
            // 点击了取消保存
            Event.Evt.on("ImgEditCancel", () => {
              // console.log(data);
              this.staticimg && this.staticimg.setVisible(true);
              this.Source.addFeature(this.boxFeature);
              let p = getPoint(
                this.boxFeature.getGeometry().getExtent(),
                "topRight"
              );
              overlay.setPosition(p);
              dispatch &&
                dispatch({
                  type: "editPicture/updateDatas",
                  payload: {
                    editShow: false,
                  },
                });
            });
          },
        };
      });
      this.drawBox.on("drawabort", () => {
        reject({ code: -1, message: "操作中止" });
      });
      InitMap.map.addInteraction(this.drawBox);
    });
  };
  this.clearListen = () => {
    if (this.repeatRequst) {
      clearTimeout(this.repeatRequst);
    }
  };
  this.addToListen = (param) => {
    clearTimeout(this.repeatRequst);
    this.repeatRequst = setTimeout(() => {
      this.addListenAjax(param);
      this.addToListen(param);
    }, requestTime);
  };
  // 添加轮询机制
  this.addListenAjax = async (param) => {
    let oldData = this.oldData;
    let res = await this.getCollectionList(param);
    let data = res.data;
    let arr = Different(oldData, data, "id");
    if (oldData.length > data.length) {
      // 这里是删除了，所以可以调用删除更新
      // console.log(arr,'删除');
      Event.Evt.firEvent("CollectionUpdate:remove", arr);
    }
    if (oldData.length < data.length) {
      // 这里是新增，所以要调用新增的更新监听
      // console.log(arr,'新增');
      Event.Evt.firEvent("CollectionUpdate:add", arr);
    }
    if (arr.length && oldData.length === data.length) {
      // 这里是删除之后又新增了，所以长度一致，但是ID不同，会有更新的数据，要调用刷新的监听
      // console.log(arr,'刷新');
      Event.Evt.firEvent("CollectionUpdate:reload", data);
    }
    // 将最新的数据更新到本地。用来对比
    this.oldData = data;
  };

  // 保存排序操作
  this.saveSortCollection = async (data) => {
    return await SORT_COLLECTION_DATA(data);
  };
  // 保存合并操作
  this.saveMergeCollection = async (data) => {
    return await MERGE_COLLECTION(data);
  };
  // 取消合并操作
  this.cancelMergeCollection = async (data) => {
    return await CANCEL_COLLECTION_MERGE(data);
  };

  // 清空选中状态
  this.clearSelectPoint = () => {
    this.features.forEach((item) => {
      // if(!uids.includes(item.ol_uid)){
      if (item.get("ftype") === "collection") {
        let style = item.getStyle();
        style.setZIndex(20);
        style.setImage(pointUnselect(item.get("multi")).getImage());
        item.setStyle(style);
      }
      // }
    });
  };

  this.handleFeatureCollectionPoint = (feature) => {
    Event.Evt.firEvent('handleFeatureToLeftMenu', feature.get('id'));
    this.clearSelectPoint();
    if (feature) {
      let style = feature.getStyle();
      style.setImage(pointSelect(feature.get("multi")).getImage());
      style.setZIndex(50);
      feature.setStyle(style);
    }
  };
  this.getFeatureByPlotCoordinate = (coor) => {
    if (this.layer.showLayer) {
      let source = this.layer.showLayer.getSource();
      return source.getFeaturesAtCoordinate(coor);
    }
    return []
  }
  this.getFeatureByCoordinate = (coor) => {
    coor = TransformCoordinate(coor);
    return this.Source.getFeaturesAtCoordinate(coor);
  }
  this.getFeatureById = (id) => {
    return this.features.find(item => item.get('id') === id);
  }
  // 点的数据选中状态
  this.handleCollectionPoint = (data) => {
    // console.log(data);
    let { location } = data;
    this.clearSelectPoint();
    if (
      location &&
      location.hasOwnProperty("latitude") &&
      location.hasOwnProperty("longitude")
    ) {
      let coor = [+location.longitude, +location.latitude];
      coor = TransformCoordinate(coor);
      let feature = this.Source.getFeaturesAtCoordinate(coor);
      // if(!feature.length) return ;
      // console.log(feature);
      // let uids = feature.map(item => item.ol_uid)|| [];
      if (feature && feature.length) {
        feature.forEach((item) => {
          let fstyle = item.getStyle();
          fstyle.setZIndex(50);
          fstyle.setImage(pointSelect(item.get('multi')).getImage());
          item.setStyle(fstyle);
        });
      }
    }
  };
  // 采集资料的点击事件
  this.handleCollection = async (val) => {
    let { target, resource_url, title, resource_id } = val;
    let pointType = this.checkCollectionType(target);
    if (pointType === "word") {
      if (target === "pdf") {
        // pdf只需要打开
        window.open(resource_url, "_blank");
      } else {
        let data = await GET_DOWNLOAD_URL(resource_id);
        let message = data.message;
        window.open(message, "_blank");
      }
    }
    if (pointType === "unknow") {
      let data = await GET_DOWNLOAD_URL(resource_id);
      let message = data.message;
      window.open(message, "_blank");
    }
    if (pointType === "audio" || pointType === "video") {
      window.open(resource_url, "_blank");
    }
    if (pointType === "pic") {
      let img = new Image();
      img.crossorigin = "anonymous";
      img.src = resource_url;
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        PhotoSwipe.show([{ w, h, src: img.src, title }]);
      };
    }
  };

  this.addAnimatePoint = ({ duration, inOrOut = "out", feature }) => { };

  // 更新江西数据的临时方法
  this.loadGeoJson = async (props = {}) => {
    let { boardId, areaTypeId } = props;
    return await Axios.get(require("../../../assets/json/3_3857.geojson")).then(
      (res) => {
        let { data } = res;
        let features = loadFeatureJSON(data, "GeoJSON");
        let p = [];
        features.forEach((item, index) => {
          let type = item.getGeometry().getType();
          let name = item.get("Name");
          let style = createStyle(type, {
            fillColor: "rgba(255,0,0,0.45)",
            showName: true,
            text: name,
          });
          item.setStyle(style);
          let param = {
            area_type_id: areaTypeId,
            board_id: boardId,
            collect_type: 4,
            target: "feature",
            title: name,
          };

          let content = {
            coordinates: item.getGeometry().getCoordinates()[0],
            geoType: "Polygon",
            featureType: "rgba(255,0,0,0.45)",
            selectName: "自定义类型",
            name: name,
            coordSysType: 0,
            strokeColor: "rgba(255,255,255,1)",
          };
          param.content = JSON.stringify(content);
          // console.log(param);
          p.push(this.addCollection(param));
        });
        Promise.all(p).then((res) => {
          console.log(res);
        });
        // this.Source.addFeatures(features)
        // console.log(features);
      }
    );
  };

  this.savePoint = (val) => {
    let { data = [], featureType, board_id } = val;
    if (data.length) {
      let p = [];
      data.forEach((item) => {
        let feature = addFeature("Point", {
          coordinates: TransformCoordinate(item.coordinate),
          name: item.name,
        });
        let style = createStyle("Point", {
          icon: {
            src: require("../../../assets/json/company3.png"),
            crossOrigin: "anonymous",
            anchor: [0.5, 0],
          },
        });
        feature.setStyle(style);
        let param = {
          collect_type: 4,
          title: item.name,
          target: "feature",
          area_type_id: "",
          board_id,
          content: JSON.stringify({
            geoType: "Point",
            selectName: "公司",
            plotType: "point",
            strokeColor: "rgba(106, 154, 255, 1)",
            coordinates: feature.getGeometry().getCoordinates(),
            coordSysType: 0,
            geometryType: "Point",
            featureType,
          }),
        };
        p.push(this.addCollection(param));
      });
      Promise.all(p).then((res) => {
        console.log(res, "保存成功了");
      });
    }
  };

  this.searchByPosition = async ({ position, radius, type, pageIndex}) => {
    AboutAction.init(position);
    AboutAction.searchByPosition({ position, radius, type, pageIndex})
  }

  // this.renderSearchPoint = (data)=>{
  //   console.log(data);
  // }

  this.formatUnit = (size) => {
    if (size) {
      return size < 1000 ? size.toFixed(2) + '米' : (size/ 1000).toFixed(2) + '千米';
    }
    return null;
  }


  const updateRadius = (feature, radius)=> {
    let f = this.formatUnit(radius);
    feature.getGeometry().setRadius(radius);
    let style = feature.getStyle();
    style.getText().setText(f);
  }

  const updateOverlayPosition = ()=>{
    let extent = this.searchAroundCircle.getGeometry().getExtent();
    let rightTop = getPoint(extent, 'topRight');
    let rightBottom = getPoint(extent, 'bottomRight');
    let point = [rightTop[0], (rightTop[1] + rightBottom[1]) / 2]
    // console.log(coor,coord,overlayElement);
    this.searchAroundOverlay.setPosition(point);
  }

  this.setSearchIndex = (index) => {
    this.searchPageIndex = index;
  }

  this.updateSearch = (id, type, index)=>{
    let sFeature = this.features.find(item => item.get('id') === id);
    let coordinates = [];
    if(sFeature){
      coordinates = sFeature.getGeometry().getCoordinates();
    }
    this.searchByPosition({position: coordinates, radius: this.circleRadius, type: type, pageIndex: index});
  }
  // 添加周边搜索
  this.addSearchAround = ({ id, feature, stype ='高速路入口'}) => {
    let sFeature = null;
    if (id) {
      sFeature = this.features.find(item => item.get('id') === id);
    } else if (feature) {
      sFeature = feature;
    } else return false;
    if (sFeature) {
      let geometry = sFeature.getGeometry();
      let type = geometry.getType();
      if (type === 'Point') {
        let defaultRadius = 8 * 1000;
        this.circleRadius = defaultRadius;
        let coordinates = geometry.getCoordinates();
        let f = addFeature('defaultCircle', { coordinates, radius: defaultRadius });
        let style = createStyle("Circle", {
          fillColor: "rgba(193, 232, 255, 0.3)",
          strokeColor: "rgba(99, 199, 255, 0.5)",
          strokeWidth: 2,
          radius: defaultRadius,
          showName: false,
          text: this.formatUnit(defaultRadius),
          offsetY: 0,
          textFillColor: "#ff0000",
          textStrokeColor: "#ffffff",
          textStrokeWidth: 2
        })
        f.setStyle(style);
        this.searchAroundCircle = f;
        this.Source.addFeature(this.searchAroundCircle);
        let ele = new DragCircleRadius({ format: this.formatUnit(defaultRadius) });
        this.searchAroundOverlay = createOverlay(ele.element, { offset: [-20, 0] });
        // 启动搜索功能
        this.searchByPosition({position: coordinates, radius: defaultRadius, type: stype, pageIndex: this.searchPageIndex})
        updateOverlayPosition(this.searchAroundOverlay, f);

        InitMap.map.addOverlay(this.searchAroundOverlay);
        let _pixel = InitMap.map.getPixelFromCoordinate(coordinates);
        let coord = null;
        let radius;
        ele.on = {
          mouseDown: () => {
            _pixel = InitMap.map.getPixelFromCoordinate(coordinates);
          },
          mouseMove: (evt, step) => {
            var pixel = [evt.clientX, _pixel[1]];
            coord = InitMap.map.getCoordinateFromPixel(pixel);
            radius = coord[0] - coordinates[0];
            if(radius <= 5 *100 || radius > 50000){

              return ;
            }
            this.circleRadius = radius;
            this.searchAroundOverlay.setPosition(coord);
            let text = this.formatUnit(radius)
            ele.updateRadius(text);
            updateRadius(f, radius);
          },
          mouseUp: async () => {
            this.searchByPosition({position: coordinates, radius, type: stype, pageIndex: this.searchPageIndex})
            Fit(InitMap.view, f.getGeometry().getExtent(), { duration: 300 });
          },
          change: (text)=>{
            let t = +text;
            radius = t;
            this.circleRadius = radius;
            updateRadius(f, t);
            ele.updateRadius(this.formatUnit(t));
            updateOverlayPosition(this.searchAroundOverlay, f);
            Fit(InitMap.view, f.getGeometry().getExtent(), { duration: 300 });
            this.searchByPosition({position: coordinates, radius: t, type: stype, pageIndex: this.searchPageIndex})
          }
        }
      }
      else
      {
        message.warn('暂时只支持坐标点的周边查询');
        return false;
      }

      Fit(InitMap.view, this.searchAroundCircle.getGeometry().getExtent(), {
        size: InitMap.map.getSize(),
        padding: fitPadding,
        duration: 300
      })
      return true;
    }
  }
  this.cancelSearchAround = () => {
    if(!this.searchAroundCircle) return ;
    if (this.Source.getFeatureByUid(this.searchAroundCircle.ol_uid)) {
      this.Source.removeFeature(this.searchAroundCircle);
      AboutAction.clearLine()
    }
    InitMap.map.removeOverlay(this.searchAroundOverlay)
  }
}

let action = new Action();

export default action;
