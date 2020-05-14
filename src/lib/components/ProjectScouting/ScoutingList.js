import config from '../../../services/scouting'
import InitMap from '../../../utils/INITMAP'
import { project } from '../../../components/PublicOverlays/index'
import { 
    Layer, 
    Source ,
    TransformCoordinate ,
    addFeature,
    createStyle,
    Fit,
    createOverlay
} from '../../utils'

const action = function(){
    const { GET_SCOUTING_LIST } = config;
    
    this.state = {
        overlays: []
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
        setTimeout(()=>{
            this.fitToCenter()
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
}

const exportAction = new action();

export default exportAction;