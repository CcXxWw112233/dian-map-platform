import {BASIC} from './config'
import { request } from './index'
export default {
    ...BASIC,
    // 获取项目列表
    GET_SCOUTING_LIST: async (orgId,data,header = {})=>{
        let response = await request('GET',`/map/${orgId}/project` , data , header);
        // 检查数据是否正常
        if(BASIC.checkResponse(response)){
            return response.data;
        }

        return Promise.reject(response);
    },
    // 删除踏勘项目
    REMOVE_BOARD: async (id,data) => {
        let response = await request('DELETE',`/map/board/${id}`,data);
        if(BASIC.checkResponse(response)){
            return response.data;
        }

        return Promise.reject(response);
    },
    // 修改踏勘项目名称
    EDIT_BOARD_NAME: async (id ,data)=>{
        let response = await request('PUT',`/map/board/${id}`,data);
        if(BASIC.checkResponse(response)){
            return response.data;
        }
        return Promise.reject(response);
    },
    // 添加踏勘项目
    ADD_BOARD: async (data) => {
        let response = await request('POST','/map/board',{ org_id : BASIC.getUrlParam.orgId , ...data});
        if(BASIC.checkResponse(response)){
            return response.data;
        }
        
        return Promise.reject(response);
    },
    // 获取项目详情中的区域列表
    GET_AREA_LIST: async (data) => {
        let response = await request('GET','/map/area_type/list',data);
        if(BASIC.checkResponse(response)){
            return response.data;
        }
        return Promise.reject(response);
    },
    // 新增区域分类
    ADD_AREA_BOARD: async (data) => {
        let response = await request('POST','/map/area_type',data);
        if(BASIC.checkResponse(response)){
            return response.data;
        }

        return Promise.reject(response);
    }
}