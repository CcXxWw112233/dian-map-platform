import React, { PureComponent } from "react";
import globalStyle from "../../globalSet/styles/globalStyles.less";
import styles from "./ScoutingDetails.less";
import { connect } from "dva";
import { Collapse, Row, Tabs } from "antd";
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
const UploadBtn = () => {
  return (
    <i
      className={globalStyle.global_icon + ` ${globalStyle.btn}`}
      style={{ fontSize: 30, color: "#0D4FF7" }}
    >
      &#xe628;
    </i>
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
        <UploadBtn />
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
    <div className={styles.uploadItem + ` ${globalStyle.btn}`}>
      <div className={styles.uploadIcon + ` ${styles[type]}`}>
        <span>{itemKeyVals[type]}</span>
      </div>
      <div className={styles.uploadDetail}>
        <Row>
          <span className={styles.firstRow}>可以叠加到地图上的资料</span>
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
      name: "阳山县沙寮村踏勘",
      date: "3/15-3/17",
      visible: true,
      activeKey: panes[0].key,
      panes,
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

  render(h) {
    const { name, date } = this.state;
    const panelStyle = {
      height: "96%",
    };
    return (
      <div className={styles.wrap}>
        <Title
          name={name}
          date={date}
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
