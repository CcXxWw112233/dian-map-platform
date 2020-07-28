import React from "react";
import styles from "./Panel.less";
import areaSearchAction from "@/lib/components/Search/AreaSearch";
import { setSession, getSession } from "utils/sessionManage";

import { Select, Button } from "antd";
import { connect } from "dva";

const { Option } = Select;

@connect(
  ({
    areaSearch: {
      provinceOptions,
      cityOptions,
      districtOptions,
      townOptions,
      villageOptions,
      provinceCode,
      cityCode,
      districtCode,
      townCode,
      villageCode,
      cityDisabled,
      districtDisabled,
      townDisabled,
      villageDisabled,
      okDisabled,
    },
  }) => ({
    provinceOptions,
    cityOptions,
    districtOptions,
    townOptions,
    villageOptions,
    provinceCode,
    cityCode,
    districtCode,
    townCode,
    villageCode,
    cityDisabled,
    districtDisabled,
    townDisabled,
    villageDisabled,
    okDisabled,
  })
)
export default class AreaPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // 下拉框状态
      provinceOptions: [],
      cityOptions: [],
      districtOptions: [],
      townOptions: [],
      villageOptions: [],
      // 选中的区划代码
      provinceCode: null,
      cityCode: null,
      districtCode: null,
      townCode: null,
      villageCode: null,
      // 下拉框禁用状态
      cityDisabled: true,
      districtDisabled: true,
      townDisabled: true,
      villageDisabled: true,
      okDisabled: true,
    };
  }
  componentDidMount() {
    areaSearchAction.getProvince().then((res) => {
      if (res.code === "0") {
        const { dispatch } = this.props;
        dispatch({
          type: "areaSearch/update",
          payload: {
            provinceOptions: res.data,
          },
        });
        // getSession("province").then((res) => {
        //   if (res.code === 0) {
        //     if (res.data) {
        //       const arr = res.data?.split("|");
        //       if (arr) {
        //         this.handleProvinceSelectChange(arr[0], 1);
        //         getSession("city").then((res) => {
        //           if (res.code === 0) {
        //             if (res.data) {
        //               const arr = res.data?.split("|");
        //               if (arr) {
        //                 this.handleCitySelectChange(arr[0], 1);
        //                 getSession("district").then((res) => {
        //                   if (res.code === 0) {
        //                     if (res.data) {
        //                       const arr = res.data?.split("|");
        //                       if (arr) {
        //                         this.handleTownSelectChange(arr[0], 1);
        //                       }
        //                     }
        //                   }
        //                 });
        //               }
        //             }
        //           }
        //         });
        //       }
        //     }
        //   }
        // });
      }
    });
  }

  updateSession = (type, code, name) => {
    if (type === "province") {
      setSession("city", "");
      setSession("district", "");
    } else if (type === "city") {
      setSession("district", "");
    }
    setSession(type, `${code}|${name}`);
  };

  updatePublicData = (type, code, name) => {
    const queryStr = `${type}='${code}'`;
    const { changeQueryStr } = this.props;
    setSession("xzqhCode", `${type}|${code}|${name}`);
    changeQueryStr && changeQueryStr(queryStr);
  };

  // 省份选择
  handleProvinceSelectChange = async (val, flag) => {
    const { dispatch, provinceOptions } = this.props;
    const name = provinceOptions?.filter((item) => {
      return item.code === val;
    })[0]?.name;
    this.props.updateLocationName(name);
    this.updatePublicData("provincecode", val, name);
    if (!flag) {
      this.updateSession("province", val, name);
    }
    dispatch({
      type: "areaSearch/update",
      payload: {
        provinceCode: val,
        cityCode: null,
        districtCode: null,
        townCode: null,
        villageCode: null,
        cityDisabled: false,
        districtDisabled: true,
        townDisabled: true,
        villageDisabled: true,
        okDisabled: false,
      },
    });
    const res = await areaSearchAction.getCity(val);
    if (res.code === "0") {
      dispatch({
        type: "areaSearch/update",
        payload: {
          cityOptions: res.data,
        },
      });
    }
  };

  // 地市选择
  handleCitySelectChange = async (val, flag) => {
    const { dispatch, cityOptions } = this.props;
    const name = cityOptions?.filter((item) => {
      return item.code === val;
    })[0]?.name;
    this.props.updateLocationName(name);
    this.updatePublicData("citycode", val, name);
    if (!flag) {
      this.updateSession("city", val, name);
    }
    dispatch({
      type: "areaSearch/update",
      payload: {
        cityCode: val,
        districtCode: null,
        townCode: null,
        villageCode: null,
        districtDisabled: false,
        townDisabled: true,
        villageDisabled: true,
      },
    });
    const res = await areaSearchAction.getDistrict(val);
    if (res.code === "0") {
      dispatch({
        type: "areaSearch/update",
        payload: {
          districtOptions: res.data,
        },
      });
    }
  };
  // 区县选择
  handleDistrictSelectChange = async (val, flag) => {
    const { dispatch, districtOptions } = this.props;
    const name = districtOptions?.filter((item) => {
      return item.code === val;
    })[0]?.name;
    this.props.updateLocationName(name);
    this.updatePublicData("districtcode", val, name);
    if (!flag) {
      this.updateSession("district", val, name);
    }
    dispatch({
      type: "areaSearch/update",
      payload: {
        districtCode: val,
        townCode: null,
        villageCode: null,
        townDisabled: false,
        villageDisabled: true,
      },
    });
    const res = await areaSearchAction.getTown(val);
    if (res.code === "0") {
      dispatch({
        type: "areaSearch/update",
        payload: {
          townOptions: res.data,
        },
      });
    }
  };

  // 乡镇选择
  handleTownSelectChange = async (val) => {
    const { dispatch, townOptions } = this.props;
    const name = townOptions?.filter((item) => {
      return item.code === val;
    })[0]?.name;
    this.props.updateLocationName(name);
    dispatch({
      type: "areaSearch/update",
      payload: {
        townCode: val,
        villageCode: null,
        villageDisabled: false,
      },
    });
    const res = await areaSearchAction.getVillige(val);
    if (res.code === "0") {
      // this.updatePublicData(res);
      dispatch({
        type: "areaSearch/update",
        payload: {
          villageOptions: res.data,
        },
      });
    }
  };

  // 村、社区选择
  handleVillageSelectChange = (val) => {
    const { dispatch } = this.props;
    dispatch({
      type: "areaSearch/update",
      payload: {
        villageCode: val,
      },
    });
  };

  getGeomByCode = (code, needChange) => {
    areaSearchAction.getGeom(code, needChange).then((res) => {
      if (res.code === "0") {
        if (res.data) {
          if (!Array.isArray(res.data)) {
            if (res.data.geom) {
              areaSearchAction.addAreaGeomToMap(res.data.geom);
            }
          } else {
            res.data.forEach((item) => {
              areaSearchAction.addAreaGeomToMap(item.geom);
            });
          }
        }
      }
    });
  };

  handleOkClick = () => {
    const {
      provinceCode,
      cityCode,
      districtCode,
      townCode,
      villageCode,
      provinceOptions,
      cityOptions,
      districtOptions,
      townOptions,
      villageOptions,
    } = this.props;
    let currentCode = 0;
    let currentLocation = "";
    let currentOptions = null;
    let needChange = false;
    // 如果省份code空
    if (villageCode) {
      needChange = true;
      currentCode = villageCode;
      currentOptions = villageOptions;
    } else if (townCode) {
      needChange = true;
      currentCode = townCode;
      currentOptions = townOptions;
    } else if (districtCode) {
      currentCode = districtCode;
      currentOptions = districtOptions;
    } else if (cityCode) {
      currentCode = cityCode;
      currentOptions = cityOptions;
    } else if (provinceCode) {
      currentCode = provinceCode;
      currentOptions = provinceOptions;
    }
    currentLocation = currentOptions.filter((option) => {
      return option.code === currentCode;
    })[0].name;
    this.props.updateLocationName(currentLocation);
    this.getGeomByCode(currentCode, needChange);
    window.areaCode = currentCode;
  };

  render() {
    const {
      provinceOptions,
      cityOptions,
      districtOptions,
      townOptions,
      villageOptions,
      provinceCode,
      cityCode,
      districtCode,
      townCode,
      villageCode,
      cityDisabled,
      districtDisabled,
      townDisabled,
      villageDisabled,
      okDisabled,
    } = this.props;
    return (
      <div className={styles.locatePanel} style={{ padding: 10 }}>
        <div className={styles.locatePanelBody}>
          <Select
            className={styles.select}
            key="province"
            value={provinceCode || undefined}
            placeholder="请选择省(市）"
            onChange={(e) => this.handleProvinceSelectChange(e)}
          >
            {provinceOptions.map((option, index) => {
              return (
                <Option key={index} value={option.code}>
                  {option.name}
                </Option>
              );
            })}
          </Select>
          <Select
            className={styles.select}
            key="city"
            value={cityCode || undefined}
            placeholder="请选择市(区）"
            disabled={cityDisabled}
            onChange={(e) => this.handleCitySelectChange(e)}
          >
            {cityOptions.map((option, index) => {
              return (
                <Option key={index} value={option.code}>
                  {option.name}
                </Option>
              );
            })}
          </Select>
          <Select
            className={styles.select}
            key="district"
            value={districtCode || undefined}
            placeholder="请选择县(区）"
            disabled={districtDisabled}
            onChange={(e) => this.handleDistrictSelectChange(e)}
          >
            {districtOptions.map((option, index) => {
              return (
                <Option key={index} value={option.code}>
                  {option.name}
                </Option>
              );
            })}
          </Select>
          <Select
            className={styles.select}
            key="town"
            value={townCode || undefined}
            placeholder="请选择乡(镇、街道）"
            disabled={townDisabled}
            onChange={(e) => this.handleTownSelectChange(e)}
          >
            {townOptions.map((option, index) => {
              return (
                <Option key={index} value={option.code}>
                  {option.name}
                </Option>
              );
            })}
          </Select>
          <Select
            className={styles.select}
            key="village"
            value={villageCode || undefined}
            placeholder="请选择村"
            disabled={villageDisabled}
            onChange={(e) => this.handleVillageSelectChange(e)}
          >
            {villageOptions.map((option, index) => {
              return (
                <Option key={index} value={option.code}>
                  {option.name}
                </Option>
              );
            })}
          </Select>
        </div>
        <div className={styles.locatePanelFooter}>
          <Button
            type="primary"
            disabled={okDisabled}
            onClick={this.handleOkClick}
          >
            确定
          </Button>
        </div>
      </div>
    );
  }
}
