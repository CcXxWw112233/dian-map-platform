import { getMyPosition } from "utils/getMyPosition";

export const getMyCenter = () => {
  // 获取定位
  getMyPosition.getPosition().then((val) => {
    // let coor = [114.11533,23.66666]
    // 转换地理坐标EPSG:4326 到 EPSG:3857
    let obj = { ...val, ...val.position };
    // let coordinate = getMyPosition.transformPosition(obj);
    // 将视图平移到坐标中心点
    if (getMyPosition.positionCircle || getMyPosition.positionIcon) {
      getMyPosition.setPosition([+obj.lng, +obj.lat]);
    } else getMyPosition.drawPosition({ ...obj, isMove: true });
    // getMyPosition.setViewCenter(coordinate, 200);
  });
};