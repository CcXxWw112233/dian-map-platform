import React from 'react'
import 'ol/ol.css';
import 'utils/plot2ol/css/ol.css'
import 'utils/plot2ol/css/plottingol.less'
import mapSource from '../utils/mapSource'
import mapApp from '../utils/INITMAP'

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
    mapApp.init('MapsView').then( _ =>{
      let {map} = _;
      // let arr = this.getBaseMapLayer();
      // !Array.isArray(arr) && (arr = [arr]);
      // arr.forEach(item => {
      //   map.addLayer(item)
      // })
      const layer = mapApp.createTilelayer(mapSource[0])
      mapApp.addLayer(layer, mapApp.baseMaps)
      // 父级回调
      onLoad && onLoad(_)
    })
  }
  // 获取底图
  getBaseMapLayer = ()=>{
    let key = 'gaode',sourceType = "vec";
    let source = mapSource.baseMaps[key][sourceType].tile;
    // console.log(source)
    if(key !== 'google' && (key === 'gaode' && sourceType !=='vec')){
      source = [source];
      let road = mapSource.baseMaps[key].roadLabel.tile
      source.push(road)
    }
    return source;
  }
  render(){
    return (
      <div style={styles.mapView} id="MapsView">

      </div>
    )
  }
}

//  connect(({maps})=>({maps}))(LayerMap)
