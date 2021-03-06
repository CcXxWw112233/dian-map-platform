import { setSession } from "../../../utils/sessionManage";
import listAction from "./ScoutingList";
import PhotoSwipe from "../../../components/PhotoSwipe/action";
import config from "../../../services/scouting";
import geojsonResourceServices from "../../../services/geojsonResource";
import { dateFormat, Different } from "../../../utils/utils";
import { Pointer as PointerInteraction } from "ol/interaction";
// import Select from 'ol/interaction/Select';
import { easeOut } from "ol/easing";
import { unByKey } from "ol/Observable";
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
  getExtent
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
import {
  createPlottingFeature,
  createPopupOverlay,
  createFeatureOverlay
} from "./createPlotting";
import { plotEdit } from "utils/plotEdit";
import INITMAP from "../../../utils/INITMAP";
import AboutAction from "./AroundAbout";
// import { out_of_china } from "../../../utils/transCoordinateSystem";
import Axios from "axios";
import Metting from "./meetting";
import nProgress from "nprogress";
import { getVectorContext } from "ol/render";
import { Style, Circle, Stroke, Fill } from "ol/style";

import totalOverlay from "../../../components/PublicOverlays/totalOverlay";
import featureOverlay from "../../../components/PublicOverlays/featureOverlay";
import throttle from "lodash/throttle";
import { getPlotImages } from "./plotOverlayAction";
import AnimateLine from "./AddAnimateLine";
import { reject } from "lodash";

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
    EDIT_AREA_MESSAGE
  } = config;
  this.projectData = {}; // ???????????????????????????
  this.activeFeature = {};
  this.layerId = "scoutingDetailLayer";
  this.Layer = Layer({ id: this.layerId, zIndex: 40 });
  // this.Layer = Layer({ id: this.layerId, zIndex: 40, declutter: true });
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
  this.overlayArr = [];
  this.overlayArr2 = [];
  this.featuresGroup = {};
  this.pontsGroup = {};
  this.isNeedMoveMapMoveedListen = false;
  this.moveendListener = () => {};
  this.changeFeatureTitleShowListener = () => {};
  this.oldFeatures = null;
  this.oldPonts = null;
  this.oldLenged = null;
  this.oldDispatch = null;
  this.oldShowFeatureName = null;
  this.oldZoom = null;
  this.oldZoom2 = null;
  this.oldPlotFeatures = null;
  this.needRenderFetureStyle = true;
  this.hasFeatureTotal = true;
  this.featureOverlay2 = null;
  this.selectedFeature = null;
  this.lastSelectedFeature = null;
  this.isCollectionTotal = false;
  this.timeInterval = null;
  this.hasMeetingRoom = null;
  this.lastSelectedFeatureStyle = null;
  this.geojsonData = {};
  this.geojsonResources = {};
  this.geojsonRenderData = {};
  this.tabActivekey = "1";
  /** ??????????????????????????????????????? */
  this.setCoordinatePointFeature = null;
  /** ???????????????????????????????????? */
  this.setCoordinatePointOverlay = null;

  Event.Evt.addEventListener("basemapchange", key => {
    if (!this.mounted) return;
    if (InitMap.checkUpdateMapSystem(key)) {
      if (this.searchAroundOverlay) {
        updateOverlayPosition();
      }
      let needReload = false;
      // ????????????????????????
      let features = this.Layer.getSource().getFeatures();
      let dic = InitMap.systemDic[key];
      features.forEach(item => {
        let type = item.getGeometry().getType();
        if (type === "Point") {
          let coordinate = this.transform(item.getGeometry().getCoordinates());
          let coor = dic(coordinate[0], coordinate[1]);
          item.getGeometry().setCoordinates(TransformCoordinate(coor));
        } else if (type === "Circle") {
          let center = item.getGeometry().getCenter();
          center = this.transform(center);
          center = dic(center[0], center[1]);
          center = TransformCoordinate(center);
          item.getGeometry().setCenter(center);
        } else if (type === "MultiPolygon" || type === "MultiLineString") {
          needReload = true;
        }
      });
      // ???????????????????????????
      if (
        this.layer &&
        this.layer.showLayer &&
        this.layer.showLayer.getSource
      ) {
        let source = this.layer.showLayer.getSource();
        let fs = source.getFeatures();

        fs.forEach(item => {
          let type = item.getGeometry().getType();
          if (type === "Point") {
            let coor = item.getGeometry().getCoordinates();
            item.getGeometry().setCoordinates(this.changeCoordinate(coor, dic));
          }
          if (type === "Circle") {
            let coor = item.getGeometry().getCenter();
            item.getGeometry().setCoordinates(this.changeCoordinate(coor, dic));
          } else if (type === "Polygon") {
            let coor = item.getGeometry().getCoordinates();
            let list = coor[0];
            list = list.map(cor => this.changeCoordinate(cor, dic));
            item.getGeometry().setCoordinates([list]);
          } else if (type === "LineString") {
            let coor = item.getGeometry().getCoordinates();
            coor = coor.map(cor => this.changeCoordinate(cor, dic));
            item.getGeometry().setCoordinates(coor);
          } else if (type === "MultiPolygon" || type === "MultiLineString") {
            needReload = true;
          }
        });
      }
      if (this.imgs && this.imgs.length) needReload = true;
      if (needReload) {
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
  const pointUnselect = isMulti =>
    createStyle("Point", {
      icon: {
        src: isMulti
          ? require("../../../assets/multiselect.png")
          : require("../../../assets/selectlocation.png"),
        crossOrigin: "anonymous",
        anchor: [0.5, 0.8]
      }
    });
  const pointSelect = isMulti =>
    createStyle("Point", {
      icon: {
        src: isMulti
          ? require("../../../assets/multiunselect.png")
          : require("../../../assets/unselectlocation.png"),
        crossOrigin: "anonymous",
        anchor: [0.5, 0.8]
      },
      iconScale: 1
    });

  this.changeCoordinate = (coordinates, dic) => {
    if (coordinates && dic) {
      let center = this.transform(coordinates);
      let coor = dic(center[0], center[1]);
      return TransformCoordinate(coor);
    }
  };

  // ???????????????????????????????????????code???
  this.getCollectionTotal = (data, ponts, level) => {
    const extent = InitMap.map.getView().calculateExtent(InitMap.map.getSize());
    let coor1 = TransformCoordinate(
      [extent[0], extent[1]],
      "EPSG:3857",
      "EPSG:4326"
    );
    let coor2 = TransformCoordinate(
      [extent[2], extent[3]],
      "EPSG:3857",
      "EPSG:4326"
    );
    let minLon = coor1[0];
    let maxLon = coor2[0];
    let minLat = coor1[1];
    let maxLat = coor2[1];
    let totalObj = {};
    let newwArr = [...data, ...ponts];
    let propertyLonLat = "";
    let propertyName = "";
    let propertyCode = "";
    if (level === 1) {
      propertyLonLat = "province_lon_lat";
      propertyName = "province_name";
      propertyCode = "provincecode";
    }
    if (level === 2) {
      propertyLonLat = "city_lon_lat";
      propertyName = "city_name";
      propertyCode = "citycode";
    }
    if (level === 3) {
      propertyLonLat = "district_lon_lat";
      propertyName = "district_name";
      propertyCode = "districtcode";
    }
    newwArr.forEach(item => {
      if (item[propertyLonLat]) {
        let lonlatArr = item[propertyLonLat].split(",");
        if (
          parseFloat(lonlatArr[0]) >= minLon &&
          parseFloat(lonlatArr[0]) <= maxLon &&
          parseFloat(lonlatArr[1]) >= minLat &&
          parseFloat(lonlatArr[1]) <= maxLat
        ) {
          if (!totalObj[item[propertyCode]]) {
            totalObj[item[propertyCode]] = {
              name: item[propertyName],
              total: 1,
              lon: lonlatArr[0],
              lat: lonlatArr[1]
            };
          } else {
            totalObj[item[propertyCode]].total++;
          }
        }
      }
    });
    return totalObj;
  };

  this.moveendCallBack = (
    data,
    ponts,
    { lenged, dispatch, showFeatureName },
    totalSwitch
  ) => {
    const zoom = InitMap.map.getView().getZoom();
    let level = 3;
    this.layer.projectScoutingArr.forEach(item => {
      this.layer.removeFeature(item);
    });
    const me = this;
    me.overlayArr.forEach(item => {
      InitMap.map.removeOverlay(item);
    });
    me.overlayArr = [];
    this.layer.plotEdit.removePlotOverlay2();
    this.features.forEach(item => {
      if (this.Source.getFeatureByUid(item.ol_uid)) {
        this.Source.removeFeature(item);
      }
    });
    this.features = [];
    if (zoom < 6) {
      level = 1;
    }
    if (zoom >= 6 && zoom <= 9) {
      level = 2;
    }
    if (zoom > 9 && zoom <= 14) {
      level = 3;
    }
    if (zoom < 14) {
      let totalObj = this.getCollectionTotal(data, ponts, level);
      let keys = Object.keys(totalObj);
      keys.forEach(item => {
        let coor = TransformCoordinate(
          [totalObj[item].lon, totalObj[item].lat],
          "EPSG:4326",
          "EPSG:3857"
        );
        let ele = totalOverlay({
          name: totalObj[item].name,
          total: totalObj[item].total,
          cb: function(e) {
            if (zoom < 6) {
              InitMap.map.getView().setZoom(9);
            }
            if (zoom >= 6 && zoom < 9) {
              InitMap.map.getView().setZoom(13);
            }
            if (zoom >= 9 && zoom < 14) {
              InitMap.map.getView().setZoom(14);
            }
            InitMap.map.getView().setCenter(coor);
            if (level === 3) {
              setTimeout(function() {
                let currentAreaFeatures =
                  me.features &&
                  me.features.filter(
                    item2 => item2.get("districtcode") === item.code
                  );
                me.extentSource &&
                  me.extentSource.addFeatures(currentAreaFeatures);
                let { getUrlParam } = config;
                let size = InitMap.map.getSize();
                let flag = getUrlParam.isMobile === "1";
                let obj = {
                  size: flag ? size.map(item => item / 2) : size,
                  padding: !flag ? [200, 150, 80, 400] : [0, 0, 0, 0],
                  nearest: true
                };
                if (me.extentSource) {
                  Fit(InitMap.view, me.extentSource.getExtent(), obj);
                }
              }, 100);
            }
          }
        });
        let newOverlay = createOverlay(ele);
        newOverlay.setPosition(coor);
        InitMap.map.addOverlay(newOverlay);
        this.overlayArr.push(newOverlay);
      });
    } else {
      // if (this.oldZoom2 !== zoom) {
      this.renderFeaturesCollection(data, {
        lenged,
        dispatch,
        showFeatureName: true
      });
      let pointCollection = this.renderPointCollection(ponts);
      this.overlayArr2.push(...pointCollection);
      this.features.push(...pointCollection);
      this.Source.addFeatures(pointCollection);
      this.overlayArr.forEach(item => {
        InitMap.map.removeOverlay(item);
      });
      // }
      this.changeLastSelectedFeatureStyle();
      this.changeSelectedFeatureStyle();
    }
    this.oldZoom2 = JSON.parse(JSON.stringify(zoom));
  };

  this.removeFeatureOverlay = () => {
    this.layer.plotEdit.removePlotOverlay2();
    this.featureOverlay2 && InitMap.map.removeOverlay(this.featureOverlay2);
    this.featureOverlay2 = null;
    this.lastSelectedFeature = null;
    this.selectedFeature = null;
  };

  this.mapMoveEnd = (data, ponts, { lenged, dispatch, showFeatureName }) => {
    if (!data) {
      return;
    }
    this.moveendCallBack(data, ponts, { lenged, dispatch, showFeatureName });
    const me = this;
    this.moveendListener = function(e) {
      if (!me.isNeedMoveMapMoveedListen) {
        this.moveendCallBack(data, ponts, {
          lenged,
          dispatch,
          showFeatureName
        });
      }
    };
    InitMap.map.on("moveend", e => this.moveendListener(e));
    this.moveendListener = throttle(this.moveendListener, 1000);
  };

  this.changeLastSelectedFeatureStyle = () => {
    this.lastSelectedFeature = this.selectedFeature;
    if (this.lastSelectedFeature) {
      let index = this.layer.projectScoutingArr.findIndex(
        item => item.feature?.get("id") === this.lastSelectedFeature.get("id")
      );
      let lastSelectedFetureStyle = this.lastSelectedFeature.getStyle();
      let image = this.getImage(false, this.lastSelectedFeature);
      if (image) {
        lastSelectedFetureStyle.setImage(
          this.getImage(false, this.lastSelectedFeature)
        );
        // lastSelectedFetureStyle.getText().setText("");
      }
      if (index > -1 && image) {
        this.layer.projectScoutingArr[index].feature.setStyle(
          lastSelectedFetureStyle
        );
      }
    }
  };

  this.changeSelectedFeatureStyle = feature => {
    if (feature) {
      let type = feature.getGeometry().getType();
      if (type === "Point") {
        this.selectedFeature = feature;
      }
    }
    if (this.selectedFeature) {
      let id = this.selectedFeature.get("id");
      if (!id) {
        return;
      }
      let index = this.layer.projectScoutingArr.findIndex(
        item => item.feature && item.feature.get("id") === id
      );
      let selectedFetureStyle = this.selectedFeature.getStyle();

      selectedFetureStyle.setImage(this.getImage(true));
      if (index > -1) {
        this.layer.projectScoutingArr[index].feature.setStyle(
          selectedFetureStyle
        );
      }
    }
  };

  this.init = dispatch => {
    // Event.Evt.firEvent("resetMoveMapMoveedListen");
    this.mounted = true;
    this.Layer.setSource(this.Source);
    const layers = InitMap.map.getLayers().getArray();
    const layer = layers.filter(layer => {
      return layer.get("id") === this.Layer.get("id");
    });
    this.layer = plotEdit.getPlottingLayer(dispatch);

    if (!layer[0]) {
      InitMap.map.on("click", evt => {
        this.featureOverlay2 && InitMap.map.removeOverlay(this.featureOverlay2);
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
              obj.feature.get("data")
            );
          }
        }
      });
      const me = this;
      this.changeFeatureTitleShowListener = function(e) {
        if (me.hasFeatureTotal) {
          if (me.oldPlotFeatures) {
            if (!me.needRenderFetureStyle) return;
            let zoom = InitMap.map.getView().getZoom();
            let obj = {
              lenged: me.oldLenged,
              dispatch: me.oldDispatch,
              showFeatureName: true
            };
            if (zoom > 14) {
              if (me.oldZoom && me.oldZoom <= 14) {
                if (me.oldFeatures && me.oldFeatures.length > 0) {
                  me.renderFeaturesCollection(me.oldPlotFeatures, obj);
                  setTimeout(function() {
                    me.changeLastSelectedFeatureStyle();
                    me.changeSelectedFeatureStyle();
                  }, 100);
                }
              }
            } else {
              if (me.oldZoom && me.oldZoom > 14) {
                if (me.oldFeatures && me.oldFeatures.length > 0) {
                  // obj.showFeatureName = false;
                  me.renderFeaturesCollection(me.oldPlotFeatures, obj);
                  setTimeout(function() {
                    me.changeLastSelectedFeatureStyle();
                    me.changeSelectedFeatureStyle();
                  }, 100);
                }
              }
            }
            me.oldZoom = JSON.parse(JSON.stringify(zoom));
          }
        }
      };
      InitMap.map.on("moveend", this.changeFeatureTitleShowListener);
      InitMap.map.addLayer(this.Layer);
    }
    const me = this;
    // ??????/??????????????????
    Event.Evt.on("removeMapMoveEndListen", function(value) {
      this.isCollectionTotal = !value;
      if (!me.oldLenged) return;
      if (me.tabActivekey !== "1") {
        message.info("?????????????????????");
        Event.Evt.firEvent("resetMoveMapMoveedListen");
        return;
      }
      let obj = {
        lenged: me.oldLenged,
        dispatch: me.oldDispatch,
        showFeatureName: me.oldShowFeatureName
      };
      let zoom = INITMAP.map.getView().getZoom();
      if (zoom >= 14) {
        obj.showFeatureName = true;
      } else {
        obj.showFeatureName = false;
      }
      me.overlayArr.forEach(item => {
        InitMap.map.removeOverlay(item);
      });
      me.overlayArr2.forEach(item => {
        if (me.Source.getFeatureByUid(item.ol_uid)) {
          me.Source.removeFeature(item);
        }
      });
      plotEdit.plottingLayer &&
        plotEdit.plottingLayer.plotEdit.removePlotOverlay2();
      me.overlayArr = [];
      me.overlayArr2 = [];
      // ?????????????????????
      if (value) {
        if (me.tabActivekey === "1") {
          me.renderFeaturesCollection(me.oldFeatures, obj);
          let pointCollection = me.renderPointCollection(me.oldPonts);
          me.overlayArr2 = pointCollection;
          me.features = me.features.concat(pointCollection);
          me.Source.addFeatures(pointCollection);
        } else {
          message.info("??????????????????");
        }
        INITMAP.map.un("moveend", me.moveendListener);
        me.moveendListener = () => {};
      } else {
        //??????
        InitMap.map
          .getView()
          .animate({ zoom: 13 }, { center: INITMAP.map.getView().getCenter() });
        // InitMap.map.getView().setZoom(13);
        me.featureOverlay2 && InitMap.map.removeOverlay(me.featureOverlay2);
        if (me.tabActivekey === "1") {
          me.mapMoveEnd(me.oldFeatures, me.oldPonts, obj, value);
        } else {
          message.info("??????????????????");
        }
      }
      me.isNeedMoveMapMoveedListen = value;
    });

    // ??????????????????
    this.timeInterval && clearInterval(this.timeInterval);
    this.timeInterval = setInterval(function() {
      if (me.hasMeetingRoom) {
        me.featureOverlay2 && InitMap.map.removeOverlay(me.featureOverlay2);
        me.layer.plotEdit.removePlotOverlay2();
        me.layer.projectScoutingArr.forEach(item => {
          if (item.feature) {
            if (item.feature.get("meetingRoomNum")) {
              item.feature.values_.meetingRoomNum = Math.round(
                Math.random() * 3
              );
              const ele = featureOverlay(item.feature.get("meetingRoomNum"));
              me.layer.plotEdit.createPlotOverlay2(ele, item);
            }
          }
        });
      }
    }, 30000);
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

  // ???????????????????????????
  let getBoxCoordinates = extent => {
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
    // ?????????????????????????????????
    listAction.clear();
  };

  this.checkCollectionType = (suffix = "") => {
    if (!suffix) return "unknow";
    const itemKeyVals = {
      paper: [], // ??????
      interview: ["aac", "mp3", "??????", "m4a", "flac"], // ??????
      pic: ["jpg", "PNG", "gif", "jpeg", "bmp"].map(item =>
        item.toLocaleLowerCase()
      ),
      video: ["MP4", "WebM", "Ogg", "avi"].map(item =>
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
        "pdf"
      ].map(item => item.toLocaleLowerCase()),
      annotate: [], // ??????
      plotting: ["feature"], // ??????
      planPic: ["plan"], // ?????????
      address: ["board_xlsx"]
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
    Event.Evt.firEvent("openLengedListPanel", false);
    this.timeInterval && clearInterval(this.timeInterval);
    this.hasMeetingRoom = null;
    this.layer.projectScoutingArr &&
      this.layer.projectScoutingArr.forEach(item => {
        INITMAP.map.removeOverlay(item.feature && item.feature.overlay);
        if (item.feature) this.layer.removeFeature(item);
      });
    this.layer.plotOverlayArr.forEach(item => {
      INITMAP.map.removeOverlay(item);
    });
    this.layer.projectScoutingArr = [];
    this.layer.plotEdit.plotClickCb = null;
    setSession(listAction.sesstionSaveKey, "");
    this.overlayArr.forEach(item => {
      INITMAP.map.removeOverlay(item);
    });
    this.overlayArr2.forEach(item => {
      if (this.Source.getFeatureByUid(item.ol_uid)) {
        this.Source.removeFeature(item);
      }
    });
    this.layer.plotEdit.removePlotOverlay2();
    INITMAP.map.un("moveend", this.moveendListener);
    this.moveendListener = () => {};
    this.clearGroupCollectionPoint();
    // Event.Evt.firEvent("resetMoveMapMoveedListen");
    this.isNeedMoveMapMoveedListen = false;
    this.oldFeatures = null;
    this.oldPonts = null;
    this.oldLenged = null;
    this.oldDispatch = null;
    this.oldShowFeatureName = null;
    this.hasFeatureTotal = false;
    this.featureOverlay2 && INITMAP.map.removeOverlay(this.featureOverlay2);
    this.lastSelectedFeature = null;
    this.selectedFeature = null;
    this.featureOverlay2 = null;
    /** ??????????????????????????????????????? */
    this.setCoordinatePointFeature = null;
    /** ???????????????????????????????????? */
    this.setCoordinatePointOverlay = null;
    // Event.Evt.removeEventListener("removeMapMoveEndListen");
  };
  // ??????????????????
  this.fetchAreaList = async data => {
    return await GET_AREA_LIST(data);
  };
  // ????????????
  this.addArea = async data => {
    return await ADD_AREA_BOARD(data);
  };

  // ??????????????????
  this.addCollection = async data => {
    return await ADD_COLLECTION(data);
  };
  // ??????????????????
  this.getCollectionList = async data => {
    return await GET_COLLECTION_LIST(data);
  };
  // ??????????????????
  this.removeCollection = async id => {
    return await DELETE_COLLECTION(id);
  };

  // ????????????????????????
  this.setGropCoordinates = async (id, data) => {
    let { coordinate } = data;
    let param = {
      longitude: coordinate[0],
      latitude: coordinate[1]
    };
    // console.log(coordinate)
    return await EDIT_AREA_MESSAGE(id, param);
  };

  const Drag = /*@__PURE__*/ (function(PointerInteraction) {
    function Drag() {
      PointerInteraction.call(this, {
        handleDownEvent: () => {}, //handleDownEvent
        handleDragEvent: () => {}, //handleDragEvent,
        handleMoveEvent: () => {}, //handleMoveEvent,
        handleUpEvent: () => {} //handleUpEvent,
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

  // ?????????????????????
  this.setToCenter = async data => {
    let coor = [+data.coordinate_x, +data.coordinate_y];
    if (!InitMap.checkNowIsGcj02System()) {
      // ????????????
      let dic = InitMap.systemDic[InitMap.baseMapKey];
      coor = dic(coor[0], coor[1]);
    }
    this.addAnimatePoint({
      coordinates: coor,
      transform: true,
      name: data.board_name
    });

    // ??????????????????
    this.projectData = {
      coordinates: coor,
      name: data.board_name
    };

    if (data.radius) {
      let feature = addFeature("defaultCircle", {
        coordinates: TransformCoordinate(coor),
        radius: Number(data.radius)
      });
      this.fitFeature(feature);
    } else {
      await this.toCenter({ center: coor, transform: true });
    }
  };

  /** ???????????????
   * @param {boolean} isMultiple ??????????????????
   * @param {{title: string}} data ???????????????
   */
  this.addCollectionCoordinates = (isMultiple, data) => {
    this.dragEvt = new Drag();
    this.hideCollectionOverlay();
    this.isActivity = true;
    return new Promise((resolve, reject) => {
      InitMap.map.once("click", event => {
        let { coordinate } = event;
        let handlefeature = InitMap.map.forEachFeatureAtPixel(
          event.pixel,
          feature => feature
        );
        if (handlefeature) {
          let type = handlefeature.getGeometry().getType();
          if (type === "Point") {
            coordinate = handlefeature.getGeometry().getCoordinates();
            message.success(`?????????????????????????????????`);
          }
        }
        let style = createStyle("Point", {
          icon: {
            src: require("../../../assets/selectlocation.png"),
            crossOrigin: "anonymous",
            anchor: [0.5, 0.8]
          },
          text: isMultiple ? "point" : data.title,
          showName: true,
          textFillColor: isMultiple ? "rgba(0,0,0,0)" : "#ff0000",
          textStrokeColor: isMultiple ? "rgba(0,0,0,0)" : "#ffffff",
          zIndex: 22
        });
        let f = (this.setCoordinatePointFeature = addFeature("Point", {
          coordinates: coordinate,
          ftype: "select_coordinates"
        }));
        f.setStyle(style);
        this.Layer.setZIndex(50);
        this.Source.addFeature(f);

        let ele = new SetCoordinateForCollection({});
        let overlay = (this.setCoordinatePointOverlay = createOverlay(
          ele.element,
          {
            position: coordinate,
            positioning: "bottom-center",
            offset: [0, -40]
          }
        ));
        InitMap.map.addOverlay(overlay);

        let p = this.transform(coordinate);
        ele.setLong(p[0]);
        ele.setLat(p[1]);

        InitMap.map.addInteraction(this.dragEvt);
        this.dragEvt.handleDownEvent = evt => {
          let map = evt.map;

          let feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
            return feature;
          });

          if (feature && feature.get("ftype") === "select_coordinates") {
            this.coordinate_ = evt.coordinate;
            overlay.setPosition(null);
            let styles = feature.getStyle();
            let imgstyle = createStyle("Point", {
              icon: {
                src: require("../../../assets/unselectlocation.png"),
                crossOrigin: "anonymous",
                anchor: [0.5, 0.8]
              }
            });
            styles.setImage(imgstyle.getImage());
            feature.setStyle(styles);
            this.feature_ = feature;
          }
          return !!feature;
        };
        this.dragEvt.handleDragEvent = evt => {
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
        this.dragEvt.handleMoveEvent = evt => {
          if (this.cursor_) {
            let map = evt.map;
            let feature = map.forEachFeatureAtPixel(evt.pixel, function(
              feature
            ) {
              return feature;
            });
            let element = evt.map.getTargetElement();
            if (feature && feature.get("ftype") === "select_coordinates") {
              if (element.style.cursor !== this.cursor_) {
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
                src: require("../../../assets/selectlocation.png"),
                crossOrigin: "anonymous",
                anchor: [0.5, 0.8]
              }
            });

            styles.setImage(imgstyle.getImage());
            this.feature_.setStyle(styles);
            // ?????????????????????
            let position = this.transform(coor);
            ele.setLong(position[0]);
            ele.setLat(position[1]);
          }
          this.coordinate_ = null;
          this.feature_ = null;
          return false;
        };
        ele.on = {
          save: val => {
            resolve(val);
            this.abortPointAddDraw();
            this.isActivity = false;
          },
          cancel: () => {
            this.abortPointAddDraw();
            reject();
            this.isActivity = false;
          }
        };
      });
    });
  };

  /** ????????????????????? */
  this.abortPointAddDraw = () => {
    InitMap.map.removeInteraction(this.dragEvt);
    this.dragEvt = null;
    if (this.setCoordinatePointFeature) {
      this.Source.removeFeature(this.setCoordinatePointFeature);
    }

    if (this.setCoordinatePointOverlay) {
      InitMap.map.removeOverlay(this.setCoordinatePointOverlay);
    }
    this.setCoordinatePointFeature = null;
    this.setCoordinatePointOverlay = null;
  };

  // ???????????????????????? ---?????? ?????? addCollectionCoordinates ??????
  this.addCollectionPosition = data => {
    return new Promise((resolve, reject) => {
      let style = createStyle("Point", {
        iconUrl: require("../../../assets/addPointLocation.png"),
        text: data.title,
        showName: true,
        textFillColor: "#ff0000",
        textStrokeColor: "#ffffff"
      });
      this.draw = drawPoint(this.Source, { style });
      this.draw.on("drawend", e => {
        e.feature.setStyle(style);
        this.activeFeature = e.feature;
        resolve(e);
        this.removeDraw();
      });
      InitMap.map.addInteraction(this.draw);
    });
  };
  // ??????????????????
  this.clearGroupPointer = () => {
    this.groupPointer.forEach(item => {
      if (this.Source.getFeatureByUid(item.ol_uid)) {
        this.Source.removeFeature(item);
      }
    });
    this.groupPointer = [];
    this.overlayArr.forEach(item => {
      INITMAP.map.removeOverlay(item);
    });
    this.overlayArr2.forEach(item => {
      if (this.Source.getFeatureByUid(item.ol_uid)) {
        this.Source.removeFeature(item);
      }
    });
    INITMAP.map.un("moveend", this.moveendListener);
    this.moveendListener = () => {};
  };
  // ????????????
  const mapClick = evt => {
    let pixel = evt.pixel;
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
      // let isGeojson = feature.get("isGeojson");
      let featureType = feature.getGeometry().getType();
      if (featureType === "Point") {
        this.isActivity = null;
        this.handlePlotClick(feature);
      }
      let coords = feature.getGeometry().getCoordinates();
      if (!coords) return;
      coords = TransformCoordinate(coords, "EPSG:3857", "EPSG:4326");
      Event.Evt.firEvent("HouseDetailGetPoi", coords.join(","));
      // console.log(p_type)
    }
  };

  // ????????????
  const LookingBackPointClick = evt => {
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

  // ??????active????????????
  this.setGroupCollectionActive = data => {
    this.groupCollectionPointer.forEach(item => {
      let style = item.getStyle();
      style.setZIndex(1);
      // style.getImage().getFill().setColor("#577DFF");
      // style.getImage().setRadius(9);
      style.setImage(pointUnselect().getImage());
      item.setStyle(style);
    });
    if (!data) return;
    let coordinate = data.location &&
      data.location.latitude &&
      data.location.longitude && [
        +data.location.longitude,
        +data.location.latitude
      ];
    if (!coordinate) return undefined;
    let coor = TransformCoordinate(coordinate);
    let feature = this.Source.getFeaturesAtCoordinate(coor);
    InitMap.map.getView().animate({
      center: feature[0].getGeometry().getCoordinates(),
      duration: 200
    });
    feature.forEach(item => {
      let style = item.getStyle();
      style.setZIndex(10);
      if (style.getImage()) {
        // style.getImage().getFill().setColor("#FE2042");
        // style.getImage().setRadius(12);
        style.setImage(pointSelect().getImage());
      }
      item.setStyle(style);
    });
  };

  /** ?????????????????????????????? */
  this.renderGoupCollectionForLookingBack = data => {
    this.clearGroupCollectionPoint();
    InitMap.map.un("click", LookingBackPointClick);
    if (data && data.length) {
      let obj = {};
      data.forEach(d => {
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
      // ??????????????????????????????
      let objkeys = Object.keys(obj);
      objkeys.forEach(item => {
        let collections = obj[item];
        let coordinate = item.split("/").map(i => +i);
        let feature = addFeature("Point", {
          coordinates: TransformCoordinate(coordinate),
          collections
        });
        let style = createStyle("Point", {
          radius: 8,
          fillColor: "#577DFF",
          strokeColor: "#ffffff",
          strokeWidth: 2,
          showName: true,
          text: "???????????????",
          offsetY: -30,
          icon: {
            src: require("../../../assets/selectlocation.png"),
            anchor: [0.5, 0.8],
            crossOrigin: "anonymous"
          },
          // text: item.title || item.name,
          textFillColor: "rgba(255,255,255,0)",
          textStrokeColor: "rgba(255,255,255,0)",
          textStrokeWidth: 1,
          font: 10
        });
        feature.setStyle(style);
        this.groupCollectionPointer.push(feature);
        // console.log(coordinate)
      });
      if (this.groupCollectionPointer.length) {
        this.Source.addFeatures(this.groupCollectionPointer);
        Fit(InitMap.view, this.Source.getExtent(), {
          size: InitMap.map.getSize(),
          padding: fitPadding
        });
        InitMap.map.on("click", LookingBackPointClick);
      }
      // console.log(obj)
    }
  };
  // ????????????????????????
  this.clearGroupCollectionPoint = () => {
    if (this.groupCollectionPointer.length) {
      this.groupCollectionPointer.forEach(item => {
        if (this.Source.getFeatureByUid(item.ol_uid)) {
          this.Source.removeFeature(item);
        }
      });
      this.groupCollectionPointer = [];
    }
  };

  // ?????????????????????
  this.setActiveGoupPointer = id => {
    this.groupPointer.map(item => {
      let style = item.getStyle();
      if (item.get("p_id") === id) {
        style
          .getImage()
          .getFill()
          .setColor("#FE2042");
        style.getImage().setRadius(12);
      } else {
        style
          .getImage()
          .getFill()
          .setColor("#577DFF");
        style.getImage().setRadius(9);
      }
      item.setStyle(style);
      return item;
    });
  };

  // ??????????????????
  this.renderGroupPointer = data => {
    InitMap.map.un("click", mapClick);
    this.clearGroupPointer();
    if (data.length) {
      data = data.filter(
        item =>
          item.hasOwnProperty("longitude") && item.hasOwnProperty("latitude")
      );
      let fs = [];
      InitMap.map.on("click", mapClick);
      data.forEach(item => {
        let coordinate = TransformCoordinate([+item.longitude, +item.latitude]);
        let feature = addFeature("Point", {
          coordinates: coordinate,
          p_id: item.id,
          p_type: "group"
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
          font: 14
        });
        feature.setStyle(style);
        fs.push(feature);
        this.groupPointer.push(feature);
      });
      if (fs.length) {
        this.Source.addFeatures(fs);
        Fit(InitMap.view, this.Source.getExtent(), {
          size: InitMap.map.getSize(),
          padding: fitPadding
        });
      }
    }
  };

  this.transform = coor => {
    return TransformCoordinate(coor, "EPSG:3857", "EPSG:4326");
  };
  // ????????????????????????
  this.editCollection = async data => {
    return await EDIT_COLLECTION(data);
  };
  // ???????????????????????????
  this.removeDraw = () => {
    InitMap.map.removeInteraction(this.draw);
    if (this.Source.getFeatureByUid(this.activeFeature.ol_uid)) {
      this.Source.removeFeature(this.activeFeature);
    }
  };

  // ?????????????????????????????????????????????
  const findHasLocationData = data => {
    let arr = data.filter(
      item => !!item.location && Object.keys(item.location).length >= 2
    );
    return arr;
  };
  this.removeOverlay = () => {
    this.overlays.forEach(item => {
      InitMap.map.removeOverlay(item);
    });
    this.overlays = [];
    if (this.polygonOverlay) {
      this.polygonOverlay.setPosition(null);
      InitMap.map.removeOverlay(this.polygonOverlay);
    }
    this.removeFeatureOverlay();
  };
  this.removeFeatures = () => {
    this.removeOverlay();
    this.clearGeoFeatures();
    this.removePlanPicCollection();
    // ????????????
    this.features.forEach(item => {
      if (this.Source.getFeatureByUid(item.ol_uid)) {
        this.Source.removeFeature(item);
      }
    });
    // ?????????????????????
    // console.log(this.layer, "77777777777777777777");
    if (this.layer) {
      this.layer.projectScoutingArr &&
        this.layer.projectScoutingArr.forEach(item => {
          INITMAP.map.removeOverlay(item.feature && item.feature.overlay);
          if (item.feature) this.layer.removeFeature(item);
          this.selectedFeatureOperator = null;
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
    array.forEach(item => {
      let key = [+item.location.longitude, +item.location.latitude];
      key = key.join("/");

      let pointType = this.checkCollectionType(item.target);
      item.pointType = pointType;

      !coordinate[key] && (coordinate[key] = []);
      coordinate[key].push(item);
    });
    Object.keys(coordinate).forEach(item => {
      let coor = item.split("/").map(c => +c);
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
              src: require("../../../assets/selectlocation.png"),
              anchor: [0.5, 0.8],
              crossOrigin: "anonymous"
            }
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
              crossOrigin: "anonymous"
            }
          };
      };
      let feature = addFeature("Point", {
        coordinates: coor,
        id: d.id,
        ftype: "collection",
        data: coordinate[item],
        multi: coordinate[item].length > 1,
        ...(coordinate[item][0] || null)
      });
      let style = createStyle("Point", moreStyle());

      feature.setStyle(style);

      features.push(feature);
    });
    return features;
  };

  // ??????feature
  this.findFeature = id => {
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

  // ?????????????????????
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

  //????????????
  this.modifyRemark = async data => {
    let newData = { ...data };
    newData.create_by && delete newData.create_by;
    newData.create_time && delete newData.create_time;
    newData.update_time && delete newData.update_time;
    return await this.editCollection(newData);
  };

  // ???????????????
  this.findImgLayer = id => {
    for (let i = 0; i < this.imgs.length; i++) {
      let item = this.imgs[i];
      if (item.get("id") && item.get("id") === id) {
        return item;
      }
    }
  };

  this.getImage = (selected = true, feature) => {
    let src = "";
    if (selected) {
      src = require("../../../assets/selectedplot.png");
    } else {
      if (feature) {
        src = feature.get("featureType");
      } else {
        src = require("../../../assets/newplot.png");
      }
    }
    if (src) {
      let style = createStyle("Point", {
        icon: {
          src: src,
          scale: selected ? 0.8 : 0.6,
          crossOrigin: "anonymous"
        }
      });
      return style.getImage();
    }
    return null;
  };

  this.fitFeature = feature => {
    Fit(InitMap.view, feature.getGeometry().getExtent(), { duration: 300 });
  };

  // ????????????????????????
  this.toggleFeatureStyle = feature => {
    this.changeLastSelectedFeatureStyle();
    this.changeSelectedFeatureStyle(feature);
  };

  // ????????????????????????
  this.handlePlotClick = (feature, pixel) => {
    if (this.isActivity) return;
    // ??????????????????
    if (!feature) return;
    let geometryType = feature.getGeometry().getType();
    if (geometryType === "Point") {
      this.changeLastSelectedFeatureStyle();
      let isGeojson = feature.get("isGeojson");
      if (!isGeojson) {
        let style = feature.getStyle();
        style.setImage(this.getImage());
        let text = style.getText().getText();
        if (!text) {
          feature
            .getStyle()
            .getText()
            .setText(feature.get("title"));
        }
        feature.setStyle(style);
        this.selectedFeature = feature;
      }
    }
    this.featureOverlay2 && InitMap.map.removeOverlay(this.featureOverlay2);
    this.cancelSearchAround();
    // Fit(InitMap.view, feature.getGeometry().getExtent(), { duration: 300 });
    Event.Evt.firEvent("handleFeatureToLeftMenu", feature.get("id"));
    // Event.Evt.firEvent("handlePlotFeature", { feature, pixel });
    // return;
    // createPopupOverlay(feature, pixel);
    if (feature.get("meetingRoomNum") !== undefined) {
      this.fitFeature(feature);
      this.oldDispatch &&
        this.oldDispatch({
          type: "collectionDetail/updateDatas",
          payload: { selectData: null }
        });
      const me = this;
      let cb = function() {
        me.featureOverlay2 && INITMAP.map.removeOverlay(me.featureOverlay2);
        Event.Evt.firEvent("handlePlotFeature", { feature, pixel });
      };

      let id = feature.get("id");
      getPlotImages(id).then(res => {
        if (res) {
          this.featureOverlay2 = createFeatureOverlay(
            feature,
            feature.get("title"),
            feature.get("meetingRoomNum"),
            res[0]?.image_url,
            cb
          );
          InitMap.map.addOverlay(this.featureOverlay2);
          this.layer.plotEdit.removePlotOverlay2();
          let operatorArr = this.layer.projectScoutingArr;
          operatorArr.forEach(item => {
            let feature = item.feature;
            let meetingRoomNum = null;
            if (feature) {
              meetingRoomNum = feature.get("meetingRoomNum");
              const ele = featureOverlay(meetingRoomNum);
              this.layer.plotEdit.createPlotOverlay2(ele, item);
            }
          });
        }
      });
    } else {
      Event.Evt.firEvent("handlePlotFeature", { feature, pixel });
    }
  };

  this.getGeojsonIcon = () => {
    return this.geojsonResources;
  };

  this.reRenderGeojson = () => {
    this.clearGeoFeatures();
    this.renderGeoJson(this.geojsonRenderData, {
      lenged: this.oldDispatch,
      dispatch: this.oldDispatch
    });
  };

  this.renderGeoJson = async (data, { lenged, dispatch }) => {
    this.geojsonRenderData = data;
    INITMAP.map.un("click", mapClick);
    InitMap.map.on("click", mapClick);
    let promise = [];
    let res = [],
      ids = [];
    let newIds = [];
    let geojsonResponseData = [];
    if (data && data.length) {
      nProgress.start();
      if (this.animateLine) {
        this.animateLine.clear();
        this.animateLine = null;
      }
      data.forEach(item => {
        newIds.push(item.id);
        if (this.geojsonData[item.id]) {
          res.push({
            ...this.geojsonData[item.id],
            __needAnimate: !!item._animate
          });
        } else {
          ids.push(item.id);
          if (item.resource_url) {
            promise.push(
              Axios.get(item.resource_url, {
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Content-Type": "application/json"
                }
              }).then(resp => {
                // ??????????????????????????????????????????????????????
                return { ...resp, __needAnimate: !!item._animate };
              })
            );
          }
        }
      });
      let newRes = await Promise.all(promise);
      newRes.forEach((item, index) => {
        this.geojsonData[ids[index]] = item;
      });
      res = [...res, ...newRes];
      if (newIds && newIds.length > 0) {
        let geojsonResponse = await geojsonResourceServices.getList(
          newIds.join(",")
        );
        if (geojsonResponse && geojsonResponse.code === "0") {
          geojsonResponseData = geojsonResponse.data;
        }
      }
    }
    nProgress.done();
    let newConfig = [];
    this.lenged = {
      title: "????????????",
      key: "map:projectScouting",
      content: []
    };
    let hasAnimate = false;
    res.forEach((item, i) => {
      if (item.__needAnimate) {
        this.startAnimateForFeatures(item.data);
        hasAnimate = true;
      }

      let geojson = item.data;
      let features = loadFeatureJSON(geojson, "GeoJSON");
      let iconUrl = "",
        strokeColor = "",
        fillColor = "";
      let currentData = [];
      features.forEach((feature, index) => {
        let type = feature.getGeometry().getType();
        let icon = feature.get("iconUrl");
        icon = icon && icon.replace("../../../assets", "");
        iconUrl = icon ? require("../../../assets" + icon) : null;
        strokeColor = feature.get("strokeColor") || "rgba(255,0,0,0.3)";
        fillColor = feature.get("fillColor") || "rgba(255,0,0,0.3)";
        let options = {
          showName: (type !== "Point" && index < 15) || type === "Point",
          text: geojson.hideName ? "" : feature.get("name") || geojson.name,
          iconUrl: iconUrl,
          strokeColor: strokeColor,
          fillColor: fillColor,
          textFillColor: "rgba(0,0,0,0.9)",
          textStrokeColor: "#FFFFFF",
          font: 14
        };
        currentData = geojsonResponseData.filter(item => {
          return item.geojson_id === newIds[i];
        });
        if (currentData && currentData.length === 1) {
          options.iconUrl = currentData[0].image_base64;
        }
        if (type === "MultiLineString") {
          options.strokeWidth = 4;
        }
        let style = createStyle(type, options);
        feature.setStyle(style);
        feature.values_.isGeojson = true;
        feature.values_.featureType = iconUrl;
        this.geoFeatures.push(feature);
      });
      if (geojson.features.length > 0) {
        if (geojson.lenged) {
          geojson.lenged.forEach(item => {
            if (item.imgSrc) {
              let imgSrc = null;
              if (item.imgSrc.includes("../../../assets")) {
                imgSrc = item.imgSrc;
                imgSrc = imgSrc.replace("../../../assets", "");
                imgSrc = require("../../../assets" + imgSrc);
                item.imgSrc = imgSrc;
              }
              if (currentData && currentData.length === 1) {
                let newItem = JSON.parse(JSON.stringify(item));
                newItem.imgSrc = currentData[0].image_base64;
                if (!this.geojsonResources[newIds[i]]) {
                  this.geojsonResources[newIds[i]] = newItem.imgSrc;
                }
                this.lenged.content.push(newItem);
              } else {
                if (!this.geojsonResources[newIds[i]]) {
                  this.geojsonResources[newIds[i]] = item.imgSrc;
                }
                this.lenged.content.push(item);
              }
            } else {
              this.lenged.content.push(item);
            }
          });
        }
      }
      if (!lenged) {
        lenged = [];
      }
      if (!Array.isArray(lenged)) {
        lenged = [lenged];
      }
      const lengedIndex = lenged.findIndex(
        lenged => lenged.key === this.lenged.key
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
      this.Source.addFeatures(features);
      if (features.length > 0) {
        Event.Evt.firEvent("openLengedListPanel", true);
      }
    });

    if (hasAnimate) {
      nProgress.start();
    }

    // Event.Evt.firEvent("updateGeojson", this.geoFeatures);
    dispatch &&
      dispatch({
        type: "lengedList/updateLengedList",
        payload: {
          config: newConfig
        }
      });
    return res;
  };
  this.clearGeoFeatures = () => {
    if (this.geoFeatures.length) {
      this.geoFeatures.forEach(item => {
        if (this.Source.getFeatureByUid(item.ol_uid)) {
          this.Source.removeFeature(item);
        }
      });
      this.geoFeatures = [];
    }
  };
  // ??????????????????
  this.renderFeaturesCollection = async (
    data,
    { lenged, dispatch, addSource = true, showFeatureName },
    geoData
  ) => {
    const commonStyleOption = {
      // textFillColor: "rgba(255,0,0,1)",
      textFillColor: "rgba(0, 0, 0, 1)",
      textStrokeColor: "#fff",
      textStrokeWidth: 3,
      font: "13px sans-serif",
      placement: "point",
      iconScale: 0.6,
      pointColor: "#fff",
      showName: showFeatureName === undefined ? true : showFeatureName
    };
    this.lenged = {
      title: "????????????",
      key: "map:projectScouting",
      content: []
    };
    if (addSource) {
      this.layer.projectScoutingArr.forEach(item => {
        if (item && item.feature) {
          InitMap.map.removeOverlay(item.feature.overlay);
          this.layer.removeFeature(item);
        }
      });
      this.layer.plotOverlayArr.forEach(item => {
        InitMap.map.removeOverlay(item);
      });
      this.layer.projectScoutingArr = [];
      this.layer.plotOverlayArr = [];
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
        item0 => item0.font === content.selectName
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
          content.featureType = iconUrl;
        }
        if (hasIndex < 0) {
          obj = {
            imgSrc: iconUrl,
            font:
              content.selectName === "???????????????"
                ? item.title
                : content.selectName,
            type: featureLowerType
          };
          this.lenged.content.push(obj);
        }
      } else {
        if (hasIndex < 0) {
          obj = {
            bgColor: featureType,
            borderColor: strokeColor,
            font:
              content.selectName === "???????????????" ||
              content.selectName === "" ||
              !content.selectName
                ? item.title
                : content.selectName,
            type: featureLowerType
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
          ...commonStyleOption
        });
      }
      if (content.geoType === "LineString") {
        myStyle = createStyle(content.geoType, {
          strokeWidth: 4,
          strokeColor: featureType,
          text: item.title,
          ...commonStyleOption
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
            img.onload = function() {
              const pat = context.createPattern(img, "repeat");
              let options = {
                strokeWidth: 2,
                strokeColor: "",
                fillColor: pat,
                text: item.title,
                ...commonStyleOption
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
          text: item.title
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
        if (content.geoType === "Point") {
          if (content.meetingRoomNum !== undefined) {
            this.hasMeetingRoom = true;
            const ele = featureOverlay(content.meetingRoomNum);
            plotEdit.plottingLayer.plotEdit.createPlotOverlay2(ele, operator);
          }
        }
        // ????????????????????????
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
    lst.forEach(item => {
      let obj = data.find(d => d.id === item.get("id"));
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
      lenged => lenged.key === this.lenged.key
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
    if (!geoData || geoData.length === 0) {
      dispatch &&
        dispatch({
          type: "lengedList/updateLengedList",
          payload: {
            config: newConfig
          }
        });
    }
    if (data.length > 0) {
      Event.Evt.firEvent("openLengedListPanel", true);
    }

    // ??????????????????
    this.addAreaSelect();
    return this.layer.showLayer.getSource();
  };
  // ??????feature
  this.renderCollection = async (
    data,
    { lenged, dispatch, animation = true, showFeatureName = false }
  ) => {
    this.currentSet = { lenged, dispatch, animation, showFeatureName };
    // ????????????
    this.removeFeatures();
    this.removeOverlay();
    if (!data.length) {
      this.oldPlotFeatures = [];
      return;
    }
    // ???????????????????????????????????????????????????
    let arr = [];
    data.forEach(item => {
      if (item.type !== "groupCollection") {
        arr.push(item);
      } else {
        arr = arr.concat(item.child);
      }
    });
    // ?????????????????????
    data = arr;
    // ????????????????????????
    data = data.filter(item => item.is_display === "1");

    let ponts = data.filter(
      item =>
        item.collect_type !== "4" &&
        item.collect_type !== "5" &&
        item.collect_type !== "group"
    );
    let features = data.filter(item => item.collect_type === "4");
    this.oldPlotFeatures = features;
    let planPic = data.filter(item => item.collect_type === "5");
    let geoData = data.filter(item => item.collect_type === "8");
    this.featuresGroup = {};
    features.forEach(item => {
      if (item.provincecode) {
        if (!this.featuresGroup[item.provincecode]) {
          this.featuresGroup[item.provincecode] = [];
        }
        let index = this.featuresGroup[item.provincecode].findIndex(
          item2 => item2.id === item.id
        );
        if (index === -1) {
          this.featuresGroup[item.provincecode].push(item);
        }
      }
      if (item.citycode) {
        if (!this.featuresGroup[item.citycode]) {
          this.featuresGroup[item.citycode] = [];
        }
        let index = this.featuresGroup[item.citycode].findIndex(
          item2 => item2.id === item.id
        );
        if (index === -1) {
          this.featuresGroup[item.citycode].push(item);
        }
      }
      if (item.districtcode) {
        if (!this.featuresGroup[item.districtcode]) {
          this.featuresGroup[item.districtcode] = [];
        }
        let index = this.featuresGroup[item.districtcode].findIndex(
          item2 => item2.id === item.id
        );
        if (index === -1) {
          this.featuresGroup[item.districtcode].push(item);
        }
      }
    });
    this.pontsGroup = {};
    ponts.forEach(item => {
      if (item.provincecode) {
        if (!this.pontsGroup[item.provincecode]) {
          this.pontsGroup[item.provincecode] = [];
        }
        this.pontsGroup[item.provincecode].push(item);
      }
      if (item.citycode) {
        if (!this.pontsGroup[item.citycode]) {
          this.pontsGroup[item.citycode] = [];
        }
        this.pontsGroup[item.citycode].push(item);
      }
      if (item.districtcode) {
        if (!this.pontsGroup[item.districtcode]) {
          this.pontsGroup[item.districtcode] = [];
        }
        this.pontsGroup[item.districtcode].push(item);
      }
    });
    this.oldFeatures = features;
    this.oldPonts = ponts;
    this.oldLenged = lenged;
    this.oldDispatch = dispatch;
    this.oldShowFeatureName = showFeatureName;
    if (this.isCollectionTotal) {
      this.mapMoveEnd(features, ponts, { lenged, dispatch, showFeatureName });
    }
    // ????????????
    this.layer.style = null;
    this.layer.attrs = null;
    this.layer.isDefault = null;

    // ??????geo??????
    await this.renderGeoJson(geoData, { lenged, dispatch }).catch(err =>
      console.log(err)
    );
    // ??????????????????
    if (!this.isCollectionTotal) {
      await this.renderFeaturesCollection(
        features,
        {
          lenged,
          dispatch,
          showFeatureName: true
        },
        geoData
      );
    }

    const sou = this.layer.showLayer.getSource();
    // ???????????????
    let ext = await this.renderPlanPicCollection(planPic);
    // ??????????????????
    if (!this.isCollectionTotal) {
      let pointCollection = this.renderPointCollection(ponts);
      this.features = this.features.concat(pointCollection);
      this.Source.addFeatures(pointCollection);
    }
    this.currentData = data;
    if (!animation) return this.features;

    let sourceExtent = this.Source.getExtent();
    let subExtent = [Infinity, Infinity, -Infinity, -Infinity];
    let sourceFlag = getExtentIsEmpty(sourceExtent);
    let souFlag = getExtentIsEmpty(
      this.layer.showLayer.getSource().getExtent()
    );
    let extFlag = getExtentIsEmpty(ext);
    // ???????????????????????????????????????
    if (!souFlag && !extFlag) {
      // ????????????
      subExtent = extend(sou.getExtent(), ext);
      // console.log(sou.getExtent(),ext)
      // ??????????????????????????????????????????
      if (!sourceFlag) {
        sourceExtent = extend(subExtent, sourceExtent);
      } else {
        // ????????????????????????????????????????????????????????????
        sourceExtent = subExtent;
      }
    }
    // ????????????????????????????????????
    else if (!extFlag || !souFlag) {
      // ??????????????????????????????????????????????????????
      if (!extFlag) {
        // ????????????????????????
        if (!sourceFlag) {
          sourceExtent = extend(ext, sourceExtent);
        } else {
          // ????????????????????????
          sourceExtent = ext;
        }
      }
      // ?????????????????????
      if (!souFlag) {
        // ???????????????????????????
        if (!sourceFlag) sourceExtent = extend(sou.getExtent(), sourceExtent);
        else {
          // ?????????????????????
          sourceExtent = sou.getExtent();
        }
      }
    }

    data &&
      data.length &&
      setTimeout(() => {
        // ?????????feature??????????????????????????? ??????????????????????????????????????????source????????????
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

  this.zoomToMap = () => {
    let zoom = INITMAP.map.getView().getZoom();
    InitMap.map.getView().setZoom(zoom < 14 ? 14 : zoom);
  };

  // type coordinate or extent
  this.toCenter = async ({
    center,
    type = "coordinate",
    duration = 800,
    zoom,
    transform = true
  }) => {
    this.selectedFeatureOperator &&
      this.layer.setToTop(this.selectedFeatureOperator);
    if (type === "coordinate") {
      if (transform) center = TransformCoordinate(center);

      return await animate({
        center: center,
        zoom: zoom ? zoom : InitMap.view.getMaxZoom() - 2,
        duration
      });
    } else if (type === "extent") {
      return await Fit(InitMap.view, center, {
        size: InitMap.map.getSize(),
        padding: fitPadding,
        duration
      });
    }
    this.selectedFeatureOperator = null;
  };

  // ???????????????????????????
  this.setEditPlanPicLayer = (val, staticImg, dispatch, collection) => {
    return new Promise((resolve, reject) => {
      if (staticImg) {
        // console.log(staticImg)
        let oldZindex = staticImg.getZIndex();
        staticImg.setZIndex(50);
        this.hideCollectionOverlay();
        // ????????????source???
        let oldSource = staticImg.getSource();
        let oldOpacity = staticImg.getOpacity();
        // ??????????????????
        let url = oldSource.getUrl();
        // ?????????????????????
        let file = null;
        // ?????????????????????
        let extent = oldSource.getImageExtent();
        // ?????????????????????????????????polygon
        let coor = getBoxCoordinates(extent);
        // ??????polygon
        let box = addFeature("Polygon", {
          coordinates: [coor],
          ftype: "editImageLayer"
        });
        // ????????????
        this.Source.addFeature(box);
        // ??????select
        let select = setSelectInteraction({
          // ?????????????????????????????????????????????
          filter: (feature, layer) => {
            if (layer && layer.get("id") !== "scoutingDetailLayer") {
              return false;
            }
            if (feature.get("ftype") === "editImageLayer") {
              return true;
            }
          }
        });
        // ????????????
        InitMap.map.addInteraction(select);
        // ??????????????????
        let modify = new Modify({
          features: select.getFeatures(),
          condition: always,
          insertVertexCondition: never
        });
        // ??????????????????
        InitMap.map.addInteraction(modify);

        // ????????????????????????
        let ele = new settingsOverlay();
        // ??????overlay
        let overlay = createOverlay(ele.element, {
          position: coor[1]
        });
        // ??????overlay
        InitMap.map.addOverlay(overlay);

        // ???????????????
        modify.on("modifyend", e => {
          // console.log(e)
          let { features } = e;
          let feature = features.getArray()[0];
          if (feature) {
            let ext = feature.getGeometry().getExtent();
            // ???????????????,????????????source,
            let source = SourceStatic(url, ext);
            // ???????????????????????????
            let point = getPoint(ext, "topRight");
            // ??????????????????
            overlay.setPosition(point);
            // ???????????????
            staticImg.setSource(source);
          }
        });

        // ???????????????
        staticImg.setOpacity(ele.opacityValue);
        // ???????????????????????????
        ele.on = {
          change: opacity => {
            staticImg.setOpacity(opacity);
          },
          enter: val => {
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
            // ???????????????????????????
            staticImg.setSource(oldSource);
            staticImg.setOpacity(oldOpacity);
            staticImg.setZIndex(oldZindex);
            reject({ code: -1, message: "????????????" });
            closeAll();
            this.showCollectionOverlay();
          },
          editImg: async () => {
            // ?????????????????????????????????
            let center = getPoint(box.getGeometry().getExtent(), "center");
            await animate({ center: center });
            let resp = await GET_PLAN_PIC(
              collection.content || collection.resource_id
            );
            let respdata = resp.data;
            let imgUrl = PLAN_IMG_URL(respdata.id);
            // ????????????????????????
            staticImg && staticImg.setVisible(false);
            overlay.setPosition(null);
            // console.log('??????????????????');
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
                  pictureHeight: h
                }
              });

            // ??????????????????
            Event.Evt.on("ImgEditComplete", data => {
              url = data.url;
              let title =
                collection.title.indexOf(respdata.layer_format) !== -1
                  ? collection.title
                  : collection.title + respdata.layer_format;
              file = new File([data.blob], title, {
                type: "image/png",
                lastModified: Date.now()
              });
              let tl = [data.extent[0], data.extent[1]];
              let rb = [data.extent[2], data.extent[3]];
              // ?????????????????????x,y ?????????x,y??????????????????,??????????????????
              let ctl = InitMap.map.getCoordinateFromPixel(tl);
              let crb = InitMap.map.getCoordinateFromPixel(rb);
              // console.log(ctl,crb);
              // ??????????????????????????????
              let ext = ctl.concat(crb);
              // ???????????????
              let tr = getPoint(ext, "topRight");

              // ??????????????????,??????source,???????????????
              let source = SourceStatic(data.url, ext);
              staticImg.setSource(source);
              staticImg.setVisible(true);
              // ????????????????????????
              staticImg.setOpacity(data.opacity);
              // ??????????????????????????????,????????????
              ele.setOpacity(data.opacity);
              // ????????????
              overlay.setPosition(tr);
              // ??????????????????
              let coordinates = getBoxCoordinates(ext);
              box.getGeometry().setCoordinates([coordinates]);
              this.Source.addFeature(box);
              // ??????????????????
              dispatch &&
                dispatch({
                  type: "editPicture/updateDatas",
                  payload: {
                    editShow: false
                  }
                });
            });
            // ?????????????????????
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
                    editShow: false
                  }
                });
            });
          }
        };

        // ??????????????????
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
        reject({ code: -1, message: "????????????????????????" });
      }
    });
  };

  // ??????????????????????????????
  this.saveEditPlanPic = async (id, data) => {
    return await SAVE_EDIT_PLAN_IMG(id, data);
  };

  //   ???????????????????????????
  this.removePlanPicCollection = () => {
    this.imgs && this.imgs.forEach(item => InitMap.map.removeLayer(item));
    // if(this.imgs && this.imgs.length)
    // window.stop();
    this.imgs = [];
  };

  let _that = this;

  // ???????????????,???????????????
  let loading = function(staticimg, extent, resp) {
    // ?????????????????????
    this.box = "";
    staticimg.on("imageloadstart", e => {
      let coor = getBoxCoordinates(extent);
      this.box = addFeature("Polygon", {
        coordinates: [coor]
      });
      this.box.setStyle(
        createStyle("Polygon", {
          showName: true,
          text: "?????????...",
          textFillColor: "rgb(255,0,0)",
          textStrokeColor: "rgba(255,255,255,0.8)",
          font: 16,
          fillColor: "rgba(0,0,0,0.25)"
        })
      );
      _that.Source.addFeature(this.box);
    });
    staticimg.on("imageloadend", e => {
      _that.Source.removeFeature(this.box);
      this.box = null;
    });

    staticimg.on("imageloaderror", () => {
      _that.Source.removeFeature(this.box);
      this.box = null;
    });
  };

  this.getNewExtent = extent => {
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

  //   ???????????????
  this.renderPlanPicCollection = async data => {
    this.imgs.forEach(item => {
      //   console.log(item)
      InitMap.map.removeLayer(item);
    });
    const baseMapKey = InitMap.baseMapKey;
    const baseMapKeys = InitMap.baseMapKeys;
    //   console.log(data);
    // ??????????????????????????????
    let ext = [Infinity, Infinity, -Infinity, -Infinity];

    let promise = data.map(item => {
      if (item.resource_id) {
        return GET_PLAN_PIC(item.resource_id);
      }
    });
    let res = await Promise.all(promise);
    this.removePlanPicCollection();
    // .then((res) => {
    this.imgs = [];
    res.forEach(item => {
      let resp = item.data;
      let extent = resp.extent
        ? resp.extent.split(",").map(e => parseFloat(e))
        : [];

      // ?????????gcj02????????? ????????????????????????gcj02?????????????????????
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
        minZoom: 10
      });
      let stati = img.getSource();
      // ???????????????????????????
      new loading(stati, extent, resp);
      img.set("id", resp.id);
      // ???????????????
      this.imgs.push(img);
      // ????????????-??????????????????????????????????????????????????????
      if (!ext.length) {
        ext = [...extent];
      } else {
        ext = extend(ext, [...extent]);
      }
    });

    this.imgs.forEach(item => {
      //   console.log(item)
      InitMap.map.addLayer(item);
    });

    return ext;
    // });
  };

  // ??????overlay????????????
  this.editZIndexOverlay = id => {
    let overlay = InitMap.map.getOverlayById(id);
    // console.log(overlay)
    if (!overlay) return;
    let className = "activeOverlayDefault";
    let activeOverlays = document.querySelectorAll("." + className);
    activeOverlays.forEach(item => {
      item.classList.remove(className);
    });

    let element = overlay.getElement();
    element.parentNode && element.parentNode.classList.add(className);
    setTimeout(() => {
      element.parentNode && (element.parentNode.style.visibility = "visible");
    }, 850);
    return element;
  };

  //   ?????????????????????overlay
  this.addOverlay = (coor, data) => {
    let isLoading = false;
    let ele = new CollectionOverlay({
      ...data,
      angleColor: "#fff",
      placement: "bottomCenter"
    });
    let overlay = createOverlay(ele.element, {
      positioning: "bottom-center",
      offset: [0, -25],
      id: data.id
    });
    InitMap.map.addOverlay(overlay);
    this.overlays.push(overlay);
    overlay.setPosition(coor);

    if (ele.audio) {
      ele.audio.addEventListener("play", e => {
        Event.Evt.firEvent("hasAudioStart", {
          ele: e.target,
          ...data
        });
      });
      ele.audio.addEventListener("pause", e => {
        // console.log(e,'pause')
      });
      ele.audio.ontimeupdate = e => {
        // console.log(e.target.currentTime)
      };
    }
    if (ele.video) {
      ele.video.onplay = e => {};
    }

    ele.on = {
      imgClick: ({ target, name }) => {
        if (isLoading) return;
        isLoading = true;
        message.success("?????????...", 0);
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
          let title = name || "??????";
          PhotoSwipe.show([{ w, h, src, title }]);
          // message.success('????????????');
        };
        img.onerror = () => {
          isLoading = false;
        };
      },
      preview: async val => {
        // console.log(val)
        let { target, resource_url, resource_id } = val;
        let ty = this.checkCollectionType(target);
        if (ty === "word") {
          if (target === "pdf") {
            // pdf???????????????
            window.open(resource_url, "_blank");
          } else {
            let data = await GET_DOWNLOAD_URL(resource_id);
            let message = data.message;
            window.open(message, "_blank");
          }
        }
      }
    };
  };

  //   ?????????????????????overlay
  this.removeLayer = (flag = 1) => {
    this.removeOverlay();
    this.removeFeatures();
    this.removeAreaSelect();
    this.removePlanPicCollection();
    if (this.animateLine) {
      this.animateLine.clear();
      this.animateLine = null;
    }
    // if (!flag) InitMap.map.removeLayer(this.Layer);
  };
  this.RemoveArea = async (id, board_id) => {
    return await DELETE_AREA(id, board_id);
  };
  this.editAreaName = async (id, data, board_id) => {
    return await EDIT_AREA_NAME(id, data, board_id);
  };

  // ????????????
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
      zIndex: 18
    });
    InitMap.map.addLayer(this.staticimg);
  };

  let removeSelect = () => {
    InitMap.map.removeInteraction(this.select);
    InitMap.map.removeInteraction(this.modify);
    this.stopDrawBox();
    InitMap.map.removeLayer(this.staticimg);
  };

  // ??????select?????????
  this.removeAreaSelect = () => {
    this.polygonOverlay && this.polygonOverlay.setPosition(null);
    InitMap.map.removeOverlay(this.polygonOverlay);
    InitMap.map.removeInteraction(this.areaSelect);
  };
  // ??????select?????????
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

  // ?????????????????????overlay
  this.addSelectOverlay = feature => {
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
        titleColor: fill
      });
      // ??????
      Fit(InitMap.view, coor, {
        padding: [200, 220, 80, 400]
      });

      this.polygonOverlay = createOverlay(ele.element, {
        offset: type === "Point" ? [10, 0] : [0, 0]
      });
      ele.on = {
        close: () => {
          this.areaSelect.dispatchEvent({ type: "select", selected: [] });
          // ????????????select?????????
          this.addAreaSelect();
        }
      };
      InitMap.map.addOverlay(this.polygonOverlay);
      this.polygonOverlay.setPosition(point);
    }
  };

  // ????????????
  this.setSelect = () => {
    this.modify = "";
    let snap = "";
    this.select = setSelectInteraction({ layers: [this.Layer] });

    this.modify = new Modify({
      features: this.select.getFeatures(),
      condition: always,
      insertVertexCondition: never
    });
    // snap = new Snap({features:this.select.getFeatures()});
    InitMap.map.addInteraction(this.modify);
    // InitMap.map.addInteraction(snap);
    InitMap.map.addInteraction(this.select);
    return { modify: this.modify, snap };
  };

  // ?????????????????????overlay
  this.hideCollectionOverlay = () => {
    if (!this.overlays.length) return;
    this.overlays.map(item => {
      item.set("oldPosition", item.getPosition());

      item.setPosition(null);
      return item;
    });
  };

  // ?????????????????????overlay
  this.showCollectionOverlay = () => {
    if (!this.overlays.length) return;
    this.overlays.map(item => {
      // console.log(item);
      let oldPosition = item.get("oldPosition");
      item.setPosition(oldPosition);
      return item;
    });
  };
  // ?????????????????????
  this.addPlanPictureDraw = (url, files, dispatch) => {
    // console.log(files);
    // ???????????????select?????????????????????
    this.removeAreaSelect();
    this.hideCollectionOverlay();
    return new Promise((resolve, reject) => {
      let globalurl = url,
        file = null;
      this.drawBox = drawBox(this.Source, {});
      this.drawBox.on("drawend", e => {
        this.boxFeature = e.feature;
        // console.log(e.feature.getGeometry().getCoordinates())
        let extent = this.boxFeature.getGeometry().getExtent();
        // ????????????????????????
        let ele = new settingsOverlay();
        let drawImgOpacity = ele.opacityValue;
        let overlay = createOverlay(ele.element);
        // ????????????????????????
        let center = getPoint(
          this.boxFeature.getGeometry().getExtent(),
          "topRight"
        );
        // ???????????????
        InitMap.map.addOverlay(overlay);
        // ???????????????
        overlay.setPosition(center);
        // ??????????????????
        InitMap.map.removeInteraction(this.drawBox);
        this.createImg(globalurl, extent, { opacity: drawImgOpacity });

        let { modify } = this.setSelect();

        modify.on("modifyend", e => {
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
          change: val => {
            // console.log(val)
            drawImgOpacity = val;
            this.staticimg && this.staticimg.setOpacity(val);
          },
          enter: val => {
            resolve({
              feature: this.boxFeature,
              ...val,
              extent: this.boxFeature.getGeometry().getExtent(),
              url: globalurl,
              blobFile: file
            });
            overlay.setPosition(null);
            InitMap.map.removeOverlay(overlay);
            removeSelect();
            this.addAreaSelect();
            this.showCollectionOverlay();
          },
          cancel: () => {
            // console.log('???????????????')
            reject({ message: "???????????????????????????" });
            overlay.setPosition(null);
            InitMap.map.removeOverlay(overlay);
            removeSelect();
            this.addAreaSelect();
            this.showCollectionOverlay();
          },
          editImg: async () => {
            // ?????????????????????????????????
            let center = getPoint(
              this.boxFeature.getGeometry().getExtent(),
              "center"
            );
            await animate({ center: center });
            // ????????????????????????
            this.staticimg && this.staticimg.setVisible(false);
            this.Source.removeFeature(e.feature);
            overlay.setPosition(null);
            // console.log('??????????????????');
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
                  pictureHeight: h
                }
              });

            // ??????????????????
            Event.Evt.on("ImgEditComplete", data => {
              globalurl = data.url;
              file = new File([data.blob], files.name, {
                type: files.type,
                lastModified: Date.now()
              });
              let tl = [data.extent[0], data.extent[1]];
              let rb = [data.extent[2], data.extent[3]];
              // ?????????????????????x,y ?????????x,y??????????????????,??????????????????
              let ctl = InitMap.map.getCoordinateFromPixel(tl);
              let crb = InitMap.map.getCoordinateFromPixel(rb);
              // console.log(ctl,crb);
              // ??????????????????????????????
              let ext = ctl.concat(crb);
              // ???????????????
              let tr = getPoint(ext, "topRight");

              // ??????????????????,??????source,???????????????
              let source = SourceStatic(data.url, ext);
              this.staticimg.setSource(source);
              this.staticimg.setVisible(true);
              // ????????????????????????
              this.staticimg.setOpacity(data.opacity);
              // ??????????????????????????????,????????????
              ele.setOpacity(data.opacity);
              // ????????????
              overlay.setPosition(tr);
              // ??????????????????
              let coordinates = getBoxCoordinates(ext);
              this.boxFeature.getGeometry().setCoordinates([coordinates]);
              this.Source.addFeature(this.boxFeature);
              // ??????????????????
              dispatch &&
                dispatch({
                  type: "editPicture/updateDatas",
                  payload: {
                    editShow: false
                  }
                });
            });
            // ?????????????????????
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
                    editShow: false
                  }
                });
            });
          }
        };
      });
      this.drawBox.on("drawabort", () => {
        reject({ code: -1, message: "????????????" });
      });
      InitMap.map.addInteraction(this.drawBox);
    });
  };
  this.clearListen = () => {
    this.changeFeatureTitleShowListener = () => {};
    if (this.repeatRequst) {
      clearTimeout(this.repeatRequst);
    }
  };
  this.addToListen = param => {
    clearTimeout(this.repeatRequst);
    this.repeatRequst = setTimeout(() => {
      this.addListenAjax(param);
      this.addToListen(param);
    }, requestTime);
  };
  // ??????????????????
  this.addListenAjax = async param => {
    let oldData = this.oldData;
    let res = await this.getCollectionList(param);
    let data = res.data;
    let arr = Different(oldData, data, "id");
    if (oldData.length > data.length) {
      // ???????????????????????????????????????????????????
      // console.log(arr,'??????');
      Event.Evt.firEvent("CollectionUpdate:remove", arr);
    }
    if (oldData.length < data.length) {
      // ??????????????????????????????????????????????????????
      // console.log(arr,'??????');
      Event.Evt.firEvent("CollectionUpdate:add", arr);
    }
    if (arr.length && oldData.length === data.length) {
      // ???????????????????????????????????????????????????????????????ID?????????????????????????????????????????????????????????
      // console.log(arr,'??????');
      Event.Evt.firEvent("CollectionUpdate:reload", data);
    }
    // ????????????????????????????????????????????????
    this.oldData = data;
  };

  // ??????????????????
  this.saveSortCollection = async data => {
    return await SORT_COLLECTION_DATA(data);
  };
  // ??????????????????
  this.saveMergeCollection = async data => {
    return await MERGE_COLLECTION(data);
  };
  // ??????????????????
  this.cancelMergeCollection = async data => {
    return await CANCEL_COLLECTION_MERGE(data);
  };

  // ??????????????????
  this.clearSelectPoint = () => {
    this.features = this.features.map(item => {
      // if(!uids.includes(item.ol_uid)){
      if (item.get("ftype") === "collection") {
        let style = item.getStyle();
        style.setZIndex(20);
        style.setImage(pointUnselect(item.get("multi")).getImage());
        item.setStyle(style);
      }
      return item;
      // }
    });
  };

  /**
   * ?????????????????????????????????
   * @param {Feature} feature
   */
  this.handleFeatureCollectionPoint = feature => {
    Event.Evt.firEvent("handleFeatureToLeftMenu", feature.get("id"));
    this.clearSelectPoint();
    if (feature) {
      let style = feature.getStyle();
      style.setImage(pointSelect(feature.get("multi")).getImage());
      style.setZIndex(50);
      feature.setStyle(style);
    }
  };
  this.getFeatureByPlotCoordinate = coor => {
    if (this.layer.showLayer) {
      let source = this.layer.showLayer.getSource();
      return source.getFeaturesAtCoordinate(coor);
    }
    return [];
  };
  this.getFeatureByCoordinate = coor => {
    coor = TransformCoordinate(coor);
    return this.Source.getFeaturesAtCoordinate(coor);
  };
  this.getFeatureById = id => {
    return this.features.find(item => item.get("id") === id);
  };
  // ????????????????????????
  this.handleCollectionPoint = data => {
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
        feature.forEach(item => {
          let fstyle = item.getStyle();
          fstyle.setZIndex(50);
          fstyle.setImage(pointSelect(item.get("multi")).getImage());
          item.setStyle(fstyle);
        });
      }
    }
  };
  // ???????????????????????????
  this.handleCollection = async val => {
    let { target, resource_url, title, resource_id } = val;
    let pointType = this.checkCollectionType(target);
    if (pointType === "word") {
      if (target === "pdf") {
        // pdf???????????????
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

  /**
   * ??????????????????????????????
   * @param duration ????????????
   * @param feature ?????????????????????
   * @param coordinates ??????????????????????????????????????????????????????
   * @param transform ???????????????????????????????????????EPSG:3857 - EPSG:4326
   * @param name ????????????
   */
  this.addAnimatePoint = ({
    duration = 2000,
    inOrOut = "out",
    feature,
    coordinates,
    transform = true,
    name
  }) => {
    if (!feature) {
      if (transform) {
        coordinates = TransformCoordinate(coordinates);
      }
      feature = addFeature("Point", { coordinates });
      let fstyle = createStyle("Point", {
        radius: 8,
        opacity: 1,
        fillColor: "rgba(254, 32, 66, 1)",
        strokeColor: "#ffffff",
        showName: true,
        text: name,
        textFillColor: "#ff0000",
        font: 14,
        textStrokeColor: "#ffffff",
        zIndex: 40
      });
      feature.setStyle(fstyle);
      this.Source.addFeature(feature);
    }
    let start = new Date().getTime();
    const animate = event => {
      let vectorContext = getVectorContext(event);
      let frameState = event.frameState;
      let flashGeom = feature.getGeometry().clone();
      let elapsed = frameState.time - start;
      let elapsedRatio = elapsed / duration;
      let radius = easeOut(elapsedRatio) * 25 + 5;
      let opacity = easeOut(1 - elapsedRatio);
      let style = new Style({
        image: new Circle({
          radius: radius,
          fill: new Fill({
            color: `rgba(75, 122, 255, ${opacity})`
          }),
          stroke: new Stroke({
            color: `rgba(75, 122, 255,${opacity})`,
            width: 0.25 + opacity
          })
        })
      });
      let s = feature.getStyle();
      s.getImage().setOpacity(opacity);
      feature.setStyle(s);
      vectorContext.setStyle(style);
      vectorContext.drawGeometry(flashGeom);
      if (elapsed > duration) {
        unByKey(listenerKey);
        this.Source.removeFeature(feature);
        InitMap.map.render();
        return;
      }
      InitMap.map.render();
    };
    let listenerKey = this.Layer.on("postrender", animate);
  };
  this.savePoint = val => {
    let { data = [], featureType, board_id } = val;
    if (data.length) {
      let p = [];
      data.forEach(item => {
        let feature = addFeature("Point", {
          coordinates: TransformCoordinate(item.coordinate),
          name: item.name
        });
        let style = createStyle("Point", {
          icon: {
            src: require("../../../assets/json/company3.png"),
            crossOrigin: "anonymous",
            anchor: [0.5, 0]
          }
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
            selectName: "??????",
            plotType: "point",
            strokeColor: "rgba(106, 154, 255, 1)",
            coordinates: feature.getGeometry().getCoordinates(),
            coordSysType: 0,
            geometryType: "Point",
            featureType
          })
        };
        p.push(this.addCollection(param));
      });
      Promise.all(p).then(res => {
        console.log(res, "???????????????");
      });
    }
  };

  this.searchByPosition = async ({ position, radius, type, pageIndex }) => {
    AboutAction.init(position);
    AboutAction.searchByPosition({ position, radius, type, pageIndex });
  };

  // this.renderSearchPoint = (data)=>{
  //   console.log(data);
  // }

  this.formatUnit = size => {
    if (size) {
      return size < 1000
        ? size.toFixed(2) + "???"
        : (size / 1000).toFixed(2) + "??????";
    }
    return null;
  };

  const updateRadius = (feature, radius) => {
    let f = this.formatUnit(radius);
    feature.getGeometry().setRadius(radius);
    let style = feature.getStyle();
    style.getText().setText(f);
  };

  const updateOverlayPosition = () => {
    let extent = this.searchAroundCircle.getGeometry().getExtent();
    let rightTop = getPoint(extent, "topRight");
    let rightBottom = getPoint(extent, "bottomRight");
    let point = [rightTop[0], (rightTop[1] + rightBottom[1]) / 2];
    // console.log(coor,coord,overlayElement);
    this.searchAroundOverlay.setPosition(point);
  };

  this.setSearchIndex = index => {
    this.searchPageIndex = index;
  };

  this.updateSearch = (id, type, index) => {
    let sFeature = this.features.find(item => item.get("id") === id);
    let coordinates = [];
    if (sFeature) {
      coordinates = sFeature.getGeometry().getCoordinates();
    }
    this.searchByPosition({
      position: coordinates,
      radius: this.circleRadius,
      type: type,
      pageIndex: index
    });
  };
  // ??????????????????
  this.addSearchAround = ({ id, feature, stype = "???????????????" }) => {
    let sFeature = null;
    if (id) {
      sFeature = this.features.find(item => item.get("id") === id);
    } else if (feature) {
      sFeature = feature;
    } else return false;
    if (sFeature) {
      let geometry = sFeature.getGeometry();
      let type = geometry.getType();
      if (type === "Point") {
        let defaultRadius = 8 * 1000;
        this.circleRadius = defaultRadius;
        let coordinates = geometry.getCoordinates();
        let f = addFeature("defaultCircle", {
          coordinates,
          radius: defaultRadius
        });
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
        });
        f.setStyle(style);
        this.searchAroundCircle = f;
        this.Source.addFeature(this.searchAroundCircle);
        let ele = new DragCircleRadius({
          format: this.formatUnit(defaultRadius)
        });
        this.searchAroundOverlay = createOverlay(ele.element, {
          offset: [-20, 0]
        });
        // ??????????????????
        this.searchByPosition({
          position: coordinates,
          radius: defaultRadius,
          type: stype,
          pageIndex: this.searchPageIndex
        });
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
            if (radius <= 5 * 100 || radius > 50000) {
              return;
            }
            this.circleRadius = radius;
            this.searchAroundOverlay.setPosition(coord);
            let text = this.formatUnit(radius);
            ele.updateRadius(text);
            updateRadius(f, radius);
          },
          mouseUp: async () => {
            this.searchByPosition({
              position: coordinates,
              radius,
              type: stype,
              pageIndex: this.searchPageIndex
            });
            Fit(InitMap.view, f.getGeometry().getExtent(), { duration: 300 });
          },
          change: text => {
            let t = +text;
            radius = t;
            this.circleRadius = radius;
            updateRadius(f, t);
            ele.updateRadius(this.formatUnit(t));
            updateOverlayPosition(this.searchAroundOverlay, f);
            Fit(InitMap.view, f.getGeometry().getExtent(), { duration: 300 });
            this.searchByPosition({
              position: coordinates,
              radius: t,
              type: stype,
              pageIndex: this.searchPageIndex
            });
          }
        };
      } else {
        message.warn("???????????????????????????????????????");
        return false;
      }

      Fit(InitMap.view, this.searchAroundCircle.getGeometry().getExtent(), {
        size: InitMap.map.getSize(),
        padding: fitPadding,
        duration: 300
      });
      return true;
    }
  };
  this.cancelSearchAround = () => {
    if (!this.searchAroundCircle) return;
    if (this.Source.getFeatureByUid(this.searchAroundCircle.ol_uid)) {
      this.Source.removeFeature(this.searchAroundCircle);
      AboutAction.clearLine();
    }
    InitMap.map.removeOverlay(this.searchAroundOverlay);
  };

  let driving = new AMap.Driving({
    policy: AMap.DrivingPolicy.LEAST_TIME
  });
  this.searchCache = {};
  // ??????????????????????????????
  this.searchByDrive = (from, to) => {
    return new Promise((resolve, reject) => {
      let key = from.join("_") + "/" + to.join("_");
      if (this.searchCache[key]) {
        resolve(this.searchCache[key]);
        return;
      } else
        driving.search(from, to, (status, result) => {
          resolve(result);
          this.searchCache[key] = result;
        });
    }).catch(err => {
      reject(err);
    });
  };
  /**
   * ??????????????????
   * @param data ??????????????????????????? Object -> collection
   */
  this.startAnimateForFeatures = data => {
    // console.log(data)
    // this.projectData ?????????????????????????????????????????? EPSG: 4326 ????????????????????? EPSG: 3857
    try {
      let features = data.features;
      let from = { ...this.projectData };
      let arr = [];
      (async () => {
        for (let i = 0; i < features.length; i++) {
          let item = features[i];
          // if(item.type !== 'Point')
          let geometry = item.geometry;
          let coordinates = geometry.coordinates;
          if (geometry.type !== "Point") return;
          // ????????????????????????????????????????????????????????????????????????
          if (+coordinates[0] > 180)
            coordinates = TransformCoordinate(
              coordinates,
              "EPSG:3857",
              "EPSG:4326"
            );
          if (+from.coordinates[0] > 180) {
            from.coordinates = TransformCoordinate(
              from.coordinates,
              "EPSG:3857",
              "EPSG:4326"
            );
          }
          let res = await this.searchByDrive(
            from.coordinates,
            coordinates
          ).catch(err => console.log(err));
          nProgress.inc(0.05);
          let toArray = this.transformAMapDataFromRoad(res);
          let obj = {
            from,
            to: toArray,
            distance: res.routes[0].distance,
            time: res.routes[0].time,
            properties: item.properties
          };
          arr.push(obj);
        }
        this.renderDriveLines(arr);
      })();
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * ??????????????????????????????
   */
  this.transformAMapDataFromRoad = data => {
    let key = InitMap.baseMapKey;
    let dic = InitMap.systemDic[key];
    let flag = InitMap.checkNowIsGcj02System(key);
    // let needChange = InitMap.checkUpdateMapSystem(key)
    let arr = [];
    if (data.routes && data.routes[0]) {
      let road = data.routes[0];
      let steps = road.steps;
      steps.forEach(step => {
        arr = arr.concat(
          step.path.map(s =>
            TransformCoordinate(!flag ? dic(s.lng, s.lat) : [s.lng, s.lat])
          )
        );
      });
    }
    return arr;
  };

  // ??????
  this.animateLine = null;
  // ??????????????????
  this.renderDriveLines = data => {
    if (!this.animateLine) {
      this.animateLine = new AnimateLine({
        startPoint: { ...this.projectData },
        showStartPoint: true
      });
      this.animateLine.renderEnd = () => {
        nProgress.done();
      };
    }
    data.forEach(item => {
      this.animateLine.addLine({ ...item, context: this.Source });
    });
  };
}

let action = new Action();

export default action;
