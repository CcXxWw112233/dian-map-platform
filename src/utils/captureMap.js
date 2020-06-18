import html2canvas from 'html2canvas';
import InitMap from './INITMAP'

export const getCanvas = ()=>{
    return new Promise((resolve,reject) => {
        // 通过id获取canvas
        html2canvas(document.getElementById(InitMap.mapId)).then(canvas => {
            resolve(canvas)
        }).catch(err => { 
            reject(err);
        })
    })
}

export const ToDownLoad = (src ,name)=>{
    if(!src) return ;
    let url = src ;
    let a = document.createElement('a');
    a.href = url;
    a.id = "capture_download_a"
    a.target = '_blank';
    a.download = name || 'MAP截图下载'
    a.click();
    a = null;
}

export const downloadCapture = ()=>{
    getCanvas().then(canvas => {
        canvas.toBlob(function(blob){
            let url = URL.createObjectURL(blob);
            ToDownLoad(url);
        })
    })
}