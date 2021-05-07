import {
  addFeature,
  Center,
  createStyle,
  Fit,
  fitPadding,
  Layer,
  Source,
  TransformCoordinate,
  pointSelect,
  pointUnselect
} from '../../utils/index'
import InitMap from '../../../utils/INITMAP'
import DEvent, {
  CLICKVIEWFEATURE,
  CLICKVIEWGROUPFEATURE,
  INITMAPEND
} from '../../utils/event'
import { CollectionTypes, EPSG } from '../../../globalSet/constans'
import { isEmpty } from 'ol/extent'

/** 未选中样式 */
const unselect = require('../../../assets/unselectlocation.png')

/** 查看的图层渲染 */
class ViewFeatures {
  constructor() {
    /** 当前图层id */
    this.layerId = 'viewFeaturesLayer'
    /** Source数据源 */
    this.Source = Source()
    /** 图层 */
    this.Layer = Layer({ id: this.layerId, zIndex: 14 })
    /** 底图实例 */
    this.map = null
    /** 视图实例 */
    this.view = null
    /** 自定义的数据id类型 */
    this.featureDid = 'view_d_id'
    /** 自定义的分类坐标点id */
    this.groupPointerDid = 'groupfeature'
    /** 分组的坐标点 */
    this.groupPointer = []
    /** feature类型的渲染合集 */
    this.featuresCollections = []
    /** 图片或媒体带有坐标的数据合集 */
    this.mediaCollections = []
    /** 上一个选中的坐标点 */
    this.prevPointer = null
    /** 选中的样式 */
    this.selectPointerStyle = pointSelect()
    /** 未选中的样式 */
    this.unSelectPointerStyle = pointUnselect()
    /** 等待地图构建完成之后构建视图 */
    DEvent.Evt.addEventListener(INITMAPEND, this.init)
  }
  /** 初始化图层 */
  init = () => {
    this.Layer.setSource(this.Source)
    InitMap.map.addLayer(this.Layer)
    this.view = InitMap.map?.getView()
    this.map = InitMap.map
    this.map.on('click', this.mapClick)
  }

  /** 销毁地图 */
  destoryMap = () => {
    this.map.un('click', this.mapClick)
  }

  /** 清空分组的坐标点 */
  clearGroupPointer = () => {
    if (this.groupPointer.length) {
      this.groupPointer.forEach(item => {
        if (this.Source.getFeatureByUid(item.ol_uid)) {
          this.Source.removeFeature(item)
        }
      })
      this.groupPointer = []
    }
  }

  /** 地图点击的事件 */
  mapClick = evt => {
    /** 地图点击的对象 */
    const obj = this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
      return { feature, layer }
    })
    if (!obj) return
    if (!obj.layer) return
    if (!obj.feature) return
    if (obj.layer.get('id') === this.layerId) {
      /** 自定义的id字段，只有这个字段才可以进行交互 */
      const did = obj.feature.get(this.featureDid)
      if (did && did === this.featureDid) {
        this.setMediaOrFeatureCollectActiveStyle(obj.feature.getId(), true)
        DEvent.Evt.firEvent(CLICKVIEWFEATURE, {
          ...obj.feature.get('featureData'),
          _from: 'layer'
        })
      }
      if (did && did === this.groupPointerDid) {
        DEvent.Evt.firEvent(CLICKVIEWGROUPFEATURE, {
          ...obj.feature.get('featureData'),
          _from: 'layer'
        })
      }
    }
  }

  /** 渲染分组的坐标
   * @param {{longitude: ?string, latitude: ?string}[]} data 数组类型的分组列表，包含经纬度
   */
  renderGroupCoordinates = data => {
    this.clearGroupPointer()
    if (data.length) {
      data = data.filter(
        item =>
          item.hasOwnProperty('longitude') && item.hasOwnProperty('latitude')
      )
      let fs = []
      // this.map.on('click', this.mapClick)
      data.forEach(item => {
        const coordinate = TransformCoordinate([
          +item.longitude,
          +item.latitude
        ])
        const feature = addFeature('Point', {
          coordinates: coordinate,
          featureData: item
        })
        const style = createStyle('Point', {
          radius: 8,
          fillColor: '#577DFF',
          strokeColor: '#ffffff',
          strokeWidth: 2,
          showName: true,
          text: item.name,
          textFillColor: '#FF4628',
          textStrokeColor: '#ffffff',
          textStrokeWidth: 1,
          font: 14
        })
        feature.setStyle(style)
        feature.set(this.featureDid, this.groupPointerDid)
        fs.push(feature)
        this.groupPointer.push(feature)
      })
      if (fs.length) {
        this.Source.addFeatures(fs)
        Fit(this.view, this.Source.getExtent(), {
          size: this.map.getSize(),
          padding: fitPadding
        })
      }
    }
  }

  /** 删除所有合集 */
  clearCollections = () => {
    this.clearGroupPointer()
    this.clearFeatureCollection()
    this.clearMediaCollection()
    this.map.render()
  }

  /** 删除数据
   * @param {[]} arrays 需要删除的合集
   */
  clearTypeCollection = arrays => {
    if (arrays.length) {
      arrays.forEach(item => {
        if (this.Source.getFeatureByUid(item.ol_uid)) {
          this.Source.removeFeature(item)
        }
      })
    }
    arrays = []
  }

  /** 删除feature类型的渲染坐标 */
  clearFeatureCollection = () => {
    this.clearTypeCollection(this.featuresCollections)
  }

  /** 删除媒体类型的数据合集 */
  clearMediaCollection = () => {
    this.clearTypeCollection(this.mediaCollections)
  }

  /**
   * 创建一个特征元素
   * @param {'Point'| 'Polygon' | 'LineString'} type 元素类型
   * @param {*} style 需要添加的样式
   * @param {{coordinates: number[]}} data 数据
   */
  CreateFeature = (type, style = {}, content = {}, data) => {
    /** 公共的属性 */
    const defaultOptionStyle = {
      // textFillColor: "rgba(255,0,0,1)",
      textFillColor: '#ff0000',
      textStrokeColor: '#fff',
      textStrokeWidth: 3,
      font: '13px sans-serif',
      placement: 'point',
      iconScale: 0.6,
      pointColor: '#fff',
      showName: true
    }
    let feature = null
    switch (type) {
      case 'Point':
        /** 点的样式 */
        const PointStyle = createStyle(type, {
          ...defaultOptionStyle,
          text: content.name,
          icon: content.icon,
          ...style,
          iconScale: 0.8
        })
        /** 点的元素 */
        const PointFeature = addFeature(type, {
          coordinates: content.coordinates
        })
        /** 设置样式 */
        PointFeature.setStyle(PointStyle)
        PointFeature.set([this.featureDid], this.featureDid)
        PointFeature.set('featureData', data)
        feature = PointFeature
        break
      case 'LineString':
        /** 线的样式 */
        const LineStringStyle = createStyle(type, {
          ...defaultOptionStyle,
          text: content.name,
          strokeWidth: 4,
          strokeColor: content.featureType,
          ...style
        })
        /** 线的元素 */
        const LineStringFeature = addFeature(type, {
          coordinates: content.coordinates
        })
        LineStringFeature.setStyle(LineStringStyle)
        LineStringFeature.set([this.featureDid], this.featureDid)
        LineStringFeature.set('featureData', data)
        feature = LineStringFeature
        break
      case 'Polygon':
        /** 面的样式 */
        const PolygonStyle = createStyle(type, {
          ...defaultOptionStyle,
          strokeWidth: 2,
          strokeColor: content.strokeColor,
          fillColor: content.featureType,
          text: content.name,
          ...style
        })
        /** 面的元素 */
        const PolygonFeature = addFeature(type, {
          coordinates: content.coordinates
        })
        PolygonFeature.setStyle(PolygonStyle)
        PolygonFeature.set([this.featureDid], this.featureDid)
        PolygonFeature.set('featureData', data)
        feature = PolygonFeature
        break
      default:
        feature = null
        break
    }
    return feature
  }

  /** 渲染feature类型的数据
   * @param {[]} features 数据集合
   */
  renderFeatureTypeCollection = features => {
    this.clearFeatureCollection()
    if (!features.length) return
    features.forEach(item => {
      if (item.content) {
        /** feature类型都包含了content的数据，是所有数据，包括了坐标和图标 */
        const content = JSON.parse(item.content)
        const { geoType, featureType } = content
        if (featureType.indexOf('&#') > -1) {
          content.icon = null
        } else {
          content.icon = { src: featureType }
        }
        /** 得到的特征元素 */
        const feature = this.CreateFeature(geoType, {}, content, item)
        if (feature) {
          this.featuresCollections.push(feature)
          feature.setId(item.id)
          this.Source.addFeature(feature)
        }
      }
    })
  }

  /** 渲染媒体数据类型坐标点
   * @param {{}[]} medias 媒体数据类型列表
   */
  renderMediaTypeCollection = (medias = []) => {
    this.clearMediaCollection()
    if (medias.length) {
      medias.forEach(item => {
        if (item.location) {
          /** 数据坐标 */
          const coordinate = [+item.location.longitude, +item.location.latitude]
          /** 转换坐标 */
          const pointCoordinate = TransformCoordinate(
            coordinate,
            EPSG.E4326,
            EPSG.E3857
          )
          const feature = this.CreateFeature(
            'Point',
            {
              icon: { src: unselect }
            },
            { coordinates: pointCoordinate, name: item.title },
            item
          )
          if (feature) {
            this.mediaCollections.push(feature)
            feature.setId(item.id)
            this.Source.addFeature(feature)
          }
        }
      })
    }
  }

  /** 重置已选中的坐标点样式 */
  ReSetPrevPointerStyle = () => {
    if (this.prevPointer) {
      const prevStyle = this.prevPointer.getStyle()

      if (this.prevPointer.get('oldImg')) {
        prevStyle.setImage(this.prevPointer.get('oldImg'))
      } else prevStyle.setImage(this.unSelectPointerStyle.getImage())

      this.prevPointer.setStyle(prevStyle)
      this.prevPointer = null
    }
  }

  /** 设置点的样式选中
   * @param {string} id 选中采集数据的id
   */
  setMediaOrFeatureCollectActiveStyle = (id, center) => {
    /** 根据id获取到的元素 */
    const feature = this.Source.getFeatureById(id)
    /** 元素特征 */
    const geo = feature?.getGeometry()

    this.ReSetPrevPointerStyle()

    if (!feature) return

    center && Center(feature)
    if (geo.getType() === 'Point') {
      const style = feature.getStyle()
      const oldImg = style.getImage()
      style.setImage(this.selectPointerStyle.getImage())
      feature.setStyle(style)
      feature.set('oldImg', oldImg)
      this.prevPointer = feature
    }
  }

  /** 渲染分组中的数据
   * @param {[]} collection 标绘数据，含有坐标的图片，视频数据
   */
  renderGroupCollections = (collection = []) => {
    /** feature类型的数据集 */
    const features = collection.filter(
      item => item.collect_type === CollectionTypes.FEATURE
    )
    /** 媒体类型的数据集 */
    const medias = collection.filter(
      item =>
        item.collect_type === CollectionTypes.MEDIA360 ||
        item.collect_type === CollectionTypes.UPLOADFILE
    )
    /** 渲染元素 */
    this.renderFeatureTypeCollection(features)
    this.renderMediaTypeCollection(medias)

    setTimeout(() => {
      /** 范围 */
      const extents = this.Source.getExtent()
      /** 判断不为空才缩放 */
      if (!isEmpty(extents))
        this.view.fit(this.Source.getExtent(), {
          padding: fitPadding,
          duration: 500
        })
    }, 50)
  }
}
/** 实例化图层 */
const viewfeature = new ViewFeatures()

export default viewfeature
