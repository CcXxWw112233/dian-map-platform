import { Feature } from 'ol'
import { LineString ,Point ,Polygon ,MultiLineString,MultiPoint,MultiPolygon} from 'ol/geom'
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector'
import {GeoJSON,WKT} from 'ol/format';
import { getCenter,getBottomLeft,getBottomRight,getTopLeft,getTopRight } from 'ol/extent'

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
        if(type === 'MultiLineString'){
            return new MultiLineString(data ? data.coordinates : []);
        }
        if(type === 'MultiPoint'){
            return new MultiPoint(data ? data.coordinates : []);
        }
        if(type === 'MultiPolygon'){
            return new MultiPolygon(data ? data.coordinates : []);
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

export const getExtent = function(feature){
    let extent = feature.getGeometry().getExtent();
    return extent;
}

export const getPoint = function(extent,type = 'center'){
    switch(type){
        case 'center' : return getCenter(extent);
        case 'topLeft' : return getTopLeft(extent);
        default : return getCenter(extent); 
    }
}

export const loadFeatureJSON = function(data ,type = 'WTK'){
    if(type === 'WTK'){
        return new WKT().readFeature(data);
    }
    return (new GeoJSON()).readFeature(data);
}

// 添加source
export const Source = function(data){
    return new VectorSource({...data})
}

export const Layer = function(data){
    return new VectorLayer({...data})
}