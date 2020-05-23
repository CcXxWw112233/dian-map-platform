import { Fill, Stroke, Style } from "ol/style";
import { fullScreen, exitScreen } from "../utils";
import { DragZoom } from "ol/interaction";
import { always } from "ol/events/condition";
import mapApp from "../INITMAP";
// 创建关闭按钮
export const createIconElement = function () {
  let icon = document.createElement("div");
  icon.classList.add("p-helper-control-feature-del");
  let style = {
    position: "absolute",
    top: "-10px",
    right: "-10px",
  };
  Object.assign(icon.style, style);
  return icon;
};

export const closeOverlay = function (
  drawing,
  allOverlay,
  overlay,
  feature,
  type = "line"
) {
  if (allOverlay && overlay) {
    allOverlay.remove(overlay);
    const source = drawing.get("sourceInDraw");
    source.removeFeature(feature);
    const el = overlay.getElement();
    el.parentNode.removeChild(el);
  }
};

export const myStyle = new Style({
  fill: new Fill({
    color: "rgba(255,120,117,0.3)",
  }),
  stroke: new Stroke({
    color: "#f5222d",
    width: 2,
  }),
});

export const unOnEventListenter = function (mapApp) {
  console.log(mapApp.eventListener);
  const listenerArr = Object.keys(mapApp.eventListener);
  listenerArr.forEach((listener) => {
    // mapApp.eventListener[listener]
  });
};

export const removeAllEventLinstener = function () {
  const myMapApp = mapApp;
  if (!myMapApp.drawing) return;
  const drawingObjArr = Object.keys(myMapApp.drawing);
  drawingObjArr.forEach((drawingObj) => {
    myMapApp.drawing[drawingObj].isActive = false;
    myMapApp.map.removeInteraction(myMapApp.drawing[drawingObj].drawing);
    const linsteners = myMapApp.drawing[drawingObj].linsteners;
    const listenerArr = Object.keys(linsteners);
    listenerArr.forEach((listener) => {
      myMapApp.drawing[drawingObj].drawing.un(
        listener,
        myMapApp.drawing[drawingObj].linsteners[listener].listener
      );
    });
  });
};

export const myZoomIn = function () {
  // 调用地图本身存在的放大缩小
  const zoomIn = document.querySelector(".ol-zoom-in");
  zoomIn && zoomIn.click();
};

export const myZoomOut = function () {
  const dom = document.querySelector(".ol-zoom-out");
  dom && dom.click();
};

export const myFullScreen = {
  isFull: false,
  change: function () {
    if (this.isFull) {
      this.isFull = false;
      exitScreen();
    } else {
      fullScreen();
      this.isFull = true;
    }
  },
};

export const myDragZoom = {
  dragZoom: null,
  setVal: function () {
    if (!this.dragZoom) {
      this.dragZoom = new DragZoom({
        condition: always,
      });
      mapApp.map.addInteraction(this.dragZoom)
    }
    this.dragZoom.setActive(true);
    this.dragZoom.on("boxend", () => {
      this.dragZoom.setActive(false);
    });
  },
};
