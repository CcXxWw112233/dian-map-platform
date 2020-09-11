// import initMap from './INITMAP'
import { getMyPosition } from "../getMyPosition";
import {
  TransformCoordinate,
  Source,
  Layer,
  addFeature,
  createStyle,
} from "../../lib/utils/index";
import axios from "axios";
import { baseConfig } from "../../globalSet/config";
// import { draw } from "utils/draw";
import scoutingProjectAction from "../../lib/components/ProjectScouting/ScoutingList";
import DetailAction from "../../lib/components/ProjectScouting/ScoutingDetail";
import lib from "./drawForMap";
import { setLocal } from "../sessionManage";
import Event from "../../lib/utils/event";
import { reject } from "lodash";
const { Evt } = Event;

// 获取地图和视图
const _getMap = (key) => {
  const initMap = require("../INITMAP").default;
  if (key) return initMap[key] || {};
  else {
    return initMap || {};
  }
};

const protocol = window.location.protocol;

// 全局的针对Flutter APP进行交互的方法
const CallWebFunction = (function_name, message, msgType = "objct") => {
  // 需要有调用方法
  if (!function_name) {
    return JSON.stringify({
      code: -1,
      message: "The method name to be called was not passed in",
    });
  }
  // 需要确保传入的是可识别的数据--object
  if (message && msgType === "objectStr") {
    message = JSON.parse(message);
  }

  // 调用方法
  if (callFunctions[function_name]) {
    return callFunctions[function_name].call(this, message);
  }
};

let timer = null;
const MapMoveSearch = function () {
  // console.log(e)
  clearTimeout(timer);
  // 只取最后一次的移动操作，防止过度请求。
  timer = setTimeout(() => {
    let center = CallWebFunction("getCenter");
    CallWebFunction("SearchForPoint", {
      position: TransformCoordinate(center, "EPSG:3857", "EPSG:4326"),
    });
  }, 1000);
};

Evt.addEventListener("handleGroupCollectionFeature", (data) => {
  // 安卓
  if (window.mapAndroid) {
    window.mapAndroid.getPoint && window.mapAndroid.getPoint({ data });
  }
  // ios
  if (window.webkit) {
    window.webkit.messageHandlers &&
      window.webkit.messageHandlers.viewCollectionDetails &&
      window.webkit.messageHandlers.viewCollectionDetails.postMessage &&
      window.webkit.messageHandlers.viewCollectionDetails.postMessage({ data });
  }
});

Evt.addEventListener("handleGroupFeature", (id) => {
  // 安卓
  if (window.mapAndroid) {
    window.mapAndroid.getPoint && window.mapAndroid.getPoint({ id });
  }
  // ios
  if (window.webkit) {
    window.webkit.messageHandlers &&
      window.webkit.messageHandlers.viewCollectionGroup &&
      window.webkit.messageHandlers.viewCollectionGroup.postMessage &&
      window.webkit.messageHandlers.viewCollectionGroup.postMessage({ id });
  }
});

// 所有暴露在外面的方法
let callFunctions = {
  lineMsg: [],
  line: null,
  source: Source(),
  layer: Layer({ id: "flutter_layer", zIndex: 11 }),
  Init: () => {
    let map = _getMap("map");
    callFunctions.layer.setSource(callFunctions.source);
    map.addLayer(callFunctions.layer);
    lib.Source = callFunctions.source;
  },
  isMounted: false,
  // 设置视图中心点
  setViewCenter: (val) => {
    let view = _getMap("view");
    view.animate({
      zoom: view.getZoom(),
      center: (val && TransformCoordinate(val)) || [
        12682417.401133642,
        2573911.8265894186,
      ],
    });
    return view.getCenter();
  },
  // 获取视图中心点
  getCenter: () => {
    let view = _getMap("view");
    return view.getCenter();
  },
  // 添加图层
  addLayer: () => {
    if (!callFunctions.isMounted) {
      callFunctions.Init();
      callFunctions.isMounted = true;
    }
  },
  // 开始记录
  startRecord: ({ coordinates, time }) => {
    let coor = TransformCoordinate(coordinates);
    // 如果没加载图层，则加载图层
    callFunctions.addLayer();
    // 如果没有加载线段，则加载线段
    if (!callFunctions.line) {
      console.log("构建初始点");
      let style = createStyle("LineString", {
        strokeWidth: 3,
      });
      callFunctions.line = addFeature("LineString", {
        coordinates: [coor],
        style: style,
      });
      callFunctions.source.addFeature(callFunctions.line);
    } else {
      // 添加线段的点
      console.log("记录更新的点...");
      callFunctions.line.getGeometry().appendCoordinate(coor);
    }
    callFunctions.lineMsg.push({ coordinates: coordinates, time });
  },
  // 停止记录
  stopRecord: ({ isRemoveLayer = false, coordinates, time }) => {
    if (!callFunctions.line) return console.log("没有线段记录");

    if (coordinates) callFunctions.lineMsg.push({ coordinates, time });

    callFunctions.lineMsg = callFunctions.lineMsg.map((item) => {
      let obj = {
        location: {
          longitude: item.coordinates[0] + "",
          latitude: item.coordinates[1] + "",
          site_name: "",
        },
        time: item.time + "",
      };
      return obj;
    });

    let string = JSON.stringify(callFunctions.lineMsg);
    console.log("获取到了数据");
    if (!isRemoveLayer) {
      console.log("获取数据保存");
      // let color = style.getStroke().getColor();
      callFunctions.lineMsg = [];
      window.stopRecord && window.stopRecord.postMessage(string);
      return string;
    }
    console.log("清除页面中画的线，停止");

    callFunctions.source.removeFeature(callFunctions.line);
    callFunctions.line = null;
    window.stopRecord && window.stopRecord.postMessage(string);
    return string;
    // callFunctions.isMounted = false;
  },

  // 设置定位位置
  setMapLocation: (val) => {
    let coor = [+val.longitude, +val.latitude];
    // 绘制定位信息
    // 如果已经展示了定位信息之后就只改变position
    if (getMyPosition.positionCircle || getMyPosition.positionIcon) {
      getMyPosition.setPosition(coor);
    } else {
      // 没有绘制就进行绘制，并设置样式
      getMyPosition.drawPosition({
        isMove: val.isMove === undefined ? true : val.isMove,
        ...val,
      });
    }
  },
  // 切换底图
  ChangeBaseMap: (key) => {
    if (!key) return;
    const initMap = require("../INITMAP").default;
    initMap.changeBaseMap(key);
    setLocal("baseMapKey", key);
  },
  // 监听地图移动
  StartMove: () => {
    let map = _getMap("map");
    map.on("moveend", MapMoveSearch);
  },
  // 停止监听地图拖动
  StopSearch: () => {
    let map = _getMap("map");
    map.un("moveend", MapMoveSearch);
  },
  // 搜索地址
  getAddressPublicFunction: ({
    address = "",
    offset = 1,
    fromCity = "",
    types,
    page = 1,
  }) => {
    return new Promise((resolve, reject) => {
      let url = protocol + "//restapi.amap.com/v3/place/text";
      let params = {
        key: baseConfig.GAODE_SERVER_APP_KEY,
        keywords: address,
        offset: offset || 1,
        city: fromCity,
        extensions: "base",
        types: types,
        page,
      };
      axios
        .get(url, { params })
        .then((res) => {
          // console.log(res)
          if (res.status === 200) {
            let data = res.data;
            if (data.info === "OK") {
              if (offset === 1) {
                resolve(data.pois[0]);
                return;
              } else {
                resolve(data.pois);
                return;
              }
            } else {
              reject(data);
            }
          } else {
            reject(res);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  // 逆编码转换坐标
  getAddressForName: async ({
    address = "",
    offset = 1,
    fromCity = "",
    types,
    page = 1,
  }) => {
    if (!address) return Promise.reject({ status: 403 });
    let pois = await callFunctions.getAddressPublicFunction({
      address,
      offset,
      fromCity,
      types,
      page,
    });
    if (window.getAddress) {
      let p = pois;
      p = p.map((item) => {
        let splitLocation = item.location && item.location.split(",");
        let location = {
          lng: splitLocation && splitLocation[0],
          lat: splitLocation && splitLocation[1],
        };
        item.location = location;
        return item;
      });
      window.getAddress.postMessage(JSON.stringify(p));
    }
    return pois;
  },

  // 通过点搜索周围数据
  SearchForPoint: async (val) => {
    let {
      position,
      radius = 200,
      locationName,
      type,
      pageSize,
      pageIndex,
    } = val;
    if (locationName) {
      let data = await callFunctions.getAddressForName({
        address: locationName,
      });
      // console.log(data);
      if (data) {
        position = data && data.location.split(",").map((item) => +item);
      }
    }
    let data = await new Promise((resolve, reject) => {
      AMap.service(["AMap.PlaceSearch"], function () {
        let placeSearch = new AMap.PlaceSearch({
          pageSize: pageSize ? pageSize : 10,
          pageIndex: pageIndex ? pageIndex : 1,
          type: type,
        });
        placeSearch.searchNearBy("", position, radius, (status, result) => {
          resolve(result.poiList);
          // 调用移动端的监听发送数据
          window.getNearbyAddressInfo &&
            result.poiList &&
            window.getNearbyAddressInfo.postMessage(
              JSON.stringify(result.poiList)
            );
        });
      });
      // 调用启动监听
      // callFunctions.StartMove();
    });
    return data;
  },

  // 通过坐标获取信息数据并且启动地图监听
  getAddressForLocation: ({ location, city, offset = 15, radius }) => {
    // 通过GPS地址查询当前位置
    callFunctions
      .SearchPoint({ position: location, city, radius })
      .then((res) => {
        // 通过GPS的地址查询附近的poi数据
        callFunctions
          .getAddressPublicFunction({ address: res, offset })
          .then((pois) => {
            window.getNearbyAddressInfo &&
              window.getNearbyAddressInfo.postMessage(JSON.stringify(pois));
          });
      });
  },

  // 绘制标绘
  // startDraw: ({ type }) => {
  //   if (!type) return new Error("缺少type");
  //   const plottingLayer = draw.create(type);
  //   // console.log(draw)

  //   draw.onActiveEventListener((e) => {
  //     console.log(e);
  //   });
  // },

  // 清除踏勘项目点
  clearSoutingProjectLayer: () => {
    scoutingProjectAction.clear();
  },

  // 通过坐标点查询
  SearchPoint: ({ position, radius = 500, city }) => {
    return new Promise((resolve, reject) => {
      var geocoder = new AMap.Geocoder({
        city: city, //城市设为北京，默认：“全国”
        radius: radius, //范围，默认：500
      });
      geocoder.getAddress(position, (status, result) => {
        if (status === "complete" && result.regeocode) {
          var address = result.regeocode.formattedAddress;
          resolve(address);
        } else {
          reject({ code: -1, message: "查询失败" });
        }
      });
    });
  },

  // 搜索地址
  searchAddress: ({ address, city }) => {
    return new Promise((resolve, reject) => {
      let url = protocol + "//restapi.amap.com/v3/geocode/geo";
      let params = {
        key: baseConfig.GAODE_SERVER_APP_KEY,
        address: address,
        city: city || undefined,
      };
      axios.get(url, { params }).then((res) => {
        if (res.status === 200) {
          let data = res.data;
          resolve(data.geocodes);
        } else {
          reject(res);
        }
      });
    });
  },

  // 通过经纬度、关键字查询
  searchNearByXY: ({ xy, keywords, radius, adcode, page }) => {
    return new Promise((resolve, reject) => {
      let url = protocol + "//restapi.amap.com/v3/place/around";
      let params = {
        key: baseConfig.GAODE_SERVER_APP_KEY,
        location: xy,
        keywords: keywords,
        radius: radius,
      };
      if (adcode) {
        params.city = adcode;
      }
      if (page) {
        params.page = page;
      }
      axios.get(url, { params }).then((res) => {
        if (res.status === 200) {
          let data = res.data;
          resolve(data.pois);
        } else {
          reject(res);
        }
      });
    });
  },

    // 通过经纬度、关键字查询
    searchNearByXY2: ({ xy, keywords, radius, adcode, page }) => {
      return new Promise((resolve, reject) => {
        let url = protocol + "//restapi.amap.com/v3/place/around";
        let params = {
          key: baseConfig.GAODE_SERVER_APP_KEY,
          location: xy,
          keywords: keywords,
          radius: radius,
        };
        if (adcode) {
          params.city = adcode;
        }
        if (page) {
          params.page = page;
        }
        axios.get(url, { params }).then((res) => {
          if (res.status === 200) {
            let data = res.data;
            resolve(data);
          } else {
            reject(res);
          }
        });
      });
    },

  // 根据经纬度获取所在城市
  getCityByLonLat: ({ lon, lat }) => {
    return new Promise((resolve, reject) => {
      let url = "https://restapi.amap.com/v3/geocode/regeo";
      let params = {
        key: baseConfig.GAODE_SERVER_APP_KEY,
        location: `${Number(lon).toFixed(6)},${Number(lat).toFixed(6)}`,
      };
      axios.get(url, { params }).then((res) => {
        if (res.status === 200) {
          let data = res.data;
          resolve(data.regeocode);
        } else {
          reject(res);
        }
      });
    });
  },

  // 渲染项目列表
  renderProjectList: () => {
    lib.showProjectPoint();
  },
  // 隐藏已经渲染的列表
  hideProjectList: () => {
    lib.hideProjectPoint();
  },
  // 渲染坐标点
  renderCollection: (data = []) => {
    callFunctions.addLayer();
    if (data.length) lib.renderCollection(data, callFunctions.source);
    else lib.getCollectionData(callFunctions.source);
  },
  // 清除渲染的元素
  clearCollection: () => {
    lib.clear();
  },
  hideOverlay: () => {
    lib.hideOverlay();
  },
  // 视图根据元素显示中间位置
  viewFitById: ({ id }) => {
    lib.fitCenter(id);
  },
  // 渲染分组坐标点
  renderGoupPoint: (data) => {
    lib.renderGroupPoint(data);
  },
  // 清除分组坐标点
  clearGroupPoint: () => {
    lib.clearGroupPoint();
  },
  // 设置选中的分组点
  setActiveGroup: (id) => {
    lib.setActiveGroupPoint(id);
  },
  // 渲染分组的采集资料点
  renderGroupCollectionPoint: (data) => {
    if (data) {
      let arr = [];
      Array.isArray(data) ? (arr = data) : (arr = JSON.parse(data));
      lib.renderGroupCollectionPoint(arr);
    }
  },
  clearGroupCollectionPoint: () => {
    lib.clearGroupCollectionPoint();
  },
  setActiveGroupCollectionPoint: (val) => {
    lib.setActiveGropCollectionPoint(val);
  },
  // zoomIn 放大
  zoomIn: () => {
    let view = _getMap("view");
    let zoom = view.getZoom();
    let maxZoom = view.getMaxZoom();
    if (zoom >= maxZoom) return;
    zoom += 1;
    view.animate({
      center: view.getCenter(),
      zoom: zoom,
      duration: 200,
    });
  },
  // zoomOut 缩小
  zoomOut: () => {
    let view = _getMap("view");
    let zoom = view.getZoom();
    let minZoom = view.getMinZoom();
    if (zoom <= minZoom) return;
    zoom -= 1;
    view.animate({
      center: view.getCenter(),
      zoom: zoom,
      duration: 200,
    });
  },

  renderTestData: (data) => {
    DetailAction.loadGeoJson(data);
  },

  saveTestPoint: (val = {}) => {
    DetailAction.savePoint(val);
  },
};

window.CallWebMapFunction = CallWebFunction;
