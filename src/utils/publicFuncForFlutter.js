
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
const CallWebFunction = (function_name , message ,msgType = 'objectStr')=>{
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
// 所有暴露在外面的方法
let callFunctions = {
   // 设置视图中心点
  setViewCenter: (val)=>{
    let view = _getMap('view');
    view.animate({
      zoom: view.getZoom(),
      center: [12682417.401133642, 2573911.8265894186]
    })
  }
}


window.CallWebMapFunction = CallWebFunction ;
