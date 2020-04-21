import axios from 'axios'
import { getBaseUrl } from './config'

const instance = axios.create({
  method:"GET",
  baseURL: getBaseUrl().API_URL
})

instance.interceptors.request.use(config => {
  console.log(config)
  return config ;
})

instance.interceptors.response.use(config => {
  return config ;
})

let request = (method, url, data, header)=>{
  return instance({
    method,
    url,
    data,
    headers:{
      ...header
    }
  })
}
export {request}
