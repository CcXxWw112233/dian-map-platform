import { setSession } from "../../../utils/sessionManage";
import listAction from "./ScoutingList";
import PhotoSwipe from "../../../components/PhotoSwipe/action";
import config from "../../../services/scouting";
import { dateFormat, Different } from "../../../utils/utils";
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
} from "../../utils/index";
import {
  CollectionOverlay,
  settingsOverlay,
  areaDetailOverlay,
} from "../../../components/PublicOverlays";
import { Modify } from "ol/interaction";
import { extend } from "ol/extent";
import { always, never } from "ol/events/condition";
import Event from "../../utils/event";
import { message } from "antd";
import { createPlottingFeature, createPopupOverlay } from "./createPlotting";
import { plotEdit } from "utils/plotEdit";
import INITMAP from "../../../utils/INITMAP";

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
  } = config;
  this.activeFeature = {};
  this.layerId = "scoutingDetailLayer"
  this.Layer = Layer({ id: this.layerId, zIndex: 11 });
  this.Source = Source();
  this.features = [];
  this.overlays = [];
  this.drawBox = null;
  this.init = (dispatch) => {
    this.Layer.setSource(this.Source);
    InitMap.map.addLayer(this.Layer);
    this.layer = plotEdit.getPlottingLayer(dispatch);
  };
  this.boxFeature = {};
  this.draw = null;
  this.lenged = null;
  this.oldData = [];
  let requestTime = 10 * 1000;

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
      interview: ["aac", "mp3", "语音", "m4a"], // 访谈
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
    this.removePlanPicCollection();
    // 删除元素
    this.features.forEach((item) => {
      if (this.Source.getFeatureByUid(item.ol_uid)) {
        this.Source.removeFeature(item);
      }
    });
    // 删除绘制的元素
    if (this.layer) {
      this.layer.projectScoutingArr &&
        this.layer.projectScoutingArr.forEach((item) => {
          if (item && item.feature) {
            InitMap.map.removeOverlay(item.feature.overlay);
            item && this.layer.removeFeature(item);
          }
        });
    }

    this.features = [];
  };

  this.renderPointCollection = (data, addOverlay = true) => {
    let array = findHasLocationData(data);
    // console.log(array)
    let features = [];
    array.forEach((item) => {
      let coor = TransformCoordinate([
        +item.location.longitude,
        +item.location.latitude,
      ]);
      let feature = addFeature("Point", { coordinates: coor, id: item.id });
      let style = createStyle("Point", {
        iconUrl: require("../../../assets/mark/collectionIcon.png"),
        strokeWidth: 2,
        strokeColor: "#fff",
        icon: { anchorOrigin: "bottom-left", anchor: [0.35, 0.25] },
      });

      let pointType = this.checkCollectionType(item.target);
      item.pointType = pointType;
      feature.setStyle(style);

      addOverlay && this.addOverlay(coor, item);

      features.push(feature);
    });
    return features;
  };

  // 查找feature
  this.findFeature = (id) => {
    for (let i = 0; i < this.layer.projectScoutingArr.length; i++) {
      const feature = this.layer.projectScoutingArr[i].feature;
      if (feature?.get("id") && feature?.get("id") === id) {
        return feature;
      }
    }
  };

  this.modifyFeature = (data) => {
    const feature = this.findFeature(data.id);
    InitMap.map.removeOverlay(feature && feature.overlay);
    feature.hasPopup = false;
    const plot = feature?.getGeometry();
    if (plot && !plot.isActive) {
      plot.updatePlot(true);
      feature.isScouting = true;
      this.layer.plotEdit.activate(feature);
    }
  };

  this.stopModifyFeature = () => {
    this.layer.plotEdit.deactivate();
  };

  // 修改图形后保存
  this.updateFeatueToDB = async (data, feature) => {
    const geometry = feature.getGeometry();
    const newCoordinates = geometry.getCoordinates();
    let content = JSON.parse(data.content);
    content.coordinates = newCoordinates;
    let newData = { ...data };
    newData.content = JSON.stringify(content);
    newData.create_by && delete newData.create_by;
    newData.create_time && delete newData.create_time;
    newData.update_time && delete newData.update_time;
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
    createPopupOverlay(feature, pixel);
  };

  // 渲染标绘数据
  this.renderFeaturesCollection = (
    data,
    { lenged, dispatch, addSource = true }
  ) => {
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
    data.forEach((item) => {
      let content = item.content;
      // console.log(item)
      if (!content) return;
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
        if (featureType.indexOf("https") === 0) {
          iconUrl = featureType
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
            let operator = me.layer._addFeature(feature);
            operator.isScouting = true;
            operator.data = item;
            operator.updateFeatueToDB = me.updateFeatueToDB.bind(me);
            me.layer.projectScoutingArr.push(operator);
            me.layer.plotEdit.plotClickCb = me.handlePlotClick.bind(me);
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
      if (addSource) {
        let operator = this.layer._addFeature(feature);
        operator.isScouting = true;
        this.layer.projectScoutingArr.push(operator);
        this.layer.plotEdit.plotClickCb = this.handlePlotClick.bind(this);
        operator.data = item;
        operator.updateFeatueToDB = this.updateFeatueToDB.bind(this);
      }
      this.features.push(feature);
    });

    if (!addSource) {
      return this.features;
    }

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
    { lenged, dispatch, animation = true }
  ) => {
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
    data.forEach(item => {
      if(item.type !== 'groupCollection'){
        arr.push(item);
      }
      else {
        arr = arr.concat(item.child);
      }
    })
    // 将所有数据更新
    data = arr ;
    // 过滤不显示的数据
    data = data.filter((item) => item.is_display === "1");

    let ponts = data.filter(
      (item) => item.collect_type !== "4" && item.collect_type !== "5" && item.collect_type !== 'group'
    );
    let features = data.filter((item) => item.collect_type === "4");
    let planPic = data.filter((item) => item.collect_type === "5");
    // 渲染点的数据
    let pointCollection = this.renderPointCollection(ponts);
    this.features = this.features.concat(pointCollection);
    this.Source.addFeatures(pointCollection);

    // 渲染标绘数据
    const sou = this.renderFeaturesCollection(features, { lenged, dispatch });

    // 渲染规划图
    let ext = await this.renderPlanPicCollection(planPic);

    if (!animation) return this.features;

    let sourceExtent = this.Source.getExtent();
    let subExtent = [Infinity, Infinity, -Infinity, -Infinity];
    let sourceFlag = getExtentIsEmpty(sourceExtent);
    let souFlag = getExtentIsEmpty(sou.getExtent());
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
        if (this.features.length && !getExtentIsEmpty(sourceExtent)) {
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
  };

  // 添加规划图编辑功能
  this.setEditPlanPicLayer = (staticImg) => {
    return new Promise((resolve, reject) => {
      if (staticImg) {
        this.hideCollectionOverlay();
        // 保存老的source源
        let oldSource = staticImg.getSource();
        let oldOpacity = staticImg.getOpacity();
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
            let obj = { extent: ext, opacity };
            this.showCollectionOverlay();
            resolve(obj);
          },
          cancel: () => {
            // 更新回原来的数据源
            staticImg.setSource(oldSource);
            staticImg.setOpacity(oldOpacity);
            reject({ code: -1, message: "取消编辑" });
            closeAll();
            this.showCollectionOverlay();
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

  //   渲染规划图
  this.renderPlanPicCollection = async (data) => {
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
    setTimeout(()=>{
      element.parentNode && (element.parentNode.style.visibility = 'visible');
    },850)
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
      ele.video.onplay = (e) => {};
    }

    ele.on = {
      imgClick: ({ target, name }) => {
        if (isLoading) return;
        isLoading = true;
        message.success("加载中...", 0);
        let img = new Image();
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
      preview: async (val)=>{
        // console.log(val)
        let { target , resource_url, resource_id} = val;
        let ty = this.checkCollectionType(target);
        if(ty === 'word'){
          if(target === 'pdf'){
            // pdf只需要打开
            window.open(resource_url ,'_blank');
          }else {
            let data = await GET_DOWNLOAD_URL(resource_id);
            let message = data.message;
            window.open(message,'_blank');
          }
        }
      }
    };
  };

  //   删除元素坐标的overlay
  this.removeLayer = (flag) => {
    this.removeOverlay();
    this.removeFeatures();
    this.removeAreaSelect();
    this.removePlanPicCollection();
    if(!flag)
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
    this.removeAreaSelect();
    this.areaSelect = setSelectInteraction({
      filter: (feature, layer) => {
        if (layer && layer.get("id") !== "scoutingDetailLayer") {
          return false;
        }
        if (
          (feature && !feature.get("collect_type")) ||
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
    console.log(files);
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
      Event.Evt.firEvent("CollectionUpdate:reload", arr);
    }
    // 将最新的数据更新到本地。用来对比
    this.oldData = data;
  };

  // 保存排序操作
  this.saveSortCollection = async (data) => {
    return await SORT_COLLECTION_DATA(data)
  }
  // 保存合并操作
  this.saveMergeCollection = async (data)=>{
    return await MERGE_COLLECTION(data);
  }
  // 取消合并操作
  this.cancelMergeCollection = async (data)=>{
    return await CANCEL_COLLECTION_MERGE(data);
  }
  // 采集资料的点击事件
  this.handleCollection = async (val)=>{
    let { target ,resource_url,title ,resource_id} = val;
    let pointType = this.checkCollectionType(target);
    if(pointType === 'word'){
      if(target === 'pdf'){
        // pdf只需要打开
        window.open(resource_url ,'_blank');
      }else {
        let data = await GET_DOWNLOAD_URL(resource_id);
        let message = data.message;
        window.open(message,'_blank');
      }
    }
    if(pointType === 'unknow'){
      let data = await GET_DOWNLOAD_URL(resource_id);
      let message = data.message;
      window.open(message,'_blank');
    }
    if(pointType === 'audio' || pointType === 'video'){
      window.open(resource_url,'_blank');
    }
    if(pointType === 'pic'){
      let img = new Image();
      img.src = resource_url;
      img.onload = ()=>{
        let w = img.width;
        let h = img.height;
        PhotoSwipe.show([{ w, h, src:img.src, title }]);
      }
    }

  }
}

let action = new Action();

export default action;
