/* eslint-disable no-loop-func */
import {
  addFeature,
  createStyle,
  Layer,
  Source,
  TransformCoordinate,
} from "../../utils/index";
import { Style, Icon, Circle as CircleStyle, Fill, Stroke, Text } from "ol/style";
import { Point } from "ol/geom";
import InitMap from "../../../utils/INITMAP";
import DEvt from "../../utils/event";
import { getVectorContext } from "ol/render";
import Feature from "ol/Feature";
import car_icon from '../../../assets/car_icon.png'
/**
 * 交通轨迹动画
 *
 * from 出发点，只允许一个点 [经纬度]
 * to 数组， 需要到达的点 [{coordinates: Array<Lng, Lat>, point: [Lng, lat]}]
 */
class LineOfAnimate {
  config = {
    from: [],
    to: [],
    moveIcon: "", // 播放的点图片，可以是点，可以是车
    playNumber: Infinity, // 循环播放次数，默认无限循环
    context: null, // 渲染的画布，如果没有画布，则只返回动画元素, 画布是openlayers的source
  };
  features = [];
  feature = [];
  Source = null;
  Layer = null;
  layerId = "animate_layer";
  number = 1;
  startPoint = null;
  props = null;
  animating = false; // 是否正在进行动画
  initFeature = false; // 是否构建完了初始
  speed = 600; // 速度
  carStyle = (text, visible = false) => {
    return new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        src: car_icon,
        opacity: !visible ? 0 : 1,
        scale: 0.2
      }),
      zIndex: 10,
      // text: new Text({
      //   text: text,
      //   fill: new Fill({
      //     color: visible ? '#ff0000' : 'rgba(0,0,0,0)'
      //   }),
      //   stroke: new Stroke({
      //     width: 3,
      //     color: visible ? '#ffffff' : 'rgba(0,0,0,0)'
      //   })
      // })
    })
  }
  // carStyle = createStyle("Point", {
  //   icon: {
  //     src: require("../../../assets/car_icon.png"),
  //     anchor: [0.5, 1]
  //   },
  // });

  constructor(props) {
    this.props = props;
    this.startPoint = props.startPoint;
    this.addLayer();
    DEvt.Evt.addEventListener("basemapchange", (key) => {
      // 检测是否是 笛卡尔坐标系
      let flag = InitMap.checkUpdateMapSystem(key);
      let needReload = false;
      if (flag) {
        // 通过纠偏字典算法纠偏
        let dic = InitMap.systemDic[key];
        // 更新页面所有坐标
        let features = this.Source.getFeatures();
        features.map((item) => {
          let type = item.getGeometry().getType();
          if (type === "Point") {
            let coor = item.getGeometry().getCoordinates();
            coor = TransformCoordinate(coor, "EPSG:3857", "EPSG:4326");
            coor = dic(coor[0], coor[1]);
            item.getGeometry().setCoordinates(TransformCoordinate(coor));
          } else if (type === "LineString") {
            needReload = true;
          }
          return item;
        });
        if (needReload) {
          DEvt.Evt.firEvent("CollectionUpdate:reload");
        }
      }
    });
  }
  // 添加一条线段
  addLine = (options) => {
    this.config = {
      ...this.config,
      ...options,
    };
    this.renderPlanLine();
  };
  // 添加图层
  addLayer = () => {
    let layer = InitMap.findLayerById(this.layerId);
    if (!layer) {
      this.Source = Source();
      this.Layer = Layer({ id: this.layerId, source: this.Source, zIndex: 10 });
      InitMap.map.addLayer(this.Layer);
    } else {
      this.Layer = layer;
      this.Source = layer.getSource();
    }
  };

  styles = (feature) => {
    // this.number++;
    // if(this.number % 2) return
    // let resolution = InitMap.view.getResolution();
    // var geometry = feature.getGeometry();

    // var length = geometry.getLength(); //获取线段长度

    // var radio = (120 * resolution) / length;

    // var dradio = 1; //投影坐标系，如3857等，在EPSG:4326下可以设置dradio=10000

    var styles = [
      createStyle("LineString", {
        strokeWidth: 4,
        strokeColor: "green",
        showName: true,
        placement: "point",
        text: `全程 ${(+feature.get("distance") / 1000).toFixed(
          1
        )}KM 共耗时 ${Math.ceil(+feature.get("time") / 60)}分钟`,
        textFillColor: "red",
        textStrokeColor: "#ffffff",
        font: 12,
        textOverflow: false,
        zIndex: 1,
      }),
    ];
    // let number = 0;
    // if(geometry.getType() === 'LineString')
    // geometry.forEachSegment(function (start, end) {
    //   number++;
    //   if (number % 20) return;
    //   var dx = end[0] - start[0];
    //   var dy = end[1] - start[1];
    //   var rotation = Math.atan2(dy, dx);
    //   styles.push(
    //     new Style({
    //       geometry: new Point(end),

    //       image: new Icon({
    //         src: require("../../../assets/arrow.png"),

    //         anchor: [0.75, 0.5],

    //         rotateWithView: false,

    //         rotation: -rotation + Math.PI,
    //       }),
    //       zIndex: 2,
    //     })
    //   );
    //   // if (start[0] === end[0] || start[1] === end[1]) return;

    //   // var dx1 = end[0] - arrowLocation[0];

    //   // var dy1 = end[1] - arrowLocation[1];

    //   // var dx2 = arrowLocation[0] - start[0];

    //   // var dy2 = arrowLocation[1] - start[1];

    //   // if (dx1 !== dx2 && dy1 !== dy2) {
    //   //   if (Math.abs(dradio * dx1 * dy2 - dradio * dx2 * dy1) < 1) {
    //   //     var dx = end[0] - start[0];

    //   //     var dy = end[1] - start[1];

    //   //     var rotation = Math.atan2(dy, dx);

    //   //     styles.push(
    //   //       new Style({
    //   //         geometry: new Point(arrowLocation),

    //   //         image: new Icon({
    //   //           src: require('../../../assets/arrow.png'),

    //   //           anchor: [0.75, 0.5],

    //   //           rotateWithView: false,

    //   //           rotation: -rotation + Math.PI,
    //   //         }),
    //   //       })
    //   //     );
    //   //   }
    //   // }
    // });
    return styles;
  };

  moveFeature = (event) => {
    var vectorContext = getVectorContext(event);
    var frameState = event.frameState;
    let features = this.Source.getFeatures();
    features.forEach((feature) => {
      if (feature.getGeometry().getType() === "LineString") {
        if (feature.get("animating")) {
          var elapsedTime = frameState.time - feature.get('startTime');
          // feature.getGeometry().getCoordinates().length / 500;
          var distance = (this.speed * elapsedTime) / 1e6;
          if (distance >= 1) {
            feature.set("animating", false);
            return;
          }
          let coor = new Point(feature.getGeometry().getCoordinateAt(distance))
          var f = new Feature(coor)
          let text = (feature.get('properties') || {}).name
          vectorContext.drawFeature(f, this.carStyle(`往${text}`, true));
        } else {
          feature.set('animating', true)
          feature.changed()
          feature.set('startTime', new Date().getTime())
        }
      }
    });
    InitMap.map.render()
    // var vectorContext = getVectorContext(event);
    // var frameState = event.frameState;

    // if (this.animating) {
    //   var elapsedTime = frameState.time - this.startTime;
    //   var distance = (this.speed * elapsedTime) / 1e6;

    //   if (distance >= 1) {
    //     this.stopAnimation(true);
    //     return;
    //   }

    //   var currentPoint = new Point(route.getCoordinateAt(distance));
    //   var feature = new Feature(currentPoint);
    //   vectorContext.drawFeature(feature, styles.geoMarker);
    // }
    // // tell OpenLayers to continue the postrender animation
    // InitMap.map.render();
  };

  stopAnimation = () => {};

  addMoveIcon = (coor) => {
    let point = new Point(coor || this.startPoint.coordinates)
    let car = new Feature({
      type: "geoMarker",
      geometry: point
    })
    return car;
  };

  // 初始化动画元素
  initAnimationFeatures = () => {
    this.initFeature = true;
    let features = this.Source.getFeatures();
    features.forEach((feature, i) => {
      if (feature.getGeometry().getType() === "LineString") {
        let car = this.addMoveIcon()
        let text = (feature.get('properties') || {}).name
        car.setStyle(this.carStyle(`往${text}`, false))
        this.Source.addFeature(car);
        feature.set('animating', true)
        // 设置开始时间
        feature.set('startTime', new Date().getTime())
        InitMap.map.render();
      }
    });
  };

  startAnimation = () => {
    // if (!this.initFeature) {
    this.Layer.un('postrender', this.moveFeature)
    this.Layer.on("postrender", this.moveFeature);
    this.initAnimationFeatures();
    // }
  };

  timer = null
  /**
   * 渲染画布中的线条，规划的路线
   */
  renderPlanLine = () => {
    if (this.props.showStartPoint) {
      this.renderStartPoint();
    }
    let coordinate = this.config.to;
    // let endCoor = item.point;
    let feature = addFeature("LineString", {
      coordinates: coordinate,
      ...this.config,
    });
    this.Source.addFeature(feature);
    // feature.setStyle(this.styles)
    this.features.push(feature);
    this.Layer.setStyle(this.styles);
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.startAnimation()
      this.renderEnd && this.renderEnd()
    }, 800)
  };

  /**
   * 渲染开始点
   */
  renderStartPoint = () => {
    if (this.Source.getFeatureById("startPoint")) return;
    this.startPoint.coordinates = TransformCoordinate(
      this.startPoint.coordinates
    );
    let feature = addFeature("Point", { ...this.startPoint, id: "startPoint" });
    let style = createStyle("Point", {
      icon: {
        src: require("../../../assets/startpoint.png"),
      },
    });
    feature.setStyle(style);
    this.Source.addFeature(feature);
  };

  clear = () => {
    this.Layer.un('postrender', this.moveFeature)
    this.Source.clear();
    this.features = [];
  };
}

export default LineOfAnimate;
