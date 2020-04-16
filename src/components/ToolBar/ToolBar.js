import React, { PureComponent } from 'react'
import { DropOption } from 'components'
import styles from './ToolBar.less'
import { myZoomIn, myZoomOut, myFullScreen, myDragZoom } from 'utils/drawing/public'
import { boxDrawing, circleDrawing, lineDrawing, pointDrawing, polygonDrawing } from 'utils/drawing/index'

export default class ToolBar extends PureComponent {
  render() {
    const tools = [{
      name: '对比',
      key: 'contrast',
      icon: 'icon-icon-cemian', 
      children: [
        {
        name: '存为对照组',
        key: 'save',
        icon: 'icon-icon-cemian',
        callBakFn: (()=>{})
      },{
        name: '读取对照组',
        key: 'read',
        icon: 'icon-icon-cemian',
        callBakFn: (()=>{})
      }
    ]},{
      name: '标绘',
      key: 'plotting',
      icon: 'icon-icon-cemian',
      children: [
        {
        name: '标记点',
        key: 'point',
        icon: 'icon-icon-cemian',
        callBakFn: pointDrawing.createDrawing.bind(pointDrawing)
      },{
        name: '标记线',
        key: 'line',
        icon: 'icon-icon-cemian',
        callBakFn: lineDrawing.createDrawing.bind(lineDrawing)
      },{
        name: '标记面',
        key: 'polygon',
        icon: 'icon-icon-cemian',
        callBakFn: polygonDrawing.createDrawing.bind(polygonDrawing)
      }
    ]},{
      name: '批注',
      key: 'annotation',
      icon: 'icon-icon-cemian',
      children:[
        {
        name: '文字',
        key: 'word',
        icon: 'icon-icon-cemian',
        callBakFn: (()=>{})
      },{
        name: '箭头',
        key: 'arrow',
        icon: 'icon-icon-cemian',
        callBakFn: (()=>{})
      },{
        name: '矩形',
        key: 'rect',
        icon: 'icon-icon-cemian',
        callBakFn: boxDrawing.createDrawing.bind(boxDrawing)
      },{
        name: '圆形',
        key: 'circle',
        icon: 'icon-icon-cemian',
        callBakFn: circleDrawing.createDrawing.bind(circleDrawing)
      }]
    },{
      name: '缩放',
      key: 'zoom',
      icon: 'icon-icon-cemian',
      children: [
        {
        name: '放大',
        key: 'zoomIn',
        icon: 'icon-icon-cemian',
        callBakFn: myZoomIn.bind(myZoomIn)
      },{
        name: '缩小',
        key: 'zoomOut',
        icon: 'icon-icon-cemian'
      },{
        name: '框选区域放大',
        key: 'zoomIn2',
        icon: 'icon-icon-cemian',
        callBakFn: myZoomOut.bind(myZoomOut)
      }]
    },{
      name: '全屏',
      key: 'fullscreen',
      icon: 'icon-icon-cemian',
      children: [],
      callBakFn: myFullScreen.change.bind(myFullScreen)
    }]
    return (
      <div className={ styles.toolbar}>
        { tools.map(item => {
          return (
            <DropOption
            options = { item }
            key = { item.key }
            />
          )
        })}
      </div>
    )
  }
}