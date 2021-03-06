import styles from './index.less'
import { BASIC } from '../../../services/config'
export default function ProjectOverlay(data){
    this.on = {
        click: ()=>{

        },
        mousedown:()=>{
            
        }
    }
    this.element = document.createElement('div');
    this.element.className = styles.projectOverlay;
    this.element.innerHTML = data.text ;
    let span = document.createElement('span');
    span.className = styles.afters;
    span.innerHTML = `<svg xmlns="https://www.w3.org/2000/svg" width="15px" height="10px" version="1.1">
        <polyline points="1,0,1,8,15,0" style="fill:#1769FF; stroke:#ffffff;stroke-width:2" />
    </svg>`
    this.element.appendChild(span);

    this.element.onclick = (e) =>{
        if(BASIC.getUrlParam.isMobile !== "1")
        this.on['click'] && this.on['click'].call(this,e);
    }
    this.element.onmousedown = (e) => {
        if(BASIC.getUrlParam.isMobile !== "1")
        this.on['mousedown'] && this.on['mousedown'].call(this, e);
    }
    this.element.style.zIndex = data.zIndex || 1;
    document.body.appendChild(this.element);
    this.remove = ()=>{
        document.body.removeChild(this.element);
    }
}