import { Feature } from "ol";
import {
  LineString,
  Point,
  Polygon,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
} from "ol/geom";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { GeoJSON, WKT } from "ol/format";
import {
  getCenter,
  getBottomLeft,
  getBottomRight,
  getTopLeft,
  getTopRight,
} from "ol/extent";
import {
  Fill,
  Text,
  Stroke,
  Style,
  MultiLineString as MultiLineStyle,
  LineString as LineStyle,
  MultiPoint as MultiPointStyle,
  MultiPolygon as MultiPolygonStyle,
  Icon,
} from "ol/style";

// 新建feature
export const addFeature = function (type, data) {
  if (!type) return new Error('property "type" is required');
  let geoType = function () {
    if (type === "LineString") {
      return new LineString(data ? data.coordinates : []);
    }
    if (type === "Point") {
      return new Point(data ? data.coordinates : []);
    }
    if (type === "Polygon") {
      return new Polygon(data ? data.coordinates : []);
    }
    if (type === "MultiLineString") {
      return new MultiLineString(data ? data.coordinates : []);
    }
    if (type === "MultiPoint") {
      return new MultiPoint(data ? data.coordinates : []);
    }
    if (type === "MultiPolygon") {
      return new MultiPolygon(data ? data.coordinates : []);
    }
  };

  let feature = new Feature({
    geometry: geoType(),
    ...data,
  });
  // 如果有id，则强制添加ID
  if (data.id) {
    feature.setId(data.id);
  }
  return feature;
};

export const getExtent = function (feature) {
  let extent = feature.getGeometry().getExtent();
  return extent;
};

export const getPoint = function (extent, type = "center") {
  switch (type) {
    case "center":
      return getCenter(extent);
    case "topLeft":
      return getTopLeft(extent);
    default:
      return getCenter(extent);
  }
};

export const loadFeatureJSON = function (data, type = "WTK") {
  if (type === "WTK") {
    return new WKT().readFeature(data);
  }
  return new GeoJSON().readFeature(data);
};

const getPolygonFillColor = (properties, fillColorKeyVals) => {
  let fillColor;
  if (fillColorKeyVals) {
    const proerty = fillColorKeyVals[0].property;
    let splitScope = [];
    fillColorKeyVals.forEach((fillColor) => {
      const tempArr0 = fillColor.scope.split("-");
      let tempArr1 = [];
      tempArr0.forEach((item) => {
        if (item.length > 0) {
          tempArr1.push(Number(item));
        }
      });
      splitScope.push(tempArr1);
    });
    const val = Number(properties[proerty]);
    for (let i = 0; i < splitScope.length; i++) {
      const scopeVal = splitScope[i];
      if (val < scopeVal[scopeVal.length - 1]) {
        fillColor = fillColorKeyVals[i].fillColor;
        break;
      }
    }
    if (!fillColor) {
      fillColor = fillColorKeyVals[fillColorKeyVals.length - 1].fillColor;
    }
  }
  return fillColor;
};

export const createStyle = function (type, options, properties, fillColorKeyVals) {
  const fillColor = getPolygonFillColor(properties, fillColorKeyVals);
  // debugger
  let defaultColor = "#3399cc";
  // 填充色
  let fill = new Fill({
    color: fillColor ? fillColor : options.fillColor || defaultColor,
  });
  // 边框色
  let stroke = new Stroke({
    color: options.strokeColor || defaultColor,
    width: options.strokeWidth || 2,
  });
  // 文字样式
  let text = options.showName
    ? new Text({
        offsetX: 0,
        offsetY: -25,
        text: fillColorKeyVals
          ? `${options.text}(${properties[fillColorKeyVals[0].property]})`
          : options.text,
        fill: new Fill({
          color: options.textFillColor || defaultColor,
        }),
        font: options.font,
        stroke: new Stroke({
          color: options.textStrokeColor || defaultColor,
          width: options.textStrokeWidth || 2,
        }),
      })
    : null;
  if (type === "Point") {
    return new Style({
      image: new Icon({
        src: options.iconUrl,
        color: options.pointColor || defaultColor,
        scale: options.iconScale || 0.6,
      }),
      text: text,
    });
  }
  if (type === "MultiLineString") {
    return new Style({
      stroke: stroke,
    });
  }
  if (type === "MultiPolygon") {
    return new Style({
      fill: fill,
      stroke: stroke,
      text: text,
    });
  }
  if (type === "Polygon") {
    return new Style({
      fill,
      stroke,
      text,
    });
  }
  if (type === "MultiPoint") {
    return new Style({
      image: new Icon({
        src: options.iconUrl,
        color: options.pointColor ? options.pointColor : defaultColor,
        scale: options.iconScale || 0.6,
      }),
      text: text,
    });
  }
};

// 添加source
export const Source = function (data) {
  return new VectorSource({ ...data });
};

export const Layer = function (data) {
  return new VectorLayer({ ...data });
};
