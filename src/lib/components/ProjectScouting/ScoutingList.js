import config from "../../../services/scouting";
import InitMap from "../../../utils/INITMAP";
import {
  project,
  addProjectOverlay,
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
} from "../../utils";

import { gcj02_to_wgs84, wgs84_to_gcj02 } from "utils/transCoordinateSystem";

// import addFeaturesOverlay from '../../../components/PublicOverlays/addFeaturesOverlay'

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
  this.currentData = null;
  this.addProjecStyle = createStyle("Point", {
    iconUrl: require("../../../assets/addPointLocation.png"),
    icon: { anchorOrigin: "bottom-left", anchor: [0.5, 0.25] },
  });

  event.Evt.on("transCoordinateSystems2ScoutingList", (key) => {
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

  this.init = async () => {
    this.Layer = Layer({ id: "project_point_layer", zIndex: 11 });
    this.Source = Source();
    this.Layer.setSource(this.Source);
    const layers = InitMap.map.getLayers().getArray();
    const layer = layers.filter((layer) => {
      return layer.get("id") === this.Layer.get("id");
    });
    if (!layer[0]) InitMap.map.addLayer(this.Layer);
    // let el = new addFeaturesOverlay({dataSource:[{text:"123",key:"1"},{text:'测试项目2',key:'2'}],activeKey:"2",width:300},'group')
    // InitMap.map.addOverlay(createOverlay(el.element,{
    //   positioning:"bottom-left",
    //   position: InitMap.view.getCenter()
    // }))
    return InitMap.map;
  };
  // 获取项目列表
  this.getList = async (data = {}) => {
    let id = config.getUrlParam.orgId;
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

  // 隐藏气泡
  this.hideOverlay = () => {
    this.overlays = this.overlays.map((item) => {
      let oldpage = item.getPosition();
      item.set("oldposition", oldpage);
      item.setPosition(null);
      return item;
    });
  };
  // 显示气泡
  this.showOverlay = () => {
    this.overlays = this.overlays.map((item) => {
      let oldposition = item.get("oldposition");
      item.setPosition(oldposition);
      return item;
    });
  };

  this.getCoords = (x, y, coordSysType) => {
    let baseMapKey = InitMap.baseMapKey;
      // gcj02(高德)坐标系
      if (this.baseMapKeys[0].indexOf(baseMapKey) > -1) {
        // 数据是在wgs84坐标系产生
        if (coordSysType === 1) {
          return TransformCoordinate(wgs84_to_gcj02(x, y));
        }
        return TransformCoordinate([x, y]);
      } else {
        // wgs84(天地图)坐标系
        // 数据是在gcj02坐标系产生
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
        // 创建point
        let feature = addFeature(styleOption.type, {
          coordinates: styleOption.coordinates,
        });
        feature.setStyle(createStyle(styleOption.type, styleOption));
        this.addOverlay(styleOption, item);
        this.Source.addFeature(feature);
      });
    // 视图位移
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
  // 添加overlay
  this.addOverlay = (data = {}, source) => {
    let ele = new project({ ...data, zIndex: 25 });
    // console.log(overlay)
    let overlay = createOverlay(ele.element, { offset: [0, -53] });

    ele.on = {
      click: (e) => {
        // console.log(data)
        // 触发外部更新
        this.firEvent("projectClick", source);
      },
    };
    InitMap.map.addOverlay(overlay);
    this.overlays.push(overlay);
    overlay.setPosition(data.coordinates);
  };

  // 删除项目
  this.removeBoard = async (id) => {
    return await REMOVE_BOARD(id, {});
  };

  // 修改项目名称
  this.editBoard = async (id, data) => {
    return await EDIT_BOARD_NAME(id, data);
  };

  // 添加新增项目的弹窗
  this.addBoardOverlay = (position, data = {}) => {
    return new Promise((resolve, reject) => {
      let ele = new addProjectOverlay({
        title: "新建踏勘计划",
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

  // 退出了添加项目的交互
  this.removeDraw = () => {
    InitMap.map.removeInteraction(this.draw);
    InitMap.map.removeOverlay(this.addProjectOverlay);
    if (
      this.Source &&
      this.Source.getFeatureByUid(this.addProjectFeature.ol_uid)
    ) {
      this.Source.removeFeature(this.addProjectFeature);
    }
  };

  // 添加项目的交互
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
  // 添加项目
  this.addBoard = async (data) => {
    let coor = TransformCoordinate(
      [data.lng, data.lat],
      "EPSG:3857",
      "EPSG:4326"
    );

    data.lng = coor[0];
    data.lat = coor[1];
    data.coord_sys_type = 0;
    if (this.baseMapKeys[1].indexOf(InitMap.baseMapKey) > -1) {
      data.coord_sys_type = 1;
    }
    return await ADD_BOARD(data);
  };

  // 进入项目详情
  this.handleClickBoard = (data) => {
    // 保存选中数据到本地
    setSession(this.sesstionSaveKey, data.board_id);
    try {
      if (window.parent) {
        window.parent.postMessage("map_board_change_" + data.board_id, "*");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 获取保存的本地缓存
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
  // 检查是不是有缓存数据
  this.checkItem = () => {
    return new Promise((resolve, reject) => {
      this.getCacheId().then(({ data }) => {
        if (!data) {
          reject({ code: -1, message: "无缓存", data: null });
        } else {
          if (this.projects.length) {
            let obj = getItemData(this.projects, data);
            obj
              ? resolve({ code: 0, message: "获取完成", data: obj })
              : resolve({ code: -1, data, message: "数据不存在" });
          } else
            this.getList()
              .then((res) => {
                let obj = getItemData(res.data, data);
                obj
                  ? resolve({ code: 0, message: "获取完成", data: obj })
                  : resolve({ code: -1, data, message: "数据不存在" });
              })
              .catch((err) => {
                reject({ code: -1, data });
              });
        }
      });
    });
  };

  // 清除图层
  this.clear = () => {
    if (this.Source) {
      this.Source.clear();
      this.clearOverlay();
      this.removeDraw();
    }
  };
};
action.prototype.on = event.Evt.on;
action.prototype.firEvent = event.Evt.firEvent;

const exportAction = new action();
// exportAction.prototype.on = new event();

export default exportAction;
