// import initMap from './INITMAP'
import { getMyPosition } from './getMyPosition'
import { TransformCoordinate ,Source,Layer  ,addFeature ,createStyle} from '../lib/utils/index'
import axios from 'axios'
import { baseConfig } from '../globalSet/config'
import { draw } from "utils/draw";


// 获取地图和视图
const _getMap = (key) =>{
  const initMap = require('./INITMAP').default ;
  if(key)
  return initMap[key] || {};
  else {
    return initMap || {};
  }
}

// 全局的针对Flutter APP进行交互的方法
const CallWebFunction = (function_name , message ,msgType = 'objct')=>{
  // 需要有调用方法
  if(!function_name){
    return JSON.stringify({code: -1, message:"The method name to be called was not passed in"})
  }
  // 需要确保传入的是可识别的数据--object
  if(message && msgType === 'objectStr'){
    message = JSON.parse(message);
  }

  // 调用方法
  if(callFunctions[function_name]){
    return callFunctions[function_name].call(this, message)
  }
}

let timer = null;
const MapMoveSearch = function(){
  // console.log(e)
  clearTimeout(timer);
  // 只取最后一次的移动操作，防止过度请求。
  timer = setTimeout(()=>{
    let center = CallWebFunction('getCenter');
    CallWebFunction('SearchForPoint',{position: TransformCoordinate(center,'EPSG:3857','EPSG:4326') })
  },1000);
  
}

// 所有暴露在外面的方法
let callFunctions = {
  lineMsg :[],
  line:null,
  source:Source(),
  layer: Layer({id:"flutter_layer",zIndex:11}),
  Init:()=>{
    let map = _getMap('map');
    callFunctions.layer.setSource(callFunctions.source);
    map.addLayer(callFunctions.layer);
  },
  isMounted:false,
   // 设置视图中心点
  setViewCenter: (val)=>{
    let view = _getMap('view');
    view.animate({
      zoom: view.getZoom(),
      center:(val && TransformCoordinate(val)) || [12682417.401133642, 2573911.8265894186]
    })
    return view.getCenter();
  },
  // 获取视图中心点
  getCenter: ()=>{
    let view = _getMap('view');
    return view.getCenter();
  },

  // 开始记录
  startRecord:({coordinates, time})=>{
    let coor = TransformCoordinate(coordinates);
    // 如果没加载图层，则加载图层
    if(!callFunctions.isMounted){
      callFunctions.Init();
      callFunctions.isMounted = true;
    }
    // 如果没有加载线段，则加载线段
    if(!callFunctions.line){
      console.log('构建初始点')
      let style = createStyle('LineString',{
        strokeWidth:3
      })
      callFunctions.line = addFeature('LineString',{
        coordinates:[coor],
        style: style
      })
      callFunctions.source.addFeature(callFunctions.line);
    }else{
      // 添加线段的点
      console.log('记录更新的点...')
      callFunctions.line.getGeometry().appendCoordinate(coor);
    }
    callFunctions.lineMsg.push({coordinates:coordinates,time});
  },
  // 停止记录
  stopRecord:({isRemoveLayer = false,coordinates,time})=>{
    if(!callFunctions.line) return console.log('没有线段记录');
    
    if(coordinates)
    callFunctions.lineMsg.push({coordinates,time});

    let string = JSON.stringify(callFunctions.lineMsg);
    console.log('获取到了数据')
    if(!isRemoveLayer){
      console.log('获取数据保存')
      // let color = style.getStroke().getColor();
      callFunctions.lineMsg = [];
      window.stopRecord && window.stopRecord.postMessage(string)
      return string;
    }
    console.log('清除页面中画的线，停止')

    callFunctions.source.removeFeature(callFunctions.line);
    callFunctions.line = null;
    window.stopRecord && window.stopRecord.postMessage(string)
    return string;
    // callFunctions.isMounted = false;
  },

  // 设置定位位置
  setMapLocation: (val)=>{
    let coor = [ +val.longitude,+val.latitude];
    // 绘制定位信息
    // 如果已经展示了定位信息之后就只改变position
    if(getMyPosition.positionCircle || getMyPosition.positionIcon){
      getMyPosition.setPosition(coor);
    } else {
      // 没有绘制就进行绘制，并设置样式
      getMyPosition.drawPosition({isMove:true,...val});
    }
    
  },
  // 切换底图
  ChangeBaseMap: (key)=>{
    if(!key) return ;
    const initMap = require('./INITMAP').default ;
    initMap.changeBaseMap(key);
  },
  // 监听地图移动
  StartMove: ()=>{
    let map = _getMap('map');
    map.on('moveend',MapMoveSearch);
  },
  // 停止监听地图拖动
  StopSearch: ()=>{
    let map = _getMap('map');
    map.un('moveend',MapMoveSearch);
  },
  // 逆编码转换坐标
  getAddressForName:({address = '', offset = 1, fromCity = ""})=>{
    if(!address) return Promise.reject({status:401});
    return new Promise((resolve, reject) => {
      let url = 'https://restapi.amap.com/v3/place/text'
      let params = {
        key: baseConfig.GAODE_SERVER_APP_KEY,
        keywords: address,
        offset:offset || 1,
        city:fromCity || undefined,
        extensions:"base"
      }
      axios.get(url,{params}).then(res => {
        // console.log(res)
        if(res.status === 200){
          let data = res.data;
          if(data.info === "OK"){
            if(offset === 1)
            resolve(data.pois[0]);
            else resolve(data.pois);
          }else{
            reject(data);
          }
        }else{
          reject(res);
        }
      }).catch(err => {
        reject(err);
      })
    })
    
  },
  // 通过点搜索周围数据
  SearchForPoint: async (val)=>{
    let { position ,radius = 200 ,locationName} = val;
    if(locationName){
      let data = await callFunctions.getAddressForName({ address: locationName})
      // console.log(data);
      if(data){
        position = data && data.location.split(',').map(item => +item);
      }
    }
    AMap.service(["AMap.PlaceSearch"], function() {
      let placeSearch = new AMap.PlaceSearch({
        pageSize:10,
        pageIndex:1
      })
      placeSearch.searchNearBy('',position,radius,(status,result)=>{
        // 调用移动端的监听发送数据
        window.getNearbyAddressInfo && 
        window.getNearbyAddressInfo.postMessage(JSON.stringify(result.poiList));
        
      })
    })
    // 调用启动监听
    callFunctions.StartMove();
  },

  // 绘制标绘
  startDraw:({type})=>{
    if(!type) return new Error('缺少type');
    const plottingLayer = draw.create(type);
    // console.log(draw)

    draw.onActiveEventListener((e)=>{
      console.log(e)
    })
  }
}

window.CallWebMapFunction = CallWebFunction ;
