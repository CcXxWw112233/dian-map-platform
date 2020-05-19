import styles from './index.less'
export default function baseOverlay(content, data = {}){
    this.bgColor = data.color || '#fff';
    this.placement = data.placement ? styles[data.placement] : styles.bottomLeft;
    this.width = data.width || 200 ;

    let div = document.createElement('div');
    let style = data.style || {};
    Object.assign(div.style, style);
    div.className = styles.baseOverlay ;
    if(data.className){
        div.classList.add(data.className);
    }

    // 角
    let span = document.createElement('span');
    span.className = styles.baseOverlayAngle;
    span.classList.add(this.placement);
    span.style.borderColor = this.bgColor;
    // 角

    typeof content === 'string' ? div.innerHTML = content : content instanceof HTMLElement ? div.appendChild(content) : "";
    div.appendChild(span);
    div.style.backgroundColor = this.bgColor;
    div.style.width = typeof this.width === 'number' ? this.width +'px' : this.width;
    this.element = div;

    return this.element ;
}