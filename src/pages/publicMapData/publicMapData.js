import React from "react";
import styles from "./publicMapData.less";
import DataItem from "./DataItem";
import PublicDataActions from "../../lib/components/PublicData";
import globalStyle from "../../globalSet/styles/globalStyles.less";
import Event from "../../lib/utils/event";
import publicDataConf from "./public_data";
// import publicData from "../../lib/components/PublicData";
import lengedListConf from "components/LengedList/config";
import { connect } from "dva";
const MenuData = require("./public_data").default;

@connect(({ lengedList: { config }, publicMapData: dataItemStateList }) => ({
  config,
  dataItemStateList,
}))
export default class PublicData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.checkedParam = {};
    this.AllCheckData = MenuData.data;
    this.populationSelect = {};
    // this.queryStr = "districtcode='440117'"
    this.queryStr = "";
    this.fillColor = null;
  }
  componentDidMount() {
    // console.log(m)
    PublicDataActions.init();
    // this.getAllData();
    const { getQueryStr, onRef } = this.props;
    onRef && onRef(this);
    if (getQueryStr) {
      this.queryStr = getQueryStr();
    }
  }
  getAllData = (queryStr) => {
    this.queryStr = queryStr;
    const { dataItemStateList: publicMapData } = this.props;
    const list = [...publicMapData.dataItemStateList] || [];
    const dataConf = [...publicDataConf.data] || [];
    PublicDataActions.clear();
    for (let i = 0; i < list.length; i++) {
      let checkedList = list[i].checkedList;
      checkedList.forEach((checked) => {
        dataConf.forEach((data) => {
          for (let j = 0; j < data.child.length; j++) {
            if (data.child[j].key === checked) {
              let loadFeatureKeys = data.child[j].loadFeatureKeys;
              loadFeatureKeys.forEach((key) => {
                if (key.cql_filter) {
                  const index = key.cql_filter.indexOf(" AND");
                  if (index > -1) {
                    key.cql_filter =
                      this.queryStr +
                      key.cql_filter.substring(index, key.cql_filter.length);
                  } else {
                    key.cql_filter = this.queryStr;
                  }
                }
                PublicDataActions.getPublicData({
                  url: "",
                  data: key,
                  fillColor: this.fillColor,
                });
              });
            }
          }
        });
      });
    }
  };
  // 获取多出来的那些 arr1 是原数据，arr2 是对比数据，新的数据是从arr2中获取
  getItems = (arr1, arr2) => {
    let arraynew = [];
    arr1 = Array.from(new Set(arr1));
    arr2.forEach((item0) => {
      const item = arr1.filter((item1) => {
        return item1 === item0;
      })?.[0];
      if (!item) {
        arraynew.push(item0);
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
    this.fillColor = fillColor;
    // 新增了选项需要显示
    if (newVal.length > oldVal.length || newVal.length === oldVal.length) {
      let arr = this.getItems(oldVal, newVal);
      // 新增了哪些图层key
      let keys = this.getCheckBoxForDatas(arr);
      keys &&
        keys.forEach((item) => {
          let data = { ...item };
          if (newVal.length === oldVal.length) {
            data.key = 1;
            if (keys.length) {
              // 删除勾选的选项-这里只需要传key，剔除其他属性
              let a = keys.map(
                (item) => item.typeName + (item.cql_filter || "")
              );
              PublicDataActions.removeFeatures(a);
            }
          }
          if (data.cql_filter) {
            const index = data.cql_filter.indexOf(" AND");
            if (index > -1) {
              data.cql_filter =
                this.queryStr +
                data.cql_filter.substring(index, data.cql_filter.length);
            } else {
              data.cql_filter = this.queryStr;
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
        a.forEach((item) => {
          if (item.indexOf("lingxi:dichan_loupan_point") > -1) {
            PublicDataActions.removeLpInfo();
            Event.Evt.firEvent("removeHousePOI");
            window.housePoi = "";
          }
        });
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
        for (let i = 0; i < child.length; i++) {
          let loadFeatureKeys = child[i].loadFeatureKeys;
          if (loadFeatureKeys) {
            for (let j = 0; j < loadFeatureKeys.length; j++) {
              let cql_filter = loadFeatureKeys[j].cql_filter;
              if (cql_filter) {
                const index = cql_filter.indexOf(" AND");
                if (index > -1) {
                  cql_filter =
                    this.queryStr +
                    cql_filter.substring(index, cql_filter.length);
                } else {
                  cql_filter = this.queryStr;
                }
                child[i].loadFeatureKeys[j].cql_filter = cql_filter;
              }
            }
          }
        }
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
    const { dispatch } = this.props;
    return (
      <div className={styles.publicBox + ` ${globalStyle.autoScrollY}`}>
        {this.AllCheckData.map((item, index) => {
          return (
            <DataItem
              stateIndex={index}
              dispatch={dispatch}
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
