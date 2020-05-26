import React from "react";
import { Button, Tooltip } from "antd";
import style from "./Location.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";

import { getMyPosition } from "utils/getMyPosition";

const Location = () => {
  // 通过高德地图获得自己的定位
  const getMyCenter = (flag) => {
    // 获取定位
    getMyPosition.getPosition().then((val) => {
      // let coor = [114.11533,23.66666]
      // 转换地理坐标EPSG:4326 到 EPSG:3857
      let coordinate = getMyPosition.transformPosition(val);
      // 将视图平移到坐标中心点
      getMyPosition.setViewCenter(coordinate, 200);
    });
  };
  return (
    <Tooltip title="定位" className={style.wrapper}>
      <Button shape="circle" >
        <i className={globalStyle.global_icon}>&#xe755;</i>
      </Button>
    </Tooltip>
  );
};

// Location.PropTypes = {
//   options: PropTypes.object
// }

export default Location;
