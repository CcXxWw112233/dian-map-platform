import {BASIC} from './config';
export default function(response){
  return new Promise((resolve, reject)=>{
    if(BASIC.checkResponse(response)){
      resolve(response.data);
    }else {
      reject(response && response.data);
    }
  })
}
