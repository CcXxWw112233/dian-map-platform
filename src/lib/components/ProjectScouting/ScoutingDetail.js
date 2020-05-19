import { setSession } from '../../../utils/sessionManage'
import listAction from './ScoutingList'
import config from '../../../services/scouting'
import { dateFormat } from '../../../utils/utils'
import InitMap from '../../../utils/INITMAP'
import { drawPoint, createStyle , Source, Layer ,TransformCoordinate ,addFeature ,createOverlay} from '../../utils/index'
import CollectionOverlay from '../../../components/PublicOverlays/CollectionOverlay'
function Action (){
    const { 
        GET_AREA_LIST,
        ADD_AREA_BOARD ,
        ADD_COLLECTION ,
        GET_COLLECTION_LIST ,
        DELETE_COLLECTION,
        EDIT_COLLECTION 
    } = config;
    this.activeFeature = {} ;
    this.Layer = Layer({id:"scoutingDetailLayer",zIndex:11});
    this.Source = Source();
    this.features = [];
    this.overlays = [];
    this.init = () => {
        this.Layer.setSource(this.Source);
        InitMap.map.addLayer(this.Layer); 
    }
    this.draw = null ;

    this.removeListPoint = () => {
        // 删除已经存在的项目列表
        listAction.clear();
    }
    this.dateFormat = dateFormat;
    this.onBack = () => {
        setSession(listAction.sesstionSaveKey,"");
    }
    // 获取区域列表
    this.fetchAreaList = async (data) => {
        return await GET_AREA_LIST(data)
    }
    // 添加区域
    this.addArea = async (data) => {
        return await ADD_AREA_BOARD(data);
    }

    // 添加踏勘列表
    this.addCollection = async (data) => {
        return await ADD_COLLECTION(data);
    }
    // 获取采集列表
    this.getCollectionList = async (data) => {
        return await GET_COLLECTION_LIST(data);
    }
    // 删除采集数据
    this.removeCollection = async (id) => {
        return await DELETE_COLLECTION(id);
    }

    // 添加关联点的交互
    this.addCollectionPosition = (data)=> {
        return new Promise((resolve, reject) => {
           let style = createStyle('Point',{
                iconUrl: require('../../../assets/addPointLocation.png'),
                text: data.title
            })
            this.draw = drawPoint(this.Source,{style}); 
            this.draw.on('drawend',(e) => {
                let { feature } = e;
                
                feature.setStyle(style);
                this.activeFeature = feature;
                InitMap.map.removeInteraction(this.draw);
                resolve(e);
            })
            InitMap.map.addInteraction(this.draw);
        })
    }
    this.transform = (coor) => {
        return TransformCoordinate(coor, 'EPSG:3857','EPSG:4326')
    }
    // 发送修改的坐标点
    this.editCollection = async (data) => {
        return await EDIT_COLLECTION(data);
    }
    // 去除添加交互的方法
    this.removeDraw = ()=>{
        InitMap.map.removeInteraction(this.draw);
        if(this.Source.getFeatureByUid(this.activeFeature.ol_uid)){
            this.Source.removeFeature(this.activeFeature);
        }
    }

    // 查找数据中，有存在效坐标的资料
    const findHasLocationData = (data) => {
        let arr = data.filter(item => !!item.location && Object.keys(item.location).length !== 0);
        return arr ;
    }
    this.removeOverlay = () => {
        this.overlays.forEach(item => {
            InitMap.map.removeOverlay(item);
        })
        this.overlays = [];
    }

    this.removeFeatures = ()=>{
        this.removeOverlay();
        // 删除元素
        console.log('removeOverlay')
        this.features.forEach(item => {
            if(this.Source.getFeatureByUid(item.ol_uid)){
                this.Source.removeFeature(item);
            }
        })
        
        this.features = [];
    }

    // 渲染feature
    this.renderCollection = (data) => {
        // 删除元素
        this.removeFeatures();
        let array = findHasLocationData(data);
        // console.log(array)
        array.forEach(item => {
            let coor = TransformCoordinate([+item.location.longitude, +item.location.latitude]);
            let feature = addFeature('Point',{coordinates:coor});
            let style = createStyle('Point',{
                strokeWidth:2,
                strokeColor:"#fff"
            });

            feature.setStyle(style);
            this.addOverlay(coor, item);
            this.features.push(feature);
            this.Source.addFeature(feature);
        })
    }
    this.addOverlay = (coor,data)=>{
        let ele = new CollectionOverlay(data);
        let overlay = createOverlay(ele.element, {positioning:'bottom-left',offset:[-10, -20]});
        InitMap.map.addOverlay(overlay);
        this.overlays.push(overlay);
        overlay.setPosition(coor);
    }

    this.removeLayer = () => {
        this.removeOverlay();
        this.removeFeatures();
        InitMap.map.removeLayer(this.Layer)
    }
}

let action = new Action();

export default action;