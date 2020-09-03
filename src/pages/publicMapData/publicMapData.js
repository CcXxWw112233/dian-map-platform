import React from "react";
import { connect } from "dva";
import { Tree } from "antd";

import styles from "./publicMapData.less";
import publicDataConf from "./public_data";
import { MyIcon } from "../../components/utils";
import PublicDataActions from "../../lib/components/PublicData";
import Event from "../../lib/utils/event";
import lengedListConf from "components/LengedList/config";

@connect()
export default class PublicData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedKeys: ["1", "2", "3", "4", "5", "6"],
      checkedKeys: [],
      selectedKeys: [],
      autoExpandParent: true,
    };
    this.props.onRef(this);
    this.lastSelectedKeys = [];
    this.AllCheckData = publicDataConf;
    this.queryStr = "";
    this.fillColor = null;
  }

  componentDidMount() {
    const { parent } = this.props;
    if (!parent.hasRenderPublicData) {
      PublicDataActions.init();
      parent.hasRenderPublicData = true;
    }
    const { getQueryStr, onRef } = this.props;
    onRef && onRef(this);
    if (getQueryStr) {
      this.queryStr = getQueryStr();
    }
    this.lastSelectedKeys = parent.publicDataCheckedKeys;
    this.setState({
      checkedKeys: parent.publicDataCheckedKeys,
    });
  }

  // 区域选择同步更新该区域的选择的公共数据
  getAllData = (queryStr) => {
    this.queryStr = queryStr;
    const { parent } = this.props;
    const list = parent.publicDataCheckedKeys || [];
    const diffArr = this.rejectNumberFromDiff(list);
    const dataConf = [...publicDataConf] || [];
    PublicDataActions.clear();
    for (let i = 0; i < diffArr.length; i++) {
      dataConf.forEach((data) => {
        for (let j = 0; j < data.children.length; j++) {
          if (data.children[j].key === diffArr[i]) {
            let loadFeatureKeys = data.children[j].loadFeatureKeys;
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
              this.fillColor = data.children[j].fillColorKeyVals;
              PublicDataActions.getPublicData({
                url: "",
                data: key,
                fillColor: this.fillColor,
              });
            });
          }
        }
      });
    }
  };

  // 获取两数组的不同值
  getDiff = (arr1, arr2) => {
    return arr1.concat(arr2).filter((v, i, arr) => {
      return arr.indexOf(v) === arr.lastIndexOf(v);
    });
  };

  // 获取人口用地的颜色配置
  getFillColor = (val) => {
    let color = null;
    if (!val) {
      return null;
    }
    for (let n = 0; n < this.AllCheckData.length; n++) {
      let child = this.AllCheckData[n].children;
      for (let i = 0; i < child.length; i++) {
        if (child[i].key === val && child[i].fillColorKeyVals) {
          color = child[i].fillColorKeyVals;
          break;
        }
      }
      if (color) {
        break;
      }
    }
    return color;
  };

  // 查找勾选和取消勾选对应的渲染key
  getCheckBoxForDatas = (val) => {
    if (val.length) {
      let allChild = [],
        AllLoadFeatureKeys = [];
      // 取出所有的child
      this.AllCheckData.forEach((item) => {
        let child = item.children;
        for (let i = 0; i < child.length; i++) {
          if (child[i].loadFeatureKeys) {
            let loadFeatureKeys = child[i].loadFeatureKeys;
            for (let j = 0; j < loadFeatureKeys.length; j++) {
              let cqlFilter = loadFeatureKeys[j].cql_filter;
              if (cqlFilter) {
                const index = cqlFilter.indexOf(" AND");
                if (index > -1) {
                  cqlFilter =
                    this.queryStr +
                    cqlFilter.substring(index, cqlFilter.length);
                  child[i].loadFeatureKeys[j].cql_filter = cqlFilter;
                } else {
                  child[i].loadFeatureKeys[j].cql_filter = this.queryStr;
                }
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

  // 剔除数字节点
  rejectNumberFromDiff = (diffArr) => {
    let newArr = [];
    diffArr.forEach((item) => {
      if (isNaN(Number(item))) {
        newArr.push(item);
      }
    });
    return newArr;
  };
  onCheck = (checkedKeys) => {
    const { parent } = this.props;
    const arr = this.getDiff(this.lastSelectedKeys, checkedKeys);
    // 人口
    const currentPopup = arr.filter(
      (item) => item.indexOf("map:population:") > -1
    )[0];
    if (currentPopup) {
      const allPopup = checkedKeys.filter(
        (item) => item.indexOf("map:population:") > -1
      );
      const needDel = this.getDiff([currentPopup], allPopup);
      if (needDel.length > 0) {
        const index = checkedKeys.findIndex((item) => item === needDel[0]);
        checkedKeys.splice(index, 1);
      }
    }
    parent.publicDataCheckedKeys = checkedKeys;
    this.setState(
      {
        checkedKeys: checkedKeys,
      },
      () => {
        // 去除数字的key数组
        const diffArr = this.rejectNumberFromDiff(arr);

        const diffTreeNodeSources = this.getCheckBoxForDatas(diffArr);

        // 去勾选了的
        if (
          this.state.checkedKeys.length > this.lastSelectedKeys.length ||
          this.state.checkedKeys.length === this.lastSelectedKeys.length
        ) {
          diffTreeNodeSources &&
            diffTreeNodeSources.forEach((item) => {
              let data = { ...item };
              if (
                this.state.checkedKeys.length === this.lastSelectedKeys.length
              ) {
                data.key = 1;
                if (diffTreeNodeSources.length) {
                  // 删除勾选的选项-这里只需要传key，剔除其他属性
                  let a = diffTreeNodeSources.map(
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
              this.fillColor = this.getFillColor(currentPopup);
              PublicDataActions.getPublicData({
                url: "",
                data: data,
                fillColor: this.fillColor,
              });
            });
        } else {
          if (diffTreeNodeSources.length) {
            // 删除勾选的选项-这里只需要传key，剔除其他属性
            let a = diffTreeNodeSources.map(
              (item) => item.typeName + (item.cql_filter || "")
            );
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
        this.updateLengedList(checkedKeys);
        this.lastSelectedKeys = this.state.checkedKeys;
      }
    );
  };
  updateLengedList = (checkedKeys) => {
    const lengedConfs = lengedListConf;
    const diffArr = this.rejectNumberFromDiff(checkedKeys);
    let arr = [];
    for (let i = 0; i < diffArr.length; i++) {
      let val = lengedConfs.filter(
        (item) => item.key.indexOf(diffArr[i]) > -1
      )[0];
      if (val) {
        arr.push(val);
      }
    }
    const { dispatch } = this.props;
    dispatch({
      type: "lengedList/updateLengedList",
      payload: {
        config: arr,
      },
    });
  };

  onSelect = (selectedKeys, e) => {
    const node = e.node;
    let arr = JSON.parse(JSON.stringify(this.lastSelectedKeys));
    const index = arr.findIndex((item) => item === node.key);
    // 表示是未勾选的
    if (index === -1) {
      arr.push(node.key);
      if (node.children) {
        node.children.forEach((item) => {
          arr.push(item.key);
        });
      }
    } else {
      const selectedArr = [];
      selectedArr.push(node.key);
      if (node.children) {
        node.children.forEach((item) => {
          selectedArr.push(item.key);
        });
      } else {
        const pkey = arr.filter((item) => item === node.pKey)[0];
        if (pkey) {
          selectedArr.push(node.pKey);
        }
      }
      arr = this.getDiff(arr, selectedArr);
    }
    arr = Array.from(new Set(arr));
    this.onCheck(arr);
  };

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys: expandedKeys,
      autoExpandParent: false,
    });
  };
  render() {
    let treeData = publicDataConf;
    treeData.forEach((data) => {
      if (data.icon) {
        data.icon = <MyIcon type={data.icon} />;
      }
    });
    return (
      <div className={styles.wrapper}>
        <Tree
          checkable
          expandedKeys={this.state.expandedKeys}
          checkedKeys={this.state.checkedKeys}
          selectedKeys={this.state.selectedKeys}
          onExpand={this.onExpand}
          onCheck={this.onCheck}
          onSelect={this.onSelect}
          treeData={treeData}
          autoExpandParent={this.state.autoExpandParent}
          // showIcon={true}
        ></Tree>
      </div>
    );
  }
}
