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

export const downloadCapture = ()=>{
    getCanvas().then(canvas => {
        canvas.toBlob(function(blob){
            let url = URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.id = "capture_download_a"
            a.target = '_blank';
            a.download = 'MAP截图下载'
            // document.body.append(a);
            a.click();
            // $(a).remove();
            a = null;
        })
    })
}