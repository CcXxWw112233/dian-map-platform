import styles from "./index.less";

export default class LPPoiOverlay {
  constructor(data) {
    let popup = document.createElement("div");
    popup.style.textAlign = "left";
    popup.className = styles.wrap;
    let context = document.createElement("div");
    context.className = styles.context;
    if (data.name) {
      const row = this.createRow();
      let icon = document.createElement("i");
      icon.classList.add(styles.icon);
      const keyVals = {
        地铁站: "ditiezhan",
        公交站: "gongjiaozhan",
        幼儿园: "youeryuan",
        小学: "xiaoxue",
        中学: "zhongxue",
        大学: "daxue",
        医院: "yiyuan",
        药店: "yaodian",
        商场: "shangchang",
        超市: "chaoshi",
        市场: "shichang",
        银行: "yinhang",
        ATM: "atm",
        餐厅: "canting",
        咖啡馆: "kafeiguan",
        公园: "gongyuan",
        电影院: "dianyingyuan",
        健身房: "jianshenfang",
        体育馆: "tiyuguan",
      };
      icon.classList.add(styles[keyVals[data.keywords]]);
      row.appendChild(icon);
      let nameDiv = document.createElement("div");
      nameDiv.style.margin = "0 10px";
      let span = document.createElement("span");
      span.innerHTML = data.name || "";
      nameDiv.appendChild(span);
      row.appendChild(nameDiv);
      context.appendChild(row);
    }
    if (data.address) {
      const row = this.createRow();
      const span = document.createElement("span");
      span.innerHTML = data.address;
      row.appendChild(span);
      context.appendChild(row);
    }
    popup.appendChild(context);
    return popup;
  }
  createRow() {
    const row = document.createElement("div");
    row.className = styles.row;
    return row;
  }
}
