import { addFeature, createStyle ,Source,Layer,TransformCoordinate ,setSelectInteraction,Fit} from '../../../lib/utils/index'
import Map from "ol/Map";
import View from "ol/View";
import { baseMapDictionary, baseMaps } from '../../../utils/mapSource'
import { getLocal ,setLocal} from '../../../utils/sessionManage'
import mapApp from '../../../utils/INITMAP'
import Event from '../../../lib/utils/event'
import {
    defaults as defaultInteractions,
    DragRotateAndZoom,
  } from "ol/interaction";

const { Evt } = Event;

function action(mapId){
    this.center = [12682417.401133642, 2573911.8265894186];
    // 视图层
    this.view = new View({
        center: this.center,
        projection: "EPSG:3857",
        minZoom: 3,
        zoom: 10,
        maxZoom: 18,
    });
    this.features = [];
    // 地图
    this.map = new Map({
        interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
        layers: [],
        target: mapId,
        view: this.view
    });
    this.Init = ()=>{
        this.Layer.setSource(this.Source);
        this.map.addLayer(this.Layer);
        this.addSelect();
        this.map.on('moveend',this.getPointForLocation)
    }
    this.Source = Source();
    this.Layer = Layer({id:"getAddressLayer",zIndex:10});
    // 创建底图
    this.baseLayer = async ()=>{
        let baseMapKey = await getLocal('baseMapKey');
        baseMapKey = baseMapKey.data;
        let firstBaseMaps = undefined;
        if(!baseMapKey){
            firstBaseMaps = baseMapDictionary[0];
            setLocal("baseMapKey",firstBaseMaps.key)
        }else{
            firstBaseMaps = baseMapDictionary.find(item => item.key === baseMapKey) || baseMapDictionary[0];
        }
        if(firstBaseMaps) {
            const values = firstBaseMaps.values || "";
            const currenttBaseMaps = baseMaps.filter(item => {return values.indexOf(item.id) > -1})
            currenttBaseMaps.forEach(baseMap => {
                const layer = mapApp.createTilelayer(baseMap)
                this.map.addLayer(layer)
            })
        }
    }
    let defaultStyle = createStyle('Point',{
        icon: {
            src: require('../../../assets/location_2.png'),
            scale: 0.5,
            color:"#ff0000"
        }
    });
    let activeStyle = createStyle('Point',{
        icon:{
            src:require('../../../assets/Location-1.png'),
        }
    })
    // 渲染坐标点
    this.renderPoint = async (data)=>{
        this.Source.clear();
        this.features = [];
        data.forEach((item,index) => {
            let { location , address , pname, cityname, adname,id } = item;
            let coor = TransformCoordinate(location.split(',').map(item => +item));
            let feature = addFeature('Point',{coordinates: coor ,id});
            let style = {};
            if(index === 0){
                style = activeStyle;
            }else{
                style = defaultStyle;
            }

            feature.setStyle(style);
            this.features.push(feature);
            this.Source.addFeature(feature);
        })  
        await Fit(this.view,this.Source.getExtent(),{size:this.map.getSize(),duration: 800 ,padding:[ 100 ,100 ,100 ,100]});
        this.view.animate({
            center:this.features[0].getGeometry().getCoordinates(),
            zoom: this.view.getZoom(),
            duration:500
        })
    }
    let timer = null;
    this.getPointForLocation = ()=>{
        clearTimeout(timer);
        timer = setTimeout(()=>{
            let center = this.view.getCenter();
            let coor = TransformCoordinate(center,'EPSG:3857','EPSG:4326');
            window.CallWebMapFunction('SearchPoint',{position: coor}).then(res => {
                // console.log(res);
                Evt.firEvent('moveEndToSearch',{address:res, position: coor});
            })
        },500)
    }
    // 设置样式
    let setDefaultStyle = (feature)=>{
        this.features = this.features.map(item => {
            if(item.get('id') !== feature.get('id'))
            item.setStyle(defaultStyle);
            else{
                item.setStyle(activeStyle);
            }
            return item;
        })
    }

    // 添加选择器
    this.addSelect = ()=>{
        this.select = setSelectInteraction();
        this.select.on('select',(e)=>{
            let selected = e.selected[0];
            if(selected){
                setDefaultStyle(selected);
                selected.setStyle(activeStyle);
                this.view.animate({
                    center:selected.getGeometry().getCoordinates(),
                    zoom: this.view.getZoom(),
                    duration:500
                })
            }
        })
        this.map.addInteraction(this.select);
    }
}

export default action;