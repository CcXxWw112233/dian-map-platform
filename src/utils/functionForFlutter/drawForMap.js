import { addFeature } from '../../lib/utils/index'
import ListAction from '../../lib/components/ProjectScouting/ScoutingList'
import DetailAction from '../../lib/components/ProjectScouting/ScoutingDetail'
function renderAction (){
    // 隐藏项目
    this.hideProjectPoint = ()=>{
        ListAction.clear();
    }
    // 显示项目坐标点
    this.showProjectPoint = async ()=>{
        this.hideProjectPoint();
        let data = await ListAction.getList();
        // console.log(data)
        ListAction.renderProjectPoint(data.data);
    }
    // 显示所有采集资料点
    this.renderCollection = (data) => {
        if(!data && !data.length){
            return ;
        }
        let pointCollection = [];
        let features = [];
        let pic = [];
        data.forEach(item => {
            // 有坐标点的展示
            if(item.collection_type !== '4' && item.collection_type !== '5'){
                pointCollection.push(item);
            }
            // 元素的展示
            if(item.collection_type === '4'){
                features.push(item);
            }
            // 
            if(item.collection_type === '5'){
                pic.push(item);
            }
        })

        

    }
}

const action = new renderAction();

export default action;