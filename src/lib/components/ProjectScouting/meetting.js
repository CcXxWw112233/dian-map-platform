import config from '../../../services/scouting';
export default function Meeting(){
  const { METTING_START, GET_BOARD_USERS } = config;
  // 开启会议的接口
  this.meettingStart = async (data) => {
    return await METTING_START(data);
  }
  // 获取用户列表的接口
  this.fetchUsers = async (data)=>{
    return await GET_BOARD_USERS(data)
  }
}
