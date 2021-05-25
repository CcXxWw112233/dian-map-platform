import React, { Fragment } from "react";
import ReactDOM from "react-dom";

import { DatePicker, Upload, message, Popconfirm } from "antd";
import moment from "moment";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { BASIC } from "@/services/config";
import { formatSize } from "../../../../utils/utils";
import styles from "./styles.less";
import styles2 from "./index.less";
import "moment/locale/zh-cn";
import locale from "antd/lib/date-picker/locale/zh_CN";
import { MyIcon } from "../../../../components/utils";
import DetailAction from "../../../../lib/components/ProjectScouting/ScoutingDetail";
import TrafficDetail from "./TrafficDetail";
import CollectionDetail from "./index";
import plotImageAction from "@/services/plotImage";
import PhotoSwipe from "../../../../components/PhotoSwipe/action";
// import Event from "@/lib/utils/event";
import Event from "../../../../lib/utils/event";
import { compress } from "../../../../utils/pictureCompress";
import { getSession } from "utils/sessionManage";
import { connect } from "dva";
import Cookies from 'js-cookie'

@connect(
  ({
    collectionDetail: {
      selectData,
      zIndex,
      type,
      isImg,
      small,
      selectedFeature,
    },
    permission: { projectPermission, projectId },
  }) => ({
    selectData,
    zIndex,
    type,
    isImg,
    small,
    selectedFeature,
    projectPermission,
    projectId,
  })
)
export default class NewCollectionDetail extends React.Component {
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
      imgs: [],
      isSearch: false,
      currentIndex: 0,
      fileList: [],
      showQrPanel: false,
      qrPanelX: null,
      qrPanelY: null,
      showUploadImage: false,
    };
    this.checkedData = null;
    this.checkedImage = null;
  }
  componentDidMount() {
    this.getPermission();
    this.getImages();
    Event.Evt.on("deletePlotImage", (id) => {
      const index = this.state.imgs.findIndex((item) => item.id === id);
      if (index < 0) return;
      plotImageAction.delete(id).then((res) => {
        if (res && res.code === "0") {
          message.info("删除成功");
          let { selectedFeature } = this.props;
          if (!selectedFeature) return;
          let id = selectedFeature.get("id");
          plotImageAction.getList(id).then((res2) => {
            if (res2 && res2.code === "0") {
              let selectedImageData = null;
              if (res2.data.length > 0) {
                if (index === this.state.imgs.length - 1) {
                  selectedImageData = res2.data[res2.data.length - 1];
                } else {
                  selectedImageData = res2.data[index];
                }
              }
              this.setState({
                imgs: res2.data,
                selectedImageData: selectedImageData,
              });
              const { dispatch } = this.props;
              dispatch({
                type: "openswitch/updateDatas",
                payload: {
                  imagePreviewVisible: res2.data.length > 0 ? true : false,
                  selectedImageData: selectedImageData,
                  imageDatas: res2.data,
                },
              });
            }
          });
        }
      });
    });
  }

  // componentWillReceiveProps() {
  //   const { selectedFeature } = this.props;
  //   if (selectedFeature) {
  //     this.getImages();
  //   }
  // }

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
    DetailAction.changeLastSelectedFeatureStyle();
    DetailAction.selectedFeature = null;
    DetailAction.lastSelectedFeature = null;
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
    let id = selectedFeature.get("id");
    const val = { id: id };
    this.searchAroundAbout(val, this.state.isSearch, data.label);
  };

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

  checkFileSize = (file) => {
    return new Promise((resolve) => {
      let { size, text } = formatSize(file.size);
      text = text.trim();
      if (+size > 60 && text === "MB") {
        message.error("文件不能大于60MB---" + file.name);
        return false;
      }
      compress(file, 16384).then((res) => {
        resolve(res);
      });
    });
  };

  getImages = () => {
    let { selectedFeature } = this.props;
    if (!selectedFeature) return;
    let id = selectedFeature.get("id");
    plotImageAction.getList(id).then((res) => {
      if (res && res.code === "0") {
        this.setState({
          imgs: res.data,
        });
      }
    });
  };

  uploadFileAction = (file) => {
    return new Promise((resolve, inject) => {
      let { selectedFeature } = this.props;
      let id = selectedFeature.get("id");
      let formData = new FormData();
      formData.append("file", file);
      plotImageAction
        .upload_file(formData)
        .then((res) => {
          if (res && res.code === "0") {
            let resource_id = res.data.file_resource_id;
            plotImageAction
              .add(resource_id, id)
              .then((res2) => {
                message.success("上传照片成功！")
                if (res2 && res2.code === "0") {
                  plotImageAction.getList(id).then((res3) => {
                    if (res3 && res3.code === "0") {
                      this.setState({
                        imgs: res3.data,
                      });
                    }
                  });
                } else {
                  message.error(res.message);
                }
              })
              .catch((e) => {
                message.error(e.message);
              });
          } else {
            message.error(res.message);
          }
        })
        .catch((e) => {
          message.error(e.message);
        });
    });
  };

  onUpload = (e) => {
    let { size, text } = formatSize(e.file.size);
    text = text.trim();
    if (!(+size > 60 && text === "MB")) {
      this.setState({
        fileList: e.fileList,
      });
    }
  };
  handleImgClick = (data, datas) => {
    // if (this.checkedData?.id != data.id) {
    //   this.checkedData = data;
    //   let img = new Image();
    //   img.src = data.image_url;
    //   img.onload = () => {
    //     this.checkedImage = img;
    //     let w = img.width;
    //     let h = img.height;
    //     PhotoSwipe.show([{ w, h, src: img.src, title: "" }]);
    //   };
    // } else {
    //   let w = this.checkedImage.width;
    //   let h = this.checkedImage.height;
    //   PhotoSwipe.show([{ w, h, src: this.checkedImage.src, title: "" }]);
    // }
    const { dispatch } = this.props;
    dispatch({
      type: "openswitch/updateDatas",
      payload: {
        imagePreviewVisible: true,
        selectedImageData: data,
        imageDatas: datas,
      },
    });
  };

  getOffsetTop = (el) => {
    return el.offsetParent
      ? el.offsetTop + this.getOffsetTop(el.offsetParent)
      : el.offsetTop;
  };

  getOffsetLeft = (el) => {
    return el.offsetParent
      ? el.offsetLeft + this.getOffsetLeft(el.offsetParent)
      : el.offsetLeft;
  };

  handleQrCodeClick = (e) => {
    this.setState({
      showQrPanel: true,
      qrPanelX: e.currentTarget.getBoundingClientRect().x - 175,
      qrPanelY: e.currentTarget.getBoundingClientRect().y - 170,
    });
  };

  // 区分可预约，已占用
  getRandom = (num) => {
    let arr = [];
    for (let i = 0; i < num; i++) {
      arr.push({ id: i, subscribe: true });
    }
    if (num < 10) {
      for (let i = num; i < 3; i++) arr.push({ id: i, subscribe: false });
    }
    return arr;
  };

  getPermission = () => {
    const { projectPermission, projectId } = this.props;
    if (projectPermission) {
      if (projectPermission[projectId] !== null) {
        if (projectPermission[projectId].includes("map:collect:plot:upload")) {
          this.setState({
            showUploadImage: true,
          });
        }
      }
    }
  };

  render() {
    const { selectedFeature } = this.props;
    if (!selectedFeature) return <CollectionDetail />;
    if (selectedFeature && selectedFeature.get("meetingRoomNum") === undefined)
      return <CollectionDetail />;
    const title = selectedFeature.get("title");
    let address = selectedFeature.get("address");
    let tel = selectedFeature.get("tel");
    let num = selectedFeature.get("meetingRoomNum") || 0;
    if (Array.isArray(address)) {
      address = "";
    }
    if (Array.isArray(tel)) {
      tel = "";
    }
    let { zIndex, selectData, isImg, small } = this.props;
    selectData = Array.isArray(selectData)
      ? selectData
      : selectData
      ? [selectData]
      : null;
    return ReactDOM.createPortal(
      <Fragment>
        {!this.state.isSearch ? (
          <div className={styles.wrapper}>
            <div className={styles.header}>
              <i className={globalStyle.global_icon} onClick={this.detailClose}>
                &#xe7d0;
              </i>
            </div>
            <div
              className={`${styles.body} ${globalStyle.autoScrollY}`}
              style={{ height: "calc(100% - 40px)" }}
            >
              <div
                className={styles.imgContainer}
                style={{
                  ...(this.state.imgs[0]?.image_url
                    ? {}
                    : { display: "table" }),
                }}
              >
                {this.state.imgs[0]?.image_url ? (
                  <img
                    crossorigin="anonymous"
                    src={this.state.imgs[0]?.image_url}
                    alt=""
                  />
                ) : (
                  <i
                    className={globalStyle.global_icon}
                    style={{ fontSize: 50 }}
                  >
                    &#xe697;
                  </i>
                )}
              </div>
              <div className={styles.content}>
                <p className={styles.title}>
                  <span>{title || ""}</span>
                </p>
                <p className={styles.describe}>电信服务商</p>
                <p className={styles.space}></p>
                <div className={styles.info}>
                  <i className={globalStyle.global_icon}>&#xe7c7;</i>
                  <span>{address || "暂无地址信息"}</span>
                </div>
                <div className={styles.info}>
                  <i className={globalStyle.global_icon}>&#xe832;</i>
                  <span>{tel || "暂无联系方式"}</span>
                </div>
                <p className={styles.space}></p>
                <p className={styles.title} style={{ fontSize: "1em" }}>
                  <span>照片</span>
                </p>
                <div
                  className={`${styles.imgLongContainer}  ${globalStyle.autoScrollX}`}
                >
                  {this.state.imgs.length > 0 ? (
                    this.state.imgs.map((item, index) => {
                      return (
                        <img
                          key={index}
                          crossOrigin="anonymous"
                          src={item.image_url}
                          alt=""
                          // onClick={() => this.handleImgClick(item)}
                          onClick={() =>
                            this.handleImgClick(item, this.state.imgs)
                          }
                        />
                      );
                    })
                  ) : (
                    <i
                      className={globalStyle.global_icon}
                      style={{
                        fontSize: 50,
                        lineHeight: "50px",
                        margin: "30px auto",
                        color: "#5a86f5",
                      }}
                    >
                      &#xe7d1;
                    </i>
                  )}
                </div>
                {this.state.showUploadImage ? (
                  <div style={{ width: 144, margin: "0 auto" }}>
                    <Upload
                      action={(file) => this.uploadFileAction(file)}
                      accept=".jpg, .jpeg, .png, .bmp"
                      beforeUpload={this.checkFileSize}
                      headers={{ Authorization: Cookies.get('Authorization') }}
                      onChange={this.onUpload}
                      fileList={this.fileList}
                    >
                      <div className={styles.addImgBtn}>
                        <i className={globalStyle.global_icon}>&#xe834;</i>
                        <span>添加照片</span>
                      </div>
                    </Upload>
                  </div>
                ) : null}
                <p className={styles.space}></p>
                <div className={styles.title} style={{ fontSize: 12 }}>
                  <span>周边快查</span>
                </div>
                <div className={styles.aroundSearch}>
                  {this.tags.map((item) => {
                    return (
                      <span key={item.key} onClick={() => this.toSearch(item)}>
                        {item.label}
                      </span>
                    );
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
                {this.getRandom(num).map((item) => {
                  return (
                    <Fragment>
                      <div className={`${styles.title} ${styles.row}`}>
                        <div style={{ display: "inherit", fontSize: "0.8em" }}>
                          <div
                            className={`${styles.circle} ${
                              item.subscribe ? styles.green : styles.red
                            }`}
                            style={{ marginLeft: 0 }}
                          ></div>
                          <span>{`${item.id + 1}号会议室`}</span>
                        </div>
                        <div style={{ display: "inherit" }}>¥80/小时</div>
                      </div>
                      <div className={styles.detail}>
                        <div className={styles.detailDescribe}>
                          <p className={styles.describe}>
                            设备：65寸交互大屏/投影/音响
                          </p>
                          <p className={styles.describe}>容纳人数：20人</p>
                        </div>
                        <div
                          className={styles.qrCode}
                          onClick={(e) => this.handleQrCodeClick(e)}
                        >
                          <MyIcon
                            type="icon-erweima"
                            style={{
                              display: "table-cell",
                              verticalAlign: "middle",
                            }}
                          />
                        </div>
                        {this.state.showQrPanel ? (
                          <div
                            className={styles.qrPanel}
                            style={{
                              position: "fixed",
                              ...{
                                left: this.state.qrPanelX,
                                top: this.state.qrPanelY,
                              },
                            }}
                          >
                            <p>
                              <i
                                className={globalStyle.global_icon}
                                onClick={() => {
                                  this.setState({
                                    showQrPanel: false,
                                  });
                                }}
                              >
                                &#xe7d0;
                              </i>
                            </p>
                            <img
                              alt=""
                              src="https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2020-12-15/1518b3f0778e47a0a970798dcd647b0f.jpg"
                            />
                            <p
                              style={{
                                marginTop: 6,
                                textAlign: "center",
                                fontSize: 14,
                              }}
                            >
                              <span style={{ fontSize: 14 }}>微信扫码预定</span>
                            </p>
                          </div>
                        ) : null}
                      </div>
                      <p className={styles.space}></p>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles2.collection_detail}>
            <TrafficDetail
              onBack={this.detailBack}
              data={selectData && selectData[this.state.currentIndex]}
              type={this.state.activeType}
              onClose={this.detailClose}
            />
          </div>
        )}
      </Fragment>,
      document.body
    );
  }
}
