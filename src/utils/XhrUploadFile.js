import axios from 'axios';
import { BASIC } from '../services/config';
import checkResponse from '../services/checkResponse';
import NProgress from 'nprogress';
import Cookies from 'js-cookie'

export const DefaultUpload = (file, data)=>{
  return new Promise((resolve,reject) => {
    NProgress.start();
    let param = new FormData();
    param.append('file',file);
    for(let key in data){
      param.append(key,data[key])
    }
    axios.post('/api/map/file/upload', param , {
      headers:{
        Authorization:Cookies.get('Authorization')
      }
    }).then(resp => {
      if(checkResponse(resp.data)){
        resolve(resp.data);
      }else reject(resp);
      NProgress.done();
    }).catch(err => {
      reject(err)
      NProgress.done();
    })
  })

}

export const UploadFile = (file,url,data,token ,callback,event)=>{
    let formData = new FormData();
    formData.append('file',file);
    axios.post(url,formData,{
        headers:{Authorization:token},
        timeout:0,
        onUploadProgress:({ total, loaded }) => {
            console.log({ percent: Math.round(loaded / total * 100).toFixed(2) })
            console.log(event)
            event && event.onProgress({ percent: Math.round(loaded / total * 100).toFixed(2) })
            // onProgress(, file);
        },
    })
    // let xhr = new XMLHttpRequest();
    // xhr.upload.onprogress = (evt)=>{
    //     if (evt.lengthComputable) {
    //         var percentComplete = evt.loaded / evt.total;
    //         console.log("Upload ", Math.round(percentComplete*100) + "% complete.");
    //     }
    //     console.log(evt,'progress')
    // }
    // xhr.upload.onloadstart = (e)=>{
    //     callback && callback.call(this,{code:"0",...e});
    // }
    // xhr.upload.onerror = (e)=>{
    //     callback && callback.call(this,{code:"-1",...e});
    // }
    // xhr.upload.onload = (e)=>{
    //     callback && callback.call(this,e);
    // }

    // xhr.open("POST",url,true);
    // let formData = new FormData();
    // formData.append('file',file);
    // if(data){
    //     let key = Object.keys(data);
    //     key.forEach(item => {
    //         formData.append(item,data[item]);
    //     })
    // }
    // xhr.setRequestHeader('Authorization',token);

    // xhr.send(formData);
}
