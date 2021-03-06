import globalStyle from "../../../globalSet/styles/globalStyles.less";
export default function featureOverlay2(name, num, imgSrc, cb) {
  let div = document.createElement("div");
  div.style.width = "320px";
  div.style.height = "332px";
  div.style.borderRadius = "10px";
  div.style.textAlign = "left";
  div.style.background = "#FFFFFF";
  div.style.fontFamily = "PingFangSC-Medium, PingFang SC";
  div.style.boxShadow =
    "17px 17px 33px 0px rgba(102, 144, 255, 0.1), 12px 12px 20px 0px rgba(87, 92, 118, 0.1)";

  let imgContainer = document.createElement("div");
  imgContainer.style.transition = "all 0.3s linear";
  imgContainer.style.backgroundColor = "#474a5b";
  imgContainer.style.height = "120px";
  imgContainer.style.width = "100%";
  imgContainer.style.overflow = "hidden";
  if (!imgSrc) {
    imgContainer.style.display = "table";
  }

  div.appendChild(imgContainer);
  if (imgSrc) {
    let img = document.createElement("img");
    img.style.width = "100%";
    img.style.height = "120px";
    img.src = imgSrc;
    imgContainer.appendChild(img);
  } else{
    let i = document.createElement("i");
    i.classList.add(globalStyle.global_icon);
    i.style.display = "table-cell";
    i.style.verticalAlign = "middle";
    i.style.fontSize = "50px";
    i.style.textAlign = "center";
    i.style.color = "#ffffff63";
    i.innerHTML = " &#xe697;"
    imgContainer.appendChild(i);
  }

  let div2 = document.createElement("div");
  div2.style.padding = "0 16px";

  let name_p = document.createElement("p");
  name_p.style.marginBottom = "0";
  name_p.style.height = "40px";
  name_p.style.fontSize = "16px";
  name_p.style.fontWeight = 500;
  name_p.style.color = "#000000";
  name_p.style.lineHeight = "40px";

  let span0 = document.createElement("span");
  span0.innerHTML = name;
  name_p.appendChild(span0);
  div2.appendChild(name_p);

  let describe_p = document.createElement("p");
  describe_p.style.marginBottom = "0";
  describe_p.style.height = "14px";
  describe_p.style.fontSize = "14px";
  describe_p.style.marginBottom = "10px";
  // describe_p.style.fontWeight = 600;
  describe_p.style.color = "#6392F9";
  describe_p.style.lineHeight = "14px";
  let span1 = document.createElement("span");
  span1.innerHTML = `???????????????${num}???`;
  describe_p.appendChild(span1);
  div2.appendChild(describe_p);

  let info_div = document.createElement("div");
  info_div.style.display = "flex";
  info_div.style.flexDirection = "column";
  let row0 = document.createElement("div");
  row0.style.display = "inline-flex";
  let col0 = document.createElement("div");
  col0.style.width = "32%";
  col0.innerHTML = "???????????????";
  row0.appendChild(col0);
  let col1 = document.createElement("div");
  col1.innerHTML = "????????????/?????????/??????/?????????/?????????/?????????";
  row0.appendChild(col1);
  info_div.appendChild(row0);

  let row1 = document.createElement("div");
  row1.style.display = "inline-flex";
  let col2 = document.createElement("div");
  col2.innerHTML = "???????????????";
  row1.appendChild(col2);
  let col3 = document.createElement("div");
  col3.innerHTML = "20???";
  row1.style.display = "inline-flex";
  row1.appendChild(col3);
  info_div.appendChild(row1);
  div2.appendChild(info_div);

  let btn = document.createElement("div");
  btn.style.textAlign = "center";
  btn.style.margin = "0 auto";
  btn.style.height = "36px";
  btn.style.background = "#ffffff";
  btn.style.borderRadius = "20px";
  btn.style.border = "1px solid #D1D5E4";
  btn.style.color = "#484E69";
  btn.style.lineHeight = "36px";
  btn.style.marginTop = "30px";
  btn.innerHTML = "?????????????????????";
  btn.style.cursor = "pointer";
  btn.onclick = cb;
  div2.appendChild(btn);

  div.appendChild(div2);
  return div;
}
