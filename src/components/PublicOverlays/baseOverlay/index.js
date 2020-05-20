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

    let position = (placement) => {
        switch(placement){
            case "bottomLeft" :  ;
            case "bottomCenter" : ;
            case "bottomRight" : 
                return "5,0,10,10,20,0"
            ;
            default :
            return "5,0,10,10,20,0";
        }
    }

    // 角
    let span = document.createElement('span');
    span.className = styles.baseOverlayAngle;
    span.classList.add(this.placement);
    Object.assign(span.style, data.angleStyle);
    // span.style.borderColor = this.bgColor;
    span.innerHTML = `<svg xmlns="https://www.w3.org/2000/svg" width="20px" height="10px" version="1.1">
        <polyline 
        points=${position(data.placement)} 
        style="fill:${data.angleColor || "#1769FF"}; 
        stroke:${data.angleBorderColor || "#ffffff"};
        stroke-width:2" />
    </svg>`
    // 角

    typeof content === 'string' ? div.innerHTML = content : content instanceof HTMLElement ? div.appendChild(content) : "";
    div.appendChild(span);
    div.style.backgroundColor = this.bgColor;
    div.style.width = typeof this.width === 'number' ? this.width +'px' : this.width;
    this.element = div;

    return this.element ;
}