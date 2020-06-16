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
  init: function () {
    // 如果有layer，就不addlayer
    let layer = mapApp.findLayerById(this.layer.get("id"));
    if (layer) {
      this.layer.setVisible(true);
    } else {
      this.layer.setSource(this.source);
      mapApp.addLayer(this.layer);
    }
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
            let name = feature.get("name") || feature.get("text");
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
