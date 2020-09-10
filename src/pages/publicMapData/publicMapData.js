import React from "react";
import { connect } from "dva";
import { Tree } from "antd";

import styles from "./publicMapData.less";
import publicDataConf from "./public_data";
import { MyIcon } from "../../components/utils";
import PublicDataActions from "../../lib/components/PublicData";
import Event from "../../lib/utils/event";
import lengedListConf from "components/LengedList/config";
import publicDataServices from "@/services/publicData";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import mapApp from "utils/INITMAP";
import { TransformCoordinate } from "@/lib/utils";

@connect()
export default class PublicData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedKeys: ["1", "2", "3", "4", "5", "6"],
      checkedKeys: [],
      selectedKeys: [],
      autoExpandParent: true,
      publicDataTree: [],
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

    publicDataServices.GET_PUBLIC_TREE().then((res) => {
      if (res.code === "0") {
        this.setState({
          publicDataTree: res.data,
        });
      }
    });
  }

  // 区域选择同步更新该区域的选择的公共数据
  getAllData = (queryStr) => {
    return;
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
                  if (!key.non_area) {
                    key.cql_filter = this.queryStr;
                  }
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
                  if (!child[i].loadFeatureKeys[j].non_area) {
                    child[i].loadFeatureKeys[j].cql_filter = this.queryStr;
                  }
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
  onCheck = (checkedKeys, e) => {
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
        const { checkedNodes } = e;
        const view = mapApp.map.getView();
        const zoom = view.getZoom();
        const center = view.getCenter();
        const newCoord = TransformCoordinate(center, "EPSG:3857", "EPSG:4326");
        let keywords = [];
        for (let i = 0; i < checkedNodes.length; i++) {
          if (checkedNodes[i].type === "3") {
            keywords.push(checkedNodes[i].title);
          }
        }
        let xy = newCoord[0] + "," + newCoord[1];
        if (checkedKeys.length > 0) {
          if (Math.round(zoom) > 8) {
            Event.Evt.firEvent("displaySearchBtn", {
              visible: true,
              keywords: keywords,
              xy: xy,
            });
          } else {
            Event.Evt.firEvent("displaySearchBtn", {
              visible: false,
              keywords: keywords,
              xy: xy,
            });
          }
        } else {
          Event.Evt.firEvent("displaySearchBtn", {
            visible: false,
            keywords: keywords,
            xy: xy,
          });
        }
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
      node.children.forEach((item) => {
        arr.push(item.key);
        if (item.children) {
          item.children.forEach((item2) => {
            arr.push(item2.key);
          });
        }
      });
    } else {
      const selectedArr = [];
      selectedArr.push(node.key);
      node.children.forEach((item) => {
        selectedArr.push(item.key);
        if (item.children) {
          item.children.forEach((item2) => {
            selectedArr.push(item2.key);
          });
        }
      });
      const pkey = arr.filter((item) => item === node.pkey)[0];
      if (pkey) {
        selectedArr.push(node.pkey);
        const { publicDataTree } = this.state;
        let has = false;
        for (let i = 0; i < publicDataTree.length; i++) {
          const child = publicDataTree[i].children;
          for (let j = 0; j < child.length; j++) {
            if (child[j].key === pkey) {
              const ckey = arr.filter((item) => item === child[j].pkey)[0];
              if (ckey) {
                selectedArr.push(ckey);
                has = true;
                break;
              }
            }
          }
          if (has) {
            break;
          }
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
      <div className={`${styles.wrapper} ${globalStyle.autoScrollY}`}>
        <Tree
          checkable
          expandedKeys={this.state.expandedKeys}
          checkedKeys={this.state.checkedKeys}
          selectedKeys={this.state.selectedKeys}
          onExpand={this.onExpand}
          onCheck={this.onCheck}
          onSelect={this.onSelect}
          // treeData={treeData}
          treeData={this.state.publicDataTree}
          autoExpandParent={this.state.autoExpandParent}
          // showIcon={true}
        ></Tree>
      </div>
    );
  }
}
