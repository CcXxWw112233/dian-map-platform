import {BASIC} from './config'
import { request } from './index'
export default {
    ...BASIC,
    GET_SCOUTING_LIST: async (orgId,data,header = {})=>{
        let response = await request('GET',`/map/${orgId}/project` , data , header);
        // 检查数据是否正常
        if(BASIC.checkResponse(response)){
            return response.data;
        }

        return Promise.reject(response);
    }
}