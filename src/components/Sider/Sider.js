import React from 'react';
import { connect } from 'dva';
import styles from './IndexPage.css';
import 'antd/dist/antd.css'
import LayerMap from '../components/maps'
import ChangeBaseMap from '../components/subComponents/ChangeBaseMap/index'
import { ChangeMap } from '../utils/utils'
import PublicTools from '../components/subComponents/PublicTools/index'

import { getMyPosition } from '../utils/getMyPosition'
import axios from '../services/index'

import { ToolBar, Location, LayerControl } from 'components/index'

import { Drawer } from 'antd'




class IndexPage extends React.Component{
  constructor(props){
    super(...arguments);
    this.map = null;
    this.view = null ;
    this.mySelfIcon = false ;
    this.positionTimer = null ;
    // this.state = {
    //   draw_
    // }

  }
  state = {
    visible: true,
    placement: 'left',
    left: '0px',
    draw_visible: false
    }

  showDrawer = () => {
    const { draw_visible } = this.state
    this.setState({
      draw_visible: !draw_visible
    })
    // if (this.state.left === '0px') {
    //   this.setState({
    //     left: '-300px'
    //   })
    // } else {
    //   this.setState({
    //     left: '0px'
    //   })
    // }
  }
  onClose = () => {
    this.setState({
      visible: false,
    });
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
    const { draw_visible } = this.state
    const { children, aa } = this.props
    return (
      <div className={styles.normal}>
          <div style={{ width: '300px', height:'100%',position:'absolute', top: '0px', left:draw_visible?0 : -300, backgroundColor:'#fff'}}>
          <div style={{ width:'100%',height:'100%'}}>
           {children}
          </div>
          <div style={{ width:'28px', height:'72px', position:'absolute', bottom: '10px', left: '100%', backgroundColor:'#EFF0EF'}} onClick={this.showDrawer}></div>
        </div>
      </div>
    )
  }
}

IndexPage.propTypes = {
};

export default connect(({maps})=>({maps}))(IndexPage);
