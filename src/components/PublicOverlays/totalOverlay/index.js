export default function totalOverlay({ name, wranNumber, total }) {
  let div = document.createElement("div");
  div.style.width = "76px";
  div.style.height = "76px";
  div.style.borderRadius = "76px";
  div.style.display = "flex";
  div.style.flexDirection = "column";
  div.style.background = "rgb(48,114,246)";
  div.style.textAlign = "center";
  div.style.color = "rgb(255,255,255)";
  div.style.padding = "20px";
  div.style.fontSize = "12px";
  if (wranNumber > 0) {
    div.style.background = "rgb(255,0,0)";
  }
  let span = document.createElement("span");
  span.innerHTML = name;
  div.appendChild(span);

  // let span2 = document.createElement("span");
  // span2.innerHTML = wranNumber > 0 ? wranNumber + "个预警" : "正常";
  // div.appendChild(span2);

  let span3 = document.createElement("span");
  span3.innerHTML = "总数:" + total;
  div.appendChild(span3);
  return div;
}
