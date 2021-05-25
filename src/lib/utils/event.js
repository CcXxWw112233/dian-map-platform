function Event(){
    this.events = {

    }
    this.listenEvent = {

    }
    let fireEvent = (evt,data) => {
        if(evt && this.events[evt]){
            let func = this.events[evt];
            func.call(this,data)
        }
        if(evt && this.listenEvent[evt] && this.listenEvent[evt].length){
          this.listenEvent[evt].forEach(item => item.call(this, data))
        }
    }

    let on = (evtName, callback) => {
        if(evtName)
        this.events[evtName] = callback;
    }

    let addEventListener = (evtName, callback)=>{
      if(evtName){
        !this.listenEvent[evtName] && (this.listenEvent[evtName] = []);
        this.listenEvent[evtName].push(callback);
      }
    }

    let removeEventListener = (evtName, callback)=>{
      if(evtName){
        if(this.listenEvent[evtName] && this.listenEvent[evtName].length){
          this.listenEvent[evtName] = this.listenEvent[evtName].filter(item => item !== callback);
        }
      }
    }

    this.firEvent = fireEvent;
    this.on = on;
    this.addEventListener = addEventListener;
    this.removeEventListener = removeEventListener;
    this.un = (evtName)=>{
      this.events[evtName] = null;
    }
}

export default {
    Evt: new Event()
};

/** 构建地图结束事件 */
export const INITMAPEND = 'initmapend'

/** 点击查看的元素点事件 */
export const CLICKVIEWFEATURE = 'clickviewfeature'

/** 分类图标被点击的元素点事件 */
export const CLICKVIEWGROUPFEATURE = 'clickviewgroupfeature'
