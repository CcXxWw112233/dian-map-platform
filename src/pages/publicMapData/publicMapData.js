import React from "react";
import styles from "./publicMapData.less";
import DataItem from "./DataItem";
import PublicDataActions from "../../lib/components/PublicData";
import globalStyle from "../../globalSet/styles/globalStyles.less";
import publicData from "../../lib/components/PublicData";
import lengedListConf from "components/LengedList/config";
import { connect } from "dva";
const MenuData = require("./public_data").default;

@connect(({ lengedList: { config } }) => ({ config }))
export default class PublicData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.checkedParam = {};
    this.AllCheckData = MenuData.data;
    this.populationSelect = {};
  }
  componentDidMount() {
    // console.log(m)
    PublicDataActions.init();
  }
  // 获取多出来的那些 arr1 是原数据，arr2 是对比数据，新的数据是从arr2中获取
  getItems = (arr1, arr2) => {
    let arraynew = [];
    arr1 = new Set(arr1);
    arr2.forEach((arr) => {
      if (!arr1.has(arr)) {
        arraynew.push(arr);
      }
    });
    return arraynew.length > 0 ? arraynew : arr2;
  };
  getItems2 = (arr1, arr2) => {
    return arr1.concat(arr2).filter(function (v, i, arr) {
      return arr.indexOf(v) === arr.lastIndexOf(v);
    });
  };
  // 选项更新，获取更新的那些数据
  changeData = (oldVal = [], newVal = [], fillColor) => {
    // 新增了选项需要显示
    if (newVal.length > oldVal.length || newVal.length === oldVal.length) {
      let arr = this.getItems(oldVal, newVal);
      // 新增了哪些图层key
      let keys = this.getCheckBoxForDatas(arr);
      keys.forEach((item) => {
        let data = { ...item };
        if (newVal.length === oldVal.length) {
          data.key = 1;
          if (keys.length) {
            // 删除勾选的选项-这里只需要传key，剔除其他属性
            let a = keys.map((item) => item.typeName + (item.cql_filter || ""));
            PublicDataActions.removeFeatures(a);
          }
        }
        PublicDataActions.getPublicData({
          url: "",
          data: data,
          fillColor: fillColor,
        });
      });
    } else if (newVal.length < oldVal.length) {
      // 删除了需要显示的内容
      let arr = this.getItems(newVal, oldVal);
      // 删除了哪些图层key
      let keys = this.getCheckBoxForDatas(arr);
      // console.log(keys, '删除了这些图层');
      if (keys.length) {
        // 删除勾选的选项-这里只需要传key，剔除其他属性
        let a = keys.map((item) => item.typeName + (item.cql_filter || ""));
        PublicDataActions.removeFeatures(a);
      }
    }
  };
  // 查找勾选和取消勾选对应的渲染key
  getCheckBoxForDatas = (val) => {
    if (val.length) {
      let allChild = [],
        AllLoadFeatureKeys = [];
      // 取出所有的child
      this.AllCheckData.forEach((item) => {
        let child = item.child;
        allChild = allChild.concat(child);
      });
      // 根据传过来的数据，进行整合，获取到数据中保存的wfs数据接口对应的key
      val.forEach((item) => {
        let obj = allChild.find((chil) => chil.key === item);
        if (obj && obj.loadFeatureKeys) {
          AllLoadFeatureKeys = AllLoadFeatureKeys.concat(obj.loadFeatureKeys);
        }
      });
      return AllLoadFeatureKeys;
    }
  };
  // 勾选了复选框
  toggleViewPulicData = (val, from, fillColor) => {
    const { dispatch } = this.props;
    // let old = val.length ? this.checkedParam[from] : [];
    let old = this.checkedParam[from];
    // 根据切换的checkbox，进行增删操作
    this.changeData(old, val, fillColor);
    // 更新保存的列表
    // debugger;
    this.checkedParam[from] = val;
    console.log(this.checkedParam);
    let currentLegedList = [];
    const paramKeys = Object.keys(this.checkedParam);
    for (let i = 0; i < lengedListConf.length; i++) {
      for (let j = 0; j < paramKeys.length; j++) {
        const param = this.checkedParam[paramKeys[j]];
        for (let k = 0; k < param.length; k++) {
          const lenged = lengedListConf[i];
          if (lenged && lenged.key && lenged.key.indexOf(param[k]) > -1) {
            currentLegedList.push(lengedListConf[i]);
          }
        }
      }
    }
    dispatch({
      type: "lengedList/updateLengedList",
      payload: {
        config: currentLegedList,
      },
    });

    // PublicDataActions.getPublicData()
  };
  render() {
    return (
      <div className={styles.publicBox + ` ${globalStyle.autoScrollY}`}>
        {this.AllCheckData.map((item, index) => {
          return (
            <DataItem
              data={item}
              key={item.key}
              onChange={this.toggleViewPulicData}
            />
          );
        })}
      </div>
    );
  }
}
