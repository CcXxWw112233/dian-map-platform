import { addFeature, Source, Layer ,loadFeatureJSON ,getExtent ,getPoint} from '../../lib/utils'
import { publicDataUrl } from '../../services/publicData'
import mapApp from '../../utils/INITMAP'

const publicData = {
    layer: Layer({id:'publicDataLayer',zIndex:11}),
    source: Source(),
    features:[],
    geomData:{},
    init:function(){
        console.log(this)
        this.layer.setSource(this.source);
        mapApp.addLayer(this.layer);
    },
    getPublicData:function({url,data}){
        let { getFeature ,GET_GEO_DATA} = publicDataUrl;
        if(this.geomData[data.typeName]){
            // 使用缓存的数据
            this.renderFeatures(this.geomData[data.typeName]);
        }else{
            // 使用接口数据
            getFeature(url ? url : GET_GEO_DATA,data).then(res => {
                // 数据缓存，后期优化成本地缓存
                this.geomData[data.typeName] = res;
                this.renderFeatures(res);
            });
        }
        
    },
    // 渲染获取到的数据
    renderFeatures:function(data){
        if(data){
            // let features = loadFeatureJSON(data,'GeoJSON');
            if(data.features.length){
                data.features.forEach(item => {
                    let coor = item.geometry.coordinates;
                    let type = item.geometry.type;
                    let feature = addFeature(type,{coordinates: coor});
                    this.source.addFeature(feature)
                })
            }
        }
        this.areaForExtent(true);
    },
    areaForExtent:function(feature,type = 'center'){
        if(feature){
            // let extent = getExtent(feature);
            // let point = getPoint(extent,type);
            mapApp.view.fit(this.source.getExtent(),mapApp.map.getSize())
        }
    }
}
export default publicData;

