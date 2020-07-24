import {
  addFeature,
  Source,
  Layer,
  // loadFeatureJSON,
  // getExtent,
  // getPoint,
  createStyle,
  Fit,
} from "../../lib/utils";
import { publicDataUrl } from "../../services/publicData";
import mapApp from "../../utils/INITMAP";
import event from "../../lib/utils/event";

import PopupOverlay from "../../components/PublicOverlays/PopupOverlay/index";
import baseOverlay from "../../components/PublicOverlays/baseOverlay/index";
import { createOverlay } from "../../lib/utils/index";

const { getFeature, GET_GEO_DATA } = publicDataUrl;
const publicData = {
  // 图层
  layer: Layer({ id: "publicDataLayer", zIndex: 11 }),
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
  init: function () {
    // 如果有layer，就不addlayer
    let layer = mapApp.findLayerById(this.layer.get("id"));
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
    if (!data.typeName) {
      return new Error('property typeName is required of arguments "data"');
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
          this.geomData[data.typeName + (data.cql_filter || "")],
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
  // 渲染获取到的数据
  renderFeatures: function (data, option, fillColor) {
    if (data) {
      if (data.features.length) {
        data.features.forEach((item) => {
          let coor = item.geometry.coordinates;
          let type = item.geometry.type;
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
    if (Array.isArray(typeNames)) {
      typeNames.forEach((item) => {
        if (this.features[item]) {
          this.features[item].forEach((feature) => {
            // 这里removeFeature有个bug，底层代码中找不到对应的feature，所以这里进行uid判断，有才执行删除
            if (this.source.getFeatureByUid(feature.ol_uid))
              this.source.removeFeature(feature);
          });
          this.features[item] = null;
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
    this.source.clear();
    // mapApp.removeLayer(this.layer);
  },
};
export default publicData;
