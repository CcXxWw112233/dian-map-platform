import axios from 'axios'
import { getBaseUrl } from './config'

const instance = axios.create({
  method:"GET",
  baseURL: getBaseUrl().API_URL
})

instance.interceptors.request.use(config => {
  return config ;
})

instance.interceptors.response.use(config => {
  return config ;
})

export default instance ;
