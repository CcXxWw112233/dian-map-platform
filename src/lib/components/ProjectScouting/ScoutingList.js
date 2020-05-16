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
    const { GET_SCOUTING_LIST ,REMOVE_BOARD ,EDIT_BOARD_NAME ,ADD_BOARD} = config;
    
    this.overlays = [];
    this.draw = null ;
    this.addProjectFeature = {} ;
    this.addProjectOverlay = {};

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
    // 
    this.clearOverlay = ()=>{
        this.overlays.forEach(item => {
            item.setPosition(null);
            InitMap.map.removeOverlay(item)
        })
        this.overlays = [];
    }

    this.renderProjectPoint = (data)=>{
        this.Source.clear();
        this.clearOverlay();
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
        Fit(InitMap.view, this.Source.getExtent(),{size: InitMap.map.getSize(),padding:[200,50,80,50]})
    }
    // 添加overlay
    this.addOverlay = (data = {})=>{
        let ele = new project(data);
        // console.log(overlay)
        let overlay = createOverlay(ele.element,{offset:[0, -53]});
        InitMap.map.addOverlay(overlay);
        this.overlays.push(overlay);
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

    this.addBoardOverlay = (position,data = {}) => {
        return new Promise((resolve, reject) => {
            let ele = new addProjectOverlay({title:"新建踏勘计划",width:300,style:{zIndex:20}});
            let overlay = createOverlay(ele.element,{positioning:"bottom-center",offset:[0,-15]});
            this.addProjectOverlay = overlay;
            InitMap.map.addOverlay(overlay);
            overlay.setPosition(position);
            data.viewToCenter && (
                InitMap.view.animate({
                    center: position,
                    zoom: InitMap.view.getZoom(),
                    duration: 500
                })
            )
            
            ele.on = {
                sure: (val)=>{
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

    this.removeDraw = ()=>{
        InitMap.map.removeInteraction(this.draw);
        InitMap.map.removeOverlay(this.addProjectOverlay);
        if(this.Source.getFeatureByUid(this.addProjectFeature.ol_uid)){
            this.Source.removeFeature(this.addProjectFeature);
        }
    }

    this.addDrawBoard = ()=>{
        return new Promise((resolve, reject) => {
            this.draw = drawPoint(this.Source);
            this.draw.on('drawend',(evt)=>{
                let {feature} = evt;
                this.addProjectFeature = feature ;
                InitMap.map.removeInteraction(this.draw);
                resolve(evt,this);
            })
            this.draw.on('drawabort',(e)=>{
                reject(e)
            })
            InitMap.map.addInteraction(this.draw);
        })
    }
    // 添加项目
    this.addBoard = async (data) => {
        console.log(data)
        let coor = TransformCoordinate([data.lng,data.lat],"EPSG:3857",'EPSG:4326' );
        
        data.lng = coor[0];data.lat = coor[1];
        return await ADD_BOARD(data);
    }
}

const exportAction = new action();

export default exportAction;