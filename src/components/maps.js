import React from 'react'
import 'ol/ol.css';
import 'utils/plot2ol/css/ol.css'
import 'utils/plot2ol/css/plottingol.less'
import { baseMapDictionary, baseMaps } from '../utils/mapSource'
import mapApp from '../utils/INITMAP'
import { getLocal } from '../utils/sessionManage'

const styles = {
  mapView:{
    width:"100%",
    height:"100%"
  }
}

export default class LayerMap extends React.Component{
  constructor(props){
    super(props)
    this.map = null;
    this.view = null;
  }
  componentDidMount(){
    // 开始构建地图
    this.initMap()
  }
  // 构建地图
  initMap = ()=>{
    let { onLoad } = this.props ;
    mapApp.init('MapsView').then( async _ =>{
      let {map} = _;
      // let arr = this.getBaseMapLayer();
      // !Array.isArray(arr) && (arr = [arr]);
      // arr.forEach(item => {
      //   map.addLayer(item)
      // })
      let baseMapKey = await getLocal('baseMapKey');
      baseMapKey = baseMapKey.data;
      let firstBaseMaps = undefined;
      if(!baseMapKey){
        firstBaseMaps = baseMapDictionary[0];
      }else{
        firstBaseMaps = baseMapDictionary.find(item => item.key === baseMapKey);
      }

      if(firstBaseMaps) {
        const values = firstBaseMaps.values
        const currenttBaseMaps = baseMaps.filter(item => {return values.indexOf(item.id) > -1})
        currenttBaseMaps.forEach(baseMap => {
          const layer = mapApp.createTilelayer(baseMap)
          mapApp.addBaseLayer(layer)
        })
      }
      // 父级回调
      onLoad && onLoad(_)
    })
  }
  // 获取底图
  // getBaseMapLayer = ()=>{
  //   let key = 'gaode',sourceType = "vec";
  //   let source = mapSource.baseMaps[key][sourceType].tile;
  //   // console.log(source)
  //   if(key !== 'google' && (key === 'gaode' && sourceType !=='vec')){
  //     source = [source];
  //     let road = mapSource.baseMaps[key].roadLabel.tile
  //     source.push(road)
  //   }
  //   return source;
  // }
  render(){
    return (
      <div style={styles.mapView} id="MapsView" onClick={e => {e.stopPropagation();e.preventDefault()}} 
      onTouchStart={e => {e.stopPropagation();e.preventDefault()}}>

      </div>
    )
  }
}

//  connect(({maps})=>({maps}))(LayerMap)
