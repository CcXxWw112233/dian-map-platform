import BaseOverlay from '../baseOverlay';
import styles from './index.less';
import globalSet from '../../../globalSet/styles/globalStyles.less';

export default function setCoordinateForCollection(){
  let div = document.createElement('div');
  div.className = styles.container_box;
  let title = document.createElement('div');
  title.className = styles.header;
  title.innerHTML = `<span class="${styles.title}">关联坐标</span>
    <span class="${styles.close} ${globalSet.global_icon}">&#xe7d0;</span>
  `
  div.appendChild(title);

  let content = document.createElement('div');
  content.className = styles.content;
  content.innerHTML = `
    <div class="${styles.content_input}">
      <div class="${styles.fildset}">
        <span class="${styles.lenged}">经度</span>
        <label>
          <input type='text' id="longitude"/>
        </label>
      </div>
      <div class="${styles.fildset}">
        <span class="${styles.lenged}">纬度</span>
        <label>
          <input type='text' id="latitude"/>
        </label>
      </div>
    </div>
  `
  let footer = document.createElement('div');
  footer.className = styles.footer;
  footer.innerHTML = `
    <button class="${globalSet.globalBtn} ${styles.cancel}">取消</button>
    <button class="${globalSet.globalBtn} ${styles.enter}">确定</button>
  `
  div.appendChild(content);
  div.appendChild(footer);

  // 添加事件回调
  let close = div.querySelector('.'+ styles.close);
  let sure = div.querySelector('.'+ styles.enter);
  let cancel = div.querySelector('.'+ styles.cancel);
  let long = div.querySelector('#longitude');
  let lat = div.querySelector('#latitude');

  const hasChange = ()=>{
    let coordinate = [long.value, lat.value];
    this.on['change'] && this.on['change'].call(this, coordinate);
  }
  if(long && lat){
    long.oninput = (e)=>{
      let v = e.target.value;
      if(v)
      e.target.value = v.replace(/[^\d\.]/g,'');

      if(v < 0){
        e.target.value = 0;
      }
      if(v >= 180){
        e.target.value = 180;
      }
      hasChange();
    }
    lat.oninput = (e)=>{
      let v = e.target.value;
      if(v)
      e.target.value = v.replace(/[^\d\.]/g,'');

      if(v < 0){
        e.target.value = 0;
      }
      if(v >= 90){
        e.target.value = 90;
      }
      hasChange();
    }
  }

  if(close){
    close.onclick = ()=>{
      this.on['cancel'] && this.on['cancel'].call(this);
    }
  }
  if(sure){
    sure.onclick = ()=>{
      let param = {
        longitude: +div.querySelector('#longitude').value,
        latitude: +div.querySelector('#latitude').value,
      }
      if(!param.longitude || !param.latitude) return ;
      // window.CallWebMapFunction("getCityByLonLat", {
      //   lon: param.longitude,
      //   lat: param.latitude
      // }).then(res => {
      //   param.districtcode = res.addressComponent?.adcode;
      //   this.on['save'] && this.on['save'].call(this, param);
      // })
      this.on['save'] && this.on['save'].call(this, param);
    }
  }
  if(cancel){
    cancel.onclick = ()=>{
      this.on['cancel'] && this.on['cancel'].call(this);
    }
  }

  this.setLong = (val)=>{
    div.querySelector('#longitude').value = val;
  }
  this.setLat = (val)=>{
    div.querySelector('#latitude').value = val;
  }

  this.on = {};

  this.element = new BaseOverlay(div,{placement:"bottomCenter",angleColor:"#fff",width:240});
  document.body.appendChild(this.element);
}
