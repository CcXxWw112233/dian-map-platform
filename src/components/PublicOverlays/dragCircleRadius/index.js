import styles from './index.less';
import { keepLastIndex } from '../../../utils/utils';

export default function DragCircleRadius(data){
  let div = document.createElement('div');
  let reg = /[^\d\.]/g;
  div.className = styles.dragBox;
  let formattext = document.createElement('div');
  formattext.className = styles.formatText;
  let text = document.createElement('span');
  let unit = document.createElement('span');
  // 格式化数据
  this.updateRadius = (val)=>{
    if(!val) return ;
    let unitTextIndex = (val.indexOf('千米') !== -1 ? val.indexOf('千米') : 0) || (val.indexOf('米') !== -1 ? val.indexOf('米') : 0);
    let t = val.substring(0,unitTextIndex);
    let unitText = val.substring(unitTextIndex);
    text.innerHTML = t;
    unit.innerHTML = unitText;
  }
  this.updateRadius(data.format)
  formattext.appendChild(text);
  formattext.appendChild(unit);
  formattext.onpointerdown = (evt)=>{
    evt.stopPropagation();
    evt.preventDefault();
  }
  formattext.ondblclick = (event)=>{
    event.preventDefault();
    event.stopPropagation();
    // console.log(event)
    text.contentEditable = true;
    unit.contentEditable = false;
    unit.innerText = '米';
    text.innerText = (text.innerHTML< 1000 && text.innerHTML > 50) ? text.innerHTML : text.innerHTML * 1000;
    text.oninput = ()=>{
      let t = text.innerHTML || "";
      text.innerHTML = t.replace(reg, "");
      if(t > 50000){
        text.innerHTML = 50000;
      }
      keepLastIndex(text);
    }
    // text.onblur = ()=>{
    //   // this.on["change"]&& this.on["change"].call(this,text.innerHTML);
    //   text.contentEditable = false;
    //   onChange();
    // }
    text.onkeydown = (evt)=>{
      const { keyCode } = evt;
      if(keyCode === 32 || keyCode === 13){
        evt.preventDefault();
        if(keyCode === 13){
          onChange();
        }
      }
    }
    keepLastIndex(text);
  }
  const onChange = ()=>{
    if(text.innerText < 500){
      text.innerHTML = 500;
    }
    // enter
    // console.log(evt);
    let inner = unit.innerHTML === '千米' ? text.innerHTML * 1000 : text.innerHTML;
    this.on["change"]&& this.on["change"].call(this,inner);
    text.contentEditable = false;
  }
  div.appendChild(formattext);
  let start = null;
  const getXY = (evt)=>{
    return {x: evt.clientX, y: evt.clientY}
  }
  const onOut = (evt)=>{
    div.onpointermove = null ;
    div.onpointerout = null;
    document.body.onpointerup = null;
    this.on['mouseUp'] && this.on["mouseUp"].call(this, evt);
  }
  div.onpointerdown = (ev)=>{
    ev.stopPropagation();
    ev.preventDefault();
    div.onpointermove = null ;
    // console.log(evt,'pointerdown')
    this.on['mouseDown'] && this.on["mouseDown"].call(this, ev);
    start = getXY(ev);
    div.onpointermove = (evt)=> {
      evt.stopPropagation();
      evt.preventDefault();
      let point = getXY(evt);
      let step = point.x - start.x;
      start = point;
      this.on['mouseMove'] && this.on["mouseMove"].call(this, evt,step);
    }
    // div.onpointerout = onOut;
    document.body.onpointerup = onOut;
  }

  this.on = {};

  this.element = div;
  document.body.appendChild(this.element);
}
