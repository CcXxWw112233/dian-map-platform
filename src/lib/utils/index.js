import { Feature } from 'ol'
import { LineString ,Point ,Polygon ,MultiLineString,MultiPoint,MultiPolygon} from 'ol/geom'
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector'
import {GeoJSON,WKT} from 'ol/format';
import { getCenter,getBottomLeft,getBottomRight,getTopLeft,getTopRight } from 'ol/extent'
import { Fill,Text, Stroke,Style, 
    MultiLineString as MultiLineStyle, 
    LineString as LineStyle,
    MultiPoint as MultiPointStyle ,
    MultiPolygon as MultiPolygonStyle, 
    Icon
} from 'ol/style'

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

export const createStyle = function( type, options ){
    let defaultColor = "#3399cc";
    // 填充色
    let fill = new Fill({
        color: options.fillColor || defaultColor
    })
    // 边框色
    let stroke = new Stroke({
        color: options.strokeColor || defaultColor,
        width: options.strokeWidth || 2
    })
    // 文字样式
    let text =  options.showName ? new Text({
        text: options.text,
        fill: new Fill({
            color: options.textFillColor || defaultColor 
        }),
        font: options.font,
        stroke: new Stroke({
            color: options.textStrokeColor || defaultColor,
            width: options.textStrokeWidth || 2
        })
    }) : null;
    // 所有类型的style，根据不同类型，返回不同的样式列表
    let styles = {
        "Point":new Style({
            // image: new Icon({
            //     src: options.iconUrl,
            //     color: options.pointColor ? options.pointColor : defaultColor
            // }),
            text:text
        }),
        "MultiLineString": new Style({
            stroke: stroke
        }),
        "MultiPolygon": new Style({
            fill: fill,
            stroke: stroke,
            text: text
        }),
        "Polygon": new Style({
            fill,
            stroke,
            text
        }),
        "MultiPoint":new Style({
            // image: new Icon({
            //     src: options.iconUrl,
            //     color: options.pointColor ? options.pointColor : defaultColor
            // }),
            text:text
        })
    }

    return styles[type];
}

// 添加source
export const Source = function(data){
    return new VectorSource({...data})
}

export const Layer = function(data){
    return new VectorLayer({...data})
}