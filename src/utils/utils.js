
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



