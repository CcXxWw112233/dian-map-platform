import React, { PureComponent } from "react";
import styles from "./ScoutingList.less";

import globalStyle from "../../globalSet/styles/globalStyles.less";
import { connect } from "dva";
import Action from '../../lib/components/ProjectScouting/ScoutingList'
import ScoutingItem from './components/ScoutingItem'
import { message } from "antd";

const ScoutingAddBtn = ({ cb }) => {
  return (
    <div className={styles.btn + ` ${styles.scoutingAdd}`} onClick={cb}>
      <p>
        <i className={globalStyle.global_icon}>&#xe65f;</i>
        <span>制定踏勘计划</span>
      </p>
    </div>
  );
};
@connect(({ controller: { mainVisible } }) => ({ mainVisible }))
export default class ScoutingList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      projects:[],
    };
  }

  componentDidMount(){
    // 检查数据
    this.renderBoardList();
    Action.init();
    Action.on('projectClick',(val)=>{
      // console.log(val)
      this.handleClick(val)
    })
  }

  renderBoardList = ()=>{
    // 获取列表
    this.getProjectList().then(val => {
      // 没有列表的时候，不进行任何操作
      if(!val.length) return ;
      this.renderPoint(val)
    });
  }

  renderPoint = (data) => {
    // 渲染数据
    Action.renderProjectPoint(data || []);
  }

  getProjectList = () => {
    return new Promise((resolve,reject) => {
      Action.getList().then(res => {
        this.setState({
          projects: res.data
        })
        resolve(res.data)
        // console.log(res)
      }).catch(err => {
        console.log(err)
        reject(err);
      })
    })
    
  }

  // 检查输入的id存不存在与列表中
  checkData = (data,id) => {
    for(let i = 0; i< data.length; i++){
      let item = data[i];
      // 有存在的数据，可以跳转页面
      if(item.board_id.toString() === id.toString()){
        return item;
      }
    }
  }

  // 点击项目
  handleClick = (val) => {
    let { dispatch } = this.props;
    this.checkData(this.state.projects, val.board_id);
    // 触发本地缓存
    Action.handleClickBoard(val);
    // 切换到详情页
    dispatch({
      type: "controller/updateMainVisible",
      payload: {
        mainVisible: 'detail',
      },
    })
  };

  // 删除项目
  removeBoard = (val) =>{
    // console.log(val.board_id)
    let id = val.board_id ;
    Action.removeBoard(id).then(res => {
      let list = [...this.state.projects];
      this.setState({
        projects: list.filter(item => item.board_id !== id)
      },()=>{
        // 重新渲染
        Action.renderProjectPoint(this.state.projects);
      })
    })
  }

  // 编辑项目名称
  handleEditBoard = (val,name)=>{
    if(val.board_name === name){
      return ;
    }
    Action.editBoardName(val.board_id,{	board_name: name}).then(res => {
      message.success('项目名称修改成功');
      let projects = [...this.state.projects].map(item => {
        if(item.board_id === val.board_id){
          item.board_name = name;
        }
        return item;
      })
      this.setState({
        projects
      },()=>{
        Action.renderProjectPoint(projects)
      })
    })
  }

  // 添加项目请求
  addBoard = (val)=>{
    let { name } = val;
    message.destroy();
    Action.addBoard({board_name: name,lng: val.coordinates[0],lat:val.coordinates[1]}).then(res => {
      let { data } = res;
      // 添加数据
      this.setState({
        projects: this.state.projects.concat([data])
      },()=>{
        // 更新点的数据
        Action.renderProjectPoint(this.state.projects);
      })
      message.success('新建项目成功')
      this.showOtherSlide();
    }).catch(err => {
      console.log(err)
      this.showOtherSlide();
      Action.removeDraw();
      message.error('新增计划失败，请稍后重试')
    })
  }
  // 显示被隐藏的页面
  showOtherSlide = ()=>{
    let { dispatch } = this.props;
    // 显示已关闭其他不需要的元素
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

  // 取消新增
  cancelAdd = (e)=>{
    e && e.preventDefault();
    Action.removeDraw();
    this.showOtherSlide();
    message.destroy();
  }

  // 添加按钮点击事件
  handleAddClick = () => {
    // 隐藏其他不需要的窗体
    this.hideOtherSlide();
    message.success(<span>请选择项目地点 或 <a onClick={this.cancelAdd}>取消新建</a></span>,0)
    // 添加绘制功能
    Action.addDrawBoard().then(evt => {
      
      let { feature } = evt;
      let coor = feature.getGeometry().getCoordinates();
      // 添加overlay
      Action.addBoardOverlay(coor,{viewToCenter:true}).then( data => {
        // console.log(data);
        data.coordinates = coor;
        this.addBoard(data);
      }).catch(err => {
        // 取消新增
        this.cancelAdd();

        message.warn('已取消新建操作');
      });
    })
  }

  render() {
    const { projects} = this.state;
    return (
      <div className={styles.wrap + ` ${globalStyle.autoScrollY}`}>
          { projects.map((item,index) => {
            return (
              <ScoutingItem
                key={item.board_id}
                name={item.board_name}
                date={""}
                style={{
                  animationDelay: index * 0.05 +'s',
                  animationDuration:"0.3s" ,
                  animationTimingFunction:"ease-in-out"
                }}
                onRename={this.handleEditBoard.bind(this,item)}
                cb={this.handleClick.bind(this,item)}
                onRemove={this.removeBoard.bind(this, item)}
              ></ScoutingItem>
            )
          })}
        <ScoutingAddBtn cb={this.handleAddClick.bind(this)} />
      </div>
    );
  }
}
