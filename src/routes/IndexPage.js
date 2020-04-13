import React from 'react';
import { connect } from 'dva';
import styles from './IndexPage.css';
import LayerMap from '../components/maps'
import ChangeBaseMap from '../components/subComponents/ChangeBaseMap/index'
import { ChangeMap } from '../utils/utils'
import PublicTools from '../components/subComponents/PublicTools/index'

import { getMyPosition } from '../utils/getMyPosition'
import axios from '../services/index'



class IndexPage extends React.Component{
  constructor(props){
    super(...arguments);
    this.map = null;
    this.view = null ;
    this.mySelfIcon = false ;
    this.positionTimer = null ;

  }
  componentDidMount(){

  }
  // 地图加载完成
  MapOnload = ({map,view})=>{
    this.map = map;
    this.view = view;
    this.setCenter(map,view);
  }

  // 通过高德地图获得自己的定位
  getMyCenter = (flag)=>{
    // 获取定位
    getMyPosition.getPosition().then(val => {
      // let coor = [114.11533,23.66666]
      // 转换地理坐标EPSG:4326 到 EPSG:3857
      let coordinate = getMyPosition.transformPosition(val);
      // 将视图平移到坐标中心点
      getMyPosition.setViewCenter(coordinate,200)
    })
  }

  setCenter = ()=>{
    // 渲染icon等;
    getMyPosition.drawPosition();
    // 启动监听--移动端才启用监听
    if(AMap.Browser.mobile){
      alert('当前是手机端页面，将启动移动位置更新')
      this.addWatchPosition();
    }
  }

  // 监听移动端的位置变化
  addWatchPosition = () => {
    this.positionTimer = setTimeout(()=>{
      getMyPosition.getPosition().then(obj => {
        let coordinate = getMyPosition.transformPosition(obj);
        // 改变自身的位置
        getMyPosition.setPosition(obj);
        getMyPosition.setViewCenter(coordinate,200);
        // 改变自身的精准范围
        getMyPosition.setPositionRadius(obj.accuracy);
      })
      // 无限回调监听位置
      this.addWatchPosition();
    },5 * 1000)
  }

  // 切换底图
  changeMap = (val,showkeys) => {
    let map = this.map ;
    let layers = map.getLayers();
    // 进行切换
    ChangeMap(val,layers,map,showkeys);
  }
  render(){
    return (
      <div className={styles.normal}>
        <span className={styles.getMyPosition} onClick={this.getMyCenter}>定位</span>
        {/* 地图主体 */}
        <LayerMap onLoad={this.MapOnload}/>
        {/* 切换底图组件 */}
        <ChangeBaseMap onChange={this.changeMap}/>
        {/* 工具栏 */}
        <PublicTools></PublicTools>

      </div>
    )
  }
}

IndexPage.propTypes = {
};

export default connect(({maps})=>({maps}))(IndexPage);
