import styles from './index.less'
import globalStyle from '../../../globalSet/styles/globalStyles.less'

export default function (){

    this.element = document.createElement('div');
    this.element.className = styles.overlay;
    this.opacityValue = 0.7;
    let isOpenOpacitySetting = false;

    let openOpacity = () => {
        if(isOpenOpacitySetting){
            isOpenOpacitySetting = false;
            // console.log('关闭了透明度设置');
            this.element.removeChild(this.opacityDiv)
        }else{
            console.log('打开了透明度设置');
            isOpenOpacitySetting = true;
            this.element.appendChild(this.opacityDiv)
        }
    }
    let items = `
    <div class="${styles.settingsItem}">
        <span class="${globalStyle.global_icon} setOpacity">
            &#xe6c9;
        </span>
        <span class="${globalStyle.global_icon} onEnter">
            &#xe639;
        </span>
        <span class="${globalStyle.global_icon} onCancel">
            &#xe606;
        </span>
    </div>
    `
    let opacity = document.createElement('input');
    opacity.className = styles.setOpacityInput;
    opacity.type = "range"
    opacity.max = 1.0;
    opacity.min = 0.3;
    opacity.step = 0.05;
    opacity.value = this.opacityValue;
    let text = document.createElement('span');
    text.innerText = Math.floor(this.opacityValue * 100) +'%'
    text.className = styles.opacityName ;
    opacity.onchange = (val)=>{
        this.opacityValue = +val.target.value;
        this.on['change'] && this.on['change'].call(this, +val.target.value);
        text.innerText = Math.floor(val.target.value * 100) +'%';
    }
    
    this.opacityDiv = document.createElement('div');
    this.opacityDiv.className = styles.opacityDiv;
    this.opacityDiv.appendChild(opacity);
    this.opacityDiv.appendChild(text)
    

    let oncancel = ()=>{
        this.on['cancel'] && this.on['cancel'].call(this);
    }

    let onenter = () => {
        this.on['enter'] && this.on['enter'].call(this,{opacity: this.opacityValue})
    }
    
    this.element.innerHTML = items;
    this.element.querySelector('.setOpacity').onclick = openOpacity;
    this.element.querySelector('.onCancel').onclick = oncancel;
    this.element.querySelector('.onEnter').onclick = onenter;
    this.on = {};
}