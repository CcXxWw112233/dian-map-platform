import config from '../../../services/scouting'
import InitMap from '../../../utils/INITMAP'
import { project } from '../../../components/PublicOverlays/index'
import addProjectOverlay from '../../../components/PublicOverlays/addProjectOverlay'
import { 
    Layer, 
    Source ,
    TransformCoordinate ,
    addFeature,
    createStyle,
    Fit,
    createOverlay,
    drawPoint,
} from '../../utils'

const action = function(){
    const { GET_SCOUTING_LIST ,REMOVE_BOARD ,EDIT_BOARD_NAME} = config;
    
    this.state = {
        overlays: [],
        draw:null
    };
    this.init = async ()=>{
        this.Layer = Layer({id:'project_point_layer',zIndex:11});
        this.Source = Source();
        this.Layer.setSource(this.Source);
        InitMap.map.addLayer(this.Layer);

        return InitMap.map;
    }
    // 获取项目列表
    this.getList = async (data = {}) => {
        let id = config.getUrlParam.orgId;
        return await GET_SCOUTING_LIST(id,data);
    }

    this.renderProjectPoint = (data)=>{
        this.Source.clear();
        data && data.forEach(item => {
            let styleOption = {
                text:item.board_name,
                type:"Point",
                iconUrl:require('../../../assets/Location-1.png'),
                coordinates: TransformCoordinate([item.coordinate_x, item.coordinate_y])
            }
            // 创建point
            let feature = addFeature(styleOption.type,{coordinates : styleOption.coordinates});
            feature.setStyle(createStyle(styleOption.type, styleOption));
            this.addOverlay(styleOption)
            this.Source.addFeature(feature);
        })
        // 视图位移
        data && setTimeout(()=>{
            if(this.Source)
            this.fitToCenter();
        },500)
        
    }
    this.fitToCenter = () => {
        Fit(InitMap.view, this.Source.getExtent(),{size: InitMap.map.getSize() - 5})
    }
    // 添加overlay
    this.addOverlay = (data = {})=>{
        let ele = new project(data);
        // console.log(overlay)
        let overlay = createOverlay(ele.element,{offset:[0, -53]});
        InitMap.map.addOverlay(overlay);
        overlay.setPosition(data.coordinates);
    }

    // 删除项目
    this.removeBoard = async (id)=>{
        return await REMOVE_BOARD(id,{});
    }

    // 修改项目名称
    this.editBoardName = async (id,data)=>{
        return await EDIT_BOARD_NAME(id,data);
    }

    this.addBoardOverlay = (position) => {
        return new Promise((resolve, reject) => {
            let ele = new addProjectOverlay({title:"新建踏勘计划",width:300,style:{zIndex:20}});
            let overlay = createOverlay(ele.element,{positioning:"bottom-center",offset:[0,-15]});
            InitMap.map.addOverlay(overlay);
            overlay.setPosition(position);
            
            ele.on = {
                sure: (val)=>{
                    // console.log(val)
                    overlay.setPosition(null);
                    InitMap.map.removeOverlay(overlay);
                    resolve(val);
                },
                cancel:() => {
                    overlay.setPosition(null);
                    InitMap.map.removeOverlay(overlay);
                    reject({code:"-1"})
                }
            }
        })
        
    }

    this.addDrawBoard = ()=>{
        return new Promise((resolve, reject) => {
            this.draw = drawPoint(this.Source);
            this.draw.on('drawend',(evt)=>{
                InitMap.map.removeInteraction(this.draw);
                resolve(evt);
            })
            this.draw.on('drawabort',(e)=>{
                reject(e)
            })
            InitMap.map.addInteraction(this.draw);
        })
    }
    // 添加项目
    this.addBoard = () => {

    }
}

const exportAction = new action();

export default exportAction;