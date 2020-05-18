import { setSession } from '../../../utils/sessionManage'
import listAction from './ScoutingList'
import config from '../../../services/scouting'
function Action (){
    const { GET_AREA_LIST,ADD_AREA_BOARD } = config;
    this.removeListPoint = () => {
        // 删除已经存在的项目列表
        listAction.clear();
    }
    this.onBack = () => {
        setSession(listAction.sesstionSaveKey,"");
    }

    this.getBoardDetail = (id) => {

    }
    
    this.fetchAreaList = async (data) => {
        return await GET_AREA_LIST(data)
    }
    this.addArea = async (data) => {
        return await ADD_AREA_BOARD(data);
    }
}

let action = new Action();

export default action;