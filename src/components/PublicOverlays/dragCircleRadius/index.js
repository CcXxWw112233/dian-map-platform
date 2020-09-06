import styles from './index.less';

export default function DragCircleRadius(data){
  let div = document.createElement('div');
  div.className = styles.dragBox;
  let formattext = document.createElement('div');
  formattext.className = styles.formatText;
  formattext.innerHTML = data.format;
  div.appendChild(formattext);
  let start = null;
  const getXY = (evt)=>{
    return {x: evt.clientX, y: evt.clientY}
  }
  div.onpointerdown = (evt)=>{
    div.onpointermove = null ;
    // console.log(evt,'pointerdown')
    this.on['mouseDown'] && this.on["mouseDown"].call(this, evt);
    start = getXY(evt);
    div.onpointermove = (evt)=> {
      let point = getXY(evt);
      let step = point.x - start.x;
      start = point;
      this.on['mouseMove'] && this.on["mouseMove"].call(this, evt,step);
    }
  }
  const onOut = (evt)=>{
    div.onpointermove = null ;
    this.on['mouseUp'] && this.on["mouseUp"].call(this, evt);
  }
  div.onpointerout = onOut;
  div.onpointerup = onOut;
  this.updateRadius = (val)=>{
    formattext.innerHTML = val;
  }

  this.on = {};

  this.element = div;
  document.body.appendChild(this.element);
}
