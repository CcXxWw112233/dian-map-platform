import React, { Fragment } from "react";
import styles from "./index.less";
import animateCss from "../../../../assets/css/animate.min.css";
import { MyIcon } from "../../../../components/utils";
import { Select, Row, Col, message, Button } from "antd";
import DetailAction from "../../../../lib/components/ProjectScouting/ScoutingDetail";
import TimeSelection from "./TimeSelection";
import { connect } from "dva";
import Event from "../../../../lib/utils/event";
import AllCollection from "../AllCollectionList";
import { CSSTransition } from "react-transition-group";
import globalStyle from "@/globalSet/styles/globalStyles.less";
// import CollectionPreview from '../CollectionPreview';

const times = (() => {
  let obj = {};
  for (let i = 0; i < 23; i++) {
    obj[i] = [];
  }
  return obj;
})();
@connect(({ collectionDetail: { selectData, showCollectionsModal } }) => ({
  selectData,
  showCollectionsModal,
}))
export default class LookingBack extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      selectActive: "",
      activeSelectObj: {},
      activeTime: {
        y: new Date().getFullYear(),
      },
      selectData: [],
      previewFull: false,
      timeData: times,
    };
    this.timer = null;
  }
  componentDidMount() {
    let d = DetailAction.oldData.filter((item) => !item.area_type_id);
    let obj = {
      collection: d,
      id: "other",
      name: "未整理",
    };
    this.setSelectionData(DetailAction.CollectionGroup.concat([obj]));
    Event.Evt.on("collectionListUpdate1", this.setSelectionData);
    Event.Evt.on("previewDeatilClose", () => {
      DetailAction.renderGoupCollectionForLookingBack(
        this.state.activeSelectObj?.collection || []
      );
    });
  }
  componentWillUnmount() {
    Event.Evt.un("collectionListUpdate1");
    Event.Evt.un("previewDeatilClose");
  }

  filterNotImg = (data) => {
    let arr = [];
    data.forEach((item) => {
      let collection = item.collection || [];
      let s = [];
      collection.forEach((col) => {
        if (col.child) {
          s = s.concat(col.child);
        } else s.push(col);
      });
      let fArr = s.filter((col) =>
        ["pic", "video", "interview"].includes(
          DetailAction.checkCollectionType(col.target)
        )
      );
      if (fArr.length) {
        let obj = {
          ...item,
          collection: fArr,
        };
        arr.push(obj);
      }
      //  else {
      //   arr.push({ ...item, disabled: true, collection: [] });
      // }
    });
    
    return arr;
  };

  activeGroup = () => {
    let { selectActive } = this.state;
    if (selectActive !== "other") {
      DetailAction.setActiveGoupPointer(selectActive);
    } else {
      DetailAction.setActiveGoupPointer(null);
    }
  };

  setSelectionData = (data) => {
    if (!data) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      let arr = this.filterNotImg(data);

      // console.log(arr)
      // DetailAction.renderGroupPointer(arr);
      this.setState(
        {
          options: arr,
          selectActive: arr[0] ? arr[0].id : "other",
          activeSelectObj: arr[0],
          activeTime: {
            y: this.state.activeTime.y,
          },
          timeData: times,
        },
        () => {
          // this.activeGroup();
        }
      );
    }, 500);
  };
  componentWillReceiveProps(nextProps) {
    if (!nextProps.selectData) {
      DetailAction.setGroupCollectionActive(null);
    }
    if (this.props.active !== nextProps.active && nextProps.active) {
      setTimeout(() => {
        DetailAction.renderGoupCollectionForLookingBack(
          this.state.selectData || []
        );
      }, 50);
    }
  }
  InitOptionGroup = () => {
    let { options } = this.state;
    const { Option } = Select;
    let disabledOptions = options.filter((item) => item.disabled === true);
    let nonDisableOptions = options.filter((item) => !item.disabled);
    options = [...nonDisableOptions, ...disabledOptions];
    return options.map((item) => {
      return (
        <Option key={item.id} disabled={item.disabled}>
          {item.name}
        </Option>
      );
    });
  };

  SelectChangeToRender = (val) => {
    this.setState(
      {
        selectActive: val,
        activeSelectObj: this.state.options.find((item) => item.id === val),
        activeTime: {
          y: new Date().getFullYear(),
        },
      },
      () => {
        // this.activeGroup();
      }
    );
  };

  setActiveChange = (data) => {
    this.setState({
      activeTime: data.active,
    });
    // console.log(data.data,'active')
  };
  setActiveData = (data) => {
    let timeData = Array.from(this.state.timeData);
    let obj = {};
    data.forEach((item) => {
      let time = new Date(item.time);
      let year = time.getFullYear();
      let m = time.getMonth() + 1;
      let date = time.getDate();
      let hours = time.getHours();
      let minut = time.getMinutes();
      let key = hours;
      if (!this.state.activeTime.m && !this.state.activeTime.d) {
        key = `${year}/${m}/${date}`;
      } else if (this.state.activeTime.m && !this.state.activeTime.d) {
        key = `${date}日 ${hours} 时`;
      }
      !obj[key] && (obj[key] = []);
      obj[key].push({ ...item, y: year, m: m, d: date, minutes: minut });
    });
    // 重组展示
    timeData = { ...timeData, ...obj };
    DetailAction.renderGoupCollectionForLookingBack(data || []);
    this.setState({
      selectData: data || [],
      timeData,
    });
  };

  pictureView = (val) => {
    const { dispatch } = this.props;
    // if(DetailAction.checkCollectionType(val.target) === 'pic')
    dispatch({
      type: "collectionDetail/updateDatas",
      payload: {
        selectData: val,
        type: "view",
        isImg: true,
      },
    });
    this.setState({
      activeItem: val.id,
    });
    DetailAction.setGroupCollectionActive(val);
  };
  Full = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "collectionDetail/updateDatas",
      payload: {
        showCollectionsModal: true,
        zIndex: 5,
        type: "view",
        isImg: true,
      },
    });
  };

  toViewCenter = (val) => {
    // console.log(val)
    if (val.location && val.location.longitude && val.location.latitude) {
      let coordinate = [+val.location.longitude, +val.location.latitude];
      DetailAction.toCenter({ center: coordinate });
    } else message.warn("采集资料暂未关联地图坐标");
  };

  render() {
    let {
      selectActive,
      activeSelectObj = {},
      activeTime,
      timeData,
      activeItem,
    } = this.state;
    const { dispatch, showCollectionsModal, board, miniTitle } = this.props;
    return (
      <div className={styles.lookingback}>
        <div className={styles.lookGroupTitle}>
          <div className={styles.chooseGroup}>
            <Select
              bordered={false}
              value={selectActive}
              size="small"
              suffixIcon={<MyIcon type="icon-xialaxuanze" />}
              onChange={this.SelectChangeToRender}
              style={{ width: 100 }}
            >
              {this.InitOptionGroup()}
            </Select>
            <span className={styles.tofull} onClick={this.Full}>
              <MyIcon type="icon-bianzu17beifen" />
            </span>
          </div>
          <div className={styles.remarks}>
            {activeSelectObj.remark && (
              <Fragment>
                <div className={styles.remark_content}>
                  我是备注xxxxx，我是备注xxxxxxx，我是备注xxxxx，我是备注xxxxxxx，我是备注xxxxx，我是备注xxxxxxx
                </div>
                <div className={styles.remark_create_msg}>
                  <Row gutter={8}>
                    <Col span={6}>2020/06/28</Col>
                    <Col span={6}>11:50</Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                      罗xx
                    </Col>
                  </Row>
                </div>
              </Fragment>
            )}
          </div>
          <div className={styles.time_selection}>
            {activeSelectObj.collection && activeSelectObj.collection.length ? (
              <TimeSelection
                data={activeSelectObj.collection}
                active={activeTime}
                idKey="look"
                onChangeActive={this.setActiveChange}
                onChange={this.setActiveData}
              />
            ) : (
              <div style={{ textAlign: "center" }}>
                暂无可回看的采集资料（图片、视频、音频）
              </div>
            )}
          </div>
        </div>
        <div className={styles.lookingback_collection}>
          <div
            style={{
              display: "flex",
              flexFlow: "row wrap",
              width: "100%",
              height: miniTitle ? "calc(100% - 65px)" : "calc(100% - 30px)",
            }}
            className={globalStyle.autoScrollY}
          >
            {Object.keys(timeData).map((item) => {
              if (timeData[item].length) {
                return (
                  <div key={item} style={{ width: "100%" }}>
                    <span className={styles.timeTitle}>
                      {!isNaN(+item) ? item + " 时" : item}
                    </span>
                    <div className={styles.lookingback_item}>
                      {timeData[item].map((data) => {
                        return (
                          <div
                            className={`${styles.looking_item}
                           ${animateCss.animated}
                          ${activeItem === data.data.id ? styles.active : ""}`}
                            key={data.data.id}
                            onClick={() => this.pictureView(data.data)}
                            onDoubleClick={() => this.toViewCenter(data.data)}
                            style={{ flexDirection: "column" }}
                          >
                            {/* <div
                              style={{
                                backgroundColor: "rgba(71, 74, 91, 1)",
                                display: "table",
                              }}
                              className={
                                activeItem === data.data.id ? styles.active : ""
                              }
                            > */}
                            {DetailAction.checkCollectionType(
                              data.data.target
                            ) === "pic" ? (
                              <div
                                style={{
                                  backgroundColor: "rgba(71, 74, 91, 1)",
                                }}
                              >
                                <img
                                  crossOrigin="anonymous"
                                  src={data.data.resource_url}
                                  alt=""
                                  width="100%"
                                />
                              </div>
                            ) : (
                              <div
                                style={{
                                  backgroundColor: "rgba(71, 74, 91, 1)",
                                  padding: 14
                                }}
                              >
                                <i className={globalStyle.global_icon} style={{fontSize: 28}}>
                                  &#xe68b;
                                </i>
                              </div>
                            )}
                            <p>
                              <span>{data.data.title}</span>
                            </p>
                          </div>
                          // </div>
                        );
                      })}
                    </div>
                  </div>
                );
              } else return <span key={item}></span>;
            })}
          </div>
          {/* <div className={styles.lookingback_item}>
            {selectData.map((item, index) => {
              return (
                <div className={styles.looking_item} key={index} onClick={()=> this.pictureView(item.data)}>
                  <div>
                    <span>{item.data.title}</span>
                    {DetailAction.checkCollectionType(item.data.target) === 'pic' &&
                    <img crossOrigin="anonymous" src={item.data.resource_url} alt="" width='100%'/>}
                  </div>
                </div>
              )
            })}
          </div> */}
          {/* <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Button onClick={this.Full}>全屏预览</Button>
            <Button style={{ marginLeft: 10 }}>播放</Button>
          </div> */}
        </div>
        {/* 左侧的所有列表 */}
        <CSSTransition
          in={showCollectionsModal}
          classNames="slideUp"
          timeout={300}
          unmountOnExit
        >
          <AllCollection
            board={board}
            timeData={this.state.timeData}
            onClose={() => {
              dispatch({
                type: "collectionDetail/updateDatas",
                payload: {
                  showCollectionsModal: false,
                  selectData: null,
                  zIndex: 10,
                  type: "view",
                  isImg: true,
                },
              });
            }}
          />
        </CSSTransition>
      </div>
    );
  }
}
