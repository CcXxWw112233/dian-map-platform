import styles from './index.less'
import baseOverlay from '../baseOverlay/index'
import globalStyle from '../../../globalSet/styles/globalStyles.less'

export default function (data = {}){
    let div = document.createElement('div');
    div.className = styles.overlay;

    let title = document.createElement('div');
    title.innerHTML = data.name;
    title.className = styles.overlayTitle;
    if(data.titleColor){
        title.style.backgroundColor = data.titleColor;
    }
    let close = document.createElement('span');
    close.className = `${globalStyle.global_icon} ${styles.closeBtn}`
    close.innerHTML = '&#xe606;'
    close.onclick = ()=>{
        this.on['close'] && this.on['close'].call(this,data);
    }
    title.appendChild(close);
    div.appendChild(title);

    let content = document.createElement('div');
    content.innerHTML = data.remark || '暂无备注信息';
    content.className = styles.overlayContent +' ' + globalStyle.autoScrollY;
    div.appendChild(content);

    this.element = new baseOverlay(div,data);
    document.body.appendChild(this.element);
    this.on = {}
}