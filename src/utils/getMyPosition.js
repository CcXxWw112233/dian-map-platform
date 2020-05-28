import MAINMAP from './INITMAP'
import { transform } from 'ol/proj'
import { Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import {Icon, Style ,Fill,Stroke} from 'ol/style';
import {Point ,Circle} from 'ol/geom';
import { Feature } from 'ol';

const iconpoint = require('../assets/loc.png');

export const getMyPosition = {
  // 渲染的icon
  positionIcon : null,
  // 渲染的位置偏差圆
  positionCircle: null,
  // 视图移动定时器
  viewTimer : null ,
  geolacation : null,
  source:null,
  layer:null,
  // 获取位置信息
  getPosition: function(){
    let _this = this ;
    return new Promise((resolve,reject) => {
      AMap.plugin('AMap.Geolocation', function() {
        let geo =  new AMap.Geolocation(
          {
            timeout: 10000,
          }
        );
        _this.geolacation = geo ;
        geo.getCurrentPosition(function(status,obj){
          console.log(status,obj);
          if(status.trim() === 'complete'){
            resolve(obj)
          }
          else{
            reject({status,obj})
          }
        });
      })
    })
  },

  // 转换高德获取的数据
  transformPosition:function (val, type){
    if(!val){
      return [0,0];
    }
    if(Array.isArray(val)){
      return transform(val, 'EPSG:4326', 'EPSG:3857')
    }
    if(arguments.length === 2){
      return transform([arguments[0],arguments[1]], 'EPSG:4326', 'EPSG:3857');
    }

    if(String(val) === '[object Object]'){
      // let { position } = val;
      let { lng,lat,latitude , longitude} = val;
      let coordinate = transform([+(lng || longitude),+( lat || latitude)], 'EPSG:4326', 'EPSG:3857');
      return coordinate ;
    }
  },
  // 清除元素
  clear:function(){
    if(this.source && this.source.getFeatureByUid(this.positionCircle && this.positionCircle.ol_uid)){
      this.source.removeFeature(this.positionCircle);
    }
    if(this.source && this.source.getFeatureByUid(this.positionIcon && this.positionIcon.ol_uid)){
      this.source.removeFeature(this.positionIcon);
    }
    MAINMAP.map.removeLayer(this.layer);
  },
  // 渲染icon和圆
  drawPosition: function(obj,transform = true) {
    // this.getPosition().then(obj => {
      // 获取转换的地址
      let coordinate = [];
      coordinate = transform ? this.transformPosition(obj) : obj.coordinate;
      // 误差
      let radius = obj.accuracy*10 || 1050;
      // icon 绘制
      let iconFeature = new Feature({
        geometry: new Point(coordinate),
        id:"",
        name:"My Self Point"
      })
      // 点
      var iconStyle = new Style({
        image: new Icon({
          radius:8,
          src: iconpoint
        })
      });
      // 偏差范围
      let cirCleFeature = new Feature({
        geometry: new Circle(coordinate , radius )
      })
      cirCleFeature.setStyle(new Style({
        fill:new Fill({
          color:"rgba(35,119,255,0.12)"
        }),
        stroke:new Stroke({
          color:"rgba(35,119,255,0.12)"
        })
      }))

      iconFeature.setStyle(iconStyle);

      this.positionIcon = iconFeature;
      this.positionCircle = cirCleFeature;
      this.source = new VectorSource({
        features: [ iconFeature, cirCleFeature]
      })
      this.layer = new VectorLayer({
        source: this.source
      })
      // 添加图层
      this.layer.setZIndex(15);
      MAINMAP.map.addLayer(this.layer);


      // 视图移动
      if(obj.isMove)
      this.setViewCenter(coordinate,1000);
    // })
  },

  // icon和圆圈变化位置
  setPosition: function (){
    let coordinate = [];
    // 统一处理传参
    if(arguments.length == 1){
      coordinate = this.transformPosition(arguments[0])
    }
    if(arguments.length == 2){
      coordinate = this.transformPosition(arguments[0],arguments[1]);
    }
    this.positionIcon && this.positionIcon.getGeometry().setCoordinates(coordinate);
    this.positionCircle && this.positionCircle.getGeometry().setCenter(coordinate);
  },

  // 当定位的准确范围更新了
  setPositionRadius: function(radius){
    radius = radius || 1050 ;
    this.positionCircle && this.positionCircle.getGeometry().setRadius(radius);
  },
  // 定位视角
  setViewCenter: function (coordinate,timer ,zoom){
    timer = timer || 0;
    zoom = zoom || 13
    clearTimeout(this.viewTimer);
    this.viewTimer = setTimeout(()=>{
      MAINMAP.view.animate({
        zoom: zoom,
        center: coordinate
      })
    },timer)
  }
}
