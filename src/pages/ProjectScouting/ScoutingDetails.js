import React, { PureComponent } from "react";
import globalStyle from "../../globalSet/styles/globalStyles.less";
import styles from "./ScoutingDetails.less";
import { connect } from "dva";
const GoBack = ({ cb }) => {
  return (
    <i
      className={
        globalStyle.global_icon + ` ${styles.gobackBtn} ${globalStyle.btn}`
      }
      style={{
        position: "absolute",
        left: 16,
        top: 16,
        zIndex: 99,
      }}
      onClick={cb}
    >
      &#xe603;
    </i>
  );
};
const Title = ({ name, date, children }) => {
  return (
    <div className={styles.title}>
      <p className={styles.name}>
        <span>{name}</span>
      </p>
      <p className={styles.date}>
        <span>{date}</span>
      </p>
      <div style={{
        position: 'absolute',
        left: '10px',
        bottom: '0px',
        fontSize: '20px',
        height: '30px',
        display: 'flex',
      }}>
      <i className={globalStyle.global_icon + ` ${globalStyle.btn}`}>&#xe65f;</i>
      <div className={styles.tab + ` ${styles.slect} ${globalStyle.btn}`}>按区域</div>
      <div className={styles.tab + ` ${globalStyle.btn}`}>按标签</div>
      </div>
    </div>
  );
};

@connect(({ controller: { mainVisible } }) => ({ mainVisible }))
export default class ScoutingDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      name: "阳山县沙寮村踏勘",
      date: "3/15-3/17",
    };
  }
  handleGoBackClick = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "controller/updateMainVisible",
      payload: {
        mainVisible: true,
      },
    });
  };
  render(h) {
    const { name, date } = this.state;
    return (
      <div className={styles.wrap}>
        <GoBack cb={this.handleGoBackClick.bind(this)}></GoBack>
        <Title name={name} date={date}>

        </Title>
      </div>
    );
  }
}
