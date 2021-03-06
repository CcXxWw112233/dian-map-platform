import { Feature, Overlay } from 'ol'
import {
  LineString,
  Point,
  Polygon,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Circle as defaultCircle
} from 'ol/geom'
import { Image } from 'ol/layer'
import Static from 'ol/source/ImageStatic'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { GeoJSON, WKT } from 'ol/format'
import { transform, Projection } from 'ol/proj'
import { Draw, Select } from 'ol/interaction'
import { createBox } from 'ol/interaction/Draw'
import {
  getCenter,
  getBottomLeft,
  getBottomRight,
  getTopLeft,
  getTopRight,
  isEmpty,
  getSize,
  getWidth,
  getHeight
} from 'ol/extent'
import {
  Fill,
  Text,
  Stroke,
  Style,
  Circle,
  // MultiLineString as MultiLineStyle,
  // LineString as LineStyle,
  // MultiPoint as MultiPointStyle,
  // MultiPolygon as MultiPolygonStyle,
  Icon
} from 'ol/style'

import * as olProj from 'ol/proj'

import { circular as circularPolygon } from 'ol/geom/Polygon'

import INITMAP from '../../utils/INITMAP'
import { BASIC } from '../../services/config'

/** 新建feature
 * @param {"LineString" | "Point" | "Polygon" | "MultiLineString" | "MultiPoint" | "MultiPolygon" | "Circle" | "defaultCircle"} type 元素类型
 * @param {{coordinates: number[]}} data feature需要包含的内容，coordinates必须要
 */
export const addFeature = function(type, data) {
  if (!type) return new Error('property "type" is required')
  let geoType = function() {
    if (type === 'LineString') {
      return new LineString(data ? data.coordinates : [])
    }
    if (type === 'Point') {
      return new Point(data ? data.coordinates : [])
    }
    if (type === 'Polygon') {
      return new Polygon(data ? data.coordinates : [])
    }
    if (type === 'MultiLineString') {
      return new MultiLineString(data ? data.coordinates : [])
    }
    if (type === 'MultiPoint') {
      return new MultiPoint(data ? data.coordinates : [])
    }
    if (type === 'MultiPolygon') {
      return new MultiPolygon(data ? data.coordinates : [])
    }
    if (type === 'Circle') {
      const projPt = olProj.toLonLat(data.coordinates, 'EPSG:3857')
      const circle4326 = circularPolygon(data ? projPt : [], data.radius)
      const circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857')
      return circle3857
    }
    if (type === 'defaultCircle') {
      return new defaultCircle(data.coordinates, data.radius)
    }
  }

  let feature = new Feature({
    geometry: geoType(),
    ...data
  })
  // console.log(feature.getGeometry())
  // 如果有id，则强制添加ID
  if (data.id) {
    feature.setId(data.id)
  }
  return feature
}

export const getExtent = function(feature) {
  let extent = feature.getGeometry().getExtent()
  return extent
}

export const getExtentIsEmpty = extent => {
  return isEmpty(extent)
}

export const getPoint = function(extent, type = 'center') {
  if (isEmpty(extent)) return
  switch (type) {
    case 'center':
      return getCenter(extent)
    case 'topLeft':
      return getTopLeft(extent)
    case 'topRight':
      return getTopRight(extent)
    case 'bottomRight':
      return getBottomRight(extent)
    case 'bottomLeft':
      return getBottomLeft(extent)
    case 'size':
      return getSize(extent)
    case 'width':
      return getWidth(extent)
    case 'height':
      return getHeight(extent)
    default:
      return getCenter(extent)
  }
}

export const loadFeatureJSON = function(data, type = 'WTK') {
  if (type === 'WTK') {
    return new WKT().readFeature(data.source, data.options)
  }
  return new GeoJSON().readFeatures(data)
}

const getPolygonFillColor = (properties = {}, fillColorKeyVals = []) => {
  let fillColor
  if (fillColorKeyVals) {
    const proerty = fillColorKeyVals[0].property
    let splitScope = []
    fillColorKeyVals.forEach(fillColor => {
      const tempArr0 = fillColor.scope.split('-')
      let tempArr1 = []
      tempArr0.forEach(item => {
        if (item.length > 0) {
          tempArr1.push(Number(item))
        }
      })
      splitScope.push(tempArr1)
    })
    const val = Number(properties[proerty])
    if (val === 0) {
      fillColor = '#E0E0E0'
    } else {
      for (let i = 0; i < splitScope.length; i++) {
        const scopeVal = splitScope[i]
        if (val < scopeVal[scopeVal.length - 1]) {
          fillColor = fillColorKeyVals[i].fillColor
          break
        }
      }
      if (!fillColor) {
        fillColor = fillColorKeyVals[fillColorKeyVals.length - 1].fillColor
      }
    }
  }
  return fillColor
}

export const createStyle = function(
  type,
  options = {},
  properties = {},
  fillColorKeyVals = []
) {
  let fillColor = null
  if (
    properties &&
    Object.keys(properties).length &&
    fillColorKeyVals &&
    fillColorKeyVals.length
  ) {
    fillColor = getPolygonFillColor(properties, fillColorKeyVals)
  }

  options.icon = !options.icon ? {} : options.icon

  let defaultColor = 'rgba(255,255,255,0.8)'
  // 填充色
  let fill = new Fill({
    color: fillColor ? fillColor : options.fillColor || defaultColor
  })
  // 边框色
  let stroke = new Stroke({
    color: options.strokeColor || defaultColor,
    width: options.strokeWidth || 2,
    lineDash: options.lineDash
  })
  // 文字样式
  let text = new Text({
    // offsetX: 0,
    // offsetY: options.offsetY === undefined ? -25 : options.offsetY,
    offsetX: 25,
    offsetY: options.offsetY === undefined ? 0 : options.offsetY,
    textAlign: 'left',
    overflow: true,
    placement: options.placement || 'point',
    text: options.showName
      ? fillColorKeyVals && fillColorKeyVals.length
        ? `${options.text}(${
            Number(properties[fillColorKeyVals[0].property]).toFixed(0) !== '0'
              ? Number(properties[fillColorKeyVals[0].property]).toFixed(0)
              : '暂无数据'
          })`
        : options.text
      : '',
    fill: new Fill({
      color: options.textFillColor || defaultColor
    }),
    font:
      typeof options.font === 'number'
        ? options.font + 'px sans-serif'
        : options.font,
    stroke: new Stroke({
      color: options.textStrokeColor || defaultColor,
      width: options.textStrokeWidth || 2
    })
  })
  if (type === 'Point') {
    let isIcon = false
    if (options.iconUrl) {
      isIcon = true
    } else if (options.icon && options.icon.hasOwnProperty('src')) {
      isIcon = true
    }
    return new Style({
      image: isIcon
        ? new Icon({
            src: options.iconUrl,
            color: options.pointColor || defaultColor,
            scale: options.iconScale || 0.8,
            anchor: [0.5, 0.5],
            ...options.icon
          })
        : new Circle({
            radius: options.radius || 5,
            fill: fill,
            stroke: stroke,
            anchor: [0.5, 0.5]
          }),
      text: text,
      zIndex: options.zIndex || Infinity
    })
  }
  if (
    type === 'MultiLineString' ||
    type === 'LineString' ||
    type === 'Polyline'
  ) {
    return new Style({
      text: text,
      stroke: stroke,
      zIndex: options.zIndex || Infinity
    })
  }
  if (type === 'MultiPolygon') {
    return new Style({
      fill: fill,
      stroke: stroke,
      text: text,
      zIndex: options.zIndex || Infinity
    })
  }
  if (type === 'Polygon') {
    return new Style({
      fill,
      stroke,
      text,
      zIndex: options.zIndex || Infinity
    })
  }
  if (type === 'MultiPoint') {
    return new Style({
      image: new Icon({
        src: options.iconUrl,
        color: options.pointColor ? options.pointColor : defaultColor,
        scale: options.iconScale || 0.6,
        ...options.icon
      }),
      text: text,
      zIndex: options.zIndex || Infinity
    })
  }
  if (type === 'Circle') {
    return new Style({
      fill,
      stroke,
      text,
      zIndex: options.zIndex || Infinity,
      radius: options.radius
    })
  }
}

/**
 *
 * @param {number[]} coor 需要转换的坐标
 * @param {'EPSG:4326' | 'EPSG:3857'} from source坐标源
 * @param {'EPSG:4326' | 'EPSG:3857'} to 需要转换到哪个坐标
 * @returns
 */
export const TransformCoordinate = (
  coor,
  from = 'EPSG:4326',
  to = 'EPSG:3857'
) => {
  return transform(coor, from, to)
}

export const Fit = (view, extent, option, duration = 1000) => {
  if (Array.isArray(extent)) {
    if (extent[0] === Infinity) {
      return
    }
  }
  return new Promise((resolve, reject) => {
    if (view && extent[0] !== Infinity) {
      view.cancelAnimations()
      view.fit(extent, {
        duration,
        padding: [200, 150, 80, 400],
        ...option,
        callback: e => {
          resolve(e)
        }
      })
    } else {
      reject(extent)
    }
  })
}

export const createOverlay = (ele, data = {}) => {
  const overlay = new Overlay({
    element: ele,
    ...data
  })
  return overlay
}

export const animate = ({ zoom, center, duration = 800 }) => {
  return new Promise((resolve, reject) => {
    INITMAP.view.animate({
      zoom: zoom || INITMAP.view.getZoom(),
      center,
      duration
    })
    setTimeout(() => {
      resolve()
    }, duration)
  })
}

export const drawPoint = (source, data = {}) => {
  return new Draw({
    source: source,
    type: 'Point',
    ...data
  })
}

//
export const drawBox = (source, data) => {
  return new Draw({
    source: source,
    type: 'Circle',
    geometryFunction: createBox(),
    ...data
  })
}

export const drawCircle = (source, geometryFunction) => {
  return new Draw({
    source: source,
    type: 'Circle',
    geometryFunction: geometryFunction
  })
}

// 添加source
export const Source = function(data) {
  return new VectorSource({ ...data })
}

export const Layer = function(data) {
  return new VectorLayer({ ...data })
}

export const SourceStatic = function(url, extent, data) {
  let projection = new Projection({
    code: 'xkcd-image',
    units: 'pixels',
    extent: extent
  })
  return new Static({
    crossOrigin: 'anonymous',
    url,
    imageExtent: extent,
    projection,
    ...data
  })
}

export const ImageStatic = function(url, extent, data) {
  return new Image({
    source: SourceStatic(url, extent, data),
    ...data
  })
}

export const setSelectInteraction = function(data = {}) {
  let select = new Select({
    ...data
  })
  return select
}

// 适应范围后的调整
export const fitPadding =
  BASIC.getUrlParam.isMobile === '1'
    ? [100, 100, 240, 100]
    : [200, 150, 80, 500]

/**
 * 设置元素的中心点和元素的范围到视图中心
 * @param {Feature} feature 需要用来定位的特征元素
 * @param {{padding: []}} options 设置项
 */
export const Center = (feature, options) => {
  /** 元素特征 */
  const geo = feature.getGeometry()
  /** 特征类型 */
  const type = geo.getType()
  if (type === 'Point') {
    /** 中心点 */
    const center = geo.getCoordinates()
    INITMAP.view.animate({
      center,
      duration: 400,
      ...options
    })
  } else {
    /** 范围 */
    const extent = geo.getExtent()
    INITMAP.view.fit(extent, {
      duration: 400,
      padding: fitPadding,
      ...options
    })
  }
}

/** 未选择的样式 */
export const pointUnselect = isMulti =>
  createStyle('Point', {
    icon: {
      src: isMulti
        ? require('../../assets/multiselect.png')
        : require('../../assets/unselectlocation.png'),
      crossOrigin: 'anonymous',
      anchor: [0.5, 0.8]
    }
  })

/** 选中的样式 */
export const pointSelect = isMulti =>
  createStyle('Point', {
    icon: {
      src: isMulti
        ? require('../../assets/multiunselect.png')
        : require('../../assets/selectlocation.png'),
      crossOrigin: 'anonymous',
      anchor: [0.5, 0.8]
    }
  })
