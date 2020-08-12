import styles from "./index.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
export default class PopupOverlay {
  constructor(data) {
    let popup = document.createElement("div");
    popup.className = styles.wrap;
    let title = document.createElement("div");
    let span = document.createElement("span");
    span.innerHTML = data.name || "";
    let cancelBtn = document.createElement("i");
    cancelBtn.classList.add(styles.close);
    cancelBtn.style.float = "right";
    cancelBtn.onclick = () => {
      data.cb && data.cb();
    };
    title.appendChild(span);
    title.appendChild(cancelBtn);
    title.className = styles.title;
    popup.appendChild(title);
    let context = document.createElement("div");
    context.className = styles.context;
    if (data.len) {
      let len = document.createElement("div");
      len.className = styles.item;
      let lenKey = document.createElement("span");
      lenKey.className = styles.first;
      lenKey.innerHTML = "周长:";
      let lenValue = document.createElement("span");
      lenValue.className = styles.second;
      lenValue.innerHTML = data.len || "";
      len.appendChild(lenKey);
      len.appendChild(lenValue);
      context.appendChild(len);
    }
    if (data.area) {
      let area = document.createElement("div");
      area.className = styles.item;
      let areaKey = document.createElement("span");
      areaKey.className = styles.first;
      areaKey.innerHTML = "面积:";
      let areaValue = document.createElement("span");
      areaValue.className = styles.second;
      areaValue.innerHTML = data.area || "";
      area.appendChild(areaKey);
      area.appendChild(areaValue);
      context.appendChild(area);
    }
    if (data.xy) {
      let xy = document.createElement("div");
      xy.className = styles.item;
      let xyKey = document.createElement("span");
      xyKey.className = styles.first;
      xyKey.innerHTML = "坐标:";
      let xyValue = document.createElement("span");
      xyValue.className = styles.second;
      xyValue.innerHTML = data.xy || "";
      xy.appendChild(xyKey);
      xy.appendChild(xyValue);
      context.appendChild(xy);
    }
    if (data.remark) {
      let remark = document.createElement("div");
      remark.className = styles.item;
      let remarkKey = document.createElement("span");
      remarkKey.className = styles.first;
      remarkKey.innerHTML = "备注:";
      let remarkValue = document.createElement("span");
      remarkValue.className = globalStyle.autoScrollY;
      remarkValue.classList.add(styles.second);
      remarkValue.innerHTML = data.remark || "";
      remark.appendChild(remarkKey);
      remark.appendChild(remarkValue);
      context.appendChild(remark);
    }
    popup.appendChild(context);
    return popup;
  }
}
