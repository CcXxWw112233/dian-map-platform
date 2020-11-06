import React, { useState, Fragment } from "react";
import { Collapse, Col, Input, Button } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./style.less";
const CreatePanelHeader = ({ data }) => {
  let [isEdit, setIsEdit] = useState(false);
  let [groupName, setGroupName] = useState(data.name);
  return (
    <div
      style={{
        width: "100%",
        height: 28,
        lineHeight: "28px",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <i
        className={globalStyle.global_icon}
        style={{ marginRight: 10, color: data.color }}
        dangerouslySetInnerHTML={{ __html: data.iconfont }}
      ></i>
      {!isEdit ? (
        <span>{data.name}</span>
      ) : (
        <Fragment>
          <Col>
            <Input
              // style={{ borderRadius: "5px" }}
              placeholder="请输入名称"
              size="small"
              autoFocus
              onChange={(e) => setGroupName(e.target.value.trim())}
              onPressEnter={(e) => {
                e.stopPropagation();
                setIsEdit(false);
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              allowClear
              value={groupName}
            />
          </Col>
          <Col span={3} style={{ textAlign: "right" }}>
            <Button
              onClick={() => setIsEdit(false)}
              size="small"
              shape="circle"
            >
              <CloseOutlined />
            </Button>
          </Col>
          <Col span={3} style={{ textAlign: "center" }}>
            <Button
              size="small"
              onClick={() => this.onModifyOk()}
              shape="circle"
              type="primary"
            >
              <CheckOutlined />
            </Button>
          </Col>
        </Fragment>
      )}
      {!data.canNotDel ? (
        <i className={globalStyle.global_icon}>&#xe7b7;</i>
      ) : null}
      {!data.canNotEdit ? (
        <i className={globalStyle.global_icon} onClick={() => setIsEdit(true)}>
          &#xe7b8;
        </i>
      ) : null}
      {/* {data.genExtraIconFont ? (
        <i
          className={globalStyle.global_icon}
          dangerouslySetInnerHTML={{ __html: data.genExtraIconFont }}
          onClick={(e) => {
            e.stopPropagation();
            data.genExtraCallBack(data);
          }}
        ></i>
      ) : null} */}
    </div>
  );
};
export default class Plan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      panels: [
        {
          iconfont: "&#xe616;",
          type: "plan",
          name: "我的计划",
          color: "rgba(106, 154, 255, 1)",
          canNotDel: true,
          canNotEdit: true,
        },
        {
          iconfont: "&#xe7c6;",
          type: "file",
          name: "文件",
          color: "rgba(98, 148, 255, 1)",
          canNotDel: true,
          canNotEdit: true,
          genExtraIconFont: "&#xe7f5;",
          genExtraCallBack: (data) => {},
        },
      ],
      datas: [
        {
          type: "plan",
          finish: "0",
          title: "现场拍照",
          date: "今天  8月24日 周一  10:00",
          star: "1",
          remind: "0",
          overdue: "0",
        },
        {
          type: "plan",
          finish: "0",
          title: "现场拍照",
          date: "今天  8月24日 周一  10:00",
          star: "0",
          remind: "0",
          overdue: "0",
        },
        {
          type: "plan",
          finish: "0",
          title: "索取政策文件和图纸",
          date: "",
          star: "0",
          remind: "0",
          overdue: "0",
        },
        {
          type: "plan",
          finish: "0",
          title: "重点人物访谈",
          date: "9月12日 周五",
          star: "0",
          remind: "1",
          overdue: "0",
        },
        {
          type: "plan",
          finish: "0",
          title: "惠州市博罗县狮子城",
          date: "计划已过期  7月15日 周一",
          star: "0",
          remind: "0",
          overdue: "1",
        },
        {
          type: "plan",
          finish: "1",
          title: "发放调查问卷表",
          date: "7月15日 周三",
          star: "0",
          remind: "0",
          overdue: "0",
        },
        {
          type: "file",
          title: "华侨新村踏勘任务书",
          remark: "7月15日 周三",
        },
        {
          type: "file",
          title: "沙寮村文件",
          remark: "7月15日 周三",
        },
      ],
    };
  }

  addPlan = () => {
    return (
      <div
        className={`${styles.item} ${styles.addPlan}`}
        onClick={() => {
          const { parent } = this.props;
          parent.setState({
            showAddPlan: true,
          });
        }}
      >
        <i className={globalStyle.global_icon}>&#xe7dc;</i>
        <div style={{ width: "calc(100% - 44px)" }} className={styles.content}>
          <span>添加计划</span>
        </div>
      </div>
    );
  };

  createItem = (item) => {
    return (
      <div className={`${styles.item} ${styles.planItem}`}>
        <div className={styles.contentPart1}>
          <i
            className={`${globalStyle.global_icon} ${
              item.finish === "0" ? styles.style1 : styles.style2
            }`}
            dangerouslySetInnerHTML={{
              __html: item.finish === "0" ? "&#xe7f2;" : "&#xe7f8;",
            }}
          ></i>
        </div>
        <div
          className={styles.contentPart2}
          style={{
            width: "calc(100% - 85px)",
            ...(item.date ? {} : { lineHeight: "50px" }),
            ...(item.type !== "file" ? {} : { lineHeight: "50px" }),
          }}
        >
          <span>{item.title}</span>
          {item.date ? (
            <span className={styles.date}>
              {item.date}
              {item.remind === "1" ? (
                <i
                  className={globalStyle.global_icon}
                  style={{
                    color:
                      item.overdue === "1"
                        ? "rgba(249, 84, 85, 1)"
                        : "rgba(106, 154, 255, 1)",
                    marginLeft: 10,
                    fontSize: 14,
                    paddingTop: 6,
                  }}
                >
                  &#xe7f4;
                </i>
              ) : null}
            </span>
          ) : null}
        </div>
        <div className={styles.contentPart3}>
          <i
            className={globalStyle.global_icon}
            style={{
              fontSize: 24,
              visibility: item.star === undefined ? "hidden" : "visible",
              color:
                item.star === "1"
                  ? "rgba(255, 183, 96, 1)"
                  : "rgba(209, 213, 228, 1)",
            }}
          >
            &#xe7f1;
          </i>
          <i
            className={globalStyle.global_icon}
            style={{
              fontSize: 24,
              color: "rgba(158, 166, 194, 1)",
            }}
          >
            &#xe7b8;
          </i>
        </div>
      </div>
    );
  };

  onModifyOk = () => {};

  genExtra = (data) => {
    if (data && data.genExtraIconFont) {
      return (
        <i
          className={globalStyle.global_icon}
          dangerouslySetInnerHTML={{ __html: data.genExtraIconFont }}
          style={{ color: "rgba(158, 166, 194, 1)", fontSize: "18px" }}
          onClick={(e) => {
            e.stopPropagation();
            data.genExtraCallBack(data);
          }}
        ></i>
      );
    }
    return null;
  };

  handleAddGroupClick = () => {};
  render() {
    const { Panel } = Collapse;
    return (
      <div className={styles.wrapper}>
        <div
          className={`${styles.body} ${globalStyle.autoScrollY}`}
          style={{ height: "100%" }}
        >
          <Collapse>
            {this.state.panels.map((item, index) => {
              return (
                <Panel
                  key={index}
                  header={<CreatePanelHeader data={item}></CreatePanelHeader>}
                  extra={this.genExtra(item)}
                >
                  <div style={{ padding: 16 }}>
                    {item.type === "plan" ? this.addPlan() : null}
                    {this.state.datas.map((item2) => {
                      if (item.type === item2.type) {
                        if (item2.finish !== "1" && item2.type === "plan") {
                          return this.createItem(item2);
                        }
                        if (item2.type === "file") {
                          return this.createItem(item2);
                        }
                      }
                      return null;
                    })}
                  </div>
                  <Collapse>
                    <Panel
                      header={
                        <div style={{ textAlign: "left", width: "80%" }}>
                          <span>已完成</span>
                        </div>
                      }
                      className="finish"
                    >
                      <div style={{ padding: 16 }}>
                        {this.state.datas.map((item) => {
                          if (item.finish === "1") {
                            return this.createItem(item);
                          }
                          return null;
                        })}
                      </div>
                    </Panel>
                  </Collapse>
                </Panel>
              );
            })}
          </Collapse>
        </div>
      </div>
    );
  }
}
