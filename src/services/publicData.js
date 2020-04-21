import { getBaseUrl } from './config'
import {request} from './index'
export const publicDataUrl = {
    request,
    // 获取公有数据的列表，使用jsonp
    GET_GEO_DATA: 'https://map.di-an.com/geoserver/wfs'
}