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
import { times } from "lodash";

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
    this.lastKeywords = [];
    this.lastKeywords2 = [];
    this.lastSingle = null;
    this.AllCheckData = publicDataConf;
    this.queryStr = "";
    this.fillColor = null;
    this.singleNodes = [];
    this.dclp = [];
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
    this.lastKeywords = parent.publicDataLastKeywords;
    this.lastKeywords2 = parent.publicDataLastKeywords2;
    this.lastSingle = parent.lastSingle;
    this.setState({
      checkedKeys: parent.publicDataCheckedKeys,
    });

    publicDataServices.GET_PUBLIC_TREE().then((res) => {
      if (res.code === "0") {
        let data = res.data;
        for (let i = 0; i < data.length; i++) {
          if (data[i].title === "人口用地") {
            this.singleNodes = data[i].children;
            data[i].disabled = true;
            data[i].children.forEach((item) => {
              item.isSingle = true;
            });
            break;
          }
          if (data[i].title === "地产楼盘") {
            this.dclp = data[i].children;
          }
        }
        this.setState({
          publicDataTree: res.data,
        });
      }
    });
  }

  // 区域选择同步更新该区域的选择的公共数据
  getAllData = (queryStr) => {
    // return;
    PublicDataActions.clear();
    this.queryStr = queryStr;
    for (let i = 0; i < publicDataConf.length; i++) {
      let data = publicDataConf[i].loadFeatureKeys[0];
      const fillColorKeyVals = data.fillColorKeyVals;
      this.fillColor = fillColorKeyVals ? fillColorKeyVals : this.fillColor;
      if (data.cql_filter) {
        const index = data.cql_filter.indexOf(" AND");
        if (index > -1) {
          data.cql_filter =
            this.queryStr +
            data.cql_filter.substring(index, data.cql_filter.length);
        } else {
          if (!data.non_area) {
            data.cql_filter = this.queryStr;
          }
        }
      }
    }
    this.lastKeywords2.forEach((item) => {
      let data = publicDataConf.filter((item2) => item2.title === item)[0];
      if (data) {
        let loadFeatureKeys = data.loadFeatureKeys[0];
        PublicDataActions.getPublicData({
          url: "",
          data: loadFeatureKeys,
          fillColor: this.fillColor,
        });
      }
    });
  };

  // 获取两数组的不同值
  getDiff = (arr1, arr2) => {
    return arr1.concat(arr2).filter((v, i, arr) => {
      return arr.indexOf(v) === arr.lastIndexOf(v);
    });
  };

  removeLastFeature = () => {
    const data = publicDataConf.filter(
      (item) => item.title === this.lastSingle.title
    )[0];
    if (data) {
      let loadFeatureKeys = data.loadFeatureKeys;
      let a = loadFeatureKeys.map(
        (item) => item.typeName + (item.cql_filter || "")
      );
      PublicDataActions.removeFeatures(a);
    }
  };

  onCheck = (checkedKeys, e) => {
    let checkedNodes = e.checkedNodes || e;
    /**
     * 只有当checkedNodes长度
     */
    const newCheckedKeys = JSON.parse(JSON.stringify(checkedKeys));
    const diffArr = this.getDiff(checkedKeys, this.lastSelectedKeys);
    if (diffArr.length === 1) {
      let currentNode = this.singleNodes.filter(
        (item) => item.id === diffArr[0]
      )[0];
      if (currentNode) {
        if (this.lastSingle) {
          const index = newCheckedKeys.findIndex(
            (key) => key === this.lastSingle.id
          );
          if (index > -1) {
            newCheckedKeys.splice(index, 1);
            const index2 = checkedNodes.findIndex(
              (item) => item.id === this.lastSingle.id
            );
            if (index2 > -1) {
              checkedNodes.splice(index2, 1);
            }
            this.removeLastFeature();
          } else {
            if (this.lastSingle.id === currentNode.id) {
              const index2 = checkedNodes.findIndex(
                (item) => item.id === this.lastSingle.id
              );
              if (index2 > -1) {
                checkedNodes.splice(index2, 1);
              }
              this.removeLastFeature();
              currentNode = null;
            }
          }
        }
      }
      this.lastSingle = currentNode;
    }
    if (checkedKeys.length === 0) {
      this.lastSingle = null;
      PublicDataActions.clear();
    }
    const { parent } = this.props;
    parent.publicDataCheckedKeys = checkedKeys;
    parent.lastSingle = this.lastSingle;
    this.setState(
      {
        checkedKeys: newCheckedKeys,
      },
      () => {
        const view = mapApp.map.getView();
        const zoom = view.getZoom();
        let keywords = [];
        let keywords2 = [];
        for (let i = 0; i < checkedNodes.length; i++) {
          if (checkedNodes[i].children.length === 0) {
            if (checkedNodes[i].is_poi === "1") {
              keywords.push(checkedNodes[i].title);
            } else {
              keywords2.push(checkedNodes[i].title);
            }
          }
        }
        if (keywords.length > 0) {
          if (Math.round(zoom) > 8) {
            Event.Evt.firEvent("displaySearchBtn", {
              visible: true,
              keywords: keywords,
            });
          } else {
            Event.Evt.firEvent("displaySearchBtn", {
              visible: false,
              keywords: keywords,
            });
          }
        } else {
          Event.Evt.firEvent("displaySearchBtn", {
            visible: false,
            keywords: keywords,
          });
        }
        if (this.lastSelectedKeys.length > checkedKeys.length) {
          if (this.lastKeywords2.length > 0) {
            let loadFeatureKeys = publicDataConf.filter(
              (item) => item.title === "新房"
            )[0].loadFeatureKeys[0];
            this.lastKeywords2 = [
              `${
                loadFeatureKeys.typeName + (loadFeatureKeys.cql_filter || "")
              }`,
            ];
          }
          const newArr = [...this.lastKeywords, ...this.lastKeywords2];
          if (keywords2.length > 0) {
            let loadFeatureKeys = publicDataConf.filter(
              (item) => item.title === "新房"
            );
            keywords2 = [
              `${
                loadFeatureKeys.typeName + (loadFeatureKeys.cql_filter || "")
              }`,
            ];
          }
          const newArr2 = [...keywords, ...keywords2];
          const arr = this.getDiff(newArr, newArr2);
          PublicDataActions.removeFeatures(arr);
        } else {
          if (keywords2.length > 0) {
            let lengedConfs = [];
            keywords2.forEach((item) => {
              for (let i = 0; i < publicDataConf.length; i++) {
                if (publicDataConf[i].title === item) {
                  let newLended = lengedListConf.filter(
                    (item) => item.key === publicDataConf[i].key
                  )[0];
                  if (newLended) {
                    lengedConfs.push(newLended);
                  }
                  const fillColorKeyVals = publicDataConf[i].fillColorKeyVals;
                  this.fillColor = fillColorKeyVals
                    ? fillColorKeyVals
                    : this.fillColor;
                  PublicDataActions.getPublicData({
                    url: "",
                    data: publicDataConf[i].loadFeatureKeys[0],
                    fillColor: publicDataConf[i].fillColorKeyVals,
                  });
                  break;
                }
              }
            });
            const { dispatch } = this.props;
            dispatch({
              type: "lengedList/updateLengedList",
              payload: {
                config: lengedConfs,
              },
            });
          }
        }
        this.lastSelectedKeys = this.state.checkedKeys;
        this.lastKeywords = keywords;
        this.lastKeywords2 = keywords2;
        parent.publicDataCheckedKeys = this.lastSelectedKeys;
        parent.publicDataLastKeywords = this.lastKeywords;
        parent.publicDataLastKeywords2 = this.lastKeywords2;
      }
    );
  };

  onSelect = (selectedKeys, e) => {
    const node = e.node;
    let arr = JSON.parse(JSON.stringify(this.lastSelectedKeys));
    const index = arr.findIndex((item) => item === node.key);
    let checkedKeys = [];
    // 表示是未勾选的
    if (index === -1) {
      arr.push(node.key);
      if (node.children.length === 0) {
        checkedKeys.push(node);
      }
      node.children.forEach((item) => {
        arr.push(item.key);
        if (item.children.length === 0) {
          checkedKeys.push(item);
        }
        if (item.children) {
          item.children.forEach((item2) => {
            if (item2.children.length === 0) {
              checkedKeys.push(item2);
            }
            arr.push(item2.key);
          });
        }
      });
    } else {
      const selectedArr = [];
      selectedArr.push(node.key);
      if (node.children.length === 0) {
        checkedKeys.push(node);
      }
      node.children.forEach((item) => {
        selectedArr.push(item.key);
        if (item.children.length === 0) {
          checkedKeys.push(item);
        }
        if (item.children) {
          item.children.forEach((item2) => {
            selectedArr.push(item2.key);
            if (item.children.length === 0) {
              checkedKeys.push(item);
            }
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
    this.onCheck(arr, checkedKeys);
  };

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys: expandedKeys,
      autoExpandParent: false,
    });
  };
  render() {
    // let treeData = publicDataConf;
    // treeData.forEach((data) => {
    //   if (data.icon) {
    //     data.icon = <MyIcon type={data.icon} />;
    //   }
    // });
    return (
      <div
        className={`${styles.wrapper} ${globalStyle.autoScrollY}`}
        style={{
          height: "94%",
        }}
      >
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
