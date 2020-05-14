import { BASIC } from './config'
import {request ,getFeature} from './index'
export const publicDataUrl = {
    request,
    getFeature,
    // 获取公有数据的列表，使用jsonp
    GET_GEO_DATA: BASIC.Geo_WFS
}