import React from "react";
import styles from "./Panel.less";
import areaSearchAction from "@/lib/components/Search/AreaSearch";
import Event from "../../lib/utils/event";

import { Select, Button } from "antd";

const { Option } = Select;
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

      locationName: "",
    };
  }
  componentDidMount() {
    areaSearchAction.getProvince().then((res) => {
      if (res.code === "0") {
        this.setState({
          provinceOptions: res.data,
        });
      }
    });
  }

  updatePublicData = (name, code) => {
    window.queryStr = `${name}='${code}'`
    Event.Evt.firEvent("updatePublicData", window.queryStr);
  };
  // 省份选择
  handleProvinceSelectChange = (val) => {
    this.setState(
      {
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
      () => {
        const name = this.state.provinceOptions.filter((item) => {
          return item.code === val;
        })[0].name;
        this.props.updateLocationName(name);
        this.updatePublicData("provinceCode", val);
        const { provinceCode } = this.state;
        areaSearchAction.getCity(provinceCode).then((res) => {
          if (res.code === "0") {
            this.setState({
              cityOptions: res.data,
            });
          }
        });
      }
    );
  };

  // 地市选择
  handleCitySelectChange = (val) => {
    this.setState(
      {
        cityCode: val,
        districtCode: null,
        townCode: null,
        villageCode: null,
        districtDisabled: false,
        townDisabled: true,
        villageDisabled: true,
      },
      () => {
        const name = this.state.cityOptions.filter((item) => {
          return item.code === val;
        })[0].name;
        this.props.updateLocationName(name);
        this.updatePublicData("cityCode", val);
        const { cityCode } = this.state;
        areaSearchAction.getDistrict(cityCode).then((res) => {
          if (res.code === "0") {
            this.updatePublicData(res);
            this.setState({
              districtOptions: res.data,
            });
          }
        });
      }
    );
  };
  // 区县选择
  handleDistrictSelectChange = (val) => {
    this.setState(
      {
        districtCode: val,
        townCode: null,
        villageCode: null,
        townDisabled: false,
        villageDisabled: true,
      },
      () => {
        const name = this.state.districtOptions.filter((item) => {
          return item.code === val;
        })[0].name;
        this.updatePublicData("districtCode", val);
        this.props.updateLocationName(name);
        const { districtCode } = this.state;
        areaSearchAction.getTown(districtCode).then((res) => {
          if (res.code === "0") {
            this.updatePublicData(res);
            this.setState({
              townOptions: res.data,
            });
          }
        });
      }
    );
  };

  // 乡镇选择
  handleTownSelectChange = (val) => {
    this.setState(
      {
        townCode: val,
        villageCode: null,
        villageDisabled: false,
      },
      () => {
        const name = this.state.townOptions.filter((item) => {
          return item.code === val;
        })[0].name;
        this.props.updateLocationName(name);
        const { townCode } = this.state;
        areaSearchAction.getVillige(townCode).then((res) => {
          if (res.code === "0") {
            this.updatePublicData(res);
            this.setState({
              villageOptions: res.data,
            });
          }
        });
      }
    );
  };

  // 村、社区选择
  handleVillageSelectChange = (val) => {
    this.setState({
      villageCode: val,
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
    } = this.state;
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
    } = this.state;
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
