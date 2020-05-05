import mapApp from "../INITMAP";
import React from 'react'
import { MyOverlay, drawFeature } from "../mapUtils";
import { Circle as CircleStyle, Fill, Style, Text } from "ol/style";
import {
  createIconElement,
  closeOverlay,
  removeAllEventLinstener,
} from "./public";

export const textDrawing = {
  drawing: null,
  overlay: null,
  icon: null,
  el: null,
  isActive: false,
  linsteners: {},
  createDrawing({dispatch}) {
    removeAllEventLinstener()
    mapApp.drawing["text"] = this
    if (!this.drawing) {
      this.drawing = drawFeature.addDraw(
        false,
        "Point",
        new Style({
          image: new CircleStyle({
            radius: 0,
            fill: new Fill({
              color: "#f5222d",
            }),
          }),
          text: new Text({
            text: "默认文字",
            scale: 3,
            fill: new Fill({
              color: "#000000",
            }),
          }),
        })
      );
      // class MyDiv extends React.Component{
      //   state = {
      //     name:"1112222"
      //   }

      //   handleClick = ()=>{
      //     this.setState({
      //       name:"点击了我"
      //     })
      //   }
      //   render(){
      //     let { name } = this.state;
      //     return (
      //       <div className='test' onClick={this.handleClick}>
      //         {name}
      //       </div>
      //     )
      //   }
      // }
      // dispatch({
      //   type: 'overlay/updateDatas',
      //   payload:{
      //     show:true,
      //     childComponet: <MyDiv/>
      //   }
      // })
    }
    if (!this.isActive) {
      mapApp.map.addInteraction(this.drawing);
      // this.addEventLinstener()
      this.isActive = true;
    } else {
      removeAllEventLinstener(this.drawing, this.linsteners);
      mapApp.map.removeInteraction(this.drawing);
      this.isActive = false;
    }
  },

  getOverlays() {
    if (!this.overlays) {
      this.overlays = new MyOverlay();
    }
    return this.overlays;
  },
  addEventLinstener({dispatch, overlay}) {
    const start = this.drawing.on("drawstart", (e) => {
      let point = e.feature;
      let coordinate = point.getGeometry().getCoordinates();
      const overlays = this.getOverlays();
      this.overlay = overlays.add("drawPointTip");
      this.el = this.overlay.getElement();
      mapApp.map.addOverlay(this.overlay);
      this.overlay.getElement().innerHTML = String(coordinate);

      this.overlay.setPosition(coordinate);

      this.icon = createIconElement();

      this.icon.onclick = closeOverlay.bind(
        this,
        this.drawing,
        overlays,
        this.overlay,
        point
      );
    });
    this.linsteners["drawstart"] = start;

    const end = this.drawing.on("drawend", (e) => {
      this.el.appendChild(this.icon);
    });

    this.linsteners["drawend"] = end;
  },
};
