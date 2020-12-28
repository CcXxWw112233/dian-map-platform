import { addFeature, createStyle } from "../../utils/index";
/**
 * 交通轨迹动画
 *
 * from 出发点，只允许一个点 [经纬度]
 * to 数组， 需要到达的点 [{coordinates: Array<Lng, Lat>, point: [Lng, lat]}]
 */
class LineOfAnimate {
  config = {
    from: [],
    to: [],
    moveIcon: "", // 播放的点图片，可以是点，可以是车
    playNumber: Infinity, // 循环播放次数，默认无限循环
    context: null, // 渲染的画布，如果没有画布，则只返回动画元素, 画布是openlayers的source
  };
  constructor(...args) {
    this.config = {
      ...this.config,
      ...args,
    };
  }

  /**
   * 渲染画布中的线条，规划的路线
   */
  renderPlanLine = () => {
    let arr = [];
    (this.to || []).forEach((item) => {
      let coordinate = item.coordinates;
      let endCoor = item.point;
      let feature = addFeature("LineString", { data: coordinate });
      let style = createStyle("LineString", {
        color: "red",
        strokeWidth: 6,
      });
      feature.setStyle(style);
      arr.push(arr);
    });
    this.context && this.context.addFeatures(arr);
  };
}

export default LineOfAnimate;
