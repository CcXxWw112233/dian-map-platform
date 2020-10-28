import {
  addFeature,
  Source,
  Layer,
  loadFeatureJSON,
  createStyle,
  Fit,
  TransformCoordinate,
} from "../../lib/utils";
import { publicDataUrl } from "../../services/publicData";
import mapApp from "../../utils/INITMAP";
import event from "../../lib/utils/event";

import PopupOverlay from "../../components/PublicOverlays/PopupOverlay/index";
import baseOverlay from "../../components/PublicOverlays/baseOverlay/index";
import { createOverlay } from "../../lib/utils/index";
import { getLocal } from "../../utils/sessionManage";
import DetailAction from "../../lib/components/ProjectScouting/ScoutingDetail";
import {
  gcj02_to_wgs84,
  wgs84_to_gcj02,
} from "../../utils/transCoordinateSystem";

import publicDataServices from "../../services/publicData";

import { message } from "antd";
import { baseConfig } from "../../globalSet/config";
import { getSession } from "utils/sessionManage";

const { getFeature, GET_GEO_DATA } = publicDataUrl;

const publicData = {
  // 图层
  layer: Layer({ id: "publicDataLayer", zIndex: 11, declutter: true }),
  // 数据源
  source: Source(),
  // key -> value 所有feature
  features: {},
  // 获取到的geo数据
  geomData: {},
  // 当前正在操作的typename
  activeTypeName: "",
  status: "ready",
  loadKey: [],
  circleFeature: null,
  lpOverlay: null,
  lastBaseMap: null, // 上一个底图
  baseMapKeys: ["gd_vec|gd_img|gg_img", "td_vec|td_img|td_ter"],
  systemDic: {
    gd_vec: wgs84_to_gcj02,
    gd_img: wgs84_to_gcj02,
    gg_img: wgs84_to_gcj02,
    td_vec: gcj02_to_wgs84,
    td_img: gcj02_to_wgs84,
    td_ter: gcj02_to_wgs84,
  },
  currentBaseMap: null,
  commonStyleOption: {
    textFillColor: "#3F48CC",
    textStrokeColor: "#fff",
    textStrokeWidth: 3,
    font: "13px sans-serif",
    placement: "point",
    iconScale: 0.6,
    pointColor: "#fff",
  },
  popupKeyVals: {
    人口分布: "population",
    人口密度: "density",
    就业岗位: "empolyment",
    居民用地: "landuse",
  },
  colors: [
    "#FFFF00",
    "#FFE100",
    "#FFC300",
    "#FFA600",
    "#FF8800",
    "#FF7500",
    "#FF6600",
  ],
  lastPopulationTypeName: "",
  hasInited: false,
  lenged: null,
  dispatch: null,
  init: function () {
    this.hasInited = true;
    event.Evt.on("transCoordinateSystems2PublicData", (key) => {
      this.lastBaseMap = this.currentBaseMap;
      this.currentBaseMap = key;
      this.transCoordinateSystemsByChangeBaseMap();
    });
    event.Evt.on("getPoi", ({ keywords }) => {
      this.removeFeatures(keywords);
      this.getADPoi(keywords);
    });
    // 如果有layer，就不addlayer
    let layer = mapApp.findLayerById(this.layer.get("id"));
    getLocal("baseMapKey").then((res) => {
      this.lastBaseMap = res.data;
      this.currentBaseMap = this.lastBaseMap;
    });
    if (layer) {
      this.layer.setVisible(true);
    } else {
      this.layer.setSource(this.source);
      mapApp.addLayer(this.layer);
      mapApp.map.on("click", (e) => {
        const feature = mapApp.map.forEachFeatureAtPixel(
          e.pixel,
          (feature, layer) => {
            return feature;
          }
        );
        if (!feature) return;
        if (DetailAction.isActivity) return;
        console.log(DetailAction.isActivity);
        const properties = feature.getProperties();
        if (
          properties.price &&
          properties.pre_salepe &&
          properties.x &&
          properties.y
        ) {
          this.lpOverlay && mapApp.map.removeOverlay(this.lpOverlay);
          const me = this;
          const data = {
            name: properties.title,
            cb: function () {
              event.Evt.firEvent("removeHousePOI");
              me.circleFeature && me.source.removeFeature(me.circleFeature);
              me.circleFeature = null;
              mapApp.map.removeOverlay(me.lpOverlay);
              this.lpOverlay = null;
              feature.hasPopup = false;
            },
          };
          let popupEle = new PopupOverlay(data);
          popupEle = new baseOverlay(popupEle, {
            angleColor: "#fff",
            width: "auto",
          });
          this.lpOverlay = createOverlay(popupEle, {
            // positioning: "bottom-left",
            offset: [-10, -50],
          });
          if (feature.overlay) {
            mapApp.map.removeOverlay(feature.overlay);
          }
          feature.overlay = this.lpOverlay;
          mapApp.map.addOverlay(this.lpOverlay);
          this.lpOverlay.setPosition(feature.getGeometry().getCoordinates());
          const housePoi = `${properties.x},${properties.y}`;
          window.housePoi = housePoi;
          // 调动周边配套面板请求数据
          event.Evt.firEvent("HouseDetailGetPoi", housePoi);
          this.createCircle(feature.getGeometry().getCoordinates());
          mapApp.map.getView().fit(feature.getGeometry().getExtent(), {
            size: mapApp.map.getSize(),
            maxZoom: 13,
            duration: 1000,
          });
        }
      });
      const that = this;
      mapApp.map.on("moveend", (e) => {
        return;
        const keys = Object.keys(that.features);
        let key = null;
        for (let i = 0; i < keys.length; i++) {
          if (keys[i].indexOf("lingxi:dichan_loupan_point") > -1) {
            key = keys[i];
            break;
          }
        }
        const lpFeature = that.features[key];
        if (lpFeature) {
          lpFeature.forEach((item) => {
            const zoom = mapApp.map.getView().getZoom();
            const properties = item.getProperties();
            if (
              properties.price &&
              properties.pre_salepe &&
              properties.x &&
              properties.y
            ) {
              let style = item.getStyle();
              const text = style.getText();
              if (zoom > 12) {
                text.setText(properties.title);
                style.setText(text);
              } else {
                text.setText("");
                style.setText(text);
              }
              item.setStyle(style);
            }
          });
        }
      });
    }
  },

  removeLpInfo: function () {
    this.lpOverlay && mapApp.map.removeOverlay(this.lpOverlay);
    this.circleFeature && this.source.removeFeature(this.circleFeature);
    this.lpOverlay = null;
    this.circleFeature = null;
  },

  // 获取数据 传入参数为url 和data， data = { @required typeName ,}
  getPublicData: function ({ url, data, fillColor }) {
    if (this.features[data.typeName + (data.cql_filter || "")]) {
      return;
    }
    // let { getFeature, GET_GEO_DATA } = publicDataUrl;
    // 如果有多个请求同时发起，则挂起保存，
    if (this.status === "loading") {
      let flag = false;
      this.loadKey.forEach((item) => {
        if (item.typeName === data.typeName) {
          flag = true;
        }
      });
      if (!flag) this.loadKey.push({ url, data });
    }
    // 如果加载完成了，则继续加载
    if (this.status === "ready") {
      this.status = "loading";
      this.activeTypeName = data.typeName + (data.cql_filter || "");
      if (this.geomData[data.typeName + (data.cql_filter || "")]) {
        // 使用缓存的数据
        this.renderFeatures(
          this.geomData[this.activeTypeName],
          data,
          fillColor
        );
        this.status = "ready";
        // 如果有挂起的请求，则请求
        if (this.loadKey.length) {
          let n = this.loadKey.splice(0, 1);
          this.getPublicData(n[0]);
        }
      } else {
        // 使用接口数据
        let params = {
          typeName: data.typeName,
        };
        if (data.cql_filter) {
          params.cql_filter = data.cql_filter;
        }
        getFeature(url ? url : GET_GEO_DATA, params)
          .then((res) => {
            // 数据缓存，后期优化成本地缓存
            this.geomData[data.typeName + (data.cql_filter || "")] = res;
            // 渲染，并且删除加载过后的loadkey
            this.renderFeatures(res, data, fillColor);
            this.status = "ready";
            // 如果有挂起的请求，则请求
            if (this.loadKey.length) {
              let n = this.loadKey.splice(0, 1);
              this.getPublicData(n[0]);
            }
          })
          .catch((err) => {
            // 如果出错了，不处理，直接跳过。
            this.status = "ready";
            console.log(err);
            // 如果有挂起的请求，则请求
            if (this.loadKey.length) {
              let n = this.loadKey.splice(0, 1);
              this.getPublicData(n[0]);
            }
          });
      }
    }
  },

  getADPoi: async function (keywords, type = 3) {
    let keys = [];
    // if (that.features) {
    //   keys = Object.keys(that.features);
    // }
    keys = keywords;
    keys.forEach((item) => {
      this.features[item] = [];
    });
    if (keywords.length === 0) return;

    const baseMapKeys = mapApp.baseMapKeys;
    const baseMapKey = mapApp.baseMapKey;
    const systemDic = mapApp.systemDic;
    const keywords2 = keywords.join(",");

    const view = mapApp.map.getView();
    const center = view.getCenter();
    const lonlat = TransformCoordinate(center, "EPSG:3857", "EPSG:4326");

    const res = await publicDataServices.QUERY_LOCAL_GEOM({
      lon: lonlat[0],
      lat: lonlat[1],
      radius: 5000,
      type: keywords2,
      adcode: mapApp.adcode,
      key: baseConfig.GAODE_SERVER_APP_KEY,
    });

    if (res.code === "0") {
      res.data.forEach((item) => {
        let temp = [item.lon, item.lat];
        if (baseMapKeys[1].includes(baseMapKey)) {
          temp = systemDic[baseMapKey](temp[0], temp[1]);
        }
        let coords = TransformCoordinate(temp, "EPSG:4326", "EPSG:3857");
        const options = {
          textFillColor: "#3F48CC",
          textStrokeColor: "#fff",
          textStrokeWidth: 3,
          font: "13px sans-serif",
          placement: "point",
          iconScale: 1,
          pointColor: "#fff",
          showName: true,
          text: item.name,
          iconUrl: require("../../assets/location.svg"),
        };
        let flag = false;
        let poiType = null;
        if (keys.includes(item.type3) && type === 3) {
          flag = true;
          poiType = item.type3;
        }
        if (keys.includes(item.type2) && type === 2) {
          flag = true;
          poiType = item.type2;
        }
        if (keys.includes(item.type1) && type === 1) {
          flag = true;
          poiType = item.type1;
        }
        if (flag) {
          const style = createStyle("Point", options);
          const feature = addFeature("Point", { coordinates: coords });
          feature.setStyle(style);
          this.source && this.source.addFeature(feature);
          this.features[poiType].push(feature);
        }
      });
    }
  },

  getAdPoi2: (data) => {
    let promise = publicDataServices.INSERT_PUBLIC_POI(data);
    Promise.all(promise).then((resp) => {
      console.log("保存成功");
    });
  },

  // cleanPopulationFeatures: function () {
  //  if (this.lastPopulationTypeName) {
  //    this.removeFeatures(this.lastPopulationTypeName)
  //  }
  // },

  getPopulationDatas: async function (
    fillColor,
    name,
    loadFeatureKeys,
    dispatch,
    lenged,
    str
  ) {
    if (lenged) {
      this.lenged = lenged;
    }
    if (dispatch) {
      this.dispatch = dispatch;
    }
    if (this.lastPopulationTypeName) {
      this.removeFeatures(this.lastPopulationTypeName);
    }
    let type = 0;
    let code = 100000;
    if (!str) {
      const xzqhSession = await getSession("xzqhCode");
      if (xzqhSession.code === 0) {
        if (xzqhSession.data) {
          const tempArr = xzqhSession.data.split("|");
          if (tempArr[0] === "districtcode") {
            type = 1;
          }
          code = tempArr[1];
        }
      }
    } else {
      const tmpArr = str.split("|");
      if (tmpArr[0] === "districtcode") {
        type = 1;
      }
      code = tmpArr[1];
    }
    this.activeTypeName = name + "_" + code;
    if (!this.features[this.activeTypeName]) {
      this.features[this.activeTypeName] = [];
      let res = await publicDataServices.getPopulationDatas(code, type);
      if (res.code === "0") {
        const data = res.data;
        let max = Number.NEGATIVE_INFINITY,
          min = Number.POSITIVE_INFINITY;
        data.forEach((item) => {
          const val = Number(item[this.popupKeyVals[name]] || 0);
          if (val > max) {
            max = val;
          }
          if (val < min) {
            min = val;
          }
        });
        const region = (max - min) / 5;
        fillColor = [];
        let lengedArr = [];
        fillColor.push({
          fillColor: this.colors[0],
          property: this.popupKeyVals[name],
          scope: `0-${min}`,
        });
        // lengedArr.push({
        //   bgColor: this.colors[0],
        //   font: `0-${min}`,
        // })
        fillColor.push({
          fillColor: this.colors[1],
          property: this.popupKeyVals[name],
          scope: `${min.toFixed(0)}-${(min + region).toFixed(0)}`,
        });
        lengedArr.push({
          bgColor: this.colors[1],
          font: `${min.toFixed(0)}-${(min + region).toFixed(0)}`,
        });
        fillColor.push({
          fillColor: this.colors[2],
          property: this.popupKeyVals[name],
          scope: `${(min + region).toFixed(0)}-${(min + region * 2).toFixed(
            0
          )}`,
        });
        lengedArr.push({
          bgColor: this.colors[2],
          font: `${(min + region).toFixed(0)}-${(min + region * 2).toFixed(0)}`,
        });
        fillColor.push({
          fillColor: this.colors[3],
          property: this.popupKeyVals[name],
          scope: `${(min + region * 2).toFixed(0)}-${(min + region * 3).toFixed(
            0
          )}`,
        });
        lengedArr.push({
          bgColor: this.colors[3],
          font: `${(min + region * 2).toFixed(0)}-${(min + region * 3).toFixed(
            0
          )}`,
        });
        fillColor.push({
          fillColor: this.colors[4],
          property: this.popupKeyVals[name],
          scope: `${(min + region * 3).toFixed(0)}-${(min + region * 4).toFixed(
            0
          )}`,
        });
        lengedArr.push({
          bgColor: this.colors[4],
          font: `${(min + region * 3).toFixed(0)}-${(min + region * 4).toFixed(
            0
          )}`,
        });
        fillColor.push({
          fillColor: this.colors[5],
          property: this.popupKeyVals[name],
          scope: `${(min + region * 4).toFixed(0)}-${(min + region * 5).toFixed(
            0
          )}`,
        });
        lengedArr.push({
          bgColor: this.colors[5],
          font: `${(min + region * 4).toFixed(0)}-${(min + region * 5).toFixed(
            0
          )}`,
        });
        fillColor.push({
          fillColor: this.colors[6],
          property: this.popupKeyVals[name],
          scope: `-${max.toFixed(0)}`,
        });
        lengedArr.push({
          bgColor: this.colors[6],
          font: `>${max.toFixed(0)}`,
        });
        lengedArr.push({
          bgColor: "#E0E0E0",
          font: "暂无数据",
        });
        this.lenged.content = lengedArr;
        data.forEach((item) => {
          let newData = {
            source: item.geom,
            options: {
              dataProjection: "EPSG:4326",
              featureProjection: "EPSG:3857",
            },
          };
          let val = item[this.popupKeyVals[name]];
          val = Number(val || 0);

          item[this.popupKeyVals[name]] = val;

          let text = item.name;
          let styleOpt = loadFeatureKeys.style;
          styleOpt.text = text;
          styleOpt.showName = true;
          styleOpt.fillColor = fillColor;
          const style = createStyle("MultiPolygon", styleOpt, item, fillColor);
          const newFeature = loadFeatureJSON(newData);
          newFeature.setStyle(style);
          this.features[this.activeTypeName].push(newFeature);
          this.source.addFeature(newFeature);
        });
        this.dispatch && this.dispatch({
          type: "lengedList/updateLengedList",
          payload: {
            config: [this.lenged],
          },
        });
      }
    } else {
      this.features[this.activeTypeName].forEach((item) => {
        this.source.addFeature(item);
      });
    }
    if (this.source) {
      const extent = this.source.getExtent();
      if (extent && extent[0] !== Infinity) {
        mapApp.map.getView().fit(extent, {
          size: mapApp.map.getSize(),
          duration: 1000,
        });
      }
    }
    this.lastPopulationTypeName = this.activeTypeName;
  },

  loadFeature: function (data, style) {
    const newFeature = loadFeatureJSON(data);
    // 当前底图是gcj02坐标系
    const baseMapKeys = mapApp.baseMapKeys;
    const baseMapKey = mapApp.baseMapKey;
    const systemDic = mapApp.systemDic;
    if (baseMapKeys[1].includes(baseMapKey)) {
      let coords = newFeature.getGeometry().getCoordinates();
      for (let i = 0; i < coords.length; i++) {
        for (let j = 0; j < coords[i].length; j++) {
          let tmp = TransformCoordinate(coords[i][j], "EPSG:3857", "EPSG:4326");
          if (tmp && tmp.length > 0) {
            tmp = systemDic[baseMapKey](tmp[0], tmp[1]);
            if (tmp && tmp.length > 0) {
              tmp = TransformCoordinate(tmp, "EPSG:4326", "EPSG:3857");
              coords[i][j] = tmp;
            }
          }
        }
      }
      newFeature.getGeometry().setCoordinates(coords);
    }
    newFeature.setStyle(style);
    this.source.addFeature(newFeature);
    mapApp.map.getView().fit(this.source.getExtent(), {
      size: mapApp.map.getSize(),
      duration: 1000,
    });
  },

  // addExtentToMap = () => {

  // },

  //切换底图后切换坐标
  transCoordinateSystemsByChangeBaseMap: function () {
    let lastIndex = this.baseMapKeys[0].indexOf(this.lastBaseMap);
    let currentIndex = this.baseMapKeys[0].indexOf(this.currentBaseMap);
    // 表示都是wgs84或者都是gcj02，不用转啦
    if (
      (lastIndex >= 0 && currentIndex >= 0) ||
      (lastIndex === -1 && currentIndex === -1)
    ) {
      return;
    } else {
      let newFeatures = [];
      let keys = Object.keys(this.features);
      for (let n = 0; n < keys.length; n++) {
        let features = this.features[keys[n]];
        if (!features) {
          continue;
        }
        for (let i = 0; i < features.length; i++) {
          let temp = null;
          const type = features[i].getGeometry().getType();
          let newFeature = features[i].clone();
          let coords = newFeature.getGeometry().getCoordinates();
          if (type.indexOf("Point") > -1) {
            temp = TransformCoordinate(coords, "EPSG:3857", "EPSG:4326");
            temp = this.systemDic[this.currentBaseMap](temp[0], temp[1]);
            coords = TransformCoordinate(temp, "EPSG:4326", "EPSG:3857");
            newFeature.getGeometry().setCoordinates(coords);
            newFeatures.push(newFeature);
            this.features[keys[n]][i] = newFeature;
          } else if (type.indexOf("Polygon") > -1) {
            for (let j = 0; j < coords.length; j++) {
              for (let k = 0; k < coords[j].length; k++) {
                for (let l = 0; l < coords[j][k].length; l++) {
                  temp = TransformCoordinate(
                    coords[j][k][l],
                    "EPSG:3857",
                    "EPSG:4326"
                  );
                  temp = this.systemDic[this.currentBaseMap](temp[0], temp[1]);
                  coords[j][k][l] = TransformCoordinate(
                    temp,
                    "EPSG:4326",
                    "EPSG:3857"
                  );
                }
              }
            }
            newFeature.getGeometry().setCoordinates(coords);
            newFeatures.push(newFeature);
            this.features[keys[n]][i] = newFeature;
          } else if (
            type.indexOf("LineString") > -1 ||
            type.indexOf("PolyLine") > -1
          ) {
            for (let j = 0; j < coords.length; j++) {
              for (let k = 0; k < coords[j].length; k++) {
                temp = TransformCoordinate(
                  coords[j][k],
                  "EPSG:3857",
                  "EPSG:4326"
                );
                temp = this.systemDic[this.currentBaseMap](temp[0], temp[1]);
                coords[j][k] = TransformCoordinate(
                  temp,
                  "EPSG:4326",
                  "EPSG:3857"
                );
              }
            }
            newFeature.getGeometry().setCoordinates(coords);
            newFeatures.push(newFeature);
            this.features[keys[n]][i] = newFeature;
          }
        }
      }
      this.source && this.source.clear();
      this.circleFeature = null;
      this.removeLpInfo();
      for (let m = 0; m < newFeatures.length; m++) {
        this.source.addFeature(newFeatures[m]);
      }
    }
    // 视图平移
    this.areaForExtent(this.source.getExtent());
  },

  // 根据底图切换坐标,当数据更新了调用
  transCoordinateSystems: function (coord, type) {
    // 如果先前的底图key跟现有的底图key一致，则无需纠偏转换,直接返回coord
    this.currentBaseMap = mapApp.baseMapKey;
    let newCoord = JSON.parse(JSON.stringify(coord));
    // 当前地图是gcj02坐标系
    let index = this.baseMapKeys[0].indexOf(this.currentBaseMap);
    if (index !== -1) {
      return newCoord;
    } else {
      // 纠偏转换
      if (newCoord) {
        if (type.indexOf("Polygon") > -1) {
          for (let i = 0; i < newCoord.length; i++) {
            for (let j = 0; j < newCoord[i].length; j++) {
              for (let k = 0; k < newCoord[i][j].length; k++) {
                let temp = TransformCoordinate(
                  newCoord[i][j][k],
                  "EPSG:3857",
                  "EPSG:4326"
                );
                temp = this.systemDic[this.currentBaseMap](temp[0], temp[1]);
                newCoord[i][j][k] = TransformCoordinate(
                  temp,
                  "EPSG:4326",
                  "EPSG:3857"
                );
              }
            }
          }
          return newCoord;
        } else if (type.indexOf("Point") > -1) {
          newCoord = TransformCoordinate(newCoord, "EPSG:3857", "EPSG:4326");
          newCoord = this.systemDic[this.currentBaseMap](
            newCoord[0],
            newCoord[1]
          );
          newCoord = TransformCoordinate(newCoord, "EPSG:4326", "EPSG:3857");
          return newCoord;
        }
        if (type.indexOf("LineString") > -1 || type.indexOf("PolyLine") > -1) {
          for (let j = 0; j < newCoord.length; j++) {
            for (let k = 0; k < newCoord[j].length; k++) {
              let temp = TransformCoordinate(
                newCoord[j][k],
                "EPSG:3857",
                "EPSG:4326"
              );
              temp = this.systemDic[this.currentBaseMap](temp[0], temp[1]);
              newCoord[j][k] = TransformCoordinate(
                temp,
                "EPSG:4326",
                "EPSG:3857"
              );
            }
          }
          return newCoord;
        }
      }
    }
  },

  // 渲染获取到的数据
  renderFeatures: function (data, option, fillColor) {
    if (data) {
      if (data.features.length) {
        data.features.forEach((item) => {
          let coor = item.geometry.coordinates;
          let type = item.geometry.type;
          coor = this.transCoordinateSystems(coor, type);
          let feature = addFeature(type, {
            coordinates: coor,
            ...item.properties,
          });
          if (option.style) {
            let name =
              feature.get("name") ||
              feature.get("text") ||
              feature.get("title");
            option.style.text = name;
            option.style.showName = option.showName;
            // 创建样式
            let style = createStyle(
              type,
              option.style,
              item.properties,
              fillColor
            );

            feature.setStyle(style);
          }

          this.source.addFeature(feature);
          if (!this.features[this.activeTypeName]) {
            this.features[this.activeTypeName] = [];
          }
          // 保存feature数据
          this.features[this.activeTypeName].push(feature);
        });
      }
    }
    // 视图平移
    this.areaForExtent(this.source.getExtent());
  },

  createCircle: function (coordinates) {
    this.circleFeature && this.source.removeFeature(this.circleFeature);
    const myOptions = {
      strokeColor: "rgba(255,0,0,1)",
      fillColor: "rgba(255,255,255,0.4)",
      zIndex: 11,
    };
    let feature = addFeature("Circle", {
      coordinates: coordinates,
      radius: 5000,
    });
    const style = createStyle("Polygon", myOptions);
    feature.setStyle(style);
    this.circleFeature = feature;
    this.source.addFeature(feature);
  },

  // 清除选到server key 图层
  removeFeatures: function (typeNames) {
    typeNames = typeof typeNames === "string" ? [typeNames] : typeNames;
    const me = this;
    if (Array.isArray(typeNames)) {
      typeNames.forEach((item) => {
        if (me.features[item]) {
          me.features[item].forEach((feature) => {
            // 这里removeFeature有个bug，底层代码中找不到对应的feature，所以这里进行uid判断，有才执行删除
            if (me.source.getFeatureByUid(feature.ol_uid))
              me.source.removeFeature(feature);
          });
          // me.features[item] = null;
        }
      });
    }
  },
  // 通过元素的范围 (extent)来进行视图移动
  areaForExtent: function (extent, duration = 1000) {
    if (extent) {
      // 动画
      Fit(mapApp.view, extent, {
        size: mapApp.map.getSize(),
        maxZoom: mapApp.view.getMaxZoom(),
        duration,
      });
    }
  },

  clear: function () {
    let keys = Object.keys(this.features);
    this.removeFeatures(keys);
    this.features = {};
    this.source && this.source.clear();
    this.circleFeature = null;
    this.removeLpInfo();
    event.Evt.firEvent("removeHousePOI");
  },
};
export default publicData;
