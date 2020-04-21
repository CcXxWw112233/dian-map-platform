import React, { PureComponent } from "react";
import { DropOption } from "components";
import styles from "./ToolBar.less";
import {
  myZoomIn,
  myZoomOut,
  myFullScreen,
  myDragZoom,
} from "utils/drawing/public";
import { draw } from "utils/draw";
import { boxDrawing, circleDrawing, lineDrawing, pointDrawing, polygonDrawing,arrowDrawing,textDrawing } from 'utils/drawing/index'

export default class ToolBar extends PureComponent {
  render() {
    // const tools = [{
    //   name: '对比',
    //   key: 'contrast',
    //   icon: 'icon-icon-cemian',
    //   children: [
    //     {
    //     name: '存为对照组',
    //     key: 'save',
    //     icon: 'icon-icon-cemian',
    //     callBakFn: (()=>{})
    //   },{
    //     name: '读取对照组',
    //     key: 'read',
    //     icon: 'icon-icon-cemian',
    //     callBakFn: (()=>{})
    //   }
    // ]},{
    //   name: '标绘',
    //   key: 'plotting',
    //   icon: 'icon-icon-cemian',
    //   children: [
    //     {
    //     name: '标记点',
    //     key: 'point',
    //     icon: 'icon-icon-cemian',
    //     callBakFn: pointDrawing.createDrawing.bind(pointDrawing)
    //   },{
    //     name: '标记线',
    //     key: 'line',
    //     icon: 'icon-icon-cemian',
    //     callBakFn: lineDrawing.createDrawing.bind(lineDrawing)
    //   },{
    //     name: '标记面',
    //     key: 'polygon',
    //     icon: 'icon-icon-cemian',
    //     callBakFn: polygonDrawing.createDrawing.bind(polygonDrawing)
    //   }
    // ]},{
    //   name: '批注',
    //   key: 'annotation',
    //   icon: 'icon-icon-cemian',
    //   children:[
    //     {
    //     name: '文字',
    //     key: 'word',
    //     icon: 'icon-icon-cemian',
    //     callBakFn: textDrawing.createDrawing.bind(textDrawing)
    //   },{
    //     name: '箭头',
    //     key: 'arrow',
    //     icon: 'icon-icon-cemian',
    //     callBakFn: arrowDrawing.createDrawing.bind(arrowDrawing)
    //   },{
    //     name: '矩形',
    //     key: 'rect',
    //     icon: 'icon-icon-cemian',
    //     callBakFn: boxDrawing.createDrawing.bind(boxDrawing)
    //   },{
    //     name: '圆形',
    //     key: 'circle',
    //     icon: 'icon-icon-cemian',
    //     callBakFn: circleDrawing.createDrawing.bind(circleDrawing)
    //   }]
    // },{
    //   name: '缩放',
    //   key: 'zoom',
    //   icon: 'icon-icon-cemian',
    //   children: [
    //     {
    //     name: '放大',
    //     key: 'zoomIn',
    //     icon: 'icon-icon-cemian',
    //     callBakFn: myZoomIn.bind(myZoomIn)
    //   },{
    //     name: '缩小',
    //     key: 'zoomOut',
    //     icon: 'icon-icon-cemian',
    //     callBakFn: myZoomOut.bind(myZoomOut)
    //   },{
    //     name: '框选区域放大',
    //     key: 'zoomIn2',
    //     icon: 'icon-icon-cemian',
    //     callBakFn: myDragZoom.setVal.bind(myDragZoom)
    //   }]
    // },{
    //   name: '全屏',
    //   key: 'fullscreen',
    //   icon: 'icon-icon-cemian',
    //   children: [],
    //   callBakFn: myFullScreen.change.bind(myFullScreen)
    // }]
    const tools = [
      {
        name: "对比",
        key: "contrast",
        icon: "icon-icon-cemian",
        children: [
          {
            name: "存为对照组",
            key: "save",
            icon: "icon-icon-cemian",
            callBakFn: (() => {}),
          },
          {
            name: "读取对照组",
            key: "read",
            icon: "icon-icon-cemian",
            callBakFn: (() => {}),
          },
        ],
      },
      {
        name: "标绘",
        key: "plotting",
        icon: "icon-icon-cemian",
        children: [
          {
            name: "标记点",
            key: "point",
            icon: "icon-icon-cemian",
            callBakFn: () => draw.create('MARKER'),
          },
          {
            name: "标记线",
            key: "line",
            icon: "icon-icon-cemian",
            callBakFn: () => draw.create('POLYLINE'),
          },
          {
            name: "标记面",
            key: "polygon",
            icon: "icon-icon-cemian",
            callBakFn: () => draw.create('POLYGON'),
          },
        ],
      },
      {
        name: "批注",
        key: "annotation",
        icon: "icon-icon-cemian",
        children: [
          {
            name: "文字",
            key: "word",
            icon: "icon-icon-cemian",
            callBakFn: () => textDrawing.createDrawing(),
          },
          {
            name: "箭头",
            key: "arrow",
            icon: "icon-icon-cemian",
            callBakFn: () => draw.create('FINE_ARROW'),
          },
          {
            name: "矩形",
            key: "rect",
            icon: "icon-icon-cemian",
            callBakFn: () => draw.create('RECTANGLE'),
          },
          {
            name: "圆形",
            key: "circle",
            icon: "icon-icon-cemian",
            callBakFn: () => draw.create('CIRCLE'),
          },
        ],
      },
      {
        name: "缩放",
        key: "zoom",
        icon: "icon-icon-cemian",
        children: [
          {
            name: "放大",
            key: "zoomIn",
            icon: "icon-icon-cemian",
            callBakFn: () => myZoomIn(),
          },
          {
            name: "缩小",
            key: "zoomOut",
            icon: "icon-icon-cemian",
            callBakFn: () => myZoomOut(),
          },
          {
            name: "框选区域放大",
            key: "zoomIn2",
            icon: "icon-icon-cemian",
            callBakFn: () => myDragZoom.setVal(),
          },
        ],
      },
      {
        name: "全屏",
        key: "fullscreen",
        icon: "icon-icon-cemian",
        children: [],
        callBakFn: () => myFullScreen.change(),
      },
    ];
    return (
      <div className={styles.toolbar}>
        {tools.map((item) => {
          return <DropOption options={item} key={item.key} />;
        })}
      </div>
    );
  }
}
