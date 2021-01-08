import React from "react";
import { DatePicker, Checkbox, Button, message } from "antd";
import moment from "moment";
import "moment/locale/zh-cn";
import locale from "antd/lib/date-picker/locale/zh_CN";

import styles from "./styles.less";
import SubscribeModal from "./modal";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import Event from "../../../../lib/utils/event";
import { connect } from "dva";
@connect(({ meetingSubscribe: { hotelNames } }) => ({
  hotelNames,
}))
export default class MeetingSubscribe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      meetingRooms: [
        {
          hotelName: "深圳皇冠假日酒店1",
          pic:
            "https://dian-yinyi-map-test-public.oss-cn-beijing.aliyuncs.com/2021-01-06/379d1415859d4b959ed89e57b8b8369b.jpg",
          star: 5,
          free: Math.round(Math.random() * 3 + 1),
        },
        {
          hotelName: "深圳皇冠假日酒店2",
          pic:
            "https://dian-yinyi-map-test-public.oss-cn-beijing.aliyuncs.com/2021-01-06/379d1415859d4b959ed89e57b8b8369b.jpg",
          star: 5,
          free: Math.round(Math.random() * 3 + 1),
        },
      ],
      checkedArr: [],
    };
    Event.Evt.on("updateMeetingRoom", (arr) => {
      let tmpArr = [];
      tmpArr = arr.map((item) => {
        return {
          hotelName: item,
          pic:
            "https://dian-yinyi-map-test-public.oss-cn-beijing.aliyuncs.com/2021-01-06/379d1415859d4b959ed89e57b8b8369b.jpg",
          star: 5,
          free: Math.round(Math.random() * 3 + 1),
        };
      });
      this.setState({
        meetingRooms: tmpArr,
      });
    });
    this.selectedMeetingRoom = {};
  }
  componentDidMount() {
    const { hotelNames } = this.props;
    let tmpArr = [];
    tmpArr = hotelNames.map((item) => {
      return {
        hotelName: item,
        pic:
          "https://dian-yinyi-map-test-public.oss-cn-beijing.aliyuncs.com/2021-01-06/379d1415859d4b959ed89e57b8b8369b.jpg",
        star: 5,
        free: Math.round(Math.random() * 3 + 1),
      };
    });
    this.setState({
      meetingRooms: tmpArr,
    });
  }
  handleOKClick = () => {
    this.selectedMeetingRoom = {};
    if (this.state.checkedArr.length > 0) {
      this.state.checkedArr.forEach((item) => {
        const tmp = item.split("-");
        if (!this.selectedMeetingRoom[tmp[0]]) {
          this.selectedMeetingRoom[tmp[0]] = [];
        }
        this.selectedMeetingRoom[tmp[0]].push(tmp[1]);
      });
      this.setState({
        showModal: true,
      });
    } else {
      message.info("请先选择要预订的会议室");
    }
  };
  creatStarsDom = (len) => {
    let vdoms = [];
    for (let i = 0; i < len; i++) {
      let vdom = (
        <i key={i + 1 + "star"} className={globalStyle.global_icon}>
          &#xe7f1;
        </i>
      );
      vdoms.push(vdom);
    }
    return vdoms;
  };
  createMeetingRoomDom = (len, index) => {
    let vdoms = [];
    for (let i = 0; i < len; i++) {
      let key = `${index}-${i + 1}`;
      let vdom = (
        <div key={i + 1 + "号会议室"} className={styles.list_item}>
          <p
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span className={styles.item_title}>{i + 1}号会议室</span>
            <Checkbox
              key={key}
              checked={this.state.checkedArr.includes(key)}
              onChange={(e) => this.onCheckboxChange(e, key)}
            ></Checkbox>
          </p>
          <p>设备：65寸交互大屏/投影/音响</p>
          <p
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <span>容纳人数：80人</span>
            <span
              style={{ color: "#575C75", fontSize: 14 }}
              className={styles.item_price}
            >
              120元/小时
            </span>
          </p>
        </div>
      );
      vdoms.push(vdom);
    }
    return vdoms;
  };
  onCheckboxChange = (e, key) => {
    let { checkedArr } = this.state;
    let index = checkedArr.findIndex((item) => item === key);
    if (index > -1) {
      checkedArr.splice(index, 1);
    } else {
      checkedArr.push(key);
    }
    this.setState({
      checkedArr: checkedArr,
      showModal: false,
    });
  };
  handleClosePanelClick = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "meetingSubscribe/updateData",
      payload: {
        panelVisible: false,
      },
    });
  };
  render() {
    return (
      <div
        className={styles.wrapper}
        style={{ position: "absolute", top: 10, right: 10 }}
      >
        <p className={styles.title}>
          <i
            className={globalStyle.global_icon}
            onClick={this.handleClosePanelClick}
          >
            &#xe7d0;
          </i>
        </p>
        <div
          className={`${styles.body} ${globalStyle.autoScrollY}`}
          style={{ height: "calc(100% - 104px)" }}
        >
          <p style={{ marginBottom: 14 }}>
            <span>日期</span>
          </p>
          <DatePicker
            locale={locale}
            showTime={{
              defaultValue: moment("00:00", "HH:mm"),
              minuteStep: 5,
            }}
            style={{ width: "100%" }}
          ></DatePicker>
          <p
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 24,
            }}
          >
            <span>预定会议</span>
            <span>预定</span>
          </p>
          {this.state.meetingRooms.map((item, index) => {
            return (
              <div key={index} className={styles.block}>
                <div className={styles.main_content}>
                  <div className={styles.img_container}>
                    <img src={item.pic} alt="" />
                  </div>
                  <div className={styles.detail_container}>
                    <p className={styles.detail_title}>{item.hotelName}</p>
                    <p className={styles.detail_star}>
                      {this.creatStarsDom(item.star)}
                    </p>
                    <p>
                      <span>会议室及宴会厅：</span>
                      <span style={{ color: "#5A86F5" }}>
                        {item.free}个可用
                      </span>
                    </p>
                    <p>游泳池/免费停车/Wi-Fi</p>
                  </div>
                </div>
                {this.createMeetingRoomDom(item.free, index)}
              </div>
            );
          })}
        </div>
        <div className={styles.footer}>
          <Button shape="round" onClick={this.handleOKClick}>
            预订会议室
          </Button>
        </div>
        {this.state.showModal ? (
          <SubscribeModal parent={this}></SubscribeModal>
        ) : null}
      </div>
    );
  }
}
