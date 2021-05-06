import {
  addFeature,
  createStyle,
  Fit,
  fitPadding,
  Layer,
  Source,
  TransformCoordinate
} from '../../utils/index'
import InitMap from '../../../utils/INITMAP'
import DEvent, { INITMAPEND } from '../../utils/event'

/** 查看的图层渲染 */
class ViewFeatures {
  constructor() {
    this.layerId = 'viewFeaturesLayer'
    /** Source数据源 */
    this.Source = Source()
    /** 图层 */
    this.Layer = Layer({ id: this.layerId , zIndex: 14 })
    /** 底图实例 */
    this.map = null
    /** 视图实例 */
    this.view = null
    /** 自定义的数据id类型 */
    this.featureDid = 'view_d_id'
    /** 分组的坐标点 */
    this.groupPointer = []
    /** 构建视图 */
    DEvent.Evt.addEventListener(INITMAPEND, this.init)
  }
  /** 初始化图层 */
  init = (v) => {
    console.log(v)
    this.Layer.setSource(this.Source)
    InitMap.map.addLayer(this.Layer)
    this.view = InitMap.map?.getView()
    this.map = InitMap.map
  }

  /** 地图点击的事件 */
  mapClick = () => {}

  /** 渲染分组的坐标
   * @param {{longitude: ?string, latitude: ?string}[]} data 数组类型的分组列表，包含经纬度
   */
  renderGroupCoordinates = data => {
    if (data.length) {
      data = data.filter(
        item =>
          item.hasOwnProperty('longitude') && item.hasOwnProperty('latitude')
      )
      let fs = []
      // this.map.on('click', this.mapClick)
      data.forEach(item => {
        let coordinate = TransformCoordinate([+item.longitude, +item.latitude])
        let feature = addFeature('Point', {
          coordinates: coordinate,
          p_id: item.id,
          p_type: 'group'
        })
        let style = createStyle('Point', {
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

  /** 渲染分组中的数据 */
  renderGroupCollections = () => {}
}
/** 实例化图层 */
const viewfeature = new ViewFeatures()

export default viewfeature
