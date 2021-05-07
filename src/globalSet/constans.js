/** 未分组的key */
export const OTHERGROUPKEY = 'other'

/** 采集数据的类型合集 */
export const CollectionTypes = {

  /** feature 标绘类型
   * @default string '4'
  */
  FEATURE: '4',

  /** 上传的采集数据
   * @default string '3'
  */
  UPLOADFILE: '3',

  /** 360 全景类型
   * @default string '10'
  */
  MEDIA360: '10',

  /** 规划图类型
   * @default string '5'
  */
  PLANPIC: '5',

  /** geoJSON类型
   * @default string '8'
  */
  GEOJSON: '8',

  /** 组合类型
   * @default string 'group'
  */
  GROUP: 'group'
}
/** 转换地址编码的特定字符串
 * 4326 - 3857 是把高德的gps坐标转换成openlayers可用的坐标
 * 3857 - 4326 是把openlayers中的坐标转换成高德的gps定位坐标
*/
export const EPSG = {
  /** 地理坐标系统 */
  E4326: 'EPSG:4326',
  /** 球体墨卡托 */
  E3857: 'EPSG:3857'
}

/** 地图的基础设置 */
export const MAPCONFIG = {
  /** 最大放大比例 */
  maxZoom: 18,
  /** 最小缩放比例 */
  minZoom: 5,
  /** 当前缩放比 */
  zoom: 10
}
