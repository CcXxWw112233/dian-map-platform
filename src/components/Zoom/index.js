import React from "react";

import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./Zoom.less";

import mapApp from "utils/INITMAP";
import { myZoomIn, myZoomOut } from "utils/drawing/public";

export default class Zoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSlider: false,
      translateY: -115,
    };
    this.moving = false;
    this.lastY = null;
    this.defaultZoom = 12;
    this.startEvent = null;
    // 缩放比例
    this.zoomPixo = 0.15;
    // window.onmouseup = (e) => this.onMouseUp(e);
    // window.onmousemove = (e) => this.onMouseMove(e);
    window.onpointerup = (e) => this.onMouseUp(e);
    window.onpointermove = (e) => this.onMouseMove(e);
  }
  componentDidMount() {
    this.defaultZoom = mapApp.map.getView().getZoom();
    const zoomBtn = this.refs.zoomBtn
    const zoomBtnRect = zoomBtn.getBoundingClientRect()
    this.lastY = zoomBtnRect.y
  }
  onMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    this.moving = true;
    // 记录第一次触摸
    this.startEvent = this.transfromClient(e);
  }

  transfromClient = (client)=>{
    return {x: client.clientX, y: client.clientY}
  }

  onMouseUp() {
    this.moving = false;
    // this.lastY = null;
    this.setState({
      translateY: -115,
      showSlider: false,
    });
  }

  onMouseMove(e) {
    e.preventDefault();
    this.moving && this.onMove(e);
  }

  onMove(e) {
    // let { translateY } = this.state;
    let moveClient = this.transfromClient(e);
    let step = this.startEvent.y - moveClient.y;

    // console.log(this.startEvent.y - moveClient.y);
    // step 大于0 放大
    if(Math.abs(this.state.translateY) >= 250  && step > 0){
      return ;
    }
    if(this.state.translateY >= 0 && step < 0){
      return ;
    }
    this.startEvent = moveClient;
    this.setState({
      translateY: this.state.translateY + (-step)
    })

    // step < 0 说明向下移动，是缩小， 反之
    let zoom = mapApp.map.getView().getZoom();
    if(step > 0){
      zoom += this.zoomPixo;
    }else{
      zoom -= this.zoomPixo;
    }
    mapApp.map.getView().setZoom(zoom);

    // if (this.lastY) {
    //   let dy = e.clientY - this.lastY;
    //   let zoom = mapApp.map.getView().getZoom();
    //   if (dy > 130 || dy < -120) {
    //     this.setState(
    //       {
    //         translateY: dy > 0 ? 0 : -250,
    //       },
    //       () => {
    //         if (dy > 130) {
    //           zoom = mapApp.map.getView().getMinZoom();
    //         } else if (dy < -120) {
    //           zoom = mapApp.map.getView().getMaxZoom();
    //         }
    //         mapApp.map.getView().setZoom(zoom);
    //       }
    //     );
    //   } else {
    //     this.setState(
    //       {
    //         translateY: dy - 115,
    //       },
    //       () => {
    //         if (dy > 0) {
    //           let minZoom = mapApp.map.getView().getMinZoom();
    //           zoom = zoom - dy / (130 / (zoom - minZoom));
    //         } else if (dy < 0) {
    //           let maxZoom = mapApp.map.getView().getMaxZoom();
    //           zoom = zoom + dy / (-120 / (maxZoom - zoom));
    //         }
    //       }
    //     );
    //   }
    //   mapApp.map.getView().setZoom(zoom);
    // }
    // this.lastY = e.clientY;
  }

  render() {
    const style = this.state.showSlider ? { display: "" } : { display: "none" };
    return (
      <div className={styles.wrapper}>
        <div className={styles.slider} style={style}></div>
        <div
          className={styles.btn}
          style={{
            userSelect:'none',
            touchAction:"none",
            transform: `translateY(${this.state.translateY}px)`,
          }}
          ref="zoomBtn"
          onPointerDown={(e) => this.onMouseDown(e)}
          onPointerOver={(e) => {
            this.setState({
              showSlider: true,
            });
            // this.lastY = document.body.clientHeight - 500;
          }}
          onPointerLeave={(e) => {
            if (!this.moving) {
              this.setState({
                showSlider: false,
              });
            }else{
              // this.onMouseUp(e)
            }
          }}
        >
          <i
            className={globalStyle.global_icon}
            onClick={() => {
              myZoomIn();
            }}
          >
            &#xe636;
          </i>
          <i
            className={globalStyle.global_icon}
            onClick={() => {
              myZoomOut();
            }}
          >
            &#xe635;
          </i>
        </div>
      </div>
    );
  }
}
