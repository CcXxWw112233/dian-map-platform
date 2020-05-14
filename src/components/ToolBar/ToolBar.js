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
import {connect} from 'dva'

@connect(({ overlay: { childComponet, show } }) => ({  childComponet, show  }))
export default class ToolBar extends PureComponent {
  render() {
    const tools = [{
      name: '对比',
      key: 'contrast',
      icon: '&#xe724;',
      children: [
        {
        name: '存为对照组',
        key: 'save',
        icon: '&#xe722;',
        cb: (()=>{})
      },{
        name: '读取对照组',
        key: 'read',
        icon: '&#xe725;',
        cb: (()=>{})
      }
    ]},{
      name: '标绘',
      key: 'plotting',
      icon: '&#xe726;',
      children: [
        {
        name: '标记点',
        key: 'point',
        icon: '&#xe715;',
        cb: pointDrawing.createDrawing.bind(pointDrawing)
      },{
        name: '标记线',
        key: 'line',
        icon: '&#xe716;',
        cb: lineDrawing.createDrawing.bind(lineDrawing)
      },{
        name: '标记面',
        key: 'polygon',
        icon: '&#xe718;',
        cb: polygonDrawing.createDrawing.bind(polygonDrawing)
      }
    ]},{
      name: '批注',
      key: 'annotation',
      icon: '&#xe943;',
      children:[
        {
        name: '文字',
        key: 'word',
        icon: '&#xe719;',
        cb: textDrawing.createDrawing.bind(textDrawing)
      },{
        name: '箭头',
        key: 'arrow',
        icon: '&#xe71a;',
        cb: arrowDrawing.createDrawing.bind(arrowDrawing)
      },{
        name: '矩形',
        key: 'rect',
        icon: '&#xe71b;',
        cb: boxDrawing.createDrawing.bind(boxDrawing)
      },{
        name: '圆形',
        key: 'circle',
        icon: '&#xe71c;',
        cb: circleDrawing.createDrawing.bind(circleDrawing)
      }]
    }]
    // const tools = [
    //   {
    //     name: "对比",
    //     key: "contrast",
    //     icon: "icon-icon-cemian",
    //     children: [
    //       {
    //         name: "存为对照组",
    //         key: "save",
    //         icon: "icon-icon-cemian",
    //         cb: (() => {}),
    //       },
    //       {
    //         name: "读取对照组",
    //         key: "read",
    //         icon: "icon-icon-cemian",
    //         cb: (() => {}),
    //       },
    //     ],
    //   },
    //   {
    //     name: "标绘",
    //     key: "plotting",
    //     icon: "icon-icon-cemian",
    //     children: [
    //       {
    //         name: "标记点",
    //         key: "point",
    //         icon: "icon-icon-cemian",
    //         cb: () => draw.create('MARKER'),
    //       },
    //       {
    //         name: "标记线",
    //         key: "line",
    //         icon: "icon-icon-cemian",
    //         cb: () => draw.create('POLYLINE'),
    //       },
    //       {
    //         name: "标记面",
    //         key: "polygon",
    //         icon: "icon-icon-cemian",
    //         cb: () => draw.create('POLYGON'),
    //       },
    //     ],
    //   },
    //   {
    //     name: "批注",
    //     key: "annotation",
    //     icon: "icon-icon-cemian",
    //     children: [
    //       {
    //         name: "文字",
    //         key: "word",
    //         icon: "icon-icon-cemian",
    //         cb: () => textDrawing.createDrawing({dispatch}),
    //       },
    //       {
    //         name: "箭头",
    //         key: "arrow",
    //         icon: "icon-icon-cemian",
    //         cb: () => draw.create('FINE_ARROW'),
    //       },
    //       {
    //         name: "矩形",
    //         key: "rect",
    //         icon: "icon-icon-cemian",
    //         cb: () => draw.create('RECTANGLE'),
    //       },
    //       {
    //         name: "圆形",
    //         key: "circle",
    //         icon: "icon-icon-cemian",
    //         cb: () => draw.create('CIRCLE'),
    //       },
    //     ],
    //   },
    //   {
    //     name: "缩放",
    //     key: "zoom",
    //     icon: "icon-icon-cemian",
    //     children: [
    //       {
    //         name: "放大",
    //         key: "zoomIn",
    //         icon: "icon-icon-cemian",
    //         cb: () => myZoomIn(),
    //       },
    //       {
    //         name: "缩小",
    //         key: "zoomOut",
    //         icon: "icon-icon-cemian",
    //         cb: () => myZoomOut(),
    //       },
    //       {
    //         name: "框选区域放大",
    //         key: "zoomIn2",
    //         icon: "icon-icon-cemian",
    //         cb: () => myDragZoom.setVal(),
    //       },
    //     ],
    //   },
    //   {
    //     name: "全屏",
    //     key: "fullscreen",
    //     icon: "icon-icon-cemian",
    //     children: [],
    //     cb: () => myFullScreen.change(),
    //   },
    // ];
    return (
      <div className={styles.toolbar}>
        {tools.map((item) => {
          return <DropOption options={item} key={item.key} />;
        })}
      </div>
    );
  }
}
