import { myZoomIn, myZoomOut } from "utils/drawing/public";
export default function totalOverlay({ name, wranNumber, total, cb }) {
  let div = document.createElement("div");
  div.style.width = "76px";
  div.style.height = "76px";
  div.style.borderRadius = "76px";
  div.style.display = "flex";
  div.style.flexDirection = "column";
  div.style.background = "rgb(48,114,246, 0.8)";
  div.style.textAlign = "center";
  div.style.color = "rgb(255,255,255)";
  div.style.fontSize = "12px";
  div.style.justifyContent = "center";
  div.style.cursor = "pointer";
  div.onmouseover= function(){
    div.style.background="rgba(255,50,0, 0.8)"
  }
  div.onmouseleave = function() {
    div.style.background = "rgb(48,114,246, 0.8)";
  }
  const onMouseWheel = (e) => {
    if (e.deltaY < 0) {
      myZoomIn();
    } else {
      myZoomOut();
    }
  };
  addEvent(div, "mousewheel", onMouseWheel);
  addEvent(div, "DOMMouseScroll", onMouseWheel);
  if (cb) {
    div.onclick = cb;
  }
  if (wranNumber > 0) {
    div.style.background = "rgb(255,0,0)";
  }
  let span = document.createElement("span");
  span.innerHTML = name;
  span.style.cursor = "pointer"
  div.appendChild(span);
  

  // let span2 = document.createElement("span");
  // span2.innerHTML = wranNumber > 0 ? wranNumber + "个预警" : "正常";
  // div.appendChild(span2);

  let span3 = document.createElement("span");
  span3.innerHTML = "总数:" + total;
  span3.style.cursor = "pointer"
  div.appendChild(span3);
  return div;
}
