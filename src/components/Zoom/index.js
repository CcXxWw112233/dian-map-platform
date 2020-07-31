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
      translateY: 0,
    };
    this.moving = false;
    this.lastY = null;
    this.defaultZoom = 12;
    // window.onmouseup = (e) => this.onMouseUp(e);
    // window.onmousemove = (e) => this.onMouseMove(e);
    window.onpointerup = (e) => this.onMouseUp(e);
    window.onpointermove = (e) => this.onMouseMove(e);
  }
  componentDidMount() {
    this.defaultZoom = mapApp.map.getView().getZoom();
  }
  onMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    this.moving = true;
  }

  onMouseUp() {
    this.moving = false;
    this.lastY = null;
    this.setState({
      translateY: 0,
      showSlider: false,
    });
  }

  onMouseMove(e) {
    e.preventDefault();
    this.moving && this.onMove(e);
  }

  onMove(e) {
    if (this.lastY) {
      let dy = e.clientY - this.lastY;
      let zoom = mapApp.map.getView().getZoom();
      if (dy > 130 || dy < -120) {
        this.setState(
          {
            translateY: dy > 0 ? 130 : -120,
          },
          () => {
            if (dy > 130) {
              zoom = mapApp.map.getView().getMinZoom();
            } else if (dy < -120) {
              zoom = mapApp.map.getView().getMaxZoom();
            }
            mapApp.map.getView().setZoom(zoom);
          }
        );
      } else {
        this.setState(
          {
            translateY: dy,
          },
          () => {
            if (dy > 0) {
              let minZoom = mapApp.map.getView().getMinZoom();
              zoom = zoom - dy / (130 / (zoom - minZoom));
            } else if (dy < 0) {
              let maxZoom = mapApp.map.getView().getMaxZoom();
              zoom = zoom + dy / (-120 / (maxZoom - zoom));
            }
          }
        );
      }
      mapApp.map.getView().setZoom(zoom);
    }
  }

  render() {
    const style = this.state.showSlider ? { display: "" } : { display: "none" };
    return (
      <div className={styles.wrapper}>
        <div className={styles.slider} style={style}></div>
        <div
          className={styles.btn}
          style={{
            transform: `translateY(${this.state.translateY}px)`,
          }}
          onPointerDown={(e) => this.onMouseDown(e)}
          onPointerEnter={(e) => {
            this.setState({
              showSlider: true,
            });
            this.lastX = 23;
            this.lastY = document.body.clientHeight - 500;
          }}
          onPointerLeave={() => {
            if (!this.moving) {
              this.setState({
                showSlider: false,
              });
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
