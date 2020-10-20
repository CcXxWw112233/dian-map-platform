import { connect } from "dva";
import React, { Fragment } from "react";
import { Tree, Menu, Dropdown, Col, Input, Button } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import styles from "./SystemManageMain.less";
import { MyIcon } from "../../components/utils";
import globalStyle from "@/globalSet/styles/globalStyles.less";

class RoleEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropDownVisible: false,
      isEdit: false,
    };
  }
  handleMoreClick = () => {};
  controlMenu = ({ key }) => {
    if (key === "rename") {
      this.setState({
        isEdit: true,
      });
    } else if (key === "copy") {
    } else if (key === "del") {
      this.setState({
        count: this.state.count - 1,
      });
    }
  };
  setDrownVisible = (val) => {
    this.setState({
      dropDownVisible: val,
    });
  };
  menu = () => {
    return (
      <Menu onClick={(e) => this.controlMenu(e)}>
        <Menu.Item key="rename">重命名</Menu.Item>
        <Menu.Item key="copy">复制</Menu.Item>
        <Menu.Item key="del">
          <span style={{ color: "rgb(255,0,0)" }}>删除</span>
        </Menu.Item>
      </Menu>
    );
  };
  setName = () => {};
  setIsEdit = (value) => {
    this.setState({
      isEdit: value,
    });
  };

  setSuffix = (value) => {};

  onEditCollection = (type, data, name) => {};

  render() {
    const { data } = this.props;
    return (
      <div
        style={{
          width: 240,
          height: 706,
          display: "flex",
          flexDirection: "column",
          borderRadius: "4px",
          border: "1px solid rgba(1, 3, 31, 0.15)",
          marginRight: "24px",
        }}
      >
        <div
          style={{
            height: 48,
            lineHeight: "48px",
            // background: "#ffffff",
            borderRadius: "4px 4px 0px 0px",
            borderBottom: "1px solid rgba(1, 3, 31, 0.15)",
            textAlign: "left",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div
            style={{
              width: "90%",
              display: "flex",
              flexDirection: "row",
              paddingLeft: 10,
            }}
          >
            {this.state.isEdit ? (
              <Fragment>
                <Col span={15}>
                  <Input
                    style={{ borderRadius: "5px" }}
                    placeholder="请输入名称"
                    size="small"
                    autoFocus
                    onChange={(e) => this.setName(e.target.value.trim())}
                    onPressEnter={() => {
                      this.onEditCollection(
                        "editName",
                        data,
                        this.setSuffix("测试")
                      );
                      this.setIsEdit(false);
                    }}
                    allowClear
                    value={"测试"}
                  />
                </Col>
                <Col span={3} style={{ textAlign: "right" }}>
                  <Button
                    onClick={(e) => this.setIsEdit(false)}
                    size="small"
                    shape="circle"
                  >
                    <CloseOutlined />
                  </Button>
                </Col>
                <Col span={3} style={{ textAlign: "center" }}>
                  <Button
                    size="small"
                    onClick={() => {
                      this.setIsEdit(false);
                      this.onEditCollection(
                        "editName",
                        data,
                        this.setSuffix("测试")
                      );
                    }}
                    shape="circle"
                    type="primary"
                  >
                    <CheckOutlined />
                  </Button>
                </Col>
              </Fragment>
            ) : (
              <span style={{ marginLeft: 24 }}>管理员</span>
            )}
          </div>
          <div>
            <Dropdown
              trigger="click"
              onVisibleChange={(val) => this.setDrownVisible(val)}
              visible={this.state.dropDownVisible}
              overlay={this.menu()}
            >
              <MyIcon type="icon-gengduo2" />
            </Dropdown>
          </div>
        </div>
        <div style={{ height: "calc(100% - 48px)" }}>
          <Tree
            checkable
            // onExpand={onExpand}
            // expandedKeys={expandedKeys}
            // autoExpandParent={autoExpandParent}
            // onCheck={onCheck}
            // checkedKeys={checkedKeys}
            // onSelect={onSelect}
            // selectedKeys={selectedKeys}
            treeData={data}
          />
        </div>
      </div>
    );
  }
}

@connect(({ openswitch: { openPanel } }) => ({ openPanel }))
export default class SystemManageMain extends React.Component {
  constructor(props) {
    super(props);
    this.treeData = [
      {
        title: "0-0",
        key: "0-0",
        children: [
          {
            title: "0-0-0",
            key: "0-0-0",
            children: [
              { title: "0-0-0-0", key: "0-0-0-0" },
              { title: "0-0-0-1", key: "0-0-0-1" },
              { title: "0-0-0-2", key: "0-0-0-2" },
            ],
          },
          {
            title: "0-0-1",
            key: "0-0-1",
            children: [
              { title: "0-0-1-0", key: "0-0-1-0" },
              { title: "0-0-1-1", key: "0-0-1-1" },
              { title: "0-0-1-2", key: "0-0-1-2" },
            ],
          },
          {
            title: "0-0-2",
            key: "0-0-2",
          },
        ],
      },
      {
        title: "0-1",
        key: "0-1",
        children: [
          { title: "0-1-0-0", key: "0-1-0-0" },
          { title: "0-1-0-1", key: "0-1-0-1" },
          { title: "0-1-0-2", key: "0-1-0-2" },
        ],
      },
      {
        title: "0-2",
        key: "0-2",
      },
    ];
    this.state = {
      updateStyle: {},
      treeData: this.treeData,
    };
  }

  static getDerivedStateFromProps(nextProps) {
    let { openPanel } = nextProps;
    let obj = {
      // datas: nextProps.currentGroup,
      // active: nextProps.currentData
    };
    if (openPanel) {
      let width = 0;
      let dom1 = document.querySelector("#leftToolBar");
      let dom2 = document.querySelector("#leftPanel");
      if (dom1) {
        width += dom1.clientWidth;
      }
      if (dom2) {
        width += dom2.clientWidth;
      }
      return {
        updateStyle: {
          width: document.body.clientWidth - width,
        },
        ...obj,
      };
    } else {
      let dom1 = document.querySelector("#leftToolBar");
      return {
        updateStyle: {
          width: document.body.clientWidth - (dom1 ? dom1.clientWidth : 0),
        },
        ...obj,
      };
    }
    return null;
  }
  render() {
    const { updateStyle, treeData } = this.state;
    return (
      <div
        className={`${styles.wrapper} ${globalStyle.autoScrollX}`}
        style={{
          ...updateStyle,
          ...{
            dispaly: "flex",
            flexDirection: "row",
          },
        }}
      >
        {treeData.map((item) => {
            return <RoleEntry data={treeData}></RoleEntry>;
          })}
        <div
          style={{
            width: 240,
            height: 312,
            background: "rgba(1, 3, 31, 0.02)",
            borderRadius: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "50%",
            }}
          >
            <i
              className={`${globalStyle.global_icon}`}
              style={{ fontSize: 24, color: "rgba(1, 3, 31, 0.45)" }}
            >
              &#xe65f;
            </i>
            <span>创建新角色</span>
          </div>
        </div>
      </div>
    );
  }
}
