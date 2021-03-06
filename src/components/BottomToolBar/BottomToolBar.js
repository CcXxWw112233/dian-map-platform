import React from "react";
import { Button } from "antd";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import {
  myZoomIn,
  myZoomOut,
  myFullScreen,
  myDragZoom,
} from "utils/drawing/public";
import { getMyPosition } from "utils/getMyPosition";
import { downloadCapture } from "../../utils/captureMap";
import styles from "./BottomToolBar.less";
export default class BottomTollBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFull: false,
      fullcreenIcon: "&#xe7f3;",
    };
    this.config = [
      {
        name: "放大",
        key: "zoomIn",
        icon: "&#xe898;",
        cb: myZoomIn.bind(myZoomIn),
      },
      {
        name: "缩小",
        key: "zoomOut",
        icon: "&#xe897;",
        cb: myZoomOut.bind(myZoomOut),
      },
      {
        name: "拉框放大",
        key: "zoomIn2",
        icon: "&#xe664;",
        cb: myDragZoom.setVal.bind(myDragZoom),
      },
      {
        name: "全屏",
        key: "fullscreen",
        icon: "&#xe7f3;",
        toggleIcon: true,
        cb: this.toggleFullscreen,
      },
      {
        name: "我的位置",
        key: "location",
        icon: "&#xe727;",
        cb: this.getMyCenter,
      },
      {
        name: "下载截图",
        key: "downloadcapture",
        icon: "&#xe7ae;",
        cb: downloadCapture,
      },
    ];
  }
  getMyCenter = () => {
    // 获取定位
    getMyPosition.getPosition().then((val) => {
      // let coor = [114.11533,23.66666]
      // 转换地理坐标EPSG:4326 到 EPSG:3857
      let obj = { ...val, ...val.position };
      // let coordinate = getMyPosition.transformPosition(obj);
      // 将视图平移到坐标中心点
      if (getMyPosition.positionCircle || getMyPosition.positionIcon) {
        getMyPosition.setPosition([+obj.lng, +obj.lat]);
      } else getMyPosition.drawPosition({ ...obj, isMove: true });
      // getMyPosition.setViewCenter(coordinate, 200);
    });
  };
  toggleFullscreen = () => {
    myFullScreen.change();
    this.setState(
      {
        isFull: !this.state.isFull,
      },
      () => {
        if (this.state.isFull) {
          this.setState({
            fullcreenIcon: "&#xe7f7;",
          });
        } else {
          this.setState({
            fullcreenIcon: "&#xe7f3;",
          });
        }
      }
    );
  };
  render() {
    return (
      <div className={styles.wrap}>
        {this.config.map((item) => {
          const icon = item.toggleIcon ? this.state.fullcreenIcon : item.icon;
          return (
            <Button
              key={item.key}
              title={item.name}
              onClick={item.cb}
              style={{
                fontSize: "1rem",
                height: "auto",
                border: "none",
                borderRadius: 0,
              }}
            >
              <i
                className={globalStyle.global_icon}
                dangerouslySetInnerHTML={{ __html: icon }}
              ></i>
            </Button>
          );
        })}
      </div>
    );
  }
}
