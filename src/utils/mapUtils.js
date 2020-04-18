import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector'
import { Draw } from 'ol/interaction';
import initMap from './INITMAP'
import Overlay from 'ol/Overlay';
import {getLength, getArea } from 'ol/sphere'

// 公用画图交互事件
export const drawFeature = {
  //
  initLayer: function(type){
    if(this.keys[type]){
      return this.keys[type];
    }
    let layer = new VectorLayer({
      source: new VectorSource({wrapX:false})
    })
    layer.type = 'vector'
    const mapApp = initMap
    mapApp.map.addLayer(layer);
    this.keys[type] = {
      layer: layer,
      source: layer.getSource()
    }
    return this.keys[type];
  },
  draw: null ,
  keys:{},
  // 添加绘图功能
  addDraw:function(getData , type ,style, geoFunc) {
    let lay = this.initLayer(type);
    // 删除已有的，新建一个新的交互逻辑
    this.removeOtherInterAction();
    getData = getData || false; type = type || 'LineString';
    let options = {
      source: lay.source,
      type: type
    }
    if (geoFunc) {
      options.geometryFunction = geoFunc
    }
    this.draw = new Draw(options)

    // 设置样式
    if(style){
      lay.layer.setStyle(style)
    }

    lay.layer.setZIndex(10);
    this.draw.set('sourceInDraw',lay.source)
    return this.draw ;
  },

  // 删除action
  removeOtherInterAction:function(action){
    initMap.map.removeInteraction(action || this.draw);
  }
}

// 创建一个单独的overlay
export const mapOverlay = {
  overlay: null,
  // 创建overlay
  createOverlayElement: function(className){
    let ele = document.querySelector('#overlayElement_dom');
    if(ele){
      return ele;
    }
    let div = document.createElement('div');
    div.id = 'overlayElement_dom';
    div.className = 'overlayPositionModal';
    div.classList.add(className)
    document.body.appendChild(div);
    return div;
  },
  // 保存已有的overlay元素
  overlayElement: function(){
    return this.createOverlayElement();
  },
  removeOverlay:function(){
    initMap.map.removeOverlay(this.overlay)
  },
  // 设置位置
  setPosition: function(position){
    if(this.overlay){
      this.overlay.setPosition(position)
    }else{
      this.overlay = new Overlay({
        element:this.overlayElement(),
        position
      })
      initMap.map.addOverlay(this.overlay)
    }
  }
}

// 可以多个创建overlay
export const MyOverlay = function(){
  this.overlays = [];
  this.indexNumber = 0;
  this.add = function(className){
    let ele = document.createElement('div');
    document.body.appendChild(ele);
    ele.className = "tooltip_overlay"
    ele.classList.add(className);

    let overlay = new Overlay({
      element: ele,
      positioning: "bottom-center",
      offset:[6, -11],
      stopEvent: true
    })
    overlay.set('index',this.indexNumber)
    this.indexNumber += 1;
    this.overlays.push(overlay);
    return overlay;
  };
  // 清除所有overlay
  this.clear = function(){
    this.overlays.forEach(item => {
      initMap.map.removeOverlay(item);
    })
    this.overlays = [];
  };

  this.findOverlayById = function(id) {
    return this.overlays.find(item => item.id === id)
  }

  this.remove = function(id) {
    for (let i = 0; i < this.overlays.length; i++) {
      if(this.overlays[i].id === id) {
        initMap.map.removeOverlay(this.overlays[i])
        this.overlays.splice(i,1);
        this.indexNumber -= 1
        break 
      }
    }
  }
  // 按照overlay中的下标进行删除
  this.removeByIndex = function(lay){
    // console.log(this)
    let index = lay.get('index');
    // console.log(index);
    let item = this.overlays[index];
    if(item){
      initMap.map.removeOverlay(item);
      this.overlays.splice(index,1);
      this.indexNumber -= 1;
    }
  }
}

export const formatLength = function(line){
  var length = getLength(line);
  var output;
  if(length>1000){
      output = (Math.round(length/1000*100)/100)+"km";
  }
  else{
      output = (Math.round(length*100)/100)+"m";
  }
  return output;
}

export const formatArea = function(polygon){
  var area = getArea(polygon);
  var output;
  if(area > 1000000){
      output = (Math.round(area/1000000*100)/100)+"km<sup>2</sup>";
  }
  else{
      output= (Math.round(area*100)/100)+"m<sup>2</sup>";
  }
  return output;
}
