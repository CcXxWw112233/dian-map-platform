import React, { Fragment } from "react";
import ReactDOM from "react-dom";

import { DatePicker } from "antd";
import moment from "moment";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./styles.less";
import styles2 from "./index.less"
import "moment/locale/zh-cn";
import locale from "antd/lib/date-picker/locale/zh_CN";
import { MyIcon } from "../../../../components/utils";
import DetailAction from "../../../../lib/components/ProjectScouting/ScoutingDetail";
import TrafficDetail from "./TrafficDetail";
import { connect } from "dva";

@connect(({ collectionDetail: { selectData, zIndex, type, isImg, small, selectedFeature } }) => ({
  selectData,
  zIndex,
  type,
  isImg,
  small,
  selectedFeature
}))
export default class NewCollectionDetai extends React.Component {
  constructor(props) {
    super(props);
    this.tags = [
      {
        key: "publicBus",
        label: "公交",
      },
      {
        key: "metro",
        label: "地铁",
      },
      {
        key: "shop",
        label: "商场",
      },
      {
        key: "bank",
        label: "银行",
      },
      {
        key: "gasStation",
        label: "加油站",
      },
      {
        key: "hotel",
        label: "酒店",
      },
    ];
    this.state = {
      imgs: [
        "https://dian-yinyi-map-test.oss-cn-beijing.aliyuncs.com/2020-05-21/8640d361de87ddf88c6a342fd435b053.jpg?Expires=1607673822&amp;OSSAccessKeyId=LTAIiTOudd9oeHVo&amp;Signature=7W6YKavBg4vopnsxjAenRdOhw5c%3D",
        "https://dian-yinyi-map-test.oss-cn-beijing.aliyuncs.com/2020-05-21/8640d361de87ddf88c6a342fd435b053.jpg?Expires=1607673822&amp;OSSAccessKeyId=LTAIiTOudd9oeHVo&amp;Signature=7W6YKavBg4vopnsxjAenRdOhw5c%3D",
        "https://dian-yinyi-map-test.oss-cn-beijing.aliyuncs.com/2020-05-21/8640d361de87ddf88c6a342fd435b053.jpg?Expires=1607673822&amp;OSSAccessKeyId=LTAIiTOudd9oeHVo&amp;Signature=7W6YKavBg4vopnsxjAenRdOhw5c%3D",
        "https://dian-yinyi-map-test.oss-cn-beijing.aliyuncs.com/2020-05-21/8640d361de87ddf88c6a342fd435b053.jpg?Expires=1607673822&amp;OSSAccessKeyId=LTAIiTOudd9oeHVo&amp;Signature=7W6YKavBg4vopnsxjAenRdOhw5c%3D",
        "https://dian-yinyi-map-test.oss-cn-beijing.aliyuncs.com/2020-05-21/8640d361de87ddf88c6a342fd435b053.jpg?Expires=1607673822&amp;OSSAccessKeyId=LTAIiTOudd9oeHVo&amp;Signature=7W6YKavBg4vopnsxjAenRdOhw5c%3D",
        "https://dian-yinyi-map-test.oss-cn-beijing.aliyuncs.com/2020-05-21/8640d361de87ddf88c6a342fd435b053.jpg?Expires=1607673822&amp;OSSAccessKeyId=LTAIiTOudd9oeHVo&amp;Signature=7W6YKavBg4vopnsxjAenRdOhw5c%3D",
      ],
      isSearch: false,
      currentIndex: 0,
    };
  }

  renderImage = (index, img) => {
    return <img key={index} crossOrigin="anonymous" src={img} alt="" />;
  };
  disabledDate = (current) => {
    return current && current < moment().add(-1, "day");
  };
  disabledDateTime = (_, type) => {
    if (type === "start") {
      return {
        disabledHours: () => this.range(0, 60).splice(4, 20),
        disabledMinutes: () => this.getMinutes(0, 60),
        disabledSeconds: () => [55, 56],
      };
    }
    return {
      disabledHours: () => [...this.range(0, 6), ...this.range(23, 24)],
      disabledMinutes: () => this.getMinutes(0, 60),
      // disabledSeconds: () => [55, 56],
    };
  };

  detailClose = () => {
    const { dispatch } = this.props;
    DetailAction.clearSelectPoint();
    DetailAction.cancelSearchAround();
    dispatch({
      type: "collectionDetail/updateDatas",
      payload: { selectData: null, isImg: true },
    });
  };

  detailBack = () => {
    this.searchAroundAbout({}, this.state.isSearch);
  };

  toSearch = (data) => {
    const { selectedFeature } = this.props;
    let id = selectedFeature.get("id")
    const val = { id: id };
    this.searchAroundAbout(val, this.state.isSearch, data.label)
  }

  searchAroundAbout = (val, flag, type) => {
    let isSearchFlag = !flag;
    if (flag) {
      DetailAction.cancelSearchAround();
    } else {
      DetailAction.cancelSearchAround();
      DetailAction.init();
      let f = DetailAction.addSearchAround({ id: val.id, stype: type });
      if (f === false) {
        isSearchFlag = false;
      }
    }
    this.setState({
      isSearch: isSearchFlag,
    });
  };

  render () {
    const { selectedFeature } = this.props;
    const title = selectedFeature.get("title");
    const address = selectedFeature.get("address");
    let tel = selectedFeature.get("tel");
    tel = (tel === [] ? "" : tel)
    let { zIndex, selectData, isImg, small } = this.props;
    selectData = Array.isArray(selectData)
      ? selectData
      : selectData
        ? [selectData]
        : null;
    return ReactDOM.createPortal(
      <Fragment>
        {!this.state.isSearch ? <div className={styles.wrapper}>
          <div className={styles.header}>
            <i className={globalStyle.global_icon} onClick={this.detailClose}>&#xe7d0;</i>
          </div>
          <div
            className={`${styles.body} ${globalStyle.autoScrollY}`}
            style={{ height: "calc(100% - 40px)" }}
          >
            <div className={styles.imgContainer}>
              <img
                crossorigin="anonymous"
                src="https://dian-yinyi-map-test.oss-cn-beijing.aliyuncs.com/2020-05-21/8640d361de87ddf88c6a342fd435b053.jpg?Expires=1607673822&amp;OSSAccessKeyId=LTAIiTOudd9oeHVo&amp;Signature=7W6YKavBg4vopnsxjAenRdOhw5c%3D"
                alt=""
              />
            </div>
            <div className={styles.content}>
              <p className={styles.title}>
                <span>{title || ""}</span>
              </p>
              <p className={styles.describe}>电信服务商</p>
              <p className={styles.space}></p>
              <div className={styles.info}>
                <i className={globalStyle.global_icon}>&#xe7c7;</i>
                <span>
                  {address || "暂无地址"}
                </span>
              </div>
              <div className={styles.info}>
                <i className={globalStyle.global_icon}>&#xe832;</i>
                <span>{tel || "暂时联系方式"}</span>
              </div>
              <p className={styles.space}></p>
              <p className={styles.title} style={{ fontSize: "1em" }}>
                <span>照片</span>
              </p>
              <div
                className={`${styles.imgLongContainer}  ${globalStyle.autoScrollX}`}
              >
                {this.state.imgs.map((item, index) => {
                  return (
                    <img key={index} crossOrigin="anonymous" src={item} alt="" />
                  );
                })}
              </div>
              <div className={styles.addImgBtn}>
                <i className={globalStyle.global_icon}>&#xe7b9;</i>
                <span>添加照片</span>
              </div>
              <p className={styles.space}></p>
              <div className={styles.title} style={{ fontSize: 12 }}>
                <span>周边快查</span>
              </div>
              <div className={styles.aroundSearch}>
                {this.tags.map((item) => {
                  return <span key={item.key} onClick={(item) => this.toSearch(item)}>{item.label}</span>;
                })}
              </div>
              <p className={styles.space}></p>
              <div
                className={`${styles.title} ${styles.row}`}
                style={{ fontSize: 12 }}
              >
                <span>会议资源</span>
                <div style={{ display: "inherit" }}>
                  <div className={`${styles.circle} ${styles.red}`}></div>
                  <span>已占用</span>
                  <div className={`${styles.circle} ${styles.green}`}></div>
                  <span>可预约</span>
                </div>
              </div>
              <p className={styles.describe}>会议日期</p>
              <DatePicker
                style={{ width: "100%" }}
                allowClear={false}
                size="small"
                placeholder="选择会议时间"
                bordered={false}
                format="YYYY年MM月DD日"
                locale={locale}
                disabledDate={this.disabledDate}
                disabledTime={this.disabledDateTime}
              ></DatePicker>
              {/* <div className={styles.listItem}>

            </div> */}
              <div className={`${styles.title} ${styles.row}`}>
                <div style={{ display: "inherit", fontSize: "0.8em" }}>
                  <div
                    className={`${styles.circle} ${styles.green}`}
                    style={{ marginLeft: 0 }}
                  ></div>
                  <span>1号会议室</span>
                </div>
                <div style={{ display: "inherit" }}>¥80/小时</div>
              </div>
              <div className={styles.detail}>
                <div className={styles.detailDescribe}>
                  <p className={styles.describe}>设备：65寸交互大屏/投影/音响</p>
                  <p className={styles.describe}>容纳人数：50人</p>
                </div>
                <MyIcon type="icon-erweima" />
              </div>
              <p className={styles.space}></p>
              <div className={`${styles.title} ${styles.row}`}>
                <div style={{ display: "inherit", fontSize: "0.8em" }}>
                  <div
                    className={`${styles.circle} ${styles.green}`}
                    style={{ marginLeft: 0 }}
                  ></div>
                  <span>1号会议室</span>
                </div>
                <div style={{ display: "inherit" }}>¥80/小时</div>
              </div>
              <div className={styles.detail}>
                <div className={styles.detailDescribe}>
                  <p className={styles.describe}>设备：65寸交互大屏/投影/音响</p>
                  <p className={styles.describe}>容纳人数：50人</p>
                </div>
                <MyIcon type="icon-erweima" />
              </div>
              <p className={styles.space}></p>
              <div className={`${styles.title} ${styles.row}`}>
                <div style={{ display: "inherit", fontSize: "0.8em" }}>
                  <div
                    className={`${styles.circle} ${styles.red}`}
                    style={{ marginLeft: 0 }}
                  ></div>
                  <span>1号会议室</span>
                </div>
                <div style={{ display: "inherit" }}>¥80/小时</div>
              </div>
              <div className={styles.detail}>
                <div className={styles.detailDescribe}>
                  <p className={styles.describe}>设备：65寸交互大屏/投影/音响</p>
                  <p className={styles.describe}>容纳人数：50人</p>
                </div>
                <MyIcon type="icon-erweima" />
              </div>
              <p className={styles.space}></p>
            </div>
          </div>
        </div> : <div className={styles2.collection_detail}><TrafficDetail
          onBack={this.detailBack}
          data={selectData && selectData[this.state.currentIndex]}
          type={this.state.activeType}
          onClose={this.detailClose}
        /></div>}
      </Fragment>,
      document.body
    );
  }
}
