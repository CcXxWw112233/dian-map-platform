import React, { PureComponent } from "react";
import styles from "./ScoutingList.less";
import globalStyle from "../../globalSet/styles/globalStyles.less";
import { connect } from "dva";
import Action from '../../lib/components/ProjectScouting/ScoutingList'
import ScoutingItem from './components/ScoutingItem'
import {
  CSSTransition,
  TransitionGroup,
} from 'react-transition-group';
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
    this.getProjectList();
  }

  getProjectList = () => {
    Action.getList().then(res => {
      // 渲染数据
      Action.init().then( _ => {
        Action.renderProjectPoint(res.data || []);
      })

      this.setState({
        projects: res.data
      })
      // console.log(res)
    }).catch(err => {
      console.log(err)
    })
  }

  handleClick = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "controller/updateMainVisible",
      payload: {
        mainVisible: false,
      },
    });
  };

  removeBoard = (val) =>{
    // console.log(val.board_id)
    let id = val.board_id ;
    Action.removeBoard(id).then(res => {
      console.log(res);
      let list = [...this.state.projects];
      this.setState({
        projects: list.filter(item => item.board_id !== id)
      },()=>{
        // 重新渲染
        Action.renderProjectPoint(this.state.projects);
      })
    })
  }

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
      })
    })
  }

  handleAddClick = () => {
    Action.addDrawBoard().then(evt => {
      let { feature } = evt;
      let coor = feature.getGeometry().getCoordinates();
      // 添加overlay
      Action.addBoardOverlay(coor);
    })
  }

  render() {
    const { projects} = this.state;
    return (
      <div className={styles.wrap + ` ${globalStyle.autoScrollY}`}>
        <TransitionGroup
        component={null}
        >
          { projects.map((item,index) => {
            return (
              <CSSTransition
              key={item.board_id}
              timeout={500}
              
              classNames="slideRight">
                <ScoutingItem
                  name={item.board_name}
                  date={""}
                  onRename={this.handleEditBoard.bind(this,item)}
                  cb={this.handleClick.bind(this,item)}
                  onRemove={this.removeBoard.bind(this, item)}
                ></ScoutingItem>
              </CSSTransition>
            )
          })}
        </TransitionGroup>
        
        <ScoutingAddBtn cb={this.handleAddClick.bind(this)} />
      </div>
    );
  }
}
