import config from "../../../services/scouting";
import InitMap from "../../../utils/INITMAP";
import {
  project,
  addProjectOverlay,
  DragCircleRadius,
} from "../../../components/PublicOverlays/index";
import { setSession, getSession } from "../../../utils/sessionManage";
import event from "../../utils/event";
import {
  Layer,
  Source,
  TransformCoordinate,
  addFeature,
  createStyle,
  Fit,
  createOverlay,
  drawPoint,
  drawCircle,
  getPoint,
} from "../../utils";

import { gcj02_to_wgs84, wgs84_to_gcj02 } from "utils/transCoordinateSystem";
import { getSessionOrgId } from "../../../utils/sessionData";

const action = function () {
  const {
    GET_SCOUTING_LIST,
    REMOVE_BOARD,
    EDIT_BOARD_NAME,
    ADD_BOARD,
  } = config;

  this.overlays = [];
  this.draw = null;
  this.addProjectFeature = {};
  this.addProjectCircleFeature = null;
  this.addProjectOverlay = {};
  this.sesstionSaveKey = "ScoutingItemId";
  this.projects = [];
  this.baseMapKeys = ["gd_vec|gd_img|gg_img", "td_vec|td_img|td_ter"];
  this.systemDic = {
    gd_vec: wgs84_to_gcj02,
    gd_img: wgs84_to_gcj02,
    gg_img: wgs84_to_gcj02,
    td_vec: gcj02_to_wgs84,
    td_img: gcj02_to_wgs84,
    td_ter: gcj02_to_wgs84,
  };
  this.projectExtentFeature = null;
  this.currentData = null;
  this.defaultRadius = null;
  this.circleRadius = null;
  this.projectExtentOverlay = null;
  this.addProjecStyle = createStyle("Point", {
    iconUrl: require("../../../assets/addPointLocation.png"),
    icon: { anchorOrigin: "bottom-left", anchor: [0.5, 0.25] },
  });
  this.mounted = false;

  event.Evt.on("transCoordinateSystems2ScoutingList", (key) => {
    if (!this.mounted) return;
    this.lastBaseMap = this.currentBaseMap;
    this.currentBaseMap = key;
    this.renderProjectPoint(this.currentData);
  });

  this.transCoordinateSystemsByChangeBaseMap = (key) => {
    let lastIndex = this.baseMapKeys[0].indexOf(InitMap.lastBaseMapKey);
    let currentIndex = this.baseMapKeys[0].indexOf(InitMap.baseMapKey);
    if (
      (lastIndex >= 0 && currentIndex >= 0) ||
      (lastIndex === -1 && currentIndex === -1)
    ) {
      return;
    } else {
      let features = this.Source.getFeatures();
      let newFeatures = [];
      features.forEach((feature) => {
        let newFeature = feature.clone();
        let coords = newFeature.getGeometry().getCoordinates();
        let tmp = TransformCoordinate(coords, "EPSG:3857", "EPSG:4326");
        tmp = this.systemDic[this.currentBaseMap](tmp[0], tmp[1]);
        coords = TransformCoordinate(tmp, "EPSG:4326", "EPSG:3857");
        newFeature.getGeometry().setCoordinates(coords);
        newFeatures.push(newFeature);
      });
      this.Source.clear();
      newFeatures.forEach((feature) => {
        this.Source.addFeature(feature);
      });
    }
  };

  this.init = async (dispatch) => {
    this.dispatch = dispatch;
    this.mounted = true;
    const layers = InitMap.map.getLayers().getArray();
    const layer = layers.filter((layer) => {
      return layer.get("id") === "project_point_layer";
    });
    if (!layer[0]) {
      this.Layer = Layer({ id: "project_point_layer", zIndex: 11 });
      this.Source = Source();
      this.Layer.setSource(this.Source);
      InitMap.map.addLayer(this.Layer);
    }

    // let el = new addFeaturesOverlay({dataSource:[{text:"123",key:"1"},{text:'????????????2',key:'2'}],activeKey:"2",width:300},'group')
    // InitMap.map.addOverlay(createOverlay(el.element,{
    //   positioning:"bottom-left",
    //   position: InitMap.view.getCenter()
    // }))
    return InitMap.map;
  };

  // ??????????????????
  this.getList = async (data = {}) => {
    let id = getSessionOrgId();
    let obj = await GET_SCOUTING_LIST(id, data);
    this.projects = obj.data;
    return obj;
  };
  //
  this.clearOverlay = () => {
    this.overlays.forEach((item) => {
      item.setPosition(null);
      InitMap.map.removeOverlay(item);
    });
    this.overlays = [];
  };

  // ????????????
  this.hideOverlay = () => {
    this.overlays = this.overlays.map((item) => {
      let oldpage = item.getPosition();
      item.set("oldposition", oldpage);
      item.setPosition(null);
      return item;
    });
  };
  // ????????????
  this.showOverlay = () => {
    this.overlays = this.overlays.map((item) => {
      let oldposition = item.get("oldposition");
      item.setPosition(oldposition);
      return item;
    });
  };

  this.getCoords = (x, y, coordSysType) => {
    let baseMapKey = InitMap.baseMapKey;
    // gcj02(??????)?????????
    if (this.baseMapKeys[0].indexOf(baseMapKey) > -1) {
      // ????????????wgs84???????????????
      if (coordSysType === 1) {
        return TransformCoordinate(wgs84_to_gcj02(x, y));
      }
      return TransformCoordinate([x, y]);
    } else {
      // wgs84(?????????)?????????
      // ????????????gcj02???????????????
      if (!coordSysType) {
        return TransformCoordinate(gcj02_to_wgs84(x, y));
      } else if (coordSysType === 1) {
        return TransformCoordinate([x, y]);
      } else {
        return null;
      }
    }
  };

  this.renderProjectPoint = (data) => {
    let lastBaseMapKey = InitMap.lastBaseMapKey;
    let baseMapKey = InitMap.baseMapKey;
    if (
      lastBaseMapKey &&
      baseMapKey &&
      this.baseMapKeys[0].indexOf(lastBaseMapKey) ===
        this.baseMapKeys[0].indexOf(baseMapKey)
    ) {
      return;
    }
    this.currentData = JSON.parse(JSON.stringify(data));
    this.Source && this.Source.clear();
    this.clearOverlay();

    data &&
      data.forEach((item) => {
        let styleOption = {
          text: item.board_name,
          type: "Point",
          iconUrl: require("../../../assets/Location-1.png"),
          coordinates: this.getCoords(
            item.coordinate_x,
            item.coordinate_y,
            Number(item.coord_sys_type || 0)
          ),
        };
        if (!styleOption.coordinates) return;
        // ??????point
        let feature = addFeature(styleOption.type, {
          coordinates: styleOption.coordinates,
        });
        feature.setStyle(createStyle(styleOption.type, styleOption));
        this.addOverlay(styleOption, item);
        this.Source.addFeature(feature);
      });
    // ????????????
    data &&
      !!data.length &&
      setTimeout(() => {
        if (this.Source) this.fitToCenter();
      }, 500);
  };

  this.fitToCenter = () => {
    window.lxMap = InitMap;
    let { getUrlParam } = config;
    let size = InitMap.map.getSize();
    let flag = getUrlParam.isMobile === "1";
    let obj = {
      size: flag ? size.map((item) => item / 2) : size,
      padding: !flag ? [200, 150, 80, 400] : [0, 0, 0, 0],
      nearest: true,
    };
    Fit(InitMap.view, this.Source.getExtent(), obj);
  };
  // ??????overlay
  this.addOverlay = (data = {}, source) => {
    let ele = new project({ ...data, zIndex: 25 });
    // console.log(overlay)
    let overlay = createOverlay(ele.element, { offset: [0, -53] });

    ele.on = {
      click: (e) => {
        // console.log(data)
        // ??????????????????
        this.firEvent("projectClick", source);
      },
    };
    InitMap.map.addOverlay(overlay);
    this.overlays.push(overlay);
    overlay.setPosition(data.coordinates);
  };

  // ????????????
  this.removeBoard = async (id) => {
    return await REMOVE_BOARD(id, {});
  };

  // ??????????????????
  this.editBoard = async (id, data) => {
    return await EDIT_BOARD_NAME(id, data);
  };

  // ???????????????????????????
  this.addBoardOverlay = (position, data = {}) => {
    return new Promise((resolve, reject) => {
      let ele = new addProjectOverlay({
        title: "??????????????????",
        width: 300,
        style: { zIndex: 20 },
        placement: "bottomLeft",
        angleColor: "#fff",
      });
      let overlay = createOverlay(ele.element, {
        positioning: "bottom-left",
        offset: [-10, -38],
      });
      this.addProjectOverlay = overlay;
      InitMap.map.addOverlay(overlay);
      overlay.setPosition(position);
      data.viewToCenter &&
        InitMap.view.animate({
          center: position,
          zoom: InitMap.view.getZoom(),
          duration: 500,
        });

      ele.on = {
        sure: (val) => {
          overlay.setPosition(null);
          InitMap.map.removeOverlay(overlay);
          resolve(val);
        },
        cancel: () => {
          overlay.setPosition(null);
          InitMap.map.removeOverlay(overlay);
          reject({ code: "-1" });
        },
      };
    });
  };

  // ??????????????????????????????
  this.removeDraw = () => {
    InitMap.map.removeInteraction(this.draw);
    InitMap.map.removeOverlay(this.addProjectOverlay);
    if (
      this.Source &&
      this.Source.getFeatureByUid(this.addProjectFeature.ol_uid)
    ) {
      this.Source.removeFeature(this.addProjectFeature);
      this.Source.removeFeature(this.addProjectCircleFeature);
    }
  };

  // ?????????????????????
  this.addDrawBoard = () => {
    return new Promise((resolve, reject) => {
      this.draw = drawPoint(this.Source, { style: this.addProjecStyle });
      this.draw.on("drawend", (evt) => {
        let { feature } = evt;
        feature.setStyle(this.addProjecStyle);
        this.addProjectFeature = feature;
        InitMap.map.removeInteraction(this.draw);
        resolve(evt, this);
      });
      this.draw.on("drawabort", (e) => {
        reject(e);
      });
      InitMap.map.addInteraction(this.draw);
    });
  };
  // ????????????
  this.addBoard = async (data) => {
    let coor = TransformCoordinate(
      [data.lng, data.lat],
      "EPSG:3857",
      "EPSG:4326"
    );

    data.lng = coor[0];
    data.lat = coor[1];
    data.coord_sys_type = 0;
    let resData = await window.CallWebMapFunction("getCityByLonLat", {
      lon: coor[0],
      lat: coor[1],
    });
    if (resData) {
      data.districtcode = resData.addressComponent?.adcode;
    }
    if (this.baseMapKeys[1].indexOf(InitMap.baseMapKey) > -1) {
      data.coord_sys_type = 1;
    }
    return await ADD_BOARD(data);
  };

  // ??????????????????
  this.handleClickBoard = (data) => {
    // ???????????????????????????
    setSession(this.sesstionSaveKey, data.board_id);
    this.dispatch &&
      this.dispatch({
        type: "permission/updateDatas",
        payload: {
          projectId: data.board_id,
        },
      });
    try {
      if (window.parent) {
        window.parent.postMessage("map_board_change_" + data.board_id, "*");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ???????????????????????????
  this.getCacheId = async () => {
    return await getSession(this.sesstionSaveKey);
  };

  let getItemData = (data, id) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].board_id == id) {
        return data[i];
      }
    }
  };
  // ??????????????????????????????
  this.checkItem = () => {
    return new Promise((resolve, reject) => {
      this.getCacheId().then(({ data }) => {
        if (!data) {
          reject({ code: -1, message: "?????????", data: null });
        } else {
          if (this.projects.length) {
            let obj = getItemData(this.projects, data);
            obj
              ? resolve({ code: 0, message: "????????????", data: obj })
              : resolve({ code: -1, data, message: "???????????????" });
          } else
            this.getList()
              .then((res) => {
                let obj = getItemData(res.data, data);
                obj
                  ? resolve({ code: 0, message: "????????????", data: obj })
                  : resolve({ code: -1, data, message: "???????????????" });
              })
              .catch((err) => {
                reject({ code: -1, data });
              });
        }
      });
    });
  };

  // ????????????
  this.clear = () => {
    if (this.Source) {
      this.Source.clear();
      this.clearOverlay();
      this.removeDraw();
      this.removeFeatureAndOvelay();
    }
  };
  this.addBoardRadius = () => {
    return new Promise((resolve) => {
      this.draw = drawCircle(this.Source);
      this.draw.on("drawend", (e) => {
        InitMap.map.removeInteraction(this.draw);
        let feature = e.feature;
        let center = feature.getGeometry().getCenter();
        let centerFeature = addFeature("Point", { coordinates: center });
        centerFeature.setStyle(this.addProjecStyle);
        this.Source.addFeature(centerFeature);
        this.addProjectFeature = centerFeature;
        this.addProjectCircleFeature = feature;
        resolve(feature);
      });
      InitMap.map.addInteraction(this.draw);
    });
  };

  this.formatUnit = (size) => {
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
    let extent = this.projectExtentFeature.getGeometry().getExtent();
    let rightTop = getPoint(extent, "topRight");
    let rightBottom = getPoint(extent, "bottomRight");
    let point = [rightTop[0], (rightTop[1] + rightBottom[1]) / 2];
    // console.log(coor,coord,overlayElement);
    this.projectExtentOverlay.setPosition(point);
  };

  this.removeFeatureAndOvelay = () => {
    this.projectExtentFeature &&
      this.Source.removeFeature(this.projectExtentFeature);
    this.projectExtentFeature = null;
    this.projectExtentOverlay &&
      InitMap.map.removeOverlay(this.projectExtentOverlay);
    this.projectExtentOverlay = null;
  };

  // ??????????????????
  this.addProjectExtent = (data) => {
    this.defaultRadius = Number(data.radius);
    let coordinates = TransformCoordinate([
      +data.coordinate_x,
      +data.coordinate_y,
    ]);
    this.projectExtentFeature = addFeature("defaultCircle", {
      coordinates: coordinates,
      radius: this.defaultRadius,
    });
    let style = createStyle("Circle", {
      fillColor: "rgba(193, 232, 255, 0.3)",
      strokeColor: "rgba(99, 199, 255, 0.5)",
      strokeWidth: 2,
      radius: this.defaultRadius,
      showName: false,
      offsetY: 0,
      textFillColor: "#ff0000",
      textStrokeColor: "#ffffff",
      textStrokeWidth: 2,
    });
    this.projectExtentFeature.setStyle(style);
    this.Source.addFeature(this.projectExtentFeature);
    Fit(InitMap.view, this.projectExtentFeature.getGeometry().getExtent());
    let ele = new DragCircleRadius({
      format: this.formatUnit(this.defaultRadius),
    });
    this.projectExtentOverlay = createOverlay(ele.element, {
      offset: [-20, 0],
    });
    InitMap.map.addOverlay(this.projectExtentOverlay);
    updateOverlayPosition();
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
        this.circleRadius = radius;
        this.projectExtentOverlay.setPosition(coord);
        let text = this.formatUnit(radius);
        ele.updateRadius(text);
        updateRadius(this.projectExtentFeature, radius);
      },
      mouseUp: async () => {
        Fit(InitMap.view, this.projectExtentFeature.getGeometry().getExtent(), {
          duration: 300,
        });
        config.EDIT_BOARD_NAME(data.board_id, { radius: this.circleRadius });
      },
      change: (text) => {
        let t = +text;
        radius = t;
        this.circleRadius = radius;
        updateRadius(this.projectExtentFeature, t);
        ele.updateRadius(this.formatUnit(t));
        updateOverlayPosition(
          this.projectExtentOverlay,
          this.projectExtentFeature
        );
        Fit(InitMap.view, this.projectExtentFeature.getGeometry().getExtent(), {
          duration: 300,
        });
      },
    };
  };
};
action.prototype.on = event.Evt.on;
action.prototype.firEvent = event.Evt.firEvent;

const exportAction = new action();
// exportAction.prototype.on = new event();

export default exportAction;
