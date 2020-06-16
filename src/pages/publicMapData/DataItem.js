import React from "react";
import styles from "./DataItem.less";
import { Collapse, Checkbox, Row, Col } from "antd";
import { MyIcon } from "../../components/utils";
// import Event from "../../lib/utils/event";
// import publicDataConf from "./public_data";

import { connect } from "dva";

const { Panel } = Collapse;

@connect(({ publicMapData: dataItemStateList }) => ({ dataItemStateList }))
export default class DataItem extends React.Component {
  constructor() {
    super(...arguments);
  }
  componentDidMount() {
    // this.getAllData();
  }
  // 创建折叠窗的header
  createIconHeader = (item) => {
    let { icon, name } = item;
    return (
      <span>
        <span style={{ float: "left" }}>
          <MyIcon type={icon} style={{ fontSize: "1rem" }} />
        </span>
        {name}
      </span>
    );
  };
  // 获取当前列表中所有的key
  getAllKeys = () => {
    let { data } = this.props;
    let list = [];
    data.child.forEach((item) => {
      list.push(item.key);
    });
    return list;
  };
  // 全选
  checkAllBox = (e) => {
    let { onChange, data, state, stateIndex, dispatch } = this.props;
    let checked = e.target.checked;
    let allKey = [];
    if (checked) {
      allKey = this.getAllKeys();
    } else {
      allKey = [];
    }
    state = {
      checkAll: checked,
      checkedList: allKey,
      indeterminate: false,
    };
    dispatch({
      type: "publicMapData/updateSateByIndex",
      payload: {
        state: state,
        index: stateIndex,
      },
    });
    onChange && onChange(allKey, data.key);
  };
  // 切换是否全选了
  isAllCheck = (list) => {
    let allList = this.getAllKeys(),
      flag = false;
    if (list.length === allList.length) {
      flag = true;
    } else {
      flag = false;
    }
    const {
      dataItemStateList: stateListData,
      stateIndex,
      dispatch,
    } = this.props;
    let newDataItemStateList = stateListData.dataItemStateList;
    newDataItemStateList[stateIndex].checkAll = flag;
    newDataItemStateList[stateIndex].indeterminate =
      list.length !== 0 ? !flag : false;
    dispatch({
      type: "publicMapData/updateDataItemStateList",
      payload: {
        dataItemStateList: newDataItemStateList,
      },
    });
  };

  // 单个复选框选择状态
  boxChange = (check) => {
    let {
      data = {},
      onChange,
      dataItemStateList: newStateListData,
      stateIndex,
      dispatch,
    } = this.props;
    let newDataItemStateList = newStateListData.dataItemStateList;
    let checked = check.target.checked;
    let value = check.target.value;
    const fillColor = check.target.fillColor;

    if (checked) {
      newDataItemStateList[stateIndex].checkedList =
        data.key === "1"
          ? [value]
          : newDataItemStateList[stateIndex].checkedList.concat([value]);
    } else {
      let index = newDataItemStateList[stateIndex].checkedList.findIndex(
        (item) => item === value
      );

      let list = [...newDataItemStateList[stateIndex].checkedList];
      list.splice(index, 1);
      newDataItemStateList[stateIndex].checkedList =
        data.key === "1" ? [] : list;
    }
    this.isAllCheck(newDataItemStateList[stateIndex].checkedList);
    onChange &&
      onChange(
        newDataItemStateList[stateIndex].checkedList,
        data.key,
        fillColor
      );
    dispatch({
      type: "publicMapData/updateDataItemStateList",
      payload: {
        dataItemStateList: newDataItemStateList,
      },
    });
  };
  // 全选单选框
  getCheckBox = () => {
    let { data, dataItemStateList: stateListData, stateIndex } = this.props;
    const newDataItemStateList = [...stateListData.dataItemStateList];
    const newStateIndex = stateIndex;
    const indeterminate =
      newDataItemStateList[newStateIndex].indeterminate || false;
    const checkAll = newDataItemStateList[newStateIndex].checkAll || false;
    return (
      <Checkbox
        onChange={this.checkAllBox}
        indeterminate={indeterminate}
        name={data.key}
        checked={checkAll}
        onClick={(event) => {
          event.stopPropagation();
        }}
        disabled={data.key === "1" ? true : false}
      />
    );
  };

  // getAllData = () => {
  //   Event.Evt.on("updatePublicData", (codeStr) => {
  //     const { dataItemStateList: publicMapData } = this.props;
  //     const list = [...publicMapData.dataItemStateList] || [];
  //     const dataConf = [...publicDataConf.data] || [];
  //     for (let i = 0; i < list.length; i++) {
  //       let checkedList = list[i].checkedList;
  //       checkedList.forEach((checked) => {
  //         dataConf.forEach((data) => {
  //           for (let j = 0; j < data.child.length; j++) {
  //             if (data.child[j].key === checked) {
  //               let loadFeatureKeys = data.child[j].loadFeatureKeys;
  //               loadFeatureKeys.forEach((key) => {
  //                 key.cql_filter = key.cql_filter.replace(
  //                   /\([^\)]*\)/g,
  //                   `(${codeStr})`
  //                 );
  //               });
  //             }
  //           }
  //         });
  //       });
  //     }
  //   });
  // };
  render() {
    let { data, dataItemStateList: stateListData, stateIndex } = this.props;
    // let { checkedList } = this.state;
    const newDataItemStateList = stateListData.dataItemStateList;
    return (
      <div className={styles.publicMenuItem}>
        <Collapse expandIconPosition="right">
          <Panel
            header={this.createIconHeader(data)}
            key={data.key}
            extra={this.getCheckBox()}
          >
            {/* <Checkbox.Group style={{ width: '100%' }}  value={checkedList}> */}
            <Row>
              {data.child.length
                ? data.child.map((item) => {
                    return (
                      <Col
                        span={8}
                        key={item.key}
                        style={{ marginBottom: "1rem" }}
                      >
                        <Checkbox
                          value={item.key}
                          name={data.key}
                          fillColor={item.fillColorKeyVals || null}
                          onChange={this.boxChange}
                          checked={
                            newDataItemStateList[
                              stateIndex
                            ].checkedList.indexOf(item.key) >= 0
                          }
                        >
                          {item.name}
                        </Checkbox>
                      </Col>
                    );
                  })
                : ""}
            </Row>
            {/* </Checkbox.Group> */}
          </Panel>
        </Collapse>
      </div>
    );
  }
}
