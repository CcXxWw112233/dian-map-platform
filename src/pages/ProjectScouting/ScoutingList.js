import React, { PureComponent } from "react";
import styles from "./ScoutingList.less";
import globalStyle from "../../globalSet/styles/globalStyles.less";
import { connect } from "dva";
import Action from '../../lib/components/ProjectScouting/ScoutingList'
const ScoutingItem = ({ name, date, cb }) => {
  const colors = [
    "brickRed",
    "darkGreen",
    "lightBlue",
    "lightGreen",
  ];
  const colorStyle = styles[colors[Math.floor(Math.random() * 4)]];
  return (
    <div
      className={`${styles.btn} ${styles.scoutingItem} ${colorStyle}`}
      onClick={cb}
    >
      <p className={styles.name}>
        <span>{name}</span>
      </p>
      <p className={styles.date}>
        <span>{date}</span>
      </p>
    </div>
  );
};
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
      name: "阳山县沙寮村踏勘",
      date: "3/15-3/17",
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
  render() {
    const { projects} = this.state;
    return (
      <div className={styles.wrap + ` ${globalStyle.autoScrollY}`}>
        { projects.map(item => {
          return (
            <ScoutingItem
            key={item.board_id}
            name={item.board_name}
            date={""}
            cb={this.handleClick.bind(this)}
            ></ScoutingItem>
          )
        })}
        <ScoutingAddBtn cb={this.handleClick.bind(this)} />
      </div>
    );
  }
}
