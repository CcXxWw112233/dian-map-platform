import React, { PureComponent, Fragment } from "react";
import globalStyle from "../../globalSet/styles/globalStyles.less";
import animateCss from "../../assets/css/animate.min.css";
import styles from "./ScoutingDetails.less";
import Action from "../../lib/components/ProjectScouting/ScoutingDetail";
import ScouListAction from "../../lib/components/ProjectScouting/ScoutingList";
import PlayCollectionAction from "../../lib/components/ProjectScouting/playCollection";
import { connect } from "dva";
import { formatLength, formatArea } from "utils/mapUtils";
import {
  Collapse,
  Tabs,
  Button,
  message,
  Space,
  // Popover,
  Empty,
  Popconfirm,
  Checkbox,
  Dropdown,
  Menu,
  Popover,
  BackTop,
  // Radio,
  // Form,
  // Input,
  // InputNumber,
} from "antd";
import { PlusCircleOutlined, CaretRightOutlined } from "@ant-design/icons";
import Event from "../../lib/utils/event";
import AudioControl from "./components/audioPlayControl";
import { MyIcon } from "../../components/utils";
import {
  Title,
  ScoutingHeader,
  ScoutingItem,
  UploadItem,
  areaScouting,
} from "./components/ScoutingDetailsSubComponents";

import PlayCollectionControl from "./components/playCollectionControl";
// import { getOffsetTop } from "utils/utils";
// import CollectionDetail from "./components/CollectionDetail";
import CollectionDetail from "./components/CollectionDetail/index-new";
import LookingBack from "./components/LookingBack";
import mapApp from "../../utils/INITMAP";

import { CSSTransition } from "react-transition-group";
import Axios from "axios";
import { BASIC } from "../../services/config";
import AboutAction from "../../lib/components/ProjectScouting/AroundAbout";
import Meettings from "./components/Meeting";
import PublicDataTreeComponent from "./components/PublicDataTreeComponent";
import Plan from "./components/Plan";
import { TransformCoordinate } from "../../lib/utils";
import geojsonResource from "../../services/geojsonResource";

const { Evt } = Event;
const { TabPane } = Tabs;

@connect(
  ({
    controller: { mainVisible, lastPageState },
    openswitch: { showFeatureName },
    lengedList: { config },
    collectionDetail: { selectData, showCollectionsModal },
  }) => ({
    mainVisible,
    lastPageState,
    config,
    showFeatureName,
    selectData,
    showCollectionsModal,
  })
)
export default class ScoutingDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.publicDataLinkArr = [];
    this.lastSelectedDom = null;
    this.isClickInPanel = false;
    const panes = [
      {
        title: "图层",
        content: areaScouting(),
        key: "1",
        closable: false,
        className: styles.tab_tab1,
        code: [
          "map:collect:add:app",
          "map:collect:add:web",
          "map:collect:push",
          "map:collect:type:add",
          "map:collect:type:update",
          "map:collect:type:remove",
        ],
      },
      {
        title: "查看",
        content: <div>正在加紧开发中...</div>,
        key: "2",
        closable: 0,
        className: styles.tab_tab2,
        code: "map:collect:lookback:view",
      },
      {
        title: "协作",
        content: <div>正在加紧开发中...</div>,
        key: "3",
        closable: 0,
        className: styles.tab_tab3,
        code: "map:board:team",
      },
      {
        title: "计划",
        content: <div>正在加紧开发中...</div>,
        key: "4",
        closable: 0,
        className: styles.tab_tab4,
        code: "map:board:plan",
      },
    ];
    this.state = {
      current_board: {},
      area_list: [],
      all_collection: [],
      not_area_id_collection: [],
      area_active_key: null,
      multipleGroup: false,
      area_selected: [],
      isPlay: false,
      playing: false,
      currentGroup: null,
      notNextGroup: false,
      notPrevGroup: false,
      playCollectionVisible: false,

      visible: true,
      activeKey: "1",
      panes,
      activeId: -1,
      audioData: {},
      miniTitle: false,
      isEdit: false,
      selections: [],
      notAreaIdSelections: [],
      showMoreAction: false,

      setCopyVisible: false,
      setMoveVisible: false,
      notRenderCollection: false,
      addGroupDisabled: true,
    };
    this.scrollView = React.createRef();
    this.saveSortTimer = null;
    this.saveSortTime = 2 * 1000; // 秒
    this.isAddAreaBtn = false; //是否外部调用了新增分类按钮
    this.isGoBack = false;
    this.collectionScrollTop = 0;
    this.touchStartClient = {};
    this.isTouch = false;
    this.scrolltoDom = null;
    this.scoutingDetailInstance = null;
    this.is360Pic = false;
    this.allFeatureList = [];
    this.props.onRef && this.props.onRef(this);
    this.notAreaIdCollection = [];
    this.areaList = [];

    // codeType区域筛选用
    this.codeType = null;
    // code区域筛选用
    this.code = null;
    this.needSingleDisplayGroup = ["人口"];
    this.needDisplayAll = [
      "交通",
      "产业设施",
      "基础设施",
      "人文景观",
      "农林耕地",
      "地籍地貌",
    ];
  }
  componentDidMount() {
    this.isGoBack = false;
    this.planRef = null;
    const { Evt } = Event;
    const { mainVisible } = this.props;
    if (mainVisible) this.getDetails();
    // 删除存在与页面中的项目点和元素
    Action.removeListPoint();
    // 构建地图组件
    Action.init(this.props.dispatch);
    // 当外部的数据保存成功后的回调
    // console.log(Event.Evt)
    Event.Evt.on("addCollectionForFeature", (data) => {
      this.setState({
        area_active_key: "other",
      });
      this.fetchCollection();
    });
    Event.Evt.on("searchProjectData", (val) => {
      if (this.state.activeKey !== "1") return;
      let tmpArr = [];
      if (val) {
        if (Array.isArray(val)) {
          val.forEach((item) => {
            if (this.state.area_active_key !== "other") {
              let area_active_key = this.state.area_active_key;
              let areaList = this.areaList.filter((item) => {
                return item.id === area_active_key;
              });
              if (areaList.length > 0) {
                this.allFeatureList = areaList[0].collection;
              }
            } else {
              this.allFeatureList = this.notAreaIdCollection;
            }
            let tmpArr2 = this.allFeatureList.filter((item2) => {
              return item2[item.type] === item.code;
            });
            tmpArr = [...tmpArr, ...tmpArr2];
          });
          let tmpAreaList = [],
            tmpNotAreaIdCollection = [];
          this.areaList.forEach((item) => {
            let data = JSON.parse(JSON.stringify(item));
            if (data.collection) {
              let collection = data.collection;
              let tmpList = [];
              val.forEach((item2) => {
                let tmp = collection.filter((item3) => {
                  return item3[item2.type] === item2.code;
                });
                tmpList = [...tmpList, ...tmp];
              });
              data.collection = tmpList;
            }
            tmpAreaList.push(data);
          });
          val.forEach((item) => {
            let tmp = this.notAreaIdCollection.filter((item2) => {
              return item2[item.type] === item.code;
            });
            tmpNotAreaIdCollection = [...tmpNotAreaIdCollection, ...tmp];
          });
          this.setState({
            area_list: tmpAreaList,
            not_area_id_collection: tmpNotAreaIdCollection,
          });
        } else {
          this.codeType = val.type;
          this.code = val.code;
          tmpArr = this.allFeatureList.filter((item) => {
            return item[val.type] === val.code;
          });
          let tmpAreaList = [],
            tmpNotAreaIdCollection = [];
          this.areaList.forEach((item) => {
            let data = JSON.parse(JSON.stringify(item));
            if (data.collection) {
              data.collection = data.collection.filter((item2) => {
                return item2[val.type] === val.code;
              });
            }
            tmpAreaList.push(data);
          });
          tmpNotAreaIdCollection = this.notAreaIdCollection.filter((item) => {
            return item[val.type] === val.code;
          });
          this.setState({
            area_list: tmpAreaList,
            not_area_id_collection: tmpNotAreaIdCollection,
          });
        }
      } else {
        tmpArr = this.allFeatureList;
        this.setState({
          area_list: this.areaList,
          not_area_id_collection: this.notAreaIdCollection,
        });
      }
      const { config: lenged, dispatch, showFeatureName } = this.props;
      // if (tmpArr.length === 0) {
      //   this.areaList.forEach(item => {
      //     tmpArr= [...tmpArr, ...item.collection]
      //   })
      // }
      Action.renderCollection(tmpArr || [], {
        lenged,
        dispatch,
        showFeatureName,
      });
    });
    // 有音频正在播放
    Event.Evt.on("hasAudioStart", (data) => {
      this.setAudio(data);
    });

    Event.Evt.on("updatePlotFeature", (data) => {
      this.fetchCollection();
    });
    Evt.on(
      "CollectionUpdate:remove",
      this.onCollectionUpdate.bind(this, "remove")
    );
    Evt.on("CollectionUpdate:add", this.onCollectionUpdate.bind(this, "add"));
    Evt.on(
      "CollectionUpdate:reload",
      this.onCollectionUpdate.bind(this, "reload")
    );
    Evt.on("FeatureOnAddBtn", () => {
      this.isAddAreaBtn = true;
      this.pushAreaItem();
    });

    Evt.on("handleGroupFeature", (id) => {
      if (this.state.activeKey === "1") this.setActiveCollapse(id);
    });
    Evt.on("handleCollectionFeature", (val) => {
      this.handleCollectionFeature(val, "edit", "collection");
    });

    Evt.addEventListener(
      "handleGroupCollectionFeature",
      this.handleCollectionFeature
    );
    Evt.on("handleFeatureToLeftMenu", (id) => {
      this.scrollForFeature(id);
    });
    Evt.on("handlePlotFeature", this.handlePlotFeature);

    const me = this;
    Evt.on("openSelectGroup", (val) => {
      let area_active_key = val.area_type_id || "other";
      if (this.state.area_active_key === area_active_key) {
        this.scrollForFeature(val.id);
      } else {
        this.setActiveCollapse(area_active_key);
        setTimeout(function () {
          me.scrollForFeature(val.id);
        }, 1);
      }
    });
  }

  setItemClickState = (val) => {
    this.isClickInPanel = val;
  };

  // 定位到位置
  scrollForFeature = (id) => {
    let text = "#menu_collection_" + id;
    let dom = document.querySelector(text);
    if (this.lastSelectedDom) {
      this.lastSelectedDom.classList.remove(styles.hoverActive);
    }
    if (dom) {
      dom.classList.add(styles.hoverActive);
      if (!this.isClickInPanel) {
        dom.scrollIntoView({ behavior: "smooth" });
      }
      this.isClickInPanel = false;
      // this.scrolltoDom = setTimeout(() => {
      //   dom.classList.remove(styles.hoverActive);
      // }, 3 * 1000);
      this.lastSelectedDom = dom;
    }
  };

  getProperties = (type, geometry) => {
    switch (type) {
      case "Point":
        let coor = Action.transform(geometry.getCoordinates());
        return {
          坐标: `经度: ${coor[0].toFixed(4)} 纬度:${coor[1].toFixed(4)}`,
        };
      case "Polygon":
        return { 面积: formatArea(geometry) };
      case "LineString":
        return { 长度: formatLength(geometry) };
      default:
    }
  };

  // 标绘点击回调
  handlePlotFeature = ({ feature, pixel }) => {
    if (!feature) return;
    // console.log(feature, pixel)
    const { dispatch } = this.props;
    let collection = this.state.all_collection.find(
      (item) => item.id === feature.get("id")
    );
    // let isGeojson = feature.get("isGeojson");
    if (collection) {
      let ftype = feature.getGeometry().getType();
      let properties = this.getProperties(ftype, feature.getGeometry());
      if (ftype === "Point") {
        let coords = feature.getGeometry().getCoordinates();
        coords = TransformCoordinate(coords, "EPSG:3857", "EPSG:4326");
        Evt.firEvent("HouseDetailGetPoi", coords.join(","));
        dispatch({
          type: "collectionDetail/updateDatas",
          payload: { selectPoi: coords.join(",") },
        });
      }
      collection.properties_map = properties;
      dispatch({
        type: "collectionDetail/updateDatas",
        payload: {
          selectData: collection,
          type: "edit",
          isImg: false,
          selectedFeature: feature,
        },
      });
    }
  };
  // 点击了坐标点
  handleCollectionFeature = (data, type = "view", from = "group") => {
    const { dispatch } = this.props;
    // let coordinates = [];
    let feature = null,
      geo;
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      let f = Action.getFeatureById(item.id);
      if (f) feature = f;
      break;
    }
    if (feature) {
      geo = feature.getGeometry();
      // coordinates = geo.getCoordinates();
    }
    data = data.map((item) => {
      let properties = this.getProperties(geo?.getType(), geo);
      item.properties_map = properties;
      return item;
    });

    dispatch({
      type: "collectionDetail/updateDatas",
      payload: {
        selectData: [...data],
        type,
        isImg: true,
      },
    });
    if (from === "group")
      Action.setGroupCollectionActive(Array.isArray(data) ? data[0] : data);
  };
  componentWillUnmount() {
    const { dispatch, config: lengedList } = this.props;
    AboutAction.clearLine("detail");
    Action.mounted = false;
    clearTimeout(this.scrolltoDom);
    Event.Evt.removeEventListener(
      "handleGroupCollectionFeature",
      this.handleCollectionFeature
    );
    if (this.isGoBack) {
      let newLengedList = [...lengedList];
      if (!Array.isArray(lengedList)) {
        newLengedList = [lengedList];
      }
      const key = Action.lenged?.key;
      const index = newLengedList.findIndex((item) => {
        return item.key === key;
      });
      newLengedList.splice(index, 1);
      dispatch({
        type: "lengedList/updateLengedList",
        payload: {
          config: newLengedList,
        },
      });
      Action.removeLayer(true);
      Action.clearListen();
      this.clearGroupPointer();
    }
    dispatch({
      type: "collectionDetail/updateDatas",
      payload: {
        selectData: null,
        type: "view",
        isImg: true,
      },
    });
  }

  // 设置正在播放的数据
  setAudio = (data) => {
    // console.log(data)
    this.setState({
      audioData: data,
    });
  };

  // 轮询中的数据监听
  onCollectionUpdate = (type, collections) => {
    let arr = Array.from(this.state.all_collection);
    if (type === "add") {
      arr = arr.concat(collections);
    }
    if (type === "remove") {
      let key = collections.map((item) => item.id);
      arr = arr.filter((item) => !key.includes(item.id));
    }
    if (type === "reload") {
      arr = collections;
    }
    this.updateAllCollectionReset(arr);
  };

  // 获取缓存中选定的项目
  getDetails = (flag) => {
    ScouListAction.checkItem().then((res) => {
      // console.log(res)
      let { data } = res;
      Event.Evt.firEvent("changeAreaInSearch", data);
      this.setState(
        {
          current_board: data,
        },
        () => {
          Action.setToCenter(data);
          if (!flag) this.renderAreaList();
          let param = { board_id: this.state.current_board.board_id };
          Action.addToListen(param);
        }
      );
    });
  };

  // 渲染区域分类列表
  renderAreaList = () => {
    let param = { board_id: this.state.current_board.board_id };
    Action.fetchAreaList(param)
      .then((resp) => {
        // console.log(resp)
        let respData = resp.data;
        // 当前激活的区域
        let active =
          this.state.area_active_key || (respData[0] && respData[0].id);
        if (!active) {
          active = "other";
        }
        this.areaList = JSON.parse(
          JSON.stringify(
            respData.map((item) =>
              Object.assign(item, { _edit: false, _remarkEdit: false })
            )
          )
        );
        this.setState({
          area_list: this.areaList,
          area_active_key: active,
          area_selected: [active],
        });
        // 获取区域分类的数据列表
        window.ProjectGroupId = active;
        this.fetchCollection();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleGoBackClick = () => {
    const { dispatch } = this.props;
    Action.onBack();
    this.isGoBack = true;
    dispatch({
      type: "controller/updateMainVisible",
      payload: {
        mainVisible: "list",
      },
    });
  };

  onChange = (activeKey) => {
    const { dispatch } = this.props;
    this.setState({ activeKey });
    if (this.state.activeKey === activeKey) return;
    this.clearGroupPointer();
    Action.clearGroupCollectionPoint();
    if (activeKey !== "1") {
      // 删除采集资料显示
      Action.removeLayer();
      // 删除轮询
      Action.clearListen();
      Action.needRenderFetureStyle = false;

      // 惠州电信展示需求
      Action.selectedFeature = null;
      Action.lastSelectedFeature = null;
      Action.removeFeatureOverlay();
      this.setState({
        isEdit: false,
      });
      if (activeKey === "2") {
        // this.renderGroupPointer();
      }
    } else if (activeKey === "1") {
      // 显示采集资料
      this.setActiveCollapse(this.state.area_active_key);
      let params = {
        board_id: this.state.current_board.board_id,
      };
      Action.needRenderFetureStyle = true;
      // 添加轮询
      Action.addToListen(params);
    }
    // 隐藏右上角的弹窗
    dispatch({
      type: "collectionDetail/updateDatas",
      payload: {
        selectData: null,
        type: "view",
        isImg: true,
      },
    });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: "新建Tab", content: "", key: activeKey });
  };

  remove = (targetKey) => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter((pane) => pane.key !== targetKey);
    if (panes.length && activeKey === targetKey) {
      if (panes.length >= 0) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key;
      }
    }
    this.setState({ panes, activeKey });
  };

  // 更新本地显示
  pushAreaItem = () => {
    let obj = {
      id: Math.random() * 100000 + 1,
      _edit: true,
      name: "",
    };
    this.setState(
      {
        area_list: this.state.area_list.concat([obj]),
        area_active_key: "",
      },
      () => {
        // 将新增的顶上去
        this.scrollView.current &&
          (this.scrollView.current.scrollTop =
            this.scrollView.current.scrollHeight + 10000);
      }
    );
  };

  // 取消新增区域
  addCancel = (item) => {
    if (item.board_id) {
      // 取消编辑状态
      this.onAreaEdit(false, item);
      return;
    }
    this.setState({
      area_list: this.state.area_list.filter((val) => val.id !== item.id),
    });
    if (this.isAddAreaBtn) {
      Evt.firEvent("FeatureOnAddCancel", false);
      this.isAddAreaBtn = false;
    }
  };

  // 保存新增的区域
  saveArea = (data, name) => {
    if (!name) return message.warn("分组名称不能为空");
    // 编辑状态
    if (data.board_id) {
      Action.editAreaName(data.id, { name }, data.board_id).then((res) => {
        this.onAreaEdit(false, data);
        this.setState(
          {
            area_list: this.state.area_list.map((item) => {
              if (item.id === data.id) {
                item.name = name;
              }
              return item;
            }),
          },
          () => {
            Action.CollectionGroup = this.state.area_list;
            Event.Evt.firEvent("collectionListUpdate1", this.state.area_list);
            // console.log(Action.CollectionGroup, this.state.area_list)
          }
        );
      });
      message.success("修改成功");
      return;
    }
    let { current_board } = this.state;
    Action.addArea({ board_id: current_board.board_id, name: name }).then(
      (res) => {
        message.success("新增操作成功");
        this.setState(
          {
            area_active_key: res.data || "",
          },
          () => {
            // console.log(res);
            this.renderAreaList();
          }
        );
      }
    );
  };

  // 渲染带坐标的数据
  renderCollection = (data = [], obj, isPanelStateChange) => {
    const { config: lenged, dispatch, showFeatureName } = this.props;
    if (isPanelStateChange) {
      if (obj) {
        if (this.needDisplayAll.includes(obj.name)) {
          if (data.length > 0) {
            const nonGeojsonIndex = data.findIndex((item) => {
              return item.target !== "geojson";
            });
            const isDisplayIndex = data.findIndex((item) => {
              return item.is_display === "1";
            });
            if (nonGeojsonIndex === -1) {
              if (isDisplayIndex === -1) {
                data.forEach((item) => {
                  item.is_display = "1";
                });
              }
            }
          }
        }
        if (this.needSingleDisplayGroup.includes(obj.name)) {
          if (data.length > 0) {
            const nonGeojsonIndex = data.findIndex((item) => {
              return item.target !== "geojson";
            });
            const isDisplayData = data.filter((item) => {
              return item.is_display === "1";
            });
            if (nonGeojsonIndex === -1) {
              if (isDisplayData.length > 1) {
                isDisplayData.forEach((item, index) => {
                  if (index > 0) {
                    const index = data.findIndex(
                      (item2) => item2.id === item.id
                    );
                    data[index].is_display = "0";
                  }
                });
              }
            }
          }
        }
      }
    }
    this.allFeatureList = data;
    Action.renderCollection(data || [], { lenged, dispatch, showFeatureName });
  };

  // 获取资源列表，动态分类
  fetchCollection = () => {
    if (this.state.notRenderCollection) return;
    let params = {
      board_id: this.state.current_board.board_id,
    };
    // 发起请求后，取消轮询
    Action.clearListen();
    // 再开始轮询--优化轮询机制
    Action.getCollectionList(params).then((res) => {
      let data = res.data.sort((a, b) => a.sort - b.sort);
      // 轮询中，加入对比更新机制
      Action.oldData = data;
      // 将重组后的数据更新,保存没有关联区域的数据
      let array = this.reSetCollection(data);
      this.updateCollection(data, array);
      Action.addToListen(params);
    });
  };

  // 更新geojson数据
  updateGeojsonCollection = (data) => {
    let array = this.reSetCollection(data);
    this.updateCollection(data, array);
  };

  filterAreaListByCode = (area_list) => {
    let tmpAreaList = [];
    area_list.forEach((item) => {
      let data = JSON.parse(JSON.stringify(item));
      if (data.collection) {
        data.collection = data.collection.filter(
          (item2) => item2[this.codeType] === this.code
        );
      }
      tmpAreaList.push(data);
    });
    return tmpAreaList;
  };
  filterNotAreaIdCollectionByCode = (data) => {
    return data.filter((item) => item[this.codeType] === this.code);
  };

  // 更新某个采集资料，并且重组，刷新元素,只需要更改all_collection数据
  updateAllCollectionReset = (data) => {
    let array = this.reSetCollection(data);
    this.updateCollection(data, array);
  };
  // 更新数据
  updateCollection = (data, area_list) => {
    this.areaList = area_list;
    this.notAreaIdCollection = data
      .filter((i) => !i.area_type_id)
      .sort((a, b) => a.create_time - b.create_time);
    let tmpAreaList = this.areaList;
    let tmpNotAreaIdCollection = this.notAreaIdCollection;
    const { dispatch } = this.props;
    if (this.code) {
      tmpAreaList = this.filterAreaListByCode(area_list);
      tmpNotAreaIdCollection = this.filterNotAreaIdCollectionByCode(
        tmpNotAreaIdCollection
      );
    }
    this.setState(
      {
        all_collection: data,
        area_list: tmpAreaList,
        not_area_id_collection: tmpNotAreaIdCollection,
      },
      () => {
        dispatch({
          type: "scoutingDetail/updateDatas",
          payload: {
            collections: this.state.all_collection,
          },
        });
        let arr = [],
          obj;
        if (this.state.multipleGroup) {
          let selectArr = this.state.area_list.filter((item) =>
            this.state.area_selected.includes(item.id)
          );
          selectArr.forEach((item) => {
            arr = arr.concat(item.collection || []);
          });
        } else {
          obj =
            this.state.area_list.find(
              (item) => item.id === this.state.area_active_key
            ) || {};
          arr = obj.collection;
          this.state.area_active_key === "other" &&
            (arr = this.state.not_area_id_collection);
        }
        // 之渲染选中的区域数据

        // 只有在整理页面才需要渲染
        if (this.state.activeKey === "1") {
          this.renderCollection(arr || [], obj);
        }
        // 更新回看的列表
        let a = area_list.concat([
          {
            id: "other",
            name: "未整理",
            collection: this.state.not_area_id_collection,
          },
        ]);
        Evt.firEvent("collectionListUpdate1", a);
        Evt.firEvent("collectionListUpdate2", a);
      }
    );
  };
  // 将数据分类，更新到区域列表
  reSetCollection = (val) => {
    let data = val || [];
    data = this.getSameGroupIdData(data);
    let list = this.state.area_list.map((item) => {
      let f_list = data.filter((v) => v.area_type_id === item.id);
      item.collection = f_list.sort(
        (a, b) => (a.__index || a.sort || 0) - (b.__index || b.sort || 0)
      );
      return item;
    });
    Action.CollectionGroup = list;
    if (this.isAddAreaBtn) {
      Evt.firEvent("FeatureOnAddSure", true);
      this.isAddAreaBtn = false;
    }
    return list;
  };

  // 上传中
  filesChange = (val, file, fileList, event) => {
    let { dispatch } = this.props;
    dispatch({
      type: "uploadNormal/updateFileList",
      payload: {
        show_upload_notification: true,
        data: fileList,
      },
    });
  };
  removeUploadItem = (file) => {
    let { dispatch } = this.props;
    // 清除上传完成的列表
    setTimeout(() => {
      dispatch({
        type: "uploadNormal/uploadSuccess",
        payload: {
          uid: file.uid,
        },
      });
      Event.Evt.firEvent("uploadFileSuccess", file);
    }, 3000);
  };

  uploadPanorama = (file) => {
    Action.uploadPanorama(file).then((res) => {
      this.fileUpload({ id: this.state.area_active_key }, res.data, file);
    });
  };
  // 上传完成
  fileUpload = (val, resp, file, event) => {
    if (resp) {
      // 清除上传完成的数据
      this.removeUploadItem(file);
      message.success("上传成功");
      let { file_resource_id, suffix, original_file_name } = resp;
      let params = {
        board_id: this.state.current_board.board_id,
        area_type_id: val.id,
        collect_type: suffix === ".geojson" ? 8 : 3,
        resource_id: file_resource_id,
        target: suffix && suffix.replace(".", ""),
        title: original_file_name,
      };
      if (this.is360Pic) {
        params.collect_type = "10";
        this.is360Pic = false;
      }
      Action.addCollection(params)
        .then((res) => {
          // console.log(res);
          // 更新上传的列表
          this.fetchCollection();
        })
        .catch((err) => {
          // 添加失败
          console.log(err.message);
          message.error(err.message);
        });
    }
  };

  onAddError = (resp, file) => {
    // console.dir(resp)
    message.error(file.name + "上传失败，请稍后重试");
    this.removeUploadItem(file);
  };

  // 删除采集的资料
  onCollectionRemove = (item, collection) => {
    let { id } = collection;

    Action.removeCollection(id)
      .then((res) => {
        message.success("删除成功");
        this.setState(
          {
            all_collection: this.state.all_collection.filter(
              (i) => i.id !== id
            ),
          },
          () => {
            // 重新渲染
            let arr = this.reSetCollection(this.state.all_collection);
            // this.renderCollection();
            this.updateCollection(Array.from(this.state.all_collection), arr);
            Action.oldData = this.state.all_collection;
            this.hiddenDetail();
          }
        );
      })
      .catch((err) => {
        message.err("删除失败,请稍后重试");
        console.log(err);
      });
  };
  // 隐藏右上角的详情框
  hiddenDetail = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "collectionDetail/updateDatas",
      payload: {
        selectData: null,
        isImg: true,
      },
    });
  };
  // 取消新增
  cancelEditCollection = () => {
    message.destroy();
    // Action.removeDraw();
    this.showOtherSlide();
  };

  // 隐藏不需要的页面
  hideOtherSlide = () => {
    let { dispatch } = this.props;
    // 关闭其他不需要的元素
    dispatch({
      type: "openswitch/updateDatas",
      payload: {
        isShowBasemapGallery: false,
        isShowRightTools: false,
        isShowLeftToolBar: false,
        isShowPhotoSwipe: false,
      },
    });
  };

  // 显示被隐藏的元素
  showOtherSlide = () => {
    let { dispatch } = this.props;
    // 关闭其他不需要的元素
    dispatch({
      type: "openswitch/updateDatas",
      payload: {
        isShowBasemapGallery: true,
        isShowRightTools: true,
        isShowLeftToolBar: true,
        isShowPhotoSwipe: true,
      },
    });
  };

  onEditCollection = async (editType, val, name) => {
    let { dispatch, selectData } = this.props;
    let params = {};
    let { id } = val;
    if (editType === "editCoordinate") {
      message.success("点击地图中的任意位置可设定坐标，可以拖动调整", 0);
      // 隐藏
      this.hideOtherSlide();
      setTimeout(() => {
        this.hiddenDetail();
      }, 50);
      // 添加坐标点的事件
      val.title = val.name || val.title;
      let coor = await Action.addCollectionCoordinates(
        false,
        val
      ).catch((err) => console.log(err));
      if (coor) {
        coor.longitude = coor.longitude.toString();
        coor.latitude = coor.latitude.toString();
        params = {
          id,
          title: val.name,
          location: {
            ...coor,
            site_name: val.title,
          },
        };
        let resData = await window.CallWebMapFunction("getCityByLonLat", {
          lon: params.location.longitude,
          lat: params.location.latitude,
        });
        params.districtcode = resData.addressComponent?.adcode;
        this.setState({
          all_collection: this.state.all_collection.map((item) => {
            if (item.id === id) {
              item.location = params.location;
            }
            return item;
          }),
        });
      } else {
        this.cancelEditCollection();
        return Promise.reject("取消了");
      }
    } else if (editType === "editName") {
      if (!name || name === val.name) {
        return;
      }
      params = {
        title: name,
        id,
      };
    }
    // 执行保存
    Action.editCollection(params)
      .then((resp) => {
        // console.log(res);
        this.cancelEditCollection();
        // this.fetchCollection();
        let arr = Array.from(this.state.all_collection);
        arr = arr.map((item) => {
          if (item.id === id) {
            item.title = name || val.title;
          }
          return item;
        });
        // 更新数据列表，会更新地图标绘数据
        this.updateAllCollectionReset(arr);
        let f = editType === "editCoordinate" ? "关联坐标完成" : "修改名称完成";
        message.success(f);
        if (selectData && editType === "editName") {
          selectData.id === id &&
            dispatch({
              type: "collectionDetail/updateDatas",
              payload: {
                selectData: { ...selectData, title: name },
              },
            });
        }
      })
      .catch((err) => {
        console.log(err);
        this.cancelEditCollection();
      });
  };
  // 选中了分组
  onSelectGroup = async (group, data, isMultiple) => {
    let { all_collection } = this.state;
    // console.log(group,data)
    let params = {
      id: data.id,
      area_type_id: group.id,
      board_id: this.state.current_board.board_id,
    };
    if (data.group_id) {
      await this.CollectionReMerge(data);
    }
    Action.editCollection(params).then((res) => {
      // console.log(res)
      if (!isMultiple) {
        message.success(
          <span>
            已将<a>{data.title}</a>
            移动到<a>{group.name}</a>
            分组
          </span>
        );
        // this.fetchCollection();
        let arr = Array.from(all_collection);
        arr = arr.map((item) => {
          if (item.id === data.id) {
            item.area_type_id = group.id;
          }
          return item;
        });
        this.updateAllCollectionReset(arr);
      }
    });
  };

  // 多选数据进行展示
  onMultipleSelectGroup = (val, id) => {
    let arr = Array.from(this.state.area_selected);
    if (val.target.checked) {
      arr.push(id);
    } else {
      arr = arr.filter((item) => item !== id);
    }
    this.setState(
      {
        area_selected: arr,
      },
      () => {
        let data = [...this.state.area_list];
        let selectData = [];
        arr.forEach((item) => {
          let obj = data.find((d) => d.id === item);
          if (obj) {
            selectData = selectData.concat(obj.collection || []);
          }
        });
        this.renderCollection(selectData);
      }
    );
  };

  onAreaDelete = (val) => {
    if (val.collection && val.collection.length) {
      return message.error("分组中存在数据，无法删除");
    }
    Action.RemoveArea(val.id, val.board_id)
      .then((res) => {
        if (res && res.code === "0") {
          message.success("删除成功");
          let arr = this.state.area_list.filter((item) => item.id !== val.id);
          this.setState({
            area_list: arr,
            multipleGroup: this.state.multipleGroup ? arr.length > 1 : false,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(`${err.message},请刷新再试。`);
      });
  };
  // 编辑名称
  onAreaEdit = (flag, val) => {
    let data = { ...val, _edit: flag };
    let list = [...this.state.area_list];

    let arr = list.map((item) => {
      if (item.id === val.id) {
        item = data;
      }
      return item;
    });
    this.setState({
      area_list: arr,
    });
  };

  renderGroupPointer = () => {
    Action.renderGroupPointer(this.state.area_list);
  };
  clearGroupPointer = () => {
    Action.clearGroupPointer();
  };

  // 点击panel时的回调
  setActiveCollapse = (key) => {
    window.ProjectGroupId = key;
    this.setState({ area_active_key: key });
    if (this.state.multipleGroup) return;
    // 关闭的时候，全部清空
    if (!key) {
      this.renderCollection([]);
      this.renderGroupPointer();
      Action.clearGroupCollectionPoint();
    } else {
      this.clearGroupPointer();
    }
    this.hiddenDetail();
    this.setState({ area_selected: [key] });
    if (key) {
      let obj = this.state.area_list.find((item) => item.id === key);
      if (obj) {
        window.ProjectGroupName = obj.name;
        this.renderCollection(obj.collection || [], obj, true);
      } else {
        this.renderCollection(this.state.not_area_id_collection || []);
      }
    }
  };

  // 计划图开始上传
  onUploadPlanStart = () => {
    this.hideOtherSlide();
  };

  // 计划图取消上传
  onUploadPlanCancel = () => {
    this.showOtherSlide();
  };

  // 上传规划图
  onUploadPlan = (val, resp, filelist, setData, firstSave) => {
    this.showOtherSlide();
    // console.log(resp);
    if (resp) {
      message.success("上传成功");
      let content =
        setData && firstSave
          ? {
              content: firstSave.data.id,
            }
          : {
              content: resp.id,
            };
      let { id, name } = resp;

      let params = {
        board_id: this.state.current_board.board_id,
        area_type_id: val.id,
        collect_type: 5,
        ...content,
        resource_id: id,
        target: "plan",
        title: name,
      };
      Action.addCollection(params)
        .then((res) => {
          // console.log(res);
          // 更新上传的列表
          this.fetchCollection();
        })
        .catch((err) => {
          // 添加失败
          console.log(err.message);
          message.error(err.message);
        });
    }
  };

  // 切换显示隐藏
  onChangeDisplay = (val, collection) => {
    // 如果是要单个展示的分组
    if (this.needSingleDisplayGroup.includes(val.name)) {
      if (val.collection.length > 0) {
        let is_display = collection.is_display;
        let param = {
          id: collection.id,
          is_display: is_display === "1" ? "0" : "1",
        };
        let tmpAllCollection = this.state.all_collection;
        let index = tmpAllCollection.findIndex((item) => {
          return item.id === param.id;
        });
        if (index > -1) {
          tmpAllCollection[index].is_display = param.is_display;
        }
        Action.editCollection(param);
        if (param.is_display === "1") {
          let currentCollection = val.collection;
          for (let i = 0; i < currentCollection.length; i++) {
            if (currentCollection[i].target === "geojson") {
              if (currentCollection[i].id === collection.id) {
                continue;
              }
              if (currentCollection[i].is_display === "1") {
                Action.editCollection({
                  id: currentCollection[i].id,
                  is_display: 0,
                });
                let index = tmpAllCollection.findIndex((item) => {
                  return item.id === currentCollection[i].id;
                });
                if (index > -1) {
                  tmpAllCollection[index].is_display = "0";
                }
              }
            }
          }
        }
        this.updateAllCollectionReset(tmpAllCollection);
      }
    } else {
      // console.log(val, collection)
      let is_display = collection.is_display;
      let param = {
        id: collection.id,
        is_display: is_display === "1" ? "0" : "1",
      };
      let arr = this.state.all_collection.map((item) => {
        if (item.id === collection.id) {
          collection.is_display = param.is_display;
          item = collection;
        }
        return item;
      });
      this.updateAllCollectionReset(arr);
      Action.editCollection(param);
    }
  };
  // 编辑规划图
  onEditPlanPic = (val, collection) => {
    const { dispatch } = this.props;
    const baseMapKeys = mapApp.baseMapKeys;
    const baseMapKey = mapApp.baseMapKey;
    // console.log(val,collection)
    this.hideOtherSlide();
    this.hiddenDetail();
    let img = Action.findImgLayer(collection.resource_id);
    Action.setEditPlanPicLayer(val, img, dispatch, collection)
      .then(async (resp) => {
        let param = {
          extent: resp.extent.join(","),
          transparency: resp.opacity,
          coord_sys_type: baseMapKeys[0].indexOf(baseMapKey) > -1 ? 0 : 1,
        };
        this.showOtherSlide();
        let imgid = collection.resource_id;
        if (resp.blobFile) {
          imgid = collection.content;
          let formdata = new FormData();
          formdata.append("file", resp.blobFile);
          formdata.append("extent", param.extent);
          formdata.append("transparency", param.transparency);
          formdata.append("coord_sys_type", param.coord_sys_type);
          let saved = await Axios.post(`/api/map/ght/${val.id}`, formdata, {
            headers: { Authorization: BASIC.getUrlParam.token },
          });

          await Action.editCollection({
            id: collection.id,
            resource_id: saved.data.data.id,
          });
        }

        Action.saveEditPlanPic(imgid, param).then((res) => {
          message.success(`修改${collection.title}成功`);
          this.fetchCollection();
        });
      })
      .catch((err) => {
        if (err.code === -1) {
          /**message.warn(err.message)*/
        } else message.error(err.message);
        this.showOtherSlide();
      });
  };
  //
  audioDistory = () => {
    // 页面清除了
  };

  onRemarkSave = (data) => {
    Action.modifyRemark(data).then((res) => {
      this.fetchCollection();
    });
  };

  //激活编辑几何图形
  onModifyFeatureInDetails = (data) => {
    const { displayPlotPanel } = this.props;
    Action.modifyFeature(data, displayPlotPanel);
  };

  //停止编辑几何图形
  onStopMofifyFeatureInDetails = () => {
    Action.stopModifyFeature();
  };

  onToggleChangeStyle = (val) => {
    this.setState({
      activeId: val.id,
    });
  };
  // 复制collection
  onCopyCollection = (val, collection, isMultiple = false) => {
    let obj = {
      collect_type: collection.collect_type,
      title: collection.title,
      target: collection.target,
      area_type_id: val.id,
      board_id: val.board_id,
      content: collection.content,
    };
    // console.log(obj)
    return Action.addCollection(obj).then((res) => {
      if (!isMultiple) {
        message.success(
          <span>
            已将<a>{collection.title}</a>
            复制到<a>{val.name}</a>
            分组
          </span>
        );
        // this.fetchCollection();
        this.updateAllCollectionReset([
          ...this.state.all_collection,
          res.data[0],
        ]);
      }
      return res.data[0];
    });
  };

  //
  onBeforeUploadPlan = () => {};
  onExcelSuccess = (arr) => {
    this.fetchCollection();
  };

  // 设置多选
  setMultipleCheck = () => {
    this.setState({ multipleGroup: !this.state.multipleGroup });
  };

  // 拖拽排序
  onCollectionDragEnd = (data, result) => {
    let ondragId = data.id;
    // return message.warn('排序功能暂未开放');
    if (
      !result.destination ||
      result.source.index === (result.destination && result.destination.index)
    ) {
      return;
    }
    // 重新记录数组顺序
    const reorder = (list, startIndex, endIndex) => {
      let result = Array.from(list);
      //删除并记录 删除元素
      const [removed] = result.splice(startIndex, 1);
      //将原来的元素添加进数组
      result.splice(endIndex, 0, removed);
      result = result.map((item, index) => {
        item.__index = index + 1;
        return item;
      });
      return result;
    };

    let area_list = Array.from(this.state.area_list);

    // 找到当前拖拽的分组
    let obj = area_list.find((item) => item.id === ondragId);
    const items = reorder(
      obj ? obj.collection : [],
      result.source.index,
      result.destination.index
    );
    // 重组
    area_list = area_list.map((item) => {
      if (item.id === ondragId) {
        item.collection = items.sort((a, b) => a.__index - b.__index);
      }
      return item;
    });
    // 清除定时器
    clearTimeout(this.saveSortTimer);
    this.setState(
      {
        area_list,
      },
      () => {
        this.saveSortTimer = setTimeout(() => {
          this.saveSort(items);
        }, this.saveSortTime);
      }
    );
  };
  // 保存排序列表
  saveSort = (data) => {
    let ids = [];
    // 合并所有的id
    data.forEach((item) => {
      if (item.type === "groupCollection") {
        ids = ids.concat(item.childIds);
      } else {
        ids.push(item.id);
      }
    });
    let param = {
      board_id: this.state.current_board.board_id,
      sort: ids,
    };
    // 调用保存
    Action.saveSortCollection(param);
  };
  // 查询最近一组中含有采集数据的分组,添加选中，默认播放选中分组
  getFirstAreaCollection = (index) => {
    for (let i = index; i < this.state.area_list.length; i++) {
      let item = this.state.area_list[i];
      if (this.state.area_active_key) {
        if (this.state.area_active_key === item.id) {
          return item;
        }
      } else if (item.collection && item.collection.length) {
        return item;
      }
    }
  };

  // 停止播放
  StopPlay = () => {
    this.setState({
      isPlay: false,
      playing: false,
      currentGroup: {},
    });
    this.showOtherSlide();
    this.fetchCollection();
    PlayCollectionAction.stop();
    Action.addToListen({ board_id: this.state.current_board.board_id });
  };

  // 播放下一组
  playNextGroup = () => {
    PlayCollectionAction.stop();
    // 如果有下一组
    let next = this.checkHasNextGroup();
    if (next) {
      this.startPlayCollection("", next);
      Evt.firEvent("autoPlayChange");
    }
  };

  // 播放上一组
  playPrevGroup = () => {
    PlayCollectionAction.stop();
    let prev = this.checkHasPrevGroup();
    if (prev) {
      this.startPlayCollection("", prev);
      Evt.firEvent("autoPlayChange");
    }
  };
  // 检查是否有goupId，有的话就合并
  getSameGroupIdData = (data) => {
    if (!data.length) return [];
    let arr = [];
    data.forEach((item) => {
      if (item.group_id) {
        // 查找有没有已经存在同一个group_id的数据，如果有，就添加到子集
        let hasGroup = arr.find((a) => a.gid === item.group_id);
        // 如果存在一个groupid，就添加
        if (hasGroup && hasGroup.child) {
          hasGroup.child.push(item);
          // 保存存在的子集id
          hasGroup.childIds.push(item.id);
        } else if (hasGroup) {
          hasGroup.child = [item];
          hasGroup.childIds = [item.id];
        } else {
          // 如果不存在，就创建
          let obj = {
            gid: item.group_id,
            title: "",
            id: item.id,
            area_type_id: item.area_type_id,
            collect_type: "group",
            target: "none",
            type: "groupCollection",
            childIds: [item.id],
            child: [item],
            create_by: {},
            sort: item.sort,
            __index: item.__index,
          };
          arr.push(obj);
        }
      } else arr.push(item);
    });

    // 过滤只有一个分组的情况
    arr = arr.map((item) => {
      if (item.gid && item.child.length === 1) {
        return item.child[0];
      } else return item;
    });
    return arr;
  };

  // 检查有没有下一个
  checkHasNextGroup = () => {
    let current = this.state.currentGroup ? { ...this.state.currentGroup } : {};
    let index = this.state.area_list.findIndex(
      (item) => item.id === current.id
    );
    if (index !== -1) {
      let next = this.state.area_list[index + 1];
      if (next) {
        if (next.collection && next.collection.length) return next;
        else {
          for (let i = index + 1; i < this.state.area_list.length; i++) {
            let item = this.state.area_list[i];
            if (item.collection && item.collection.length) {
              return item;
            }
          }
        }
      } else return undefined;
    } else return undefined;
  };
  // 检查有没有上一个
  checkHasPrevGroup = () => {
    let current = this.state.currentGroup ? { ...this.state.currentGroup } : {};
    let index = this.state.area_list.findIndex(
      (item) => item.id === current.id
    );
    if (index !== -1) {
      if (index === 0) {
        return undefined;
      }
      let prev = this.state.area_list[index - 1];
      if (prev) {
        if (prev.collection.length) return prev;
        else {
          for (let i = index - 1; i >= 0; i--) {
            let item = this.state.area_list[i];
            if (item.collection && item.collection.length) {
              return item;
            }
          }
        }
      } else return undefined;
    } else return undefined;
  };
  // 开始播放
  startPlayCollection = (mode, areaData, index = 0) => {
    // 获取有数据的分组，不包含未分组区域
    let data = [];
    if (areaData && areaData.collection.length) {
      data = areaData;
    } else {
      data = this.getFirstAreaCollection(index);
      !data && (data = {});
    }
    // 过滤空坐标信息
    let collection =
      data.collection &&
      data.collection.filter(
        (item) => item.is_display === "1" || item.type === "groupCollection"
      );
    if (!collection || (collection && !collection.length))
      return message.warn("当前分组没有数据可以进行播放");
    let arr = [];
    collection.forEach((item) => {
      if (
        item.collect_type !== "4" &&
        item.collect_type !== "5" &&
        item.collect_type !== "group"
      ) {
        if (item.location && item.location.hasOwnProperty("latitude")) {
          arr.push(item);
        }
      } else arr.push(item);
    });
    let flag = PlayCollectionAction.setData(
      mode,
      arr.sort((a, b) => (a.__index || 0) - (b.__index || 0))
    );
    if (flag) {
      // 发起请求后，取消轮询
      Action.clearListen();
      PlayCollectionAction.play();
      this.hideOtherSlide();
      this.setState(
        {
          isPlay: true,
          playing: true,
          currentGroup: data,
        },
        () => {
          // 检查是不是有上一个和下一个，自动过滤没有任何数据的
          let next = this.checkHasNextGroup();
          let prev = this.checkHasPrevGroup();
          this.setState({
            notNextGroup: !next,
            notPrevGroup: !prev,
          });
        }
      );
    }
  };
  // 退出合并
  CollectionReMerge = (collection) => {
    return new Promise((resolve, reject) => {
      let param = {
        data_id: collection.id,
      };
      Action.cancelMergeCollection(param)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          message.warn(err.message);
          reject(err);
        });
    });
  };

  // 上下合并,取消合并
  CollectionMerge = async (type, data, collection, index) => {
    let current = data.collection;
    let other = null;
    let ids = [];
    if (type === "up") {
      other = current[index - 1];
      ids = [other.id, collection.id];
    }
    if (type === "down") {
      other = current[index + 1];
      ids = [collection.id, other.id];
    }
    let array = Array.from(this.state.all_collection);
    // 保存
    if (ids.length)
      Action.saveMergeCollection({ data_ids: ids }).then((res) => {
        message.success("操作成功");
        // this.fetchCollection();
        let g_id = [],
          list = [];
        let arr = array.filter((item) => ids.includes(item.id));
        g_id = arr.map((item) => item.group_id).filter((v) => v);
        if (g_id.length) {
          // 两个拥有groupId的数据，合并抹除掉其中一个
          if (g_id.length > 1) {
            let oldId = g_id[1];
            let newId = g_id[0];
            list = array.map((item) => {
              if (ids.includes(item.id)) {
                item.group_id = newId;
              }
              if (item.group_id === oldId) {
                item.group_id = newId;
              }
              return item;
            });
          } else if (g_id.length === 1) {
            list = array.map((item) => {
              if (ids.includes(item.id)) {
                item.group_id = g_id[0];
              }
              return item;
            });
          }
        } else {
          let mgId = Math.round(Math.random() * 1000000 + 1);
          list = array.map((item) => {
            if (ids.includes(item.id)) {
              item.group_id = mgId;
            }
            return item;
          });
        }
        this.updateAllCollectionReset(list);
      });
    // 退出这个组合
    if (type === "cancel") {
      await this.CollectionReMerge(collection);
      message.success("操作成功");
      array = array.map((item) => {
        if (item.id === collection.id) {
          item.group_id = "";
        }
        return item;
      });
      this.updateAllCollectionReset(array);
      // this.fetchCollection();
    }
  };

  toPlayCollection = (data) => {
    // console.log(data)
    let { mode, time, showone } = data;
    PlayCollectionAction.playMode = mode;
    PlayCollectionAction.autoPlayTime = time;
    PlayCollectionAction.justShowOne = showone;

    // 开始播放
    this.startPlayCollection(mode);
    this.setState({ playCollectionVisible: false });
  };
  // 选中采集资料，可以打开右上角的详情
  checkItem = (val) => {
    const { dispatch } = this.props;
    let type = Action.checkCollectionType(val.target);
    // if(val.collect_type === '4'){
    let feature = Action.getFeatureById(val.id);
    if (feature) {
      let geo = feature.getGeometry();
      let properties = this.getProperties(geo.getType(), geo);
      val = Object.assign({}, { properties_map: properties }, val);
    }
    // }
    dispatch({
      type: "collectionDetail/updateDatas",
      payload: {
        selectData: val,
        selectedFeature: feature,
        type: "edit",
        isImg: type === "pic" || type === "video" || type === "interview",
      },
    });
    Action.handleCollectionPoint(val);
  };

  CollectionViewScroll = (e) => {
    // console.log(e)
    let target = e.target;
    this.collectionScrollTop = target.scrollTop;
  };

  // 鼠标滚轮滚动
  collectionWhell = (e) => {
    let whellY = e.deltaY;
    if (this.collectionScrollTop === 0 && whellY < 0) {
      // console.log('向上滚动到顶了');
      this.setState({
        miniTitle: false,
      });
    } else if (this.collectionScrollTop > 0 && whellY > 0) {
      // console.log('向下滚动中')
      this.setState({
        miniTitle: true,
      });
    }
  };
  // 触摸事件
  move = (evt) => {
    if (!this.isTouch) return;
    let touchM = this.getTouch(evt);
    let y = touchM.y - this.touchStartClient.y;
    if (y > 0 && this.collectionScrollTop === 0) {
      // console.log('滑动到顶了');
      this.setState({
        miniTitle: false,
      });
    } else if (y < 0 && this.collectionScrollTop > 0) {
      // console.log('往下滑动')
      this.setState({
        miniTitle: true,
      });
    }

    this.touchStartClient = touchM;
  };
  collectionTouchStart = (e) => {
    if (e.pointerType === "mouse") return;
    this.isTouch = true;
    this.touchStartClient = this.getTouch(e);
  };

  getTouch = (e) => {
    return { x: e.layerX || e.pageX, y: e.layerY || e.pageY };
  };
  onPlanRef = (ref) => {
    this.planRef = ref;
  };

  PublicView = ({ children, height }) => {
    let { miniTitle } = this.state;
    let h = height
      ? height
      : miniTitle
      ? "calc(100vh - 150px)"
      : "calc(100vh - 415px)";
    return (
      <div
        className={styles.publicview}
        style={{ display: "flex", flexDirection: "column", height: h }}
        ref={this.scrollView}
        onScroll={this.CollectionViewScroll}
        onWheel={this.collectionWhell}
        onPointerDown={this.collectionTouchStart}
        onPointerMove={this.move}
        onPointerOut={() => {
          this.isTouch = false;
        }}
      >
        {children}
      </div>
    );
  };

  // 设置分类坐标点
  onSetCoordinates = async (val) => {
    message.success(
      <span>
        选取一个坐标设置为分类展示点 或{" "}
        <a
          onClick={(e) => {
            e.stopPropagation();
            this.cancelEditCollection();
          }}
        >
          取消选择
        </a>
      </span>,
      0
    );
    val.title = val.name;
    let res = await Action.addCollectionPosition(val);
    // console.log(res);
    let { feature } = res;
    let coor = feature.getGeometry().getCoordinates();
    let resp = await Action.setGropCoordinates(val.id, {
      coordinate: coor,
    }).catch((err) => console.log(err));
    let arr = Action.transform(coor);
    if (resp) {
      message.success("保存成功");
      this.cancelEditCollection();
      let list = this.state.area_list.map((item) => {
        if (item.id === val.id) {
          item.longitude = arr[0];
          item.latitude = arr[1];
        }
        return item;
      });

      // 更新全局的分组数据，不需要请求
      this.updateCollection(Array.from(this.state.all_collection), list);

      // 闭合分组
      this.setActiveCollapse("");
      // 渲染分类坐标
      this.renderGroupPointer();
      Action.clearGroupCollectionPoint();
    }
  };

  selectionCollection = (val) => {
    this.setState({
      selections: val,
    });
  };
  onNotAreaIdSelection = (val) => {
    this.setState({
      notAreaIdSelections: val,
    });
  };
  // 多选删除
  onMultipleRemove = () => {
    let arr = [...this.state.selections, ...this.state.notAreaIdSelections];
    let list = Array.from(this.state.all_collection);
    if (!arr.length) return;
    (async () => {
      for (let i = 0; i < arr.length; i++) {
        Action.removeCollection(arr[i]).catch((err) => console.log(err));
      }
    })();
    list = list.filter((item) => !arr.includes(item.id));
    this.setState(
      {
        all_collection: list,
        notAreaIdSelections: [],
        selections: [],
      },
      () => {
        message.success("删除成功");
        this.hiddenDetail();
        this.updateAllCollectionReset(list);
        Action.oldData = list;
      }
    );
  };

  // 渲染分组列表
  GroupSelection = ({ onSelect }) => {
    const { area_list, selections, notAreaIdSelections } = this.state;
    let arr = Array.from([...selections, ...notAreaIdSelections]);
    const selectGroup = (val) => {
      onSelect && onSelect(val);
    };
    // 过滤选中的分组，选中的不能出现在列表中
    let selectAreaId = this.state.all_collection.filter((item) =>
      arr.includes(item.id)
    );
    selectAreaId = selectAreaId.map((item) => item.area_type_id);
    return (
      <div className={styles.selectActionGroup}>
        {area_list.map((item) => {
          if (selectAreaId.includes(item.id)) {
            return "";
          } else
            return (
              <div
                key={item.id}
                onClick={() => selectGroup(item)}
                style={{ cursor: "pointer" }}
              >
                {item.name}
              </div>
            );
        })}
      </div>
    );
  };

  onRecoverGeojsonIcon = (data) => {
    geojsonResource
      .delete(data.id)
      .then((res) => {
        if (res && res.code === "0") {
          message.success("已恢复默认图标");
          Action.reRenderGeojson();
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };

  onModifyGeojsonIcon = (data) => {
    let geojsonResources = Action.getGeojsonIcon();
    let icon = geojsonResources[data.id];
    if (!icon) {
      message.info("该图层不支持更换图标。");
    } else {
      Event.Evt.firEvent("openModifyPointPanel", icon);
      Event.Evt.un("modifyGeojsonIcon");
      Event.Evt.on("modifyGeojsonIcon", (icon) => {
        geojsonResource
          .add({
            geojson_id: data.id,
            image_base64: icon,
          })
          .then((res) => {
            if (res && res.code === "0") {
              message.success("更改图标完成。");
              Action.reRenderGeojson();
            }
          })
          .catch((e) => {
            message.error(e.message);
          });
      });
    }
  };

  MultipleMenus = () => {
    const onHandle = ({ key }) => {
      if (key === "coordinates") {
        let arr = [...this.state.selections, ...this.state.notAreaIdSelections];
        if (!arr.length) return message.warn("未选择任何采集坐标点");
        let selection = this.state.all_collection.filter((item) =>
          arr.includes(item.id)
        );
        let m = selection.filter(
          (item) => item.target === "feature" || item.target === "plan"
        );
        if (m.length)
          return message.warn(
            "勾选数据存在标绘或者规划图，无法进行批量关联坐标点，请取消"
          );

        setHide();
        this.hideOtherSlide();
        message.success(`点击地图中的任意位置可设定坐标，可以拖动调整`, 0);
        this.hiddenDetail();
        Action.addCollectionCoordinates(true, {})
          .then((val) => {
            val.longitude = val.longitude.toString();
            val.latitude = val.latitude.toString();
            let p = selection.map((item) => {
              return Action.editCollection({
                id: item.id,
                title: item.name,
                location: {
                  ...val,
                  site_name: val.title,
                },
              });
            });
            Promise.all(p)
              .then(() => {
                message.success("保存成功");
                let array = Array.from(this.state.all_collection);
                array = array.map((item) => {
                  if (arr.includes(item.id)) {
                    item.location = val;
                  }
                  return item;
                });
                this.updateAllCollectionReset(array);
              })
              .catch((err) => {
                console.log(err);
              });
            message.destroy();
            this.showOtherSlide();
          })
          .catch((err) => {
            console.log(err);
            this.showOtherSlide();
            message.destroy();
          });
      }
    };
    const setHide = () => {
      this.setState({
        showMoreAction: false,
      });
    };
    const onSelect = (type, val) => {
      let { selections, notAreaIdSelections } = this.state;
      let arr = [...selections, ...notAreaIdSelections];
      let selectArr = this.state.all_collection.filter((item) =>
        arr.includes(item.id)
      );
      if (!arr.length) return message.warn("未选择采集资料");
      if (type === "copy") {
        let notA = selectArr.filter((item) => item.collect_type !== "4");
        if (notA.length) {
          return message.warn("非标绘数据暂不支持复制，请取消勾选");
        }
      }
      let promise = selectArr.map((item) => {
        if (type === "copy") {
          return this.onCopyCollection(val, item, true);
        } else {
          return this.onSelectGroup(val, item, true);
        }
      });
      Promise.all(promise).then((res) => {
        if (type === "copy") {
          this.updateAllCollectionReset([...this.state.all_collection, ...res]);
          message.success(
            <span>
              复制到 <a>{val.name}</a> 分组完成
            </span>
          );
        } else {
          let array = Array.from(this.state.all_collection);
          array.map((item) => {
            if (arr.includes(item.id)) {
              item.area_type_id = val.id;
            }
            return item;
          });
          this.updateAllCollectionReset(array);
          message.success(
            <span>
              移动到 <a>{val.name}</a> 分组完成
            </span>
          );
        }
        setTimeout(() => {
          this.setState({
            notAreaIdSelections: [],
            selections: [],
          });
        });
      });
      // console.log(type,val)
      setHide();
    };
    return (
      <Menu onClick={onHandle}>
        <Menu.Item key="copy">
          <Popover
            trigger="click"
            visible={this.state.setCopyVisible}
            onVisibleChange={(val) => this.setState({ setCopyVisible: val })}
            title="选择复制到哪个分组"
            overlayStyle={{ zIndex: 1050 }}
            content={() =>
              this.GroupSelection({ onSelect: onSelect.bind(this, "copy") })
            }
          >
            <div>复制到分组</div>
          </Popover>
        </Menu.Item>
        <Menu.Item key="move">
          <Popover
            trigger="click"
            visible={this.state.setMoveVisible}
            onVisibleChange={(val) => this.setState({ setMoveVisible: val })}
            title="选择移动到哪个分组"
            overlayStyle={{ zIndex: 1050 }}
            content={() =>
              this.GroupSelection({ onSelect: onSelect.bind(this, "move") })
            }
          >
            <div>移动到分组</div>
          </Popover>
        </Menu.Item>
        <Menu.Item key="coordinates">关联坐标</Menu.Item>
        <Menu.Item key="remove">
          <Popconfirm
            title={`确定删除选中的${
              [...this.state.selections, ...this.state.notAreaIdSelections]
                .length
            }个采集资料吗？`}
            onConfirm={() => {
              this.onMultipleRemove();
              setHide();
            }}
            okText="删除"
            cancelText="取消"
            overlayStyle={{ zIndex: 1050 }}
          >
            <div className="danger">删除</div>
          </Popconfirm>
        </Menu.Item>
      </Menu>
    );
  };

  renderForActive = (key) => {
    const {
      area_list,
      not_area_id_collection,
      activeId,
      current_board,
    } = this.state;
    const defaultHeight = this.state.miniTitle
      ? "calc(100vh - 100px)"
      : "calc(100vh - 370px)";
    const defaultHeight2 = this.state.miniTitle
      ? "calc(100vh - 190px)"
      : "calc(100vh - 430px)";
    const { dispatch } = this.props;
    const { PublicView } = this;
    switch (key) {
      case "1":
        return (
          <Fragment>
            <PublicView>
              <Collapse
                onChange={(e) => {
                  this.setActiveCollapse(e);
                }}
                className={styles.scoutingItem}
                accordion={true}
                activeKey={this.state.area_active_key}
                expandIconPosition="left"
                expandIcon={({ isActive }) => (
                  <CaretRightOutlined rotate={isActive ? 90 : 0} />
                )}
              >
                {area_list.map((item, index) => {
                  let activeStyle = null;
                  if (item.id === activeId) {
                    activeStyle = { backgroundColor: "rgba(214,228,255,0.5)" };
                  }
                  if (item.collect_type === "9") {
                    this.publicDataLinkArr.push({ key: "", children: [] });
                  }
                  return (
                    <Collapse.Panel
                      header={
                        <ScoutingHeader
                          selected={this.state.area_selected}
                          onSelect={this.onMultipleSelectGroup}
                          onAreaEdit={this.onAreaEdit.bind(this, true)}
                          total={item.length}
                          data={item}
                          board={item}
                          activeKey={this.state.area_active_key}
                          index={index + 1}
                          edit={item._edit}
                          remarkEdit={item._remarkEdit}
                          onCancel={this.addCancel.bind(this, item)}
                          onSave={this.saveArea.bind(this, item)}
                          onRemarkSave={() => this.saveRemark(item)}
                          multiple={this.state.multipleGroup}
                          onUploadPlanStart={this.onUploadPlanStart.bind(
                            this,
                            item
                          )}
                          uploadPanorama={this.uploadPanorama}
                          onChange={this.filesChange.bind(this, item)}
                          onUpload={this.fileUpload.bind(this, item)}
                          onUploadPlan={this.onUploadPlan.bind(this, item)}
                          onUploadPlanCancel={this.onUploadPlanCancel}
                          onError={this.onAddError}
                          onAreaDelete={this.onAreaDelete}
                          onExcelSuccess={this.onExcelSuccess}
                          dispatch={dispatch}
                          onSetCoordinates={this.onSetCoordinates}
                          parentTool={this.props.parentTool}
                          boardId={this.state.current_board.board_id}
                          parent={this}
                          // onDragEnter={e => {this.setState({area_active_key: item.id})}}
                        />
                      }
                      key={item.id}
                      style={{ backgroundColor: "#fff", marginBottom: "10px" }}
                    >
                      <ScoutingItem
                        parent={this}
                        index={this.publicDataLinkArr.length - 1}
                        callback={this.renderAreaList}
                        onSelectCollection={this.selectionCollection}
                        CollectionEdit={this.state.isEdit}
                        board={this.state.current_board}
                        selected={this.state.selections}
                        // dispatch={dispatch}
                        onCheckItem={this.checkItem}
                        // onDrop={()=> console.log(item)}
                        style={activeStyle}
                        data={item}
                        onSelectGroup={this.onSelectGroup}
                        dataSource={item.collection}
                        areaList={area_list}
                        onCollectionRemove={this.onCollectionRemove.bind(
                          this,
                          item
                        )}
                        onEditCollection={this.onEditCollection}
                        onChangeDisplay={this.onChangeDisplay.bind(this, item)}
                        onEditPlanPic={this.onEditPlanPic.bind(this, item)}
                        onRemarkSave={this.onRemarkSave}
                        onModifyRemark={this.onModifyRemark}
                        onModifyFeature={this.onModifyFeatureInDetails}
                        onStopMofifyFeatureInDetails={() =>
                          this.onStopMofifyFeatureInDetails()
                        }
                        onToggleChangeStyle={this.onToggleChangeStyle}
                        onCopyCollection={this.onCopyCollection}
                        onDragEnd={this.onCollectionDragEnd}
                        onMergeDown={this.CollectionMerge.bind(
                          this,
                          "down",
                          item
                        )}
                        onMergeUp={this.CollectionMerge.bind(this, "up", item)}
                        onMergeCancel={this.CollectionMerge.bind(
                          this,
                          "cancel",
                          item
                        )}
                        onRecoverGeojsonIcon={this.onRecoverGeojsonIcon}
                        onModifyGeojsonIcon={this.onModifyGeojsonIcon}
                      />
                    </Collapse.Panel>
                  );
                })}
                {/* 没有未分组数据的时候，不显示未分组 */}
                {not_area_id_collection.length && (
                  <Collapse.Panel
                    key="other"
                    style={{ backgroundColor: "#fff", marginBottom: "10px" }}
                    header={
                      <ScoutingHeader
                        data={{ name: "未整理", id: "other" }}
                        total={not_area_id_collection.length}
                        edit={false}
                        activeKey={this.state.area_active_key}
                        index={area_list.length + 1}
                        onCancel={() => {}}
                        onSave={() => {}}
                        // onDragEnter={e => {this.setState({area_active_key: item.id})}}
                      />
                    }
                  >
                    {!!not_area_id_collection.length ? (
                      <Checkbox.Group
                        onChange={this.onNotAreaIdSelection}
                        style={{ width: "100%" }}
                        value={this.state.notAreaIdSelections}
                      >
                        <div className={styles.norAreaIdsData}>
                          {not_area_id_collection.map((item, index) => {
                            let activeStyle = null;
                            if (item.id === activeId) {
                              activeStyle = {
                                backgroundColor: "rgba(214,228,255,0.5)",
                              };
                            }
                            return (
                              <div
                                key={item.id}
                                className={`${animateCss.animated} ${animateCss.slideInRight}`}
                                style={{
                                  animationDuration: "0.3s",
                                  animationDelay: index * 0.02 + "s",
                                  width: "100%",
                                }}
                              >
                                {item.collect_type !== "9" ? (
                                  <UploadItem
                                    Edit={this.state.isEdit}
                                    onCheckItem={this.checkItem}
                                    style={activeStyle}
                                    data={item}
                                    parent={this}
                                    type={Action.checkCollectionType(
                                      item.target
                                    )}
                                    areaList={area_list}
                                    onSelectGroup={this.onSelectGroup}
                                    onRemove={this.onCollectionRemove.bind(
                                      this,
                                      item
                                    )}
                                    onEditCollection={this.onEditCollection}
                                    onChangeDisplay={this.onChangeDisplay.bind(
                                      this,
                                      item
                                    )}
                                    onModifyRemark={this.onModifyRemark}
                                    onRemarkSave={this.onRemarkSave}
                                    onModifyFeature={
                                      this.onModifyFeatureInDetails
                                    }
                                    onStopMofifyFeatureInDetails={
                                      this.onStopMofifyFeatureInDetails
                                    }
                                    onToggleChangeStyle={
                                      this.onToggleChangeStyle
                                    }
                                    onCopyCollection={this.onCopyCollection}
                                  />
                                ) : (
                                  <PublicDataTreeComponent
                                    onRef={this.onPublicDataTreeComponentRef}
                                    datas={item}
                                    key={item.id}
                                    areaList={area_list}
                                    callback={this.renderAreaList}
                                    parent={this}
                                    index={this.publicDataLinkArr.length - 1}
                                    changeQueryStr={this.props.changeQueryStr}
                                  ></PublicDataTreeComponent>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </Checkbox.Group>
                    ) : (
                      <Empty
                        style={{ textAlign: "center" }}
                        description="暂无采集数据"
                      />
                    )}
                  </Collapse.Panel>
                )}
              </Collapse>
            </PublicView>
            <div className={styles.addAreaBtn}>
              {!this.state.isEdit ? (
                <Space style={{ paddingBottom: 10 }}>
                  <Button
                    type="primary"
                    ghost
                    icon={<PlusCircleOutlined />}
                    onClick={this.pushAreaItem}
                    size="small"
                    style={{
                      ...(this.props.parentTool &&
                        this.props.parentTool.getStyle(
                          "map:collect:type:add",
                          "project",
                          this.state.current_board.board_id
                        )),
                    }}
                    disabled={
                      this.props.parentTool &&
                      this.props.parentTool.getDisabled(
                        "map:collect:type:add",
                        "project",
                        this.state.current_board.board_id
                      )
                    }
                  >
                    <span style={{ fontSize: "0.6rem" }}>新增分类</span>
                  </Button>
                  {area_list.length > 2 ? (
                    <Button
                      type="primary"
                      disabled={area_list.length < 2}
                      onClick={() => this.setMultipleCheck()}
                      ghost
                      size="small"
                      icon={<MyIcon type="icon-duoxuan" />}
                    >
                      <span style={{ fontSize: "0.6rem" }}>
                        {this.state.multipleGroup ? "单图层" : "多图层"}
                      </span>
                    </Button>
                  ) : null}
                  <Button
                    type="primary"
                    ghost
                    size="small"
                    icon={<MyIcon type="icon-huabi" />}
                    onClick={() => {
                      this.setState({ isEdit: true });
                    }}
                  >
                    <span style={{ fontSize: "0.6rem" }}>编辑</span>
                  </Button>
                </Space>
              ) : (
                <Space style={{ paddingBottom: 10 }}>
                  <Dropdown
                    trigger="click"
                    visible={this.state.showMoreAction}
                    onVisibleChange={(val) =>
                      this.setState({ showMoreAction: val })
                    }
                    overlay={() => this.MultipleMenus()}
                  >
                    <Button
                      type="primary"
                      ghost
                      size="small"
                      icon={<MyIcon type="icon-duoxuan" />}
                    >
                      操作
                    </Button>
                  </Dropdown>
                  <Button
                    type="primary"
                    ghost
                    icon={<MyIcon type="icon-chexiao" />}
                    onClick={() => {
                      this.setState({
                        isEdit: false,
                        notAreaIdSelections: [],
                        selections: [],
                      });
                    }}
                    size="small"
                  >
                    取消
                  </Button>
                </Space>
              )}
            </div>
          </Fragment>
        );
      case "2":
        return (
          <PublicView height={defaultHeight}>
            <LookingBack
              board={current_board}
              active={this.state.activeKey === "2"}
              miniTitle={this.state.miniTitle}
            />
          </PublicView>
        );
      case "3":
        return (
          <PublicView height={defaultHeight}>
            <Meettings
              board={current_board}
              active={this.state.activeKey === "3"}
              miniTitle={this.state.miniTitle}
            />
          </PublicView>
        );
      case "4":
        return (
          // <div
          //   style={{
          //     display: "flex",
          //     justifyContent: "center",
          //     alignItems: "center",
          //     height: 400,
          //   }}
          // >
          //   <span>正在加紧开发中...</span>
          // </div>
          <Fragment>
            <PublicView height={defaultHeight2}>
              <Plan
                board={current_board}
                parent={this.props.parent}
                scoutingDetail={this}
                showAddPlan={this.props.showAddPlan}
                onRef={this.onPlanRef}
              ></Plan>
            </PublicView>
            <div
              className={styles.addAreaBtn}
              style={{
                paddingTop: 0,
              }}
            >
              <Button
                block
                className={styles.btn}
                onClick={() => {
                  this.setState(
                    {
                      addGroupDisabled: false,
                    },
                    () => {
                      this.planRef && this.planRef.addGroup();
                    }
                  );
                }}
                style={{
                  ...(this.state.addGroupDisabled
                    ? {}
                    : {
                        pointerEvents: "none",
                        cursor: "not-allowed",
                        background: "hsla(0,0%,100%,.1)",
                      }),
                }}
              >
                <i
                  className={globalStyle.global_icon}
                  style={{ marginTop: 2, marginRight: 4 }}
                >
                  &#xe7dc;
                </i>
                <span>添加分组</span>
              </Button>
            </div>
          </Fragment>
        );
      default:
    }
  };

  render() {
    const { current_board, isPlay, playing } = this.state;
    const { selectData } = this.props;
    const panelStyle = {
      // height: "100%",
    };
    return (
      <div
        className={`${styles.wrap} ${animateCss.animated} ${animateCss.slideInLeft}`}
        style={{ animationDuration: "0.3s" }}
        id="detailContent"
      >
        {this.state.audioData.ele && !this.state.audioData.ele.paused && (
          <AudioControl
            audioEle={this.state.audioData.ele}
            onDistory={this.audioDistory}
            data={this.state.audioData}
            onClose={() => this.setState({ audioData: {} })}
          />
        )}

        <Title
          className={this.state.miniTitle ? styles.miniTitle : styles.maxTitle}
          name={current_board.board_name}
          date={""}
          mini={this.state.miniTitle}
          id={current_board.board_id}
          data={current_board}
          groupId={this.state.area_active_key}
          collectData={this.state.all_collection}
          cb={this.handleGoBackClick.bind(this)}
          parentTool={this.props.parentTool}
          boardId={this.state.current_board.board_id}
          currentBoard={this.state.current_board}
        ></Title>
        <Tabs
          onChange={this.onChange}
          activeKey={this.state.activeKey}
          onEdit={this.onEdit}
          tabBarGutter={10}
          className={`${styles.detailContentTabs} detailTabs`}
        >
          {this.state.panes.map((pane) => {
            let style = {};
            if (pane.key === "1") {
              let visible =
                this.props.parentTool &&
                this.props.parentTool.getCollectVisible(
                  pane.code,
                  this.state.current_board.board_id
                );
              style = visible
                ? {}
                : {
                    pointerEvents: "none",
                    cursor: "not-allowed",
                    display: "none",
                    background: "hsla(0,0%,100%,.1)",
                  };
              // this.setState({
              //   notRenderCollection: visible,
              // });
            } else {
              style =
                this.props.parentTool &&
                this.props.parentTool.getStyle(
                  pane.code,
                  "project",
                  this.state.current_board.board_id
                );
            }
            let oldStyle = pane.key === "1" ? panelStyle : {};
            return (
              <TabPane
                tab={<span>{pane.title}</span>}
                key={pane.key}
                className={pane.className}
                closable={pane.closable}
                style={{ ...oldStyle, ...style }}
              >
                {this.renderForActive(pane.key)}
              </TabPane>
            );
          })}
          {/* <TabPane
            tab={<span>按区域</span>}
            key="1"
            style={panelStyle}
          >

          </TabPane> */}
        </Tabs>
        {playing && (
          <PlayCollectionControl
            isPlay={isPlay}
            onExit={this.StopPlay}
            currentGroup={this.state.currentGroup}
            onNextGroup={this.playNextGroup}
            onPrevGroup={this.playPrevGroup}
            hasNextGroup={!this.state.notNextGroup}
            hasPrevGroup={!this.state.notPrevGroup}
          />
        )}
        <CSSTransition
          in={!!selectData}
          classNames="slideRight"
          timeout={300}
          unmountOnExit
        >
          <CollectionDetail />
        </CSSTransition>
        <BackTop target={() => this.scrollView.current} style={{ right: 10 }} />
      </div>
    );
  }
}
