
// 获取浏览器定位数据
export const getLocation = ()=>{
  return new Promise((resolve, reject)=>{
    if(window.navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position)=>{
        resolve(position);
      })
    }else{
      reject({msg:"浏览器不支持定位"})
    }
  })
}

// 切换地图的统一方法
/**
 *
 * @param {传入需要显示的地图名称} key
 * @param {地图中存在的图层，用于显示隐藏和添加} tiles
 * @param {地图主体} map
 * @param {需要显示哪些图层的key 默认img地形图和roadLabel路线图，google的只显示img} showKeys
 */
export const ChangeMap = (key,tiles,map,showKeys = ['_img_tile','_roadLabel_tile']) =>{
  // 兼容参数传错
  if(!showKeys && !showKeys.length){
    showKeys = ['_img_tile']
  }
  // 谷歌地图只有地形图
  let enKey = [];
  switch(key){
    case "google":showKeys.map(item => {
      enKey.push('gg'+item);
      return 'gg'+item;
    }); break;
    case "tianditu": showKeys.map(item => {
      enKey.push('td'+item);
      return 'td'+item
    });break;
    case "gaode" : showKeys.map(item =>{
      enKey.push('gd'+item);
      return 'gd'+item;
    });break;
    default : console.log(enKey);
  }

  const mapSource = require('./mapSource').default;
  let sources = mapSource.baseMaps;
  if(key){
    // img,ver等字段
    let keys = Object.keys(sources[key]);
    // 取出这个需要展示的地图里面，存在哪些图层-包括
    let mids = [];
    // 循环，取出字段
    keys.forEach(item => {
      // 取出需要展示的字段
      if(item!=='title'){
        let mid = sources[key][item].tile.get('mid');
        mids.push(mid);
      }
    })

    // 取出showkeys对应需要展示的key
    let arr = [];
    enKey.forEach(item => {
      let reg = new RegExp(`${item}`,'g');
      let arrs = mids.filter(m => reg.test(m));
      arr = arr.concat(arrs);
    })


    // 找出已存在的图层，设置显示，如果无图层，则添加
    // console.log(tiles)
    if(tiles){
      tiles.forEach(item => {
        let type = item.get('layerOnType')
        if(type === 'baseMap')
        item.setVisible(false);
      })

      let isInMap = [];
      arr.forEach(item => {
        let isEnter = "";
        tiles.forEach(t => {
          if(t.get('mid') === item && t.get('mid')){
            isEnter = t;
            t.setVisible(true)
          }
        });
        if(!isEnter){
          isInMap.push(item);
        }
      })

      // console.log(arr,isInMap)
      // 循环之后，发现没有存在的图层，说明是新图层，需要添加并且显示
      if(isInMap.length){
        // 添加source中存储的图层，对显示的图层需要过滤
        isInMap.forEach(item => {
          let spl = item.split('_');
          let splKey = spl[1];
          let tile = sources[key][splKey].tile;
          // 添加需要显示的图层
          map.addLayer(tile);
        })
      }
    }
  }
}

export const fullScreen = ()=>{
    var el = document.documentElement;
    var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;

    //typeof rfs != "undefined" && rfs
    if (rfs) {
        rfs.call(el);
    }
    else if (typeof window.ActiveXObject !== "undefined") {
        //for IE，这里其实就是模拟了按下键盘的F11，使浏览器全屏
        var wscript = new window.ActiveXObject("WScript.Shell");
        if (wscript != null) {
            wscript.SendKeys("{F11}");
        }
    }
}

export function exitScreen(){
  var el = document;
  var cfs = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullScreen;

  //typeof cfs != "undefined" && cfs
  if (cfs) {
      cfs.call(el);
  }
  else if (typeof window.ActiveXObject !== "undefined") {
      //for IE，这里和fullScreen相同，模拟按下F11键退出全屏
      var wscript = new window.ActiveXObject("WScript.Shell");
      if (wscript != null) {
          wscript.SendKeys("{F11}");
      }
  }
}

export function dateFormat (val ,format){
  val = +val;
  function Zero(number){
    return number < 10 ? '0'+ number: number;
  }
  let date = new Date(val);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minut = date.getMinutes();
  let secon = date.getSeconds();
  
  let obj = {
    "yyyy": year,
    "MM": Zero(month),
    "dd": Zero(day),
    "HH": Zero(hour),
    "mm": Zero(minut),
    "ss": Zero(secon)
  }

  let keys = Object.keys(obj);
  keys.forEach(item => {
    format = format.replace(item, obj[item]);
  })

  return format;

}

export function keepLastIndex(obj) {
  if (window.getSelection) { //ie11 10 9 ff safari
      obj.focus(); //解决ff不获取焦点无法定位问题
      var range = window.getSelection(); //创建range
      range.selectAllChildren(obj); //range 选择obj下所有子内容
      range.collapseToEnd(); //光标移至最后
  } else if (document.selection) { //ie10 9 8 7 6 5
      var range = document.selection.createRange(); //创建选择对象
      //var range = document.body.createTextRange();
      range.moveToElementText(obj); //range定位到obj
      range.collapse(false); //光标移至最后
      range.select();
  }
}

// 格式化文件大小
export const formatSize = (limit)=>{
  var size = "";  
  var sizeFormat = "";
  if( limit < 0.1 * 1024 ){ //如果小于0.1KB转化成B  
      size = limit.toFixed(2);    
      sizeFormat = "B";
  }else if(limit < 0.1 * 1024 * 1024 ){//如果小于0.1MB转化成KB  
      size = (limit / 1024).toFixed(2);   
      sizeFormat = "KB";          
  }else 
  // if(limit < 0.1 * 1024 * 1024 * 1024)
  { //如果小于0.1GB转化成MB  
      size = (limit / (1024 * 1024)).toFixed(2);  
      sizeFormat = "MB";  
  }
  // else{ //其他转化成GB  
  //     size = (limit / (1024 * 1024 * 1024)).toFixed(2) ;  
  //     sizeFormat = "GB";  
  // }  
      
  var sizestr = size + "";   
  var len = sizestr.indexOf("\.");  
  var dec = sizestr.substr(len + 1, 2);  
  let text = "";
  if(dec == "00"){//当小数点后为00时 去掉小数部分  
      text = sizestr.substring(0,len) + sizestr.substr(len + 3,2);  
  }  
  return {size,text: sizeFormat};  
}

// 对比两个数组中的不同点
export function Different(fArr,cArr,field){
  let diffRes = []
  let fDatas = []
  let cDatas = []
  for(let i in fArr){
      let flg = false
      for(let j in cArr){
          if(cArr[j][field]===fArr[i][field]){
              flg = true
              break
          }
      }
      if(!flg){
          fDatas.push(fArr[i])
      }
  }
  for(let i in cArr){
      let flg = false
      for(let j in fArr){
          if(fArr[j][field]===cArr[i][field]){
              flg = true
              break
          }
      }
      if(!flg){
          cDatas.push(cArr[i])
      }
  }
  diffRes.push(...cDatas.concat(fDatas))
  return diffRes
}

// 定义一个深拷贝函数  接收目标target参数
export function deepClone(target) {
  // 定义一个变量
  let result;
  // 如果当前需要深拷贝的是一个对象的话
  if (typeof target === 'object') {
  // 如果是一个数组的话
      if (Array.isArray(target)) {
          result = []; // 将result赋值为一个数组，并且执行遍历
          for (let i in target) {
              // 递归克隆数组中的每一项
              result.push(deepClone(target[i]))
          }
       // 判断如果当前的值是null的话；直接赋值为null
      } else if(target===null) {
          result = null;
       // 判断如果当前的值是一个RegExp对象的话，直接赋值    
      } else if(target.constructor===RegExp){
          result = target;
      }else {
       // 否则是普通对象，直接for in循环，递归赋值对象的所有值
          result = {};
          for (let i in target) {
              result[i] = deepClone(target[i]);
          }
      }
   // 如果不是对象的话，就是基本数据类型，那么直接赋值
  } else {
      result = target;
  }
   // 返回最终结果
  return result;
}


