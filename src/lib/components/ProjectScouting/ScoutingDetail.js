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
  fitPadding,
  SourceStatic,
} from "../../utils/index";
import {
  CollectionOverlay,
  settingsOverlay,
  areaDetailOverlay,
} from "../../../components/PublicOverlays";
import { Modify } from "ol/interaction";
import { extend } from "ol/extent";
import { always, never } from "ol/events/condition";

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
  this.lenged = null;

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
      interview: ["aac", "mp3", "语音"], // 访谈
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
        "txt",
        "xmind",
        "pdf",
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
    if (this.polygonOverlay) {
      this.polygonOverlay.setPosition(null);
      InitMap.map.removeOverlay(this.polygonOverlay);
    }
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

  // 查找feature
  this.findFeature = (id) => {
    for (let i = 0; i < this.features.length; i++) {
      let item = this.features[i];
      if (item.get("id") && item.get("id") === id) {
        return item;
      }
    }
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

  // 渲染标绘数据
  this.renderFeaturesCollection = (data, { lenged, dispatch }) => {
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
    this.lenged = {
      title: "项目踏勘",
      key: "map:projectScouting",
      content: [],
    };
    data.forEach((item) => {
      let content = item.content;
      // console.log(item)
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
      if (featureType.indexOf("/") > -1) {
        isImage = true;
        featureType = featureType.replace("img", "");
        iconUrl = require("../../../assets" + featureType);
        if (hasIndex < 0) {
          obj = {
            imgSrc: iconUrl,
            font:
              content.selectName === "自定义类型"
                ? content.name
                : content.selectName,
            type: featureLowerType,
          };
          this.lenged.content.push(obj);
        }
      } else {
        if (hasIndex < 0) {
          obj = {
            bgColor: featureType,
            font:
              content.selectName === "自定义类型" || content.selectName === ""
                ? content.name
                : content.selectName,
            type: featureLowerType,
          };
          this.lenged.content.push(obj);
        }
      }
      let feature = addFeature(content.geoType, {
        coordinates: content.coordinates,
        ...item,
        ...content,
      });

      // code by liulaian
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
          img.src = iconUrl;
          const me = this;
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
            me.Source.addFeature(feature);
            me.features.push(feature);
            return;
          };
          return;
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
      this.Source.addFeature(feature);
      this.features.push(feature);
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
      newConfig = lenged[lengedIndex];
    } else {
      newConfig = lenged.concat(this.lenged);
    }
    if (this.lenged.content.length > 0) {
      dispatch({
        type: "lengedList/updateLengedList",
        payload: {
          config: newConfig,
        },
      });
    }

    // 添加区域选择
    this.addAreaSelect();
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
  this.renderCollection = async (data, { lenged, dispatch }) => {
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
    let ext = await this.renderPlanPicCollection(planPic);
    data &&
      data.length &&
      setTimeout(() => {
        // 当存在feature的时候，才可以缩放
        if (this.features.length)
          Fit(
            InitMap.view,
            ext.length
              ? extend(ext, this.Source.getExtent())
              : this.Source.getExtent(),
            {
              size: InitMap.map.getSize(),
              padding: fitPadding,
            },
            800
          );
      });
  };

  // type coordinate or extent
  this.toCenter = ({ center, type = "coordinate", duration = 800, zoom }) => {
    if (type === "coordinate") {
      center = TransformCoordinate(center);
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
  };

  // 添加规划图编辑功能
  this.setEditPlanPicLayer = (staticImg) => {
    return new Promise((resolve, reject) => {
      if (staticImg) {
        // 保存老的source源
        let oldSource = staticImg.getSource();
        // 保存图片地址
        let url = oldSource.getUrl();
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
            if (layer.get("id") !== "scoutingDetailLayer") {
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
            let obj = { extent: ext, opacity };
            resolve(obj);
          },
          cancel: () => {
            // 更新回原来的数据源
            staticImg.setSource(oldSource);
            reject({ code: -1, message: "取消编辑" });
            closeAll();
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
    this.imgs = [];
    window.stop();
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
    });

    staticimg.on("imageloaderror", () => {
      _that.Source.removeFeature(this.box);
    });
  };

  //   渲染规划图
  this.renderPlanPicCollection = async (data) => {
    //   console.log(data);
    // 所有规划图加载的范围
    let ext = [];

    let promise = data.map((item) => {
      if (item.resource_id) {
        return GET_PLAN_PIC(item.resource_id);
      }
    });
    this.imgs = [];
    let res = await Promise.all(promise);
    // .then((res) => {
    this.imgs = [];
    res.forEach((item) => {
      let resp = item.data;
      let extent = resp.extent
        ? resp.extent.split(",").map((e) => parseFloat(e))
        : [];
      let img = ImageStatic(PLAN_IMG_URL(resp.id), extent, {
        opacity: +resp.transparency,
        minZoom: 10,
      });
      let stati = img.getSource();
      // 添加规划图加载状态
      new loading(stati, extent, resp);
      img.set("id", resp.id);
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
    this.removeAreaSelect();
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

    this.staticimg = ImageStatic(url, extent, {
      className: "staticImg",
      ...data,
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
    this.removeAreaSelect();
    this.areaSelect = setSelectInteraction({
      filter: (feature, layer) => {
        if (layer && layer.get("id") !== "scoutingDetailLayer") {
          return false;
        }
        if (
          (feature && !feature.get("collect_type")) ||
          feature.getGeometry().getType !== "Polygon" ||
          !feature.get("remark")
        ) {
          return false;
        }

        return true;
      },
    });
    InitMap.map.addInteraction(this.areaSelect);

    this.areaSelect.on("select", (e) => {
      let selected = e.selected[0];
      if (selected) {
        if (this.polygonOverlay) {
          this.polygonOverlay.setPosition(null);
          InitMap.map.removeOverlay(this.polygonOverlay);
        }
        this.addSelectOverlay(selected);
      } else {
        if (this.polygonOverlay) {
          this.polygonOverlay.setPosition(null);
          InitMap.map.removeOverlay(this.polygonOverlay);
        }
      }
    });
    //
  };

  // 点击的时候添加overlay
  this.addSelectOverlay = (feature) => {
    let type = feature.getGeometry().getType();
    let coor = feature.getGeometry().getExtent();
    let point = getPoint(coor, "topRight");
    let remark = feature.get("remark") || "";
    if (type === "Polygon" && remark) {
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

      this.polygonOverlay = createOverlay(ele.element);
      ele.on = {
        close: () => {
          this.areaSelect.dispatchEvent({ type: "select", selected: [] });
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
    });
    // snap = new Snap({features:this.select.getFeatures()});
    InitMap.map.addInteraction(this.modify);
    // InitMap.map.addInteraction(snap);
    InitMap.map.addInteraction(this.select);
    return { modify: this.modify, snap };
  };

  // 添加规划图范围
  this.addPlanPictureDraw = (url, data) => {
    // 删除已有的select事件，防止冲突
    this.removeAreaSelect();
    return new Promise((resolve, reject) => {
      this.drawBox = drawBox(this.Source, (data = {}));

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
            this.addAreaSelect();
          },
          cancel: () => {
            // console.log('取消规划图')
            reject({ message: "您已取消上传规划图" });
            overlay.setPosition(null);
            InitMap.map.removeOverlay(overlay);
            removeSelect();
            this.addAreaSelect();
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
