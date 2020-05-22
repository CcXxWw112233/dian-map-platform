import { setSession } from "../../../utils/sessionManage";
import listAction from "./ScoutingList";
import config from "../../../services/scouting";
import { dateFormat } from "../../../utils/utils";
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
} from "../../utils/index";
import {
  CollectionOverlay,
  settingsOverlay,
} from "../../../components/PublicOverlays";
import { Modify } from "ol/interaction";
import { always } from "ol/events/condition";

import { draw } from "utils/draw";

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
  } = config;
  this.activeFeature = {};
  this.Layer = Layer({ id: "scoutingDetailLayer", zIndex: 11 });
  this.Source = Source();
  this.features = [];
  this.overlays = [];
  this.drawBox = null;
  this.init = () => {
    this.Layer.setSource(this.Source);
    InitMap.map.addLayer(this.Layer);
  };
  this.boxFeature = {};
  this.draw = null;

  this.removeListPoint = () => {
    // 删除已经存在的项目列表
    listAction.clear();
  };

  this.checkCollectionType = (suffix = "") => {
    if (!suffix) return "unknow";
    const itemKeyVals = {
      paper: [], // 图纸
      interview: ["aac", "mp3",'语音'], // 访谈
      pic: ["jpg", "PNG", "gif", "jpeg"].map((item) =>
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
        "xmind",
      ].map((item) => item.toLocaleLowerCase()),
      annotate: [], // 批注
      plotting: ["feature"], // 标绘
      planPic: ["plan"], // 规划图
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

  // 添加关联点的交互
  this.addCollectionPosition = (data) => {
    return new Promise((resolve, reject) => {
      let style = createStyle("Point", {
        iconUrl: require("../../../assets/addPointLocation.png"),
        text: data.title,
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
      (item) => !!item.location && Object.keys(item.location).length !== 0
    );
    return arr;
  };
  this.removeOverlay = () => {
    this.overlays.forEach((item) => {
      InitMap.map.removeOverlay(item);
    });
    this.overlays = [];
  };

  this.removeFeatures = () => {
    this.removeOverlay();
    this.removePlanPicCollection();
    // 删除元素
    this.features.forEach((item) => {
      if (this.Source.getFeatureByUid(item.ol_uid)) {
        this.Source.removeFeature(item);
      }
    });

    this.features = [];
  };

  this.renderPointCollection = (data) => {
    let array = findHasLocationData(data);
    // console.log(array)
    array.forEach((item) => {
      let coor = TransformCoordinate([
        +item.location.longitude,
        +item.location.latitude,
      ]);
      let feature = addFeature("Point", { coordinates: coor });
      let style = createStyle("Point", {
        strokeWidth: 2,
        strokeColor: "#fff",
      });

      let pointType = this.checkCollectionType(item.target);
      item.pointType = pointType;
      feature.setStyle(style);
      this.addOverlay(coor, item);
      this.features.push(feature);
      this.Source.addFeature(feature);
    });
  };

  // 渲染标绘数据
  this.renderFeaturesCollection = (data, { lengedConfig, dispatch }) => {
    const commonStyleOption = {
      textFillColor: "rgba(255,0,0,1)",
      textStrokeColor: "#fff",
      textStrokeWidth: 3,
      font: "13px sans-serif",
      placement: "point",
      iconScale: 1,
      pointColor: "#fff",
      showName: true,
    };
    let projectScouting = {
      title: "项目踏勘",
      key: "map:projectScouting",
      content: [],
    };
    data.forEach((item) => {
      let content = item.content;
      content = content && JSON.parse(content);
      let featureType = content.featureType || "";
      let isImage = false;
      let iconUrl = "";
      let obj = null;
      const hasIndex = projectScouting.content.findIndex(
        (item0) => item0.font === content.selectName
      );
      const featureLowerType = content.geoType.toLowerCase();
      if (featureType.indexOf("/") > -1) {
        isImage = true;
        featureType = featureType.replace("img", "");
        iconUrl = require("../../../assets" + featureType);
        if (hasIndex < 0) {
          obj = {
            imgSrc: iconUrl,
            font: content.selectName,
            type: featureLowerType,
          };
          projectScouting.content.push(obj);
        }
      } else {
        if (hasIndex < 0) {
          obj = {
            bgColor: featureType,
            font: content.selectName,
            type: featureLowerType,
          };
          projectScouting.content.push(obj);
        }
      }
      let feature = addFeature(content.geoType, {
        coordinates: content.coordinates,
      });

      // code by liulaian
      let myStyle = null;
      if (content.geoType === "Point") {
        myStyle = createStyle(content.geoType, {
          radius: 8,
          fillColor: "rgba(168,9,10,0.7)",
          strokeWidth: 2,
          strokeColor: "rgba(168,9,10,1)",
          iconUrl: iconUrl,
          text: content.name,
          ...commonStyleOption,
        });
      }
      if (content.geoType === "LineString") {
        myStyle = createStyle(content.geoType, {
          strokeWidth: 4,
          strokeColor: featureType,
          text: content.name,
          ...commonStyleOption,
        });
      }
      if (content.geoType === "Polygon") {
        if (isImage) {
          let canvas = document.createElement("canvas");
          let context = canvas.getContext("2d");
          let img = new Image();
          img.src = iconUrl;
          const me = this;
          img.onload = function () {
            const pat = context.createPattern(img, "repeat");
            let options = {
              strokeWidth: 2,
              strokeColor: isImage ? "" : featureType.replace("0.7", 1),
              fillColor: pat,
              text: content.name,
              ...commonStyleOption,
            };
            myStyle = createStyle(content.geoType, options);
            feature.setStyle(myStyle);
            me.Source.addFeature(feature);
            me.features.push(feature);
            return;
          };
          return;
        }
        myStyle = createStyle(content.geoType, {
          strokeWidth: 2,
          strokeColor: isImage ? "" : featureType.replace("0.7", 1),
          fillColor: featureType,
          text: content.name,
          ...commonStyleOption,
        });
      }
      feature.setStyle(myStyle);
      this.Source.addFeature(feature);
      this.features.push(feature);
      // let plottingLayer = draw.getPlottingLayer()
      // let featureOperator = plottingLayer._addFeature(feature)
      // featureOperator.setName(content.name)
    });
    let newConfig = [];
    if (!lengedConfig) {
      lengedConfig = [];
    }
    const lengedIndex = lengedConfig.findIndex(
      (lenged) => lenged.key === projectScouting.key
    );
    if (lengedIndex > -1) {
      lengedConfig[lengedIndex] = projectScouting;
      newConfig = lengedConfig[lengedIndex];
    } else {
      newConfig = lengedConfig.concat(projectScouting);
    }
    if (projectScouting.content.length > 0) {
      dispatch({
        type: "lengedList/updateLengedList",
        payload: {
          config: newConfig,
        },
      });
    }
  };
  this.getPolygonFill = (iconUrl) => {
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    let img = new Image();
    img.src = iconUrl;
    img.onload = function () {
      const pat = context.createPattern(img, "repeat");
      return pat;
    };
    const pat = context.createPattern(img, "repeat");
    return pat;
  };
  // 渲染feature
  this.renderCollection = (data, { lenged, dispatch }) => {
    // 过滤不显示的数据
    data = data.filter((item) => item.is_display === "1");
    // 删除元素
    this.removeFeatures();
    let ponts = data.filter(
      (item) => item.collect_type !== "4" && item.collect_type !== "5"
    );
    let features = data.filter((item) => item.collect_type === "4");
    let planPic = data.filter((item) => item.collect_type === "5");
    // 渲染点的数据
    this.renderPointCollection(ponts);
    // 渲染标绘数据
    this.renderFeaturesCollection(features, { lenged, dispatch });
    // 渲染规划图
    this.renderPlanPicCollection(planPic);

    data &&
      data.length &&
      setTimeout(() => {
        // 当存在feature的时候，才可以缩放
        if (this.features.length)
          Fit(
            InitMap.view,
            this.Source.getExtent(),
            {
              size: InitMap.map.getSize(),
              padding: [200, 150, 80, 400],
            },
            800
          );
      });
  };

  //   删除已存在的规划图
  this.removePlanPicCollection = () => {
    this.imgs && this.imgs.forEach((item) => InitMap.map.removeLayer(item));
    this.imgs = [];
  };

  //   渲染规划图
  this.renderPlanPicCollection = (data) => {
    //   console.log(data);
    let promise = data.map((item) => {
      if (item.resource_id) {
        return GET_PLAN_PIC(item.resource_id);
      }
    });
    this.imgs = [];
    Promise.all(promise).then((res) => {
      this.imgs = [];
      res.forEach((item) => {
        let resp = item.data;
        let extent = resp.extent
          ? resp.extent.split(",").map((e) => parseFloat(e))
          : [];
        let img = ImageStatic(PLAN_IMG_URL(resp.id), extent, {
          opacity: +resp.transparency,
        });
        this.imgs.push(img);
      });

      this.imgs.forEach((item) => {
        //   console.log(item)
        InitMap.map.addLayer(item);
      });
    });
  };

  //   添加元素坐标的overlay
  this.addOverlay = (coor, data) => {
    let ele = new CollectionOverlay(data);
    let overlay = createOverlay(ele.element, {
      positioning: "bottom-left",
      offset: [-12, -10],
    });
    InitMap.map.addOverlay(overlay);
    this.overlays.push(overlay);
    overlay.setPosition(coor);
  };

  //   删除元素坐标的overlay
  this.removeLayer = () => {
    this.removeOverlay();
    this.removeFeatures();
    InitMap.map.removeLayer(this.Layer);
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

    this.staticimg = ImageStatic(url, extent, data);
    InitMap.map.addLayer(this.staticimg);
  };

  let removeSelect = () => {
    InitMap.map.removeInteraction(this.select);
    InitMap.map.removeInteraction(this.modify);
    this.stopDrawBox();
    InitMap.map.removeLayer(this.staticimg);
  };

  // 编辑功能
  this.setSelect = () => {
    this.modify = "";
    let snap = "";
    this.select = setSelectInteraction({ layers: [this.Layer] });

    this.modify = new Modify({
      features: this.select.getFeatures(),
      condition: always,
    });
    // snap = new Snap({features:this.select.getFeatures()});
    InitMap.map.addInteraction(this.modify);
    // InitMap.map.addInteraction(snap);
    InitMap.map.addInteraction(this.select);
    return { modify: this.modify, snap };
  };

  // 添加规划图范围
  this.addPlanPictureDraw = (url, data) => {
    return new Promise((resolve, reject) => {
      this.drawBox = drawBox(this.Source, (data = {}));

      this.drawBox.on("drawend", (e) => {
        this.boxFeature = e.feature;
        let extent = this.boxFeature.getGeometry().getExtent();
        let ele = new settingsOverlay();
        let drawImgOpacity = ele.opacityValue;
        let overlay = createOverlay(ele.element);
        let center = getPoint(
          this.boxFeature.getGeometry().getExtent(),
          "topRight"
        );
        InitMap.map.addOverlay(overlay);
        overlay.setPosition(center);
        InitMap.map.removeInteraction(this.drawBox);
        this.createImg(url, extent, { opacity: drawImgOpacity });

        let { modify } = this.setSelect();

        modify.on("modifyend", (e) => {
          let features = e.features;
          let f = features.getArray()[0];
          let ext = f.getGeometry().getExtent();
          let point = getPoint(ext, "topRight");
          overlay.setPosition(point);
          this.createImg(url, ext, { opacity: drawImgOpacity });
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
            });
            overlay.setPosition(null);
            InitMap.map.removeOverlay(overlay);
            removeSelect();
          },
          cancel: () => {
            // console.log('取消规划图')
            reject({ message: "您已取消上传规划图" });
            overlay.setPosition(null);
            InitMap.map.removeOverlay(overlay);
            removeSelect();
          },
        };
      });
      this.drawBox.on("drawabort", () => {
        reject({ code: -1, message: "操作中止" });
      });
      InitMap.map.addInteraction(this.drawBox);
    });
  };
}

let action = new Action();

export default action;
