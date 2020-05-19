import React, { PureComponent , useState ,Fragment} from "react";
import globalStyle from "../../globalSet/styles/globalStyles.less";
import animateCss from '../../assets/css/animate.min.css'
import styles from "./ScoutingDetails.less";
import Action from '../../lib/components/ProjectScouting/ScoutingDetail'
import ScouListAction from '../../lib/components/ProjectScouting/ScoutingList'
import { connect } from "dva";
import { Collapse, Row, Tabs ,Input ,Button, message ,Upload ,Space ,Dropdown ,Menu ,Popconfirm} from "antd";
import { PlusCircleOutlined ,CheckCircleOutlined, CloseCircleOutlined , SettingTwoTone } from '@ant-design/icons'
import { BASIC } from '../../services/config'
const { TabPane } = Tabs;

const Title = ({ name, date, cb }) => {
  return (
    <div className={styles.title}>
      <p style={{ marginTop: 8 }}>
        <i
          className={globalStyle.global_icon + ` ${globalStyle.btn}`}
          style={{
            color: "#fff",
            fontSize: 22,
          }}
          onClick={cb}
        >
          &#xe602;
        </i>
      </p>
      <p className={styles.name} style={{ marginTop: 109 }}>
        <span>{name}</span>
      </p>
      <p
        className={styles.date}
        style={{
          marginTop: 5,
        }}
      >
        <span>{date}</span>
      </p>
    </div>
  );
};
const UploadBtn = ({onChange}) => {
  return (
    <Upload 
    action='/api/map/file/upload'
    headers={{"Authorization":BASIC.getUrlParam.token}}
    onChange={(e)=> onChange(e)}
    showUploadList={false}
    >
      <i
        className={globalStyle.global_icon + ` ${globalStyle.btn} ${styles.uploadBtn}`}
        style={{ color: "#0D4FF7" }}>
        &#xe628;
      </i>
    </Upload>
  );
};
const ScoutingItem = ({ 
  data ,index ,
  edit = false ,onCancel ,
  onError ,onSave,
  onUpload ,onChange ,
  dataSource = [],
  onCollectionRemove,
  onEditCollection
}) => {
  let [ areaName, setAreaName ] = useState("");
  let [ isEdit, setIsEdit ] = useState(edit);
  const header = (
    <div
      style={{
        display: "flex",
      }}
      onClick={e => {edit ? e.stopPropagation():""}}
      > 
      <Fragment>
        <div className={styles.numberIcon}>
          <span>{index}</span>
        </div>
        <div className={styles.text}>
          { isEdit ? 
            <Fragment>
              <Input placeholder="请输入名称" value={areaName} 
              style={{width:"70%",marginRight:'2%'}} 
              onPressEnter={e => {e.stopPropagation();saveItem()}} 
              onClick={(e) => e.stopPropagation()}
              onChange={(e)=>{setAreaName(e.target.value)}}/>
              <Button onClick={()=> saveItem()} size='middle' type='primary' icon={<CheckCircleOutlined />}></Button>
              <Button onClick={() => {setIsEdit(false); onCancel && onCancel()}} size='middle' icon={<CloseCircleOutlined/>}></Button>
            </Fragment>
          : <span>{data.name}</span>
          }
          
        </div>
      </Fragment>
    </div>
  );

  // 保存事件
  const saveItem = ()=>{
    onSave && onSave(areaName);
    setIsEdit(false);
  }

  // 开始上传
  const startUpload = ({file , fileList}) => {
    let { response } = file;
    onChange && onChange(file,fileList)
    if(response){
      BASIC.checkResponse(response) ? (onUpload && onUpload(response.data,fileList)) : (onError && onError(response))
    }else{
      // onError && onError(file)
    }
  }

  return (
    <Collapse expandIconPosition="right" className={styles.scoutingItem}>
      <Collapse.Panel header={header} style={{backgroundColor:"#fff"}}>
        {/* <div className={styles.itemDetail}>
          <p className={styles.light}>
            <i className={globalStyle.global_icon}>&#xe616;</i>
            <span>3月15日</span>
            <i className={globalStyle.global_icon}>&#xe605;</i>
            <span>沙寮村委</span>
          </p>
          <p>
            <i className={globalStyle.global_icon}>&#xe685;</i>
            <span>执行任务清单、备忘、要求等细节说明填在此</span>
          </p>
        </div> */}
        {
          dataSource.map((item,index) => {
            return (
              <div className={`${animateCss.animated} ${animateCss.slideInRight}`}
              style={{animationDuration:"0.3s",animationDelay:index * 0.05 +'s' }}
              key={item.id}>
                <UploadItem type="paper" data={item} onRemove={onCollectionRemove}
                onEditCollection={onEditCollection}/>
              </div>
            )
          })
        }
        {/* <UploadItem type="paper" />
        <UploadItem type="paper" />
        <UploadItem type="interview" />
        <UploadItem type="pic" />
        <UploadItem type="video" />
        <UploadItem type="word" />
        <UploadItem type="annotate" />
        <UploadItem type="plotting" />
        <UploadItem type="video" /> */}
        <UploadBtn onChange={startUpload} />
      </Collapse.Panel>
    </Collapse>
  );
};
const ScoutingItem2 = ({ data }) => {
  const header = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ textAlign: "left" }}>
        <i className={globalStyle.global_icon + ` ${globalStyle.btn} ${styles.icon}`}>
          &#xe6d9;
        </i>
        人口
      </div>
    </div>
  );
  return (
    <Collapse expandIconPosition="right" className={styles.scoutingItem}>
      <Collapse.Panel header={header}>
        <UploadItem type="paper" />
        <UploadItem type="paper" />
        <UploadItem type="interview" />
        <UploadBtn />
      </Collapse.Panel>
    </Collapse>
  );
};
const UploadItem = ({ type ,data ,onRemove ,onEditCollection}) => {
  let [ visible ,setVisible ] = useState(false);
  const itemKeyVals = {
    paper: "图纸",
    interview: "访谈",
    pic: "图片",
    video: "视频",
    word: "文档",
    annotate: "批注",
    plotting: "标绘",
  };
  let { create_by ,title , create_time, target} = data;
  let time = Action.dateFormat(create_time, 'yyyy/MM/dd');
  let hours = Action.dateFormat(create_time, 'HH:mm')

  const onHandleMenu = ({key})=>{
    // 添加坐标点
    if(key === 'editCollection'){
      setVisible(false);
      onEditCollection && onEditCollection(data)
    }
  }

  const menu = (
    <Menu onClick={ onHandleMenu}>
      <Menu.Item key="editCollection">
        关联坐标
      </Menu.Item>
      <Menu.Item key="selectGroup">
        关联分组
      </Menu.Item>
      <Menu.Item key="removeBoard">
        <Popconfirm title='确定删除此资料吗?'
        okText='删除'
        cancelText="取消"
        overlayStyle={{zIndex:10000}}
        onConfirm={()=> {setVisible(false);onRemove && onRemove(data)}}
        placement="topRight">
          <div style={{width:"100%"}}>删除</div>
        </Popconfirm>
      </Menu.Item>
    </Menu>
);


  return (
    <div className={styles.uploadItem + ` ${globalStyle.btn}`}>
      <div className={styles.uploadIcon + ` ${styles[type]}`}>
        <span>{itemKeyVals[type]}</span>
      </div>
      <div className={styles.uploadDetail}>
        <Row style={{width:'100%',textAlign:"left"}}>
          <span style={{minHeight:'1rem'}} title={title} 
          className={`${styles.firstRow} ${styles.text_overflow} text_ellipsis`}>{title}</span>
        </Row>
        <Row>
          <Space size={8} style={{fontSize:12}}>
            <span>{create_by.name}</span> 
            <span>{time}</span> 
            <span>{hours}</span>
          </Space>
        </Row>
      </div>
      <div style={{display:'flex',justifyContent:"center",alignItems:"center",paddingRight:'5px'}}>
        <Dropdown overlay={menu} 
          trigger="click"
          onVisibleChange={(val)=> setVisible(val)}
          visible={visible}>
            <SettingTwoTone />
        </Dropdown>
        
      </div>
    </div>
  );
};

const areaScouting = () => {
  return (
    <div className={globalStyle.autoScrollY} style={{ height: "100%" }}>
      <ScoutingItem />
      <ScoutingItem />
      <ScoutingItem />
      <ScoutingItem />
    </div>
  );
};

const tagScouting = () => {
  return (
    <div className={globalStyle.autoScrollY} style={{ height: "100%" }}>
      <ScoutingItem2 />
      <ScoutingItem2 />
      <ScoutingItem2 />
    </div>
  );
};

@connect(({ controller: { mainVisible } }) => ({ mainVisible }))
export default class ScoutingDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    const panes = [
      { title: "按区域", content: areaScouting(), key: "1", closable: false },
      { title: "按标签", content: tagScouting(), key: "2", closable: false },
    ];
    this.state = {
      current_board:{},
      area_list:[],
      all_collection:[],
      not_area_id_collection:[],

      
      name: "阳山县沙寮村踏勘",
      date: "3/15-3/17",
      visible: true,
      activeKey: panes[0].key,
      panes,
    };
  }
  componentDidMount(){
    this.getDetails();
    // 删除存在与页面中的项目点和元素
    Action.removeListPoint();
    // 构建地图组件
    Action.init();
  }

  // 获取缓存中选定的项目
  getDetails = () => {
    ScouListAction.checkItem().then(res => {
      let { data } = res;
      this.setState({
        current_board: data
      },() => {
        this.renderAreaList();
      })
    })
  }

  // 渲染区域分类列表
  renderAreaList = ()=> {
    Action.fetchAreaList({board_id: this.state.current_board.board_id}).then(resp => {
      // console.log(resp)
      let respData = resp.data;
      this.setState({
        area_list: respData,
      })
      // 获取区域分类的数据列表
      this.fetchCollection();
    }).catch(err => {
      console.log(err);
    })
  }

  handleGoBackClick = () => {
    const { dispatch } = this.props;
    Action.onBack();

    dispatch({
      type: "controller/updateMainVisible",
      payload: {
        mainVisible: 'list',
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
      name:"",
    }
    this.setState({
      area_list: this.state.area_list.concat([obj])
    })
  }

  // 取消新增区域
  addCancel = (item) => {
    this.setState({
      area_list: this.state.area_list.filter(val => val.id !== item.id)
    })
  }

  // 保存新增的区域
  saveArea = (data,name)=>{
    let { current_board } = this.state;
    Action.addArea({board_id: current_board.board_id, name: name}).then(res => {
      message.success('新增操作成功');
      // console.log(res);
      this.renderAreaList();
    })
  }

  componentWillUnmount(){
    Action.removeLayer();
  }
  // 渲染带坐标的数据
  renderCollection = () =>{ 
    let { all_collection } = this.state;
    all_collection.length && Action.renderCollection(all_collection)
  }

  // 获取资源列表，动态分类
  fetchCollection = () => {
    let params = {
      board_id: this.state.current_board.board_id
    }
    Action.getCollectionList(params).then(res => {
      let data = res.data || [];
      let list = this.state.area_list.map(item => {
        let f_list = data.filter(v => v.area_type_id === item.id);
        item.collection = f_list;
        return item;
      })
      // 将重组后的数据更新,保存没有关联区域的数据
      this.setState({
        all_collection: data,
        area_list: list,
        not_area_id_collection: data.filter( i => !i.area_type_id),
      },()=>{
        this.renderCollection();
      })
    })
  }

  // 上传中
  filesChange = (val, file, fileList)=> {
    console.log('上传中...',file,fileList)
  }
  // 上传完成
  fileUpload = (val, resp) => {
    if(resp){
      message.success('上传成功')
      let { file_resource_id ,suffix ,original_file_name} = resp;

      let params = {
        board_id: this.state.current_board.board_id,
        area_type_id: val.id,
        collect_type: 3,
        resource_id: file_resource_id,
        target: suffix && suffix.replace('.',''),
        title:original_file_name,

      }
      Action.addCollection(params).then(res => {
        // console.log(res);
        // 更新上传的列表
        this.fetchCollection();
      }).catch(err => {
        // 添加失败
        console.log(err)
      })
      

    }
  }

  onAddError = ()=> {
    // message.error('添加失败，请稍后重试')
  }

  // 删除采集的资料
  onCollectionRemove = (item,collection) => {
    let { id } = collection;
    let { area_list } = this.state;

    item.collection = item.collection.filter(cols => cols.id !== id);

    let list = area_list.map(area => {
      if(area.id === item.id){
        area = item;
      }
      return area;
    })

    Action.removeCollection(id).then(res => {
      message.success('删除成功');
      this.setState({
        area_list: list,
        all_collection: this.state.all_collection.filter(i => i.id !== id)
      })
    }).catch(err => {
      message.err('删除失败,请稍后重试');
      console.log(err);
    })

    
  }

  // 取消新增
  cancelEditCollection = ()=>{
    message.destroy();
    Action.removeDraw();
    this.showOtherSlide();
  }

  // 隐藏不需要的页面
  hideOtherSlide = ()=>{
    let { dispatch } = this.props;
    // 关闭其他不需要的元素
    dispatch({
      type:"openswitch/updateDatas",
      payload:{
        slideSwitch:false,
        showSlideButton: false,
        lengedSwitch: false,
        showLengedButton: false,
      }
    })
  }

  // 显示被隐藏的元素
  showOtherSlide = ()=>{
    let { dispatch } = this.props;
    // 关闭其他不需要的元素
    dispatch({
      type:"openswitch/updateDatas",
      payload:{
        slideSwitch:true,
        showSlideButton: true,
        lengedSwitch: false,
        showLengedButton: true,
      }
    })
  }

  onEditCollection = (val)=>{
    let { id } = val;
    message.success(
    <span>选取一个坐标设置为资料展示点 或 <a onClick={e => {e.stopPropagation(); this.cancelEditCollection();}}>取消选择</a></span>
    ,0)
    // 隐藏
    this.hideOtherSlide();
    // 添加坐标点的事件
    Action.addCollectionPosition(val).then(res => {
      let { feature } = res;
      // console.log(res);
      let coor = feature.getGeometry().getCoordinates();
      coor = Action.transform(coor);
      let params = {
        id,
        location:{
          longitude: coor[0],
          latitude: coor[1],
          site_name: val.title
        }
      }
      // 执行保存
      Action.editCollection(params).then(res => {
        // console.log(res);
        this.cancelEditCollection();
        this.fetchCollection()
      }).catch(err => {
        console.log(err)
        this.cancelEditCollection();
      })
    })
  }

  render(h) {
    const { current_board ,area_list ,not_area_id_collection} = this.state;
    const panelStyle = {
      height: "96%",
    };
    return (
      <div className={`${styles.wrap} ${animateCss.animated} ${animateCss.slideInLeft}`}
      style={{animationDuration:'0.3s'}}
      >
        <Title
          name={current_board.board_name}
          date={""}
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
          <TabPane tab={<span>按区域</span>} key="1" style={panelStyle}>
            <div className={globalStyle.autoScrollY} style={{ height: "100%" ,paddingBottom:'40px'}}>
              {
                area_list.map((item,index) => {
                  return (
                    <ScoutingItem key={item.id} data={item} 
                    index={index + 1} edit={item._edit} 
                    onSave={this.saveArea.bind(this, item)}
                    onCancel={this.addCancel.bind(this, item)}
                    onChange={this.filesChange.bind(this, item)}
                    onUpload={this.fileUpload.bind(this,item)}
                    dataSource={item.collection}
                    onError={this.onAddError}
                    onCollectionRemove={this.onCollectionRemove.bind(this, item)}
                    onEditCollection={this.onEditCollection}/>
                  )
                })
              }
              {
                !!not_area_id_collection.length && 
                <div className={styles.norAreaIdsData}>
                  {
                    not_area_id_collection.map((item,index) => {
                      return (
                        <div key={item.id} className={`${animateCss.animated} ${animateCss.slideInRight}`}
                        style={{animationDuration:"0.3s",animationDelay: index * 0.05 +'s'}}>
                          <UploadItem data={item} type='pic' 
                          onRemove={this.onCollectionRemove.bind(this,item)}
                          onEditCollection={this.onEditCollection}/>
                        </div>
                      )
                    })
                  }
                </div>
              }
              
            </div>
            <div className={styles.addAreaBtn}>
              <Button type="primary" ghost icon={<PlusCircleOutlined/>} onClick={this.pushAreaItem}>新增</Button>
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
      </div>
    );
  }
}
