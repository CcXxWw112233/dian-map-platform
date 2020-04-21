import { Feature } from 'ol'
import { LineString ,Point ,Polygon } from 'ol/geom'
import Source from 'ol/source/Source';
import Layer from 'ol/layer/Layer';

// 新建feature
export const addFeature = function(type, data){
    if(!type) return new Error('property "type" is required');
    let geoType = function(){
        if(type === 'LineString'){
            return new LineString(data ? data.coordinates : [])
        }
        if(type === 'Point'){
            return new Point(data ? data.coordinates :[])
        }   
        if(type === 'Polygon'){
            return new Polygon(data ? data.coordinates: []);
        }
    }

    let feature = new Feature({
        geometry: geoType(),
        ...data
    })
    // 如果有id，则强制添加ID
    if(data.id){
        feature.setId(data.id);
    }
    return feature ;
}

// 添加source
export const VectorSource = function(data){
    return new Source({...data})
}

export const VectorLayer = function(data){
    return new Layer({...data})
}