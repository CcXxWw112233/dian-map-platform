import React from 'react'
import styles from './index.less'
import mapMain from '../../../utils/INITMAP'
import { drawFeature ,addOverlay ,formatArea,formatLength} from '../../../utils/mapUtils'
import { fullScreen,exitScreen } from '../../../utils/utils'
import { always } from 'ol/events/condition'
import {DragZoom} from 'ol/interaction';
import {Circle as CircleStyle, Fill, Stroke, Style ,Icon} from 'ol/style';
import {createBox} from 'ol/interaction/Draw'

export default class PublicTools extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      activeTool:""
    }
    this.tools = [{
      name:"放大",
      toolkey:"zoomIn",
    },{
      name:"缩小",
      toolkey:"zoomOut",
    },{
      name:"框选放大",
      toolkey:"dragZoom",
    },
    {
      name:"坐标点",
      toolkey:"measurePoint"
    },
    {
      name:"测距",
      toolkey:"measureLine"
    },{
      name:"测面",
      toolkey:"measureArea"
    },{
      name:"全屏/退出全屏",
      toolkey:'fullScreen'
    },{
      name: '绘制矩形',
      toolkey: 'drawBox'
    },{
      name: '绘制圆',
      toolkey: 'drawCircle'
    }]
    this.dragZoom = null;
    this.drawLine = null;
    this.drawPolygon = null;
    this.drawPoint = null ;
    this.isFull = false;
    this.drawRectangle = null;
    this.drawCircle = null;
  }

  componentDidMount(){
    // 统一添加交互方法，用setActive激活和关闭
    this.addInteraction();
  }

  // 统一添加交互
  addInteraction = () =>{
    if(mapMain.map){
      window.map = mapMain.map
      // 框选放大交互
      this.dragZoom = new DragZoom({
        condition: always,
      })
      this.dragZoom.setActive(false);
      mapMain.map.addInteraction(this.dragZoom);
    }
  }
  // 激活工具
  toolActive = (val) => {
    // 删除交互
    drawFeature.removeOtherInterAction();
    const myStyle = new Style({
      fill: new Fill({
        color:'rgba(255,120,117,0.3)'
      }),
      stroke: new Stroke({
        color: "#f5222d",
        width: 2
    }),
    })
    // console.log(val)
    if(val.toolkey === 'zoomIn'){
      // 调用地图本身存在的放大缩小
      let zoomIn = document.querySelector('.ol-zoom-in');
      zoomIn && zoomIn.click();
      return ;
    }
    if(val.toolkey === 'zoomOut'){
      // 调用地图本身存在的放大缩小
      let dom = document.querySelector('.ol-zoom-out');
      dom && dom.click();
      return ;
    }

    if(val.toolkey === 'fullScreen'){
      if(this.isFull){
        this.isFull = false;
        exitScreen();
      }else{
        fullScreen();
        this.isFull = true;
      }
    }

    // 框选放大
    if(val.toolkey === 'dragZoom'){
      this.drawLine.setActive(false);
      this.drawPolygon.setActive(false)
      if(this.dragZoom.getActive()){
        // 关闭框选放大功能
        this.dragZoom.setActive(false)
      }else{
        // 激活框选放大功能
        this.dragZoom.setActive(true);
      }
    }

    // 测线
    if(val.toolkey === 'measureLine'){
      // 测量距离交互
      this.drawLine = drawFeature.addDraw(false, 'LineString' ,
      new Style({
        stroke:new Stroke({
          color: '#f5222d',
          width:3
        })
      }));
      mapMain.map.addInteraction(this.drawLine);
      this.drawLineGetLength();
    }

    if (val.toolkey === 'drawCircle') {
       // 绘制圆
       this.drawCircle = drawFeature.addDraw(false, 'Circle', myStyle);
       mapMain.map.addInteraction(this.drawCircle);
       this.drawCircleGetRadius()
    }

    if (val.toolkey === 'drawBox') {
      //画长方形
      this.drawBox = drawFeature.addDraw(false, 'Circle', myStyle, createBox())
      // this.drawBox.setActive(false);
      mapMain.map.addInteraction(this.drawBox);
      this.drawBoxGetX()
    }

    // 测面
    if(val.toolkey === 'measureArea') {
       // 测量面积交互
       this.drawPolygon = drawFeature.addDraw(false, 'Polygon',
       new Style({
         fill: new Fill({
           color:'rgba(255,120,117,0.3)'
         }),
         stroke: new Stroke({
           color: "#f5222d",
           width: 2
       }),
       }));
       mapMain.map.addInteraction(this.drawPolygon);
       this.drawPolygonGetArea();
    }

    if(val.toolkey === 'measurePoint'){
      // 挂载拾取坐标点的交互
      this.drawPoint =  drawFeature.addDraw(false,'Point',new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#f5222d'
          })
        })
      }))
      mapMain.map.addInteraction(this.drawPoint);
      this.drawPointGetPoint();
    }

    // 设置active样式
    if(val.toolkey !== this.state.activeTool)
    this.setState({
      activeTool: val.toolkey
    });
    else{
      this.setState({
        activeTool:""
      })
      // 删除当前存在的交互
      drawFeature.removeOtherInterAction();
    }
  }

  // 创建关闭按钮
  createIconElement = ()=>{
    let icon = document.createElement('span');
    icon.innerHTML = "X";
    let style = {
      position:'absolute',
      top:"-10px",
      righ:"5px",
      padding:"5px",
      width:"10px",
      height:"10px",
      lineHeight:"10px",
      color:"#000",
      fontSize:"12px",
      background:"#fff",
      borderRadius:"99px",
      cursor:"pointer"
    }
    Object.assign(icon.style, style);
    return icon ;
  }

  // overlay按钮
  createOverLayBtnElement =(count) => {
    let div0 = document.createElement('div')
    const style0 = {
      position: 'absolute',
      top: '10px',
      right: '-35px',
      display: 'flex',
      'flex-direction': 'column'
    }
    if (!count) count = 2
    Object.assign(div0.style,style0)
    for (let i = 0; i < count; i++) {
      let div = document.createElement('div')
      const style1 = {
        width: '40px',
        height: '30px',
        'margin-bottom': '5px',
        'background-color': 'white',
        'line-height': '30px',
        cursor: 'pointer'
      }
      div.innerHTML = '关闭'
      if (i === 1) div.innerHTML = '设置'
      Object.assign(div.style, style1)
      div0.appendChild(div)
    }
    return div0
  }

  // 画线获取长度
  drawLineGetLength = ()=>{
    // 构建overlay的类
    let getoverlay = new addOverlay();
    let overlay = null,icon = null;
    let isStart = false ;
    // 开始绘制
    this.drawLine.on('drawstart',(e)=>{
      isStart = true;
      // 创建一个overlay，让overlay有单独作用域
      overlay = getoverlay.add('drawLineLength');
      let ele = overlay.getElement();
      mapMain.map.addOverlay(overlay);
      let line = e.feature ;
      line.getGeometry().on('change',(geo) => {
        let target = geo.target;
        ele.innerHTML = formatLength(target)
        let lastCoor = target.getLastCoordinate();
        overlay.setPosition(lastCoor);
      })
      // 关闭按钮
      icon = this.createIconElement();

      icon.onclick = this.closeOverlay.bind(this,line,overlay,getoverlay,'line')
    })

    // 处理在绘画中关闭绘制的bug
    this.drawLine.on('change:active',(e)=>{
      let active = e.target.get(e.key);
      if(!active && isStart){
        getoverlay.removeByIndex(overlay);
      }
    })
    this.drawLine.on('drawend',(e)=>{
      isStart = false;
      let ele = overlay.getElement();

      ele.appendChild(icon);
      // getoverlay.removeByIndex(overlay)
    })
  }

  // 删除画的线,面和overlay
  closeOverlay = (feature, overlay, alloverlay, type = 'line')=>{
    // 删除overlay
    alloverlay.removeByIndex(overlay);
    let source = null;
    if(type === 'line'){
      source = this.drawLine.get('sourceInDraw')
    }else if(type === 'area'){
      source = this.drawPolygon.get('sourceInDraw')
    }
    else if(type === 'point'){
      source = this.drawPoint.get('sourceInDraw')
    }
    source.removeFeature(feature)
    let ele = overlay.getElement();
    ele.parentNode.removeChild(ele);
  }

  // 画框获取面积
  drawPolygonGetArea = () => {
    let allOverlay = new addOverlay();
    let overlay = null ,icon = null;
    let isStart = false;
    this.drawPolygon.on('drawstart',(ev)=>{
      isStart = true ;
      let feature = ev.feature;
      overlay = allOverlay.add('drawPolygonArea');
      let ele = overlay.getElement();
      // 将overlay添加
      mapMain.map.addOverlay(overlay);
      // 关闭按钮
      icon = this.createIconElement();

      icon.onclick = this.closeOverlay.bind(this,feature,overlay,allOverlay,'area')

      feature.getGeometry().on('change',(evt)=>{
        let target = evt.target;
        let area = formatArea(target);
        ele.innerHTML = area;
        let coordinate = target.getInteriorPoint().getCoordinates();
        overlay.setPosition(coordinate);
      })
    })

    // 处理正在绘制的时候，关闭绘制功能
    this.drawPolygon.on('change:active',(e)=>{
      let active = e.target.get(e.key);
      // 如果是关闭绘制功能，并且开始之后没有drawend
      if(!active && isStart){
        allOverlay.removeByIndex(overlay);
      }
    })
    this.drawPolygon.on('drawend',()=>{
      isStart = false;
      let ele = overlay.getElement();
      ele.appendChild(icon);
    })
  }

  // 画点获取坐标
  drawPointGetPoint = () => {
    let allOverlay = new addOverlay();
    let overlay = null,icon = null ;
    this.drawPoint.on('drawstart',(ev)=>{
      let feature = ev.feature ;
      let coordinate = feature.getGeometry().getCoordinates();
      overlay = allOverlay.add('drawPointTip');
      mapMain.map.addOverlay(overlay);
      overlay.getElement().innerHTML = String(coordinate);

      overlay.setPosition(coordinate);

      icon = this.createIconElement();

      icon.onclick = this.closeOverlay.bind(this,feature,overlay,allOverlay,'point')
    })
    this.drawPoint.on('drawend',()=>{
      overlay.getElement().appendChild(icon);
    })
  }

  // drawCircle
  drawCircleGetRadius = () => {
    const allOverlay = new addOverlay();
    this.drawCircle.on('drawstart', e =>{
      const feature = e.feature
      const overlay = allOverlay.add('drawCircleTip')
      mapMain.map.addOverlay(overlay)
      feature.getGeometry().on('change',(evt)=>{

        const radius = feature.getGeometry().getRadius()
        const el = overlay.getElement()
        el.innerHTML = radius.toFixed(2) + 'm'
        const centerPoi = evt.target.getCenter()
        const lastPoi = evt.target.getLastCoordinate()
        overlay.setPosition([(centerPoi[0] + lastPoi[0]) / 2, (centerPoi[1] + lastPoi[1]) / 2]);
      })
    })
    this.drawCircle.on('drawend', e=> {
      this.drawCircle.setActive(false)
    })
  }

  drawBoxGetX = () => {
    const allOverlay = new addOverlay();
    let overlay = null
    this.drawBox.on('drawstart', e =>{
      overlay = allOverlay.add('drawBoxTip')
      mapMain.map.addOverlay(overlay)
    })
    this.drawBox.on('drawend', e => {
      const el = overlay.getElement()
      const poi = e.feature.getGeometry().getCoordinates()[0][2]
      overlay.setPosition(poi)
      this.drawBox.setActive(false)
      const overlayEl = this.createOverLayBtnElement();
      el.appendChild(overlayEl)

    })
  }
  render(){
    let { activeTool } = this.state;
    return (
      <div className={styles.publicTools}>
        { this.tools.map(item => {
          return (
            <div className={`${styles.toolsItem} ${activeTool === item.toolkey ? styles.activeTool:""}`} key={item.toolkey} onClick={this.toolActive.bind(this, item)}>
              { item.name }
            </div>
          )
        }) }
      </div>
    )
  }
}
