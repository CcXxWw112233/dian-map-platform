import react from "react";
import { Dropdown, Menu, Popover, Popconfirm, Switch } from "antd";
import scoutingDetailsAction from "../../../services/scouting";
import publicDataStyles from "../PublicDataTreeComponent.less";
import styles from "../ScoutingDetails.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { MyIcon } from "../../../components/utils";

import PublicDataAction from "../../../lib/components/PublicData";
import publicDataConf from "../../publicMapData/public_data";

export default class PublicDataTreeComponetHeader extends react.Component {
  constructor(props) {
    super(props);
    this.eyeOpen = "icon-yanjing_xianshi";
    this.eyeClose = "icon-yanjing_yincang";
    this.state = {
      eyeState: false,
      copyVisible: false,
      moveVisible: false,
      delVisible: false,
      dropDownVisible: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { showEyeByFirst } = nextProps;
    this.setState({
      eyeState: showEyeByFirst,
    });
  }
  controlMenu = (key, data) => {
    // switch (key) {
    //   case "copy2group":
    //     // scoutingDetailsAction.COPY_PUBLICDATA_TREE(data.resource_id)
    //     this.setState({
    //       copyVisible: true,
    //     });
    //     break;
    //   case "move2group":
    //     this.setState({
    //       moveVisible: true,
    //     });
    //     // scoutingDetailsAction.MOVE_PUBLICDATA_TREE(data.resource_id)
    //     break;
    //   case "delete":
    //     // scoutingDetailsAction.DEL_PUBLICDATA_TREE(data.resource_id, data.)
    //     break;
    // }
    // if (key === "copy2group") {
    //   this.setState({
    //     copyVisible: !this.state.copyVisible,
    //   });
    // } else if (key === "move2group") {
    //   this.setState({
    //     moveVisible: !this.state.moveVisible,
    //   });
    // } else if (key === "delete") {
    //   this.setState({
    //     delVisible: !this.state.delVisible,
    //   });
    // }
  };

  setCopyVisible = (val) => {
    this.setState({
      copyVisible: val,
    });
  };

  setMoveVisible = (val) => {
    this.setState({
      moveVisible: val,
    });
  };

  setDropDownVisible = (val) => {
    this.setState({
      dropDownVisible: val,
    });
  };

  delete = (collectionId, data) => {
    let ids = [];
    let promise = null;
    if (data.content) {
      promise = scoutingDetailsAction
        .DELETE_COLLECTION(collectionId)
        .then((res) => {
          PublicDataAction.removeFeatures(data.title);
        });
    } else {
      ids.push(data.id);
      if (data.children) {
        data.children.forEach((item) => {
          ids.push(item.id);
        });
      }
      promise = scoutingDetailsAction
        .DEL_PUBLICDATA_TREE(collectionId, ids)
        .then((res) => {
          PublicDataAction.removeFeatures(data.title);
        });
    }
    Promise.all([promise]).then((res) => {
      const { callback } = this.props;
      callback && callback();
    });
  };

  AreaItem = (type, data, collectionId) => {
    const setGroup = (item) => {
      this.setCopyVisible(false);
      this.setMoveVisible(false);
      this.setDropDownVisible(false);
      let ids = [];
      let flag = false;
      if (data && data.content) {
        flag = true;
      } else {
        ids.push(data.id);
        if (data.children) {
          data.children.forEach((item) => {
            ids.push(item.id);
          });
        }
      }
      let promise = null;
      if (type === "move") {
        if (!flag) {
          promise = scoutingDetailsAction
            .MOVE_PUBLICDATA_TREE(collectionId, item.id, ids)
            .then((res) => {
              PublicDataAction.removeFeatures(data.title);
            });
        } else {
          const param = {
            id: collectionId,
            area_type_id: item.id,
          };
          promise = scoutingDetailsAction
            .MOVE_PUBLICDATA_TREE2(param)
            .then((res) => {
              PublicDataAction.removeFeatures(data.title);
            });
        }
      } else if (type === "copy") {
        if (!flag) {
          promise = scoutingDetailsAction.COPY_PUBLICDATA_TREE(
            collectionId,
            item.id,
            ids
          );
        } else {
          promise = scoutingDetailsAction.COPY_PUBLICDATA_TREE2(
            collectionId,
            item.id
          );
        }
      }
      Promise.all([promise]).then((res) => {
        const { callback } = this.props;
        callback && callback();
      });
    };
    const { areaList } = this.props;
    let list = areaList.map((item) => {
      if (item.id !== data.area_type_id) {
        let dom = (
          <div
            className={styles.areaItem}
            key={item.id}
            onClick={setGroup.bind(this, item)}
          >
            {item.name}
          </div>
        );
        return dom;
      }
      return void 0;
    });
    if (list.length) return list;
    else return "暂无分组可以选择";
  };


  getPoiIds = (data) => {
    let ids = []
    if (data.children) {
      data.children.forEach(item => {
        ids.push(item.title)
      })
    }
    return ids
  }

  handleEyeClick = (data) => {
    if (!data) return;
    if (data.title === "人口用地") {
      return;
    }

    this.setState(
      {
        eyeState: !this.state.eyeState,
      },
      () => {
        if (this.state.eyeState) {
          if (!PublicDataAction.hasInited) {
            PublicDataAction.init();
          }
          let poiIds = [];
          // const { parent,isFirst } = this.props;
          // if (isFirst) {
          //   parent.setState({
          //     firstEyeActive: this.state.eyeState,
          //   })
          // } else {
          //   parent.setState({
          //     secondEyeActive: this.state.eyeState,
          //   })
          // }
          if (data.content && data.content.length > 0) {
            if (data.content[0].is_poi === "1") {
              // const content = data.content;
              // content.forEach((item) => {
              //   if (item.children) {
              //     const child = item.children;
              //     child.forEach((item2) => {
              //       poiIds.push(item2.title);
              //     });
              //   }
              // });
              poiIds.push(data.title);
              PublicDataAction.getADPoi(poiIds, 1);
            } else {
              if (data.content) {
                // 楼盘
                let conf = publicDataConf.filter(
                  (item) => item.title === data.content[0].title
                )[0];
                if (!conf) return;
                let loadFeatureKeys = conf.loadFeatureKeys[0];
                const fillColorKeyVals = data.fillColorKeyVals;
                PublicDataAction.getPublicData({
                  url: "",
                  data: loadFeatureKeys,
                  fillColor: fillColorKeyVals,
                });
              }
            }
          } else if (data.children && data.children.length > 0) {
            if (data.children[0].is_poi === "1") {
              data.children.forEach(item => {
                poiIds.push(item.title);
              })
              PublicDataAction.getADPoi(poiIds, 2);
            }
          }
        } else {
          let poiIds = this.getPoiIds(data)
          PublicDataAction.removeFeatures(poiIds);
        }
      }
    );
  };

  renderDropdown = (data, collectionId) => {
    const menu = (
      <Menu
        onClick={(e) => {
          this.controlMenu(e.key, data);
        }}
      >
        <Menu.Item key="copy2group">
          <Popover
            overlayStyle={{ zIndex: 10000 }}
            visible={this.state.copyVisible}
            onVisibleChange={(val) => this.setCopyVisible(val)}
            trigger="click"
            placement="rightTop"
            title={`复制 ${data.title} 到`}
            content={this.AreaItem("copy", data, collectionId)}
          >
            <div style={{ width: "100%" }}>复制到分组</div>
          </Popover>
        </Menu.Item>
        <Menu.Item key="move2group">
          <Popover
            overlayStyle={{ zIndex: 10000 }}
            visible={this.state.moveVisible}
            onVisibleChange={(val) => this.setMoveVisible(val)}
            trigger="click"
            placement="rightTop"
            title={`移动 ${data.title} 到`}
            content={this.AreaItem("move", data, collectionId)}
          >
            <div style={{ width: "100%" }}>移动到分组</div>
          </Popover>
        </Menu.Item>
        <Menu.Item key="delete">
          <Popconfirm
            title={
              <span>
                确定删除[{data.title}]吗？
                <br />
              </span>
            }
            okText="确定"
            cancelText="取消"
            overlayStyle={{ zIndex: 1065 }}
            placement="bottomLeft"
            onConfirm={() => {
              this.setDropDownVisible(false);
              this.delete(collectionId, data);
            }}
          >
            <div className="danger">删除</div>
          </Popconfirm>
        </Menu.Item>
      </Menu>
    );
    return (
      <Dropdown
        overlay={menu}
        trigger="click"
        onVisibleChange={(val) => this.setDropDownVisible(val)}
        visible={this.state.dropDownVisible}
      >
        <MyIcon type="icon-gengduo1" />
      </Dropdown>
    );
  };
  render() {
    const { data, collectionId, isFirst } = this.props;
    if (data) {
      return (
        <div
          className={styles.uploadItem + ` ${globalStyle.btn}`}
          style={{ flexDirection: "row" }}
        >
          <div className={publicDataStyles.text} style={{ width: "82%" }}>
            <span>{data.title}</span>
          </div>
          <div
            className={styles.uploadItemOperation}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* {!(data.title === "人口用地" || data.title === "地产楼盘") ? (
              <MyIcon
                type={this.state.eyeState ? this.eyeOpen : this.eyeClose}
                onClick={() => this.handleEyeClick(data)}
              />
            ) : null} */}
            {/* {!isFirst ? (
              <MyIcon
                type={this.state.eyeState ? this.eyeOpen : this.eyeClose}
                onClick={() => this.handleEyeClick(data)}
              />
            ) : null} */}
            {/* <Switch defaultChecked size="small" /> */}
            {this.renderDropdown(data, collectionId)}
          </div>
        </div>
      );
    }
  }
}
