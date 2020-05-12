import React from "react";
import styles from "./DataItem.less";
import { Collapse, Checkbox, Row, Col } from "antd";
import { MyIcon } from "../../components/utils";

const { Panel } = Collapse;

export default class DataItem extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      indeterminate: false,
      checkAll: false,
      checkedList: [],
    };
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
    let { onChange, data } = this.props;
    let checked = e.target.checked;
    let allKey = [];
    if (checked) {
      allKey = this.getAllKeys();
    } else {
      allKey = [];
    }
    this.setState({
      checkAll: checked,
      checkedList: allKey,
      indeterminate: false,
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
    this.setState({
      checkAll: flag,
      indeterminate: list.length !== 0 ? !flag : false,
    });
  };

  // 单个复选框选择状态
  boxChange = (check) => {
    let { data = {}, onChange } = this.props;
    let checked = check.target.checked;
    let value = check.target.value;
    const fillColor = check.target.fillColor 
    if (checked) {
      this.setState(
        {
          checkedList:
            data.key === "1" ? [value] : this.state.checkedList.concat([value]),
        },
        () => {
          // 更新全选
          this.isAllCheck(this.state.checkedList);
          onChange && onChange(this.state.checkedList, data.key, fillColor);
        }
      );
    } else {
      let index = this.state.checkedList.findIndex((item) => item === value);
      let list = [...this.state.checkedList];
      list.splice(index, 1);
      this.setState(
        {
          checkedList: data.key === "1" ? [] : list,
        },
        () => {
          this.isAllCheck(this.state.checkedList);
          onChange && onChange(this.state.checkedList, data.key, fillColor);
        }
      );
    }
  };
  // 全选单选框
  getCheckBox = () => {
    let { data } = this.props;
    let { indeterminate, checkAll } = this.state;
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
  render() {
    let { data } = this.props;
    let { checkedList } = this.state;
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
                          checked={checkedList.indexOf(item.key) >= 0}
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
