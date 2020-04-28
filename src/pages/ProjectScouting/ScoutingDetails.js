import React, { PureComponent } from "react";
import globalStyle from "../../globalSet/styles/globalStyles.less";
import styles from "./ScoutingDetails.less";
import { connect } from "dva";
import { Collapse, Row, Tabs } from "antd";
const { TabPane } = Tabs;

const Title = ({ name, date, cb, children }) => {
  return (
    <div className={styles.title}>
      <p style={{ marginTop: 20 }}>
        <i
          className={
            globalStyle.global_icon + ` ${styles.gobackBtn} ${globalStyle.btn}`
          }
          onClick={cb}
        >
          &#xe603;
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
      <p
        style={{
          marginTop: 8,
        }}
      >
        <i className={globalStyle.global_icon + ` ${globalStyle.btn}`}>
          &#xe65f;
        </i>
        {children}
      </p>
    </div>
  );
};

const ScoutingItem = ({ data }) => {
  const header = (
    <div
      style={{
        display: "flex",
      }}
    >
      <div className={styles.numberIcon}>
        <span>2</span>
      </div>
      <div className={styles.text}>
        <span>区域A的调研</span>
      </div>
    </div>
  );
  return (
    <Collapse expandIconPosition="right" className={styles.scoutingItem}>
      <Collapse.Panel header={header}>
        <div className={styles.itemDetail}>
          <p>
            <i className={globalStyle.global_icon}>&#xe616;</i>
            <span>3月15日</span>
            <i className={globalStyle.global_icon}>&#xe600;</i>
            <span>沙寮村委</span>
          </p>
          <p>
            <i className={globalStyle.global_icon}>&#xe685;</i>
            <span>执行任务清单、备忘、要求等细节说明填在此</span>
          </p>
        </div>
        <UploadItem type="paper" />
        <UploadItem type="paper" />
        <UploadItem type="interview" />
        <UploadItem type="pic" />
        <UploadItem type="video" />
        <UploadItem type="word" />
        <UploadItem type="annotate" />
        <UploadItem type="plotting" />
        <UploadItem type="video" />
        <i
          className={globalStyle.global_icon + ` ${globalStyle.btn}`}
          style={{ fontSize: 30, color: "#0D4FF7" }}
        >
          &#xe628;
        </i>
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
        <i className={globalStyle.global_icon + ` ${globalStyle.btn}`}>
          &#xe6d9;
        </i>
        人口
      </div>
      <i
        className={globalStyle.global_icon + ` ${globalStyle.btn}`}
        style={{ fontSize: 30, color: "#0D4FF7" }}
      >
        &#xe628;
      </i>
    </div>
  );
  return (
    <Collapse expandIconPosition="right" className={styles.scoutingItem}>
      <Collapse.Panel header={header}>
        <UploadItem type="paper" />
        <UploadItem type="paper" />
        <UploadItem type="interview" />
      </Collapse.Panel>
    </Collapse>
  );
};
const UploadItem = ({ type }) => {
  const itemKeyVals = {
    paper: "图纸",
    interview: "访谈",
    pic: "图片",
    video: "视频",
    word: "文档",
    annotate: "批注",
    plotting: "标绘",
  };
  return (
    <div className={styles.uploadItem}>
      <div className={styles.uploadIcon + ` ${styles[type]}`}>
        <span>{itemKeyVals[type]}</span>
      </div>
      <div className={styles.uploadDetail}>
        <Row>
          <span>可以叠加到地图上的资料</span>
        </Row>
        <Row>
          <span>区珊</span>
          <span>2020/01/27</span>
          <span>05:30PM</span>
        </Row>
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
      visible: true,
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
  handleTogglePanelClick = (index) => {};
  render(h) {
    const { name, date } = this.state;
    const panelStyle = {
      height: "93%",
    };
    return (
      <div className={styles.wrap}>
        <Title
          name={name}
          date={date}
          cb={this.handleGoBackClick.bind(this)}
        ></Title>
        <Tabs
          // tabPosition="left"
          tabBarGutter={10}
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "absolute",
            top: 196,
            left: 0,
            bottom: 2,
            width: "100%"
          }}
        >
          <TabPane tab={<span>按区域</span>} key="1" style={panelStyle}>
            <div className={globalStyle.autoScrollY} style={{ height: "100%" }}>
              <ScoutingItem />
              <ScoutingItem />
              <ScoutingItem />
              <ScoutingItem />
            </div>
          </TabPane>
          <TabPane tab={<span>按标签</span>} key="2">
            <div className={globalStyle.autoScrollY} style={{ height: "100%" }}>
              <ScoutingItem2 />
              <ScoutingItem2 />
              <ScoutingItem2 />
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
