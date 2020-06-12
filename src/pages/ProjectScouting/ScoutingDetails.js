import React, { PureComponent} from "react";
import globalStyle from "../../globalSet/styles/globalStyles.less";
import animateCss from "../../assets/css/animate.min.css";
import styles from "./ScoutingDetails.less";
import Action from "../../lib/components/ProjectScouting/ScoutingDetail";
import ScouListAction from "../../lib/components/ProjectScouting/ScoutingList";
import PlayCollectionAction from '../../lib/components/ProjectScouting/playCollection'
import { connect } from "dva";
import {
  Collapse,
  Tabs,
  Button,
  message,
  Space,
  Popover
} from "antd";
import {
  PlusCircleOutlined,
  CaretRightOutlined 
} from "@ant-design/icons";
import Event from "../../lib/utils/event";
import AudioControl from "./components/audioPlayControl";
import { MyIcon } from '../../components/utils'
import { Title, ScoutingHeader, ScoutingItem, UploadItem,  areaScouting} from './components/ScoutingDetailsSubComponents'
import PlayCollectionControl from './components/playCollectionControl'

const { Evt } = Event;
const { TabPane } = Tabs;


@connect((
  { controller: { mainVisible }, 
  lengedList: { config } }) => 
({
  mainVisible,
  config
}))
export default class ScoutingDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    const panes = [
      { title: "按区域", content: areaScouting(), key: "1", closable: false },
    ];
    this.state = {
      current_board: {},
      area_list: [],
      all_collection: [],
      not_area_id_collection: [],
      area_active_key: null,
      multipleGroup:false,
      area_selected:[],
      isPlay:false,
      playing: false,
      currentGroup:null,
      notNextGroup:false,
      notPrevGroup:false,

      visible: true,
      activeKey: panes[0].key,
      panes,
      activeId: -1,
      audioData: {},
    };
    this.scrollView = React.createRef();
  }
  componentDidMount () {
    const { Evt } = Event;
    this.getDetails();
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
    // 有音频正在播放
    Event.Evt.on("hasAudioStart", (data) => {
      this.setAudio(data);
    });

    Event.Evt.on("updatePlotFeature", (data) => {
      this.fetchCollection();
    });
    Evt.on('CollectionUpdate:remove',this.onCollectionUpdate.bind(this,'remove'))
    Evt.on('CollectionUpdate:add',this.onCollectionUpdate.bind(this,'add'))
    Evt.on('CollectionUpdate:reload',this.onCollectionUpdate.bind(this,'reload'))
    
  }

  // 设置正在播放的数据
  setAudio = (data) => {
    // console.log(data)
    this.setState({
      audioData: data,
    });
  };

  // 轮询中的数据监听
  onCollectionUpdate = (type,collections)=>{
    let arr = Array.from(this.state.all_collection);
    if(type === 'add'){
      arr = arr.concat(collections);
    }
    if(type === 'remove'){
      let key = collections.map(item => item.id);
      arr = arr.filter(item => !key.includes(item.id));
    }
    // 重组所有数据
    let list = this.reSetCollection(arr);
    // 更新分组列表和所有collection
    this.updateCollection(arr ,list)
  }

  // 获取缓存中选定的项目
  getDetails = (flag) => {
    ScouListAction.checkItem().then((res) => {
      // console.log(res)
      let { data } = res;
      this.setState(
        {
          current_board: data,
        },
        () => {
          if (!flag) this.renderAreaList();
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
        let active = this.state.area_active_key || ( respData[0] && respData[0].id);
        this.setState({
          area_list: respData.map((item) =>
            Object.assign(item, { _edit: false, _remarkEdit: false })
          ),
          area_active_key: active,
          area_selected:active,
        });
        // 获取区域分类的数据列表
        this.fetchCollection();
        Action.addToListen(param);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleGoBackClick = () => {
    const { dispatch } = this.props;
    Action.onBack();

    dispatch({
      type: "controller/updateMainVisible",
      payload: {
        mainVisible: "list",
      },
    });
  };

  onChange = (activeKey) => {
    this.setState({ activeKey });
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
        area_active_key: ""
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
  };

  // 保存新增的区域
  saveArea = (data, name) => {
    if (!name) return message.warn('分组名称不能为空');
    // 编辑状态
    if (data.board_id) {
      Action.editAreaName(data.id, { name }).then((res) => {
        this.onAreaEdit(false, data);
        this.setState({
          area_list: this.state.area_list.map((item) => {
            if (item.id === data.id) {
              item.name = name;
            }
            return item;
          }),
        });
      });
      message.success("修改成功");
      return;
    }
    let { current_board } = this.state;
    Action.addArea({ board_id: current_board.board_id, name: name }).then(
      (res) => {
        message.success("新增操作成功");
        this.setState({
          area_active_key: res.data || ""
        },()=>{
          // console.log(res);
          this.renderAreaList();
        })
      }
    );
  };

  componentWillUnmount () {
    const { dispatch, config: lengedList } = this.props;
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
    Action.removeLayer();
    Action.clearListen();
  }
  // 渲染带坐标的数据
  renderCollection = (data) => {
    const { config: lenged, dispatch } = this.props;
    Action.renderCollection(data || [], { lenged, dispatch });
  };

  // 获取资源列表，动态分类
  fetchCollection = () => {
    let params = {
      board_id: this.state.current_board.board_id,
    };
    Action.getCollectionList(params).then((res) => {
      let data = res.data;
      // 轮询中，加入对比更新机制
      Action.oldData = data;
      // 将重组后的数据更新,保存没有关联区域的数据
      let array = this.reSetCollection(data);
      this.updateCollection(data, array)
    });
  };

  // 更新数据
  updateCollection = (data ,area_list)=>{
    this.setState(
      {
        all_collection: data,
        area_list: area_list,
        not_area_id_collection: data.filter((i) => !i.area_type_id),
      },
      () => {
        // 之渲染选中的区域数据
        let obj =
          this.state.area_list.find(
            (item) => item.id === this.state.area_active_key
          ) || {};
        let arr = obj.collection;
        this.state.area_active_key === "other" &&
          (arr = this.state.not_area_id_collection);
        this.renderCollection(arr || []);
      }
    );
  }
  // 将数据分类，更新到区域列表
  reSetCollection = (val) => {
    let data = val || [];
    let list = this.state.area_list.map((item) => {
      let f_list = data.filter((v) => v.area_type_id === item.id);
      item.collection = f_list.sort((a,b) => (a.__index||0) - (b.__index||0));
      return item;
    });
    return list;
  };

  // 上传中
  filesChange = (val, file, fileList, event) => {
    // console.log("上传中...", file, fileList,event);
    if (event) {
      let percent = Math.floor((event.loaded / event.total) * 100);
      console.log(percent, event.percent);
    }
  };
  // 上传完成
  fileUpload = (val, resp, event) => {
    if (resp) {
      message.success("上传成功");
      let { file_resource_id, suffix, original_file_name } = resp;

      let params = {
        board_id: this.state.current_board.board_id,
        area_type_id: val.id,
        collect_type: 3,
        resource_id: file_resource_id,
        target: suffix && suffix.replace(".", ""),
        title: original_file_name,
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
        });
    }
  };

  onAddError = () => {
    // message.error('添加失败，请稍后重试')
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
          }
        );
      })
      .catch((err) => {
        message.err("删除失败,请稍后重试");
        console.log(err);
      });
  };

  // 取消新增
  cancelEditCollection = () => {
    message.destroy();
    Action.removeDraw();
    this.showOtherSlide();
  };

  // 隐藏不需要的页面
  hideOtherSlide = () => {
    let { dispatch } = this.props;
    // 关闭其他不需要的元素
    dispatch({
      type: "openswitch/updateDatas",
      payload: {
        slideSwitch: false,
        showSlideButton: false,
        lengedSwitch: false,
        showLengedButton: false,
        bottomTools:false,
        isShowTempPlot:false
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
        slideSwitch: true,
        showSlideButton: true,
        lengedSwitch: false,
        showLengedButton: true,
        bottomTools:true,
        isShowTempPlot:true
      },
    });
  };

  onEditCollection = async (editType, val, name) => {
    let res = "",
      params = {};
    let { id } = val;
    if (editType === "editCoordinate") {
      message.success(
        <span>
          选取一个坐标设置为资料展示点 或{" "}
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
      // 隐藏
      this.hideOtherSlide();
      // 添加坐标点的事件
      res = await Action.addCollectionPosition(val);
      let { feature } = res;
      // console.log(res);
      let coor = feature.getGeometry().getCoordinates();
      coor = Action.transform(coor);
      params = {
        id,
        location: {
          longitude: coor[0],
          latitude: coor[1],
          site_name: val.title,
        },
      };
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
        this.fetchCollection();
        let f = editType == "editCoordinate" ? "关联坐标完成" : "修改名称完成";
        message.success(f);
      })
      .catch((err) => {
        console.log(err);
        this.cancelEditCollection();
      });
  };
  // 选中了分组
  onSelectGroup = (group, data) => {
    // console.log(group,data)
    let params = {
      id: data.id,
      area_type_id: group.id,
    };
    Action.editCollection(params).then((res) => {
      // console.log(res)
      message.success(
        <span>
          已将<a>{data.title}</a>
          移动到<a>{group.name}</a>
          分组
        </span>
      );
      this.fetchCollection();
    });
  };

  // 多选数据进行展示
  onMultipleSelectGroup = (val,id)=>{
    let arr = Array.from(this.state.area_selected)
    if(val.target.checked){
      arr.push(id);
    }else{
      arr = arr.filter(item => item !== id);
    }
    this.setState({
      area_selected:arr
    },()=>{
      let data = [...this.state.area_list];
      let selectData = [];
      arr.forEach(item => {
        let obj = data.find(d => d.id === item);
        if(obj){
          selectData = selectData.concat(obj.collection || [])
        }
      })
      this.renderCollection(selectData)
    })
  }

  onAreaDelete = (val) => {
    if (val.collection && val.collection.length) {
      return message.error("分组中存在数据，无法删除");
    }
    Action.RemoveArea(val.id)
      .then((res) => {
        message.success("删除成功");
        let arr = this.state.area_list.filter((item) => item.id !== val.id);
        this.setState({
          area_list: arr,
          multipleGroup: this.state.multipleGroup ? arr.length > 1 :false
        });
      })
      .catch((err) => {
        console.log(err);
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

  // 点击panel时的回调
  setActiveCollapse = (key) => {
    this.setState({ area_active_key: key });
    if(this.state.multipleGroup) return;
    // 关闭的时候，全部清空
    if(!key){this.renderCollection([])};
    this.setState({area_selected:[key]})
    if (key) {
      let obj = this.state.area_list.find((item) => item.id === key);
      if (obj) {
        this.renderCollection(obj.collection || []);
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
  onUploadPlan = (val, resp) => {
    this.showOtherSlide();
    // console.log(resp);
    if (resp) {
      message.success("上传成功");
      let { id, name } = resp;

      let params = {
        board_id: this.state.current_board.board_id,
        area_type_id: val.id,
        collect_type: 5,
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
        });
    }
  };

  // 切换显示隐藏
  onChangeDisplay = (val, collection) => {
    // console.log(val, collection)
    let is_display = collection.is_display;
    let param = {
      id: collection.id,
      is_display: is_display === "1" ? "0" : "1",
    };
    Action.editCollection(param).then((res) => {
      // console.log(res);
      let { all_collection } = this.state;
      // 更新状态重新渲染
      let arr = all_collection.map((item) => {
        if (item.id === collection.id) {
          collection.is_display = param.is_display;
          item = collection;
        }
        return item;
      });
      let list = this.reSetCollection(arr);
      this.updateCollection(Array.from(all_collection), list);
    });
  };
  // 编辑规划图
  onEditPlanPic = (val, collection) => {
    // console.log(val,collection)
    this.hideOtherSlide();
    let img = Action.findImgLayer(collection.resource_id);
    Action.setEditPlanPicLayer(img)
      .then((resp) => {
        let param = {
          extent: resp.extent.join(","),
          transparency: resp.opacity,
        };
        this.showOtherSlide();
        Action.saveEditPlanPic(collection.resource_id, param).then((res) => {
          message.success(`修改${collection.title}成功`);
          this.fetchCollection();
        });
      })
      .catch((err) => {
        if (err.code === -1) { /**message.warn(err.message)*/ }
        else message.error(err.message);
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
    Action.modifyFeature(data);
  };

  //停止编辑几何图形
  onStopMofifyFeatureInDetails = () => {
    Action.stopModifyFeature()
  }

  onToggleChangeStyle = (val) => {
    this.setState({
      activeId: val.id,
    });
  };
  // 复制collection
  onCopyCollection = (val, collection) => {
    let obj = {
      collect_type: collection.collect_type,
      title: collection.title,
      target: collection.target,
      area_type_id: val.id,
      board_id: val.board_id,
      content: collection.content,
    };
    // console.log(obj)
    Action.addCollection(obj).then((res) => {
      // console.log(res)
      message.success(
        <span>
          已将<a>{collection.title}</a>
          复制到<a>{val.name}</a>
          分组
        </span>
      );
      this.fetchCollection();
    });
  };

  // 
  onBeforeUploadPlan = ()=>{

  }
  onExcelSuccess = (arr)=>{
    this.fetchCollection();
  }


  // 设置多选
  setMultipleCheck = ()=>{
    this.setState({multipleGroup:!this.state.multipleGroup});
  }

  // 拖拽排序
  onCollectionDragEnd = (data,result)=>{
    let ondragId = data.id;
    // return message.warn('排序功能暂未开放');
    if (!result.destination) {
      return;
    }
    // 重新记录数组顺序
    const reorder = (list, startIndex, endIndex) => {
      let result = Array.from(list);
      //删除并记录 删除元素
      const [removed] = result.splice(startIndex, 1);
      //将原来的元素添加进数组
      result.splice(endIndex, 0, removed);
      result = result.map((item, index) => {item.__index = index + 1; return item;})
      return result;
    };

    let area_list = Array.from(this.state.area_list);

    // 找到当前拖拽的分组
    let obj = area_list.find(item => item.id === ondragId);
    const items = reorder(
      obj ? obj.collection : [],
      result.source.index,
      result.destination.index
    );
    // 重组
    area_list = area_list.map(item => {
      if(item.id === ondragId){
        item.collection = items.sort((a,b)=> a.__index - b.__index);
      }
      return item;
    })
    this.setState({
      area_list
    })
  }

  // 查询最近一组中含有采集数据的分组
  getFirstAreaCollection = (index)=>{
    for(let i = index; i< this.state.area_list.length; i++){
      let item = this.state.area_list[i];
      if( this.state.area_active_key === item.id && item.collection && item.collection.length){
        return item;
      }
    }
  }

  // 停止播放
  StopPlay = ()=>{
    this.setState({
      isPlay:false,
      playing:false,
      currentGroup:{}
    })
    this.showOtherSlide();
    this.fetchCollection();
    PlayCollectionAction.stop();
  }

  // 播放下一组
  playNextGroup = ()=>{
    PlayCollectionAction.stop();
    // 如果有下一组
    let next = this.checkHasNextGroup();
    if(next){
      this.startPlayCollection("",next)
      Evt.firEvent('autoPlayChange');
    }
  }

  // 播放上一组
  playPrevGroup = ()=>{
    PlayCollectionAction.stop();
    let prev = this.checkHasPrevGroup();
    if(prev){
      this.startPlayCollection("",prev);
      Evt.firEvent('autoPlayChange');
    }
  }
  // 检查有没有下一个
  checkHasNextGroup = () => {
    let current = this.state.currentGroup ? {...this.state.currentGroup} : {};
    let index = this.state.area_list.findIndex(item => item.id === current.id);
    if(index !== -1){
      let next = this.state.area_list[index + 1];
      if(next){
        if(next.collection && next.collection.length)
        return next;
        else {
          for(let i = index + 1; i< this.state.area_list.length; i++){
            let item = this.state.area_list[i];
            if(item.collection && item.collection.length){
              return item;
            }
          }
        }
      }else return undefined;
    }
    else return undefined;
  }
  // 检查有没有上一个
  checkHasPrevGroup = ()=>{
    let current = this.state.currentGroup ? {...this.state.currentGroup} : {};
    let index = this.state.area_list.findIndex(item => item.id === current.id);
    if(index !== -1){
      if(index === 0){
        return undefined;
      }
      let prev = this.state.area_list[index - 1];
      if(prev){
        if(prev.collection.length)
        return prev;
        else {
          for(let i = index - 1; i >= 0;i--){
            let item = this.state.area_list[i];
            if(item.collection && item.collection.length){
              return item;
            }
          }
        }
      }else return undefined;
    }else return undefined;
  }
  // 开始播放
  startPlayCollection = (mode , areaData ,index = 0)=>{
    // 获取有数据的分组，不包含未分组区域
    let data = [];
    if(areaData && areaData.collection.length){
      data = areaData;
    }else{
      data = this.getFirstAreaCollection(index);
      !data && (data = {});
    }
    // 过滤空坐标信息
    let collection = data.collection && data.collection.filter(item => (item.is_display === '1' && item.location && item.location.hasOwnProperty('latitude')));
    if(!collection) return ;
    let flag = PlayCollectionAction.setData(mode, collection.sort((a,b)=> (a.__index || 0) - (b.__index || 0)));
    if(flag){
      PlayCollectionAction.play();
      this.hideOtherSlide();
      this.setState({
        isPlay:true,
        playing:true,
        currentGroup: data,
      },()=>{
        // 检查是不是有上一个和下一个，自动过滤没有任何数据的
        let next = this.checkHasNextGroup();
        let prev = this.checkHasPrevGroup();
        this.setState({
          notNextGroup: !next,
          notPrevGroup: !prev
        })
      })
    }
  }

  render () {
    const { current_board, area_list, not_area_id_collection ,all_collection ,isPlay, playing} = this.state;
    const panelStyle = {
      height: "96%",
    };
    const { activeId } = this.state;
    const { dispatch } = this.props;
    return (
      <div
        className={`${styles.wrap} ${animateCss.animated} ${animateCss.slideInLeft}`}
        style={{ animationDuration: "0.3s" }}
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
          name={current_board.board_name}
          date={""}
          id={current_board.board_id}
          data={current_board}
          cb={this.handleGoBackClick.bind(this)}
        ></Title>
        <Tabs
          onChange={this.onChange}
          activeKey={this.state.activeKey}
          // type="editable-card"
          onEdit={this.onEdit}
          tabBarGutter={10}
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "absolute",
            top: 207,
            left: 0,
            bottom: 2,
            width: "100%",
          }}
        >
          {/* {this.state.panes.map((pane) => (
            <TabPane
              tab={<span>{pane.title}</span>}
              key={pane.key}
              closable={pane.closable}
              style={pane.key === "1" ? panelStyle : null}
            >
              {pane.content}
            </TabPane>
          ))} */}
          <TabPane
            tab={<span style={{ visibility: "hidden" }}>按区域</span>}
            key="1"
            style={panelStyle}
          >
            <div
              className={globalStyle.autoScrollY}
              style={{ height: "75vh", paddingBottom: "40px" }}
              ref={this.scrollView}
            >
              <Collapse
                expandIconPosition="right"
                onChange={(e) => {
                  this.setActiveCollapse(e);
                }}
                className={styles.scoutingItem}
                accordion={true}
                activeKey={this.state.area_active_key}
                expandIconPosition="left"
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              >
                {area_list.map((item, index) => {
                  let activeStyle = null;
                  if (item.id === activeId) {
                    activeStyle = { backgroundColor: "rgba(214,228,255,0.5)" };
                  }
                  return (
                    <Collapse.Panel
                      header={
                        <ScoutingHeader
                          selected={this.state.area_selected}
                          onSelect={this.onMultipleSelectGroup}
                          data={item}
                          activeKey={this.state.area_active_key}
                          index={index + 1}
                          edit={item._edit}
                          remarkEdit={item._remarkEdit}
                          onCancel={this.addCancel.bind(this, item)}
                          onSave={this.saveArea.bind(this, item)}
                          onRemarkSave={() => this.saveRemark(item)}
                          multiple={this.state.multipleGroup}
                        // onDragEnter={e => {this.setState({area_active_key: item.id})}}
                        />
                      }
                      key={item.id}
                      style={{ backgroundColor: "#fff", marginBottom: "10px" }}
                    >
                      <ScoutingItem
                        board={this.state.current_board}
                        dispatch={dispatch}
                        // onDrop={()=> console.log(item)}
                        style={activeStyle}
                        data={item}
                        onAreaEdit={this.onAreaEdit.bind(this, true)}
                        onAreaDelete={this.onAreaDelete}
                        onSelectGroup={this.onSelectGroup}
                        onChange={this.filesChange.bind(this, item)}
                        onUpload={this.fileUpload.bind(this, item)}
                        dataSource={item.collection}
                        onError={this.onAddError}
                        areaList={area_list}
                        onUploadPlan={this.onUploadPlan.bind(this, item)}
                        onCollectionRemove={this.onCollectionRemove.bind(
                          this,
                          item
                        )}
                        onEditCollection={this.onEditCollection}
                        onUploadPlanStart={this.onUploadPlanStart.bind(
                          this,
                          item
                        )}
                        onUploadPlanCancel={this.onUploadPlanCancel}
                        onChangeDisplay={this.onChangeDisplay.bind(this, item)}
                        onEditPlanPic={this.onEditPlanPic.bind(this, item)}
                        onRemarkSave={this.onRemarkSave}
                        onModifyRemark={this.onModifyRemark}
                        onModifyFeature={this.onModifyFeatureInDetails}
                        onStopMofifyFeatureInDetails={() => this.onStopMofifyFeatureInDetails()}
                        onToggleChangeStyle={this.onToggleChangeStyle}
                        onCopyCollection={this.onCopyCollection}
                        onExcelSuccess={this.onExcelSuccess}
                        onDragEnd={this.onCollectionDragEnd}
                      />
                    </Collapse.Panel>
                  );
                })}
                <Collapse.Panel
                  key="other"
                  style={{ backgroundColor: "#fff", marginBottom: "10px" }}
                  header={
                    <ScoutingHeader
                      data={{ name: "未分组" ,id:'other'}}
                      edit={false}
                      activeKey={this.state.area_active_key}
                      index={area_list.length + 1}
                      onCancel={() => { }}
                      onSave={() => { }}
                    // onDragEnter={e => {this.setState({area_active_key: item.id})}}
                    />
                  }
                >
                  {!!not_area_id_collection.length && (
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
                              animationDelay: index * 0.05 + "s",
                            }}
                          >
                            <UploadItem
                              style={activeStyle}
                              data={item}
                              type={Action.checkCollectionType(item.target)}
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
                              onModifyFeature={this.onModifyFeatureInDetails}
                              onStopMofifyFeatureInDetails={this.onStopMofifyFeatureInDetails}
                              onToggleChangeStyle={this.onToggleChangeStyle}
                              onCopyCollection={this.onCopyCollection}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Collapse.Panel>
              </Collapse>
            </div>
            <div className={styles.addAreaBtn}>
              <Space style={{paddingBottom:10}}>
                <Button
                  type="primary"
                  ghost
                  icon={<PlusCircleOutlined />}
                  onClick={this.pushAreaItem}
                  shape="round"
                  size="small"
                >
                  新增
                </Button>
                <Button 
                shape="round"
                type="primary"
                disabled={area_list.length < 2}
                onClick={()=> this.setMultipleCheck()}
                ghost
                size="small"
                icon={<MyIcon type="icon-duoxuan"/>}>
                  {this.state.multipleGroup ? '分组展示':'组合展示'}
                </Button>
                <Popover
                trigger="focus"
                title="选择播放模式"
                content={
                  <div>
                    <Button type='link' size='small'
                    onClick={()=> this.startPlayCollection('hand')}>手动播放</Button>
                    <Button type='link' size='small'
                    onClick={()=> this.startPlayCollection('auto')}>自动播放</Button>
                  </div>
                }>
                  <Button shape="round" 
                  icon={<MyIcon type="icon-bofang"/>}
                  ghost
                  size="small"
                  type="primary"
                  disabled={!all_collection.length}>
                    演播
                  </Button>
                </Popover>
                
              </Space>
            </div>
          </TabPane>
          {/* <TabPane tab={<span>按标签</span>} key="2">
            <div className={globalStyle.autoScrollY} style={{ height: "100%" }}>
              <ScoutingItem2 />
              <ScoutingItem2 />
              <ScoutingItem2 />
            </div>
          </TabPane> */}
        </Tabs>
        {playing && <PlayCollectionControl isPlay={isPlay} onExit={this.StopPlay}
        currentGroup={this.state.currentGroup}
        onNextGroup={this.playNextGroup}
        onPrevGroup={this.playPrevGroup}
        hasNextGroup={!this.state.notNextGroup}
        hasPrevGroup={!this.state.notPrevGroup}/> }
      </div>
    );
  }
}
