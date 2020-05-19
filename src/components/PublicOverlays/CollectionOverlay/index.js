import styles from './index.less'
import baseOverlay from '../baseOverlay'

export default function overlay (data = {}){
    let div = document.createElement('div');
    this.data = data;
    div.className = styles.overlay;
    div.innerHTML = data.title;

    this.element = new baseOverlay(div,{});
    
    document.body.appendChild(this.element);
    this.remove = ()=>{
        document.body.removeChild(this.element);
    }
}