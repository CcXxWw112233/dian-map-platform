//计算两点之间的距离
const calculationDistance = (point1, point2) => {
  let x1 = point1[0];
  let y1 = point1[1];
  let x2 = point2[0];
  let y2 = point2[1];
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};
//计算点pX到点pA和pB所确定的直线的距离
const distToSegment = (start, end, center) => {
  let a = Math.abs(calculationDistance(start, end));
  let b = Math.abs(calculationDistance(start, center));
  let c = Math.abs(calculationDistance(end, center));
  let p = (a + b + c) / 2.0;
  let s = Math.sqrt(Math.abs(p * (p - a) * (p - b) * (p - c)));
  return (s * 2.0) / a;
};
//递归方式压缩轨迹
const compressLine = (coordinate, result, start, end, dMax) => {
  if (start < end) {
    let maxDist = 0;
    let currentIndex = 0;
    let startPoint = coordinate[start];
    let endPoint = coordinate[end];
    for (let i = start + 1; i < end; i++) {
      let currentDist = distToSegment(startPoint, endPoint, coordinate[i]);
      if (currentDist > maxDist) {
        maxDist = currentDist;
        currentIndex = i;
      }
    }
    if (maxDist >= dMax) {
      //将当前点加入到过滤数组中
      result.push(coordinate[currentIndex]);
      //将原来的线段以当前点为中心拆成两段，分别进行递归处理
      compressLine(coordinate, result, start, currentIndex, dMax);
      compressLine(coordinate, result, currentIndex, end, dMax);
    }
  }
  return result;
};

/**
 *
 *@param coordinate 原始轨迹Array<{latitude,longitude}>
 *@param dMax 允许最大距离误差
 *@return douglasResult 抽稀后的轨迹
 *
 */
const douglasPeucker = (coordinate, dMax = 10) => {
  if (!coordinate || !(coordinate.length > 2)) {
    return null;
  }
  coordinate.forEach((item, index) => {
    item.id = index;
  });
  let result = compressLine(coordinate, [], 0, coordinate.length - 1, dMax);
  result.push(coordinate[0]);
  result.push(coordinate[coordinate.length - 1]);
  let resultLatLng = result.sort((a, b) => {
    if (a.id < b.id) {
      return -1;
    } else if (a.id > b.id) return 1;
    return 0;
  });
  // resultLatLng.forEach((item) => {
  //   item.id = undefined;
  // });
  return resultLatLng;
};

export default douglasPeucker;
