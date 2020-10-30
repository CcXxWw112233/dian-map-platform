import react from "react";
import { Collapse, Dropdown, Menu, Popover, Popconfirm } from "antd";
import { MyIcon } from "../../../components/utils";

import PublicDataAction from "../../../lib/components/PublicData";
import publicDataConf from "../../publicMapData/public_data";
import lengedListConf from "components/LengedList/config";
import publicDataStyles from "../PublicDataTreeComponent.less";
import styles from "../ScoutingDetails.less";
import scoutingDetailsAction from "../../../services/scouting";
import Event from "@/lib/utils/event";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { connect } from "dva";

@connect()
export default class DetailItem extends react.Component {
  constructor(props) {
    super(props);
    this.eyeOpen = "icon-yanjing_xianshi";
    this.eyeClose = "icon-yanjing_yincang";
    this.populationDatas = ["人口分布", "人口密度", "就业岗位", "居民用地"];
    this.state = {
      eyeState: false,
    };
    Event.Evt.on("getPublicData", (str) => {
      const { data } = this.props;
      if (data.is_poi === "0") {
        this.setState({
          eyeState: true,
        });
        if (!PublicDataAction.hasInited) {
          PublicDataAction.init();
        }
        // PublicDataAction.clear()
        if (data && data.is_poi === "1") {
          PublicDataAction.getADPoi([data.title]);
        } else {
          const isPopulation = this.populationDatas.includes(data.title);
          let conf = publicDataConf.filter(
            (item) => item.title === data.title
          )[0];
          if (!conf) return;
          let loadFeatureKeys = conf.loadFeatureKeys[0];
          const fillColorKeyVals = conf.fillColorKeyVals;
          if (isPopulation) {
            // PublicDataAction.removeFeatures(this.populationDatas);
            const { dispatch } = this.props;
            const newLended = lengedListConf.filter(
              (item) => item.key === conf.key
            )[0];
            PublicDataAction.getPopulationDatas(
              fillColorKeyVals,
              data.title,
              loadFeatureKeys,
              dispatch,
              newLended,
              str
            );
          } else {
            PublicDataAction.getPublicData({
              url: "",
              data: loadFeatureKeys,
              fillColor: fillColorKeyVals,
            });
          }
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { showEyeByFirst, showEyeBySecond } = nextProps;
    this.setState({
      eyeState: showEyeByFirst,
    });
    this.setState({
      eyeState: showEyeBySecond,
    });
  }
  handleEyeClick = (data, change) => {
    this.setState(
      {
        eyeState: change ? true : !this.state.eyeState,
      },
      () => {
        // 显示
        if (this.state.eyeState) {
          if (!PublicDataAction.hasInited) {
            PublicDataAction.init();
          }
          if (data && data.is_poi === "1") {
            PublicDataAction.getADPoi([data.title]);
          } else {
            const isPopulation = this.populationDatas.includes(data.title);
            let conf = publicDataConf.filter(
              (item) => item.title === data.title
            )[0];
            if (!conf) return;
            let loadFeatureKeys = conf.loadFeatureKeys[0];
            const fillColorKeyVals = conf.fillColorKeyVals;
            if (isPopulation) {
              const { dispatch } = this.props;
              const newLended = lengedListConf.filter(
                (item) => item.key === conf.key
              )[0];
              PublicDataAction.getPopulationDatas(
                fillColorKeyVals,
                data.title,
                loadFeatureKeys,
                dispatch,
                newLended
              );
            } else {
              PublicDataAction.getPublicData({
                url: "",
                data: loadFeatureKeys,
                fillColor: fillColorKeyVals,
              });
            }
          }
        } else {
          // 隐藏
          if (data && data.is_poi === "1") {
            PublicDataAction.removeFeatures(data.title);
          } else {
            const isPopulation = this.populationDatas.includes(data.title);
            if (isPopulation) {
              // 人口
              PublicDataAction.removeFeatures(
                PublicDataAction.lastPopulationTypeName
              );
            } else {
            }
          }
        }
      }
    );
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
      ids.push(data.resource_id);
      data.content.forEach((item) => {
        ids.push(item.id);
        if (item.children) {
          item.children.forEach((item2) => {
            ids.push(item2.id);
          });
        }
      });
    } else {
      ids.push(data.id);
      if (data.children) {
        data.children.forEach((item) => {
          ids.push(item.id);
        });
      }
    }
    promise = scoutingDetailsAction.DEL_PUBLICDATA_TREE(collectionId, ids);
    Promise.all([promise]).then((res) => {
      const { callback } = this.props;
      callback && callback();
    });
  };

  AreaItem = (type, data, collectionId) => {
    let promise = null;
    const setGroup = (item) => {
      this.setCopyVisible(false);
      this.setMoveVisible(false);
      this.setDropDownVisible(false);
      let ids = [data.id];
      if (type === "move") {
        promise = scoutingDetailsAction
          .MOVE_PUBLICDATA_TREE(collectionId, item.id, ids)
          .then((res) => {
            PublicDataAction.removeFeatures(data.title);
          });
      } else if (type === "copy") {
        promise = scoutingDetailsAction.COPY_PUBLICDATA_TREE(
          collectionId,
          item.id,
          ids
        );
      } else if (type === "delete") {
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
    const { data, collectionId } = this.props;
    return (
      <div
        className={styles.uploadItem + ` ${globalStyle.btn}`}
        key={data.id}
        style={{ flexDirection: "row" }}
      >
        <div className={styles.uploadIcon}>
          <MyIcon type="icon-bianzu78beifen12" />
        </div>
        <div className={publicDataStyles.text}>
          <span>{data.title}</span>
        </div>
        <div className={styles.uploadItemOperation}>
          <MyIcon
            type={this.state.eyeState ? this.eyeOpen : this.eyeClose}
            onClick={() => this.handleEyeClick(data)}
          />
          {this.renderDropdown(data, collectionId)}
        </div>
      </div>
    );
  }
}
