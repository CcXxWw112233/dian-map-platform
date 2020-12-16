export default function featureOverlay(num) {
  let div = document.createElement("div");
  div.style.width = "40px";
  div.style.height = "20px";
  div.style.borderRadius = "10px";
  div.style.border = "2px solid #FFFFFF";
  div.style.color = "rgba(255, 255, 255, 1)";
  div.style.background = "rgba(46, 156, 99, 1)";
  div.style.lineHeight = "13px";
  if (num === 0) {
    div.style.background = "rgba(255, 129, 129, 1)";
  }
  div.innerHTML = (num || 0).toString();
  return div;
}
