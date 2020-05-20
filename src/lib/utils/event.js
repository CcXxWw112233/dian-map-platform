function Event(){
    this.events = {

    }
    let fireEvent = (evt,data) => {
        if(evt && this.events[evt]){
            let func = this.events[evt];
            func.call(this,data)
        }
    }
    
    let on = (evtName, callback) => {
        if(evtName)
        this.events[evtName] = callback;
    }

    this.firEvent = fireEvent;
    this.on = on;
}

export default {
    Evt: new Event()
};