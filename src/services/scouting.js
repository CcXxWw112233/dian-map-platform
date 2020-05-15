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
    },
    REMOVE_BOARD: async (id,data) => {
        let response = await request('DELETE',`/map/board/${id}`,data);
        if(BASIC.checkResponse(response)){
            return response.data;
        }

        return Promise.reject(response);
    },
    EDIT_BOARD_NAME: async (id ,data)=>{
        let response = await request('PUT',`/map/board/${id}`,data);
        if(BASIC.checkResponse(response)){
            return response.data;
        }
        return Promise.reject(response);
    }
}