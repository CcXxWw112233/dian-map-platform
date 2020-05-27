import React, { PureComponent } from "react";
import { DropOption } from "components";
import styles from "./ToolBar.less";
// import {
//   myZoomIn,
//   myZoomOut,
//   myFullScreen,
//   myDragZoom,
// } from "utils/drawing/public";
import { draw } from "utils/draw";
import { 
  // boxDrawing, circleDrawing, 
  lineDrawing, pointDrawing, polygonDrawing,
  // arrowDrawing,textDrawing 
} from 'utils/drawing/index'
import {connect} from 'dva'

@connect(({ modal: { visible, data } }) => ({ visible, data }))
export default class ToolBar extends PureComponent {
  render() {
    // const tools = [{
    //   name: '对比',
    //   key: 'contrast',
    //   icon: '&#xe724;',
    //   children: [
    //     {
    //     name: '存为对照组',
    //     key: 'save',
    //     icon: '&#xe722;',
    //     cb: (()=>{})
    //   },{
    //     name: '读取对照组',
    //     key: 'read',
    //     icon: '&#xe725;',
    //     cb: (()=>{})
    //   }
    // ]},{
    //   name: '标绘',
    //   key: 'plotting',
    //   icon: '&#xe726;',
    //   children: [
    //     {
    //     name: '标记点',
    //     key: 'point',
    //     icon: '&#xe715;',
    //     cb: pointDrawing.createDrawing.bind(pointDrawing)
    //   },{
    //     name: '标记线',
    //     key: 'line',
    //     icon: '&#xe716;',
    //     cb: lineDrawing.createDrawing.bind(lineDrawing)
    //   },{
    //     name: '标记面',
    //     key: 'polygon',
    //     icon: '&#xe718;',
    //     cb: polygonDrawing.createDrawing.bind(polygonDrawing)
    //   }
    // ]},{
    //   name: '批注',
    //   key: 'annotation',
    //   icon: '&#xe943;',
    //   children:[
    //     {
    //     name: '文字',
    //     key: 'word',
    //     icon: '&#xe719;',
    //     cb: textDrawing.createDrawing.bind(textDrawing)
    //   },{
    //     name: '箭头',
    //     key: 'arrow',
    //     icon: '&#xe71a;',
    //     cb: arrowDrawing.createDrawing.bind(arrowDrawing)
    //   },{
    //     name: '矩形',
    //     key: 'rect',
    //     icon: '&#xe71b;',
    //     cb: boxDrawing.createDrawing.bind(boxDrawing)
    //   },{
    //     name: '圆形',
    //     key: 'circle',
    //     icon: '&#xe71c;',
    //     cb: circleDrawing.createDrawing.bind(circleDrawing)
    //   }]
    // }]
    const {dispatch} = this.props
    const tools = [
      // {
      //   name: "对比",
      //   key: "contrast",
      //   icon: "&#xe724;",
      //   children: [
      //     {
      //       name: "存为对照组",
      //       key: "save",
      //       icon: "&#xe722;",
      //       cb: (() => {}),
      //     },
      //     {
      //       name: "读取对照组",
      //       key: "read",
      //       icon: "&#xe725;",
      //       cb: (() => {}),
      //     },
      //   ],
      // },
      {
          name: '量测',
          key: 'measuration',
          icon: '&#xe726;',
          children: [
            {
            name: '量测坐标',
            key: 'coordinate',
            icon: '&#xe715;',
            cb: pointDrawing.createDrawing.bind(pointDrawing)
          },{
            name: '量测距离',
            key: 'distance',
            icon: '&#xe716;',
            cb: lineDrawing.createDrawing.bind(lineDrawing)
          },{
            name: '量测面积',
            key: 'area',
            icon: '&#xe718;',
            cb: polygonDrawing.createDrawing.bind(polygonDrawing)
          }
        ]},
      {
        name: "标绘",
        key: "plotting",
        icon: "&#xe726;",
        children: [
          {
            name: "标记点",
            key: "point",
            icon: "&#xe715;",
            cb: () => draw.create('MARKER', dispatch),
          },
          {
            name: "标记线",
            key: "line",
            icon: "&#xe716;",
            cb: () => draw.create('POLYLINE', dispatch),
          },
          {
            name: "标记面",
            key: "polygon",
            icon: "&#xe718;",
            cb: () => draw.create('POLYGON', dispatch),
          },
          {
            name: "标记自由面",
            key: "polygon",
            icon: "&#xe718;",
            cb: () => draw.create('FREEHAND_POLYGON', dispatch),
          },
        ],
      },
      {
        name: "批注",
        key: "annotation",
        icon: "&#xe943;",
        children: [
          // {
          //   name: "文字",
          //   key: "word",
          //   icon: "icon-icon-cemian",
          //   cb: () => textDrawing.createDrawing({dispatch}),
          // },
          {
            name: "箭头",
            key: "arrow",
            icon: "&#xe71a;",
            cb: () => draw.create('FINE_ARROW', dispatch),
          },
          {
            name: "矩形",
            key: "rect",
            icon: "&#xe71b;",
            cb: () => draw.create('RECTANGLE', dispatch),
          },
          {
            name: "圆形",
            key: "circle",
            icon: "&#xe71c;",
            cb: () => draw.create('CIRCLE', dispatch),
          },
        ],
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
