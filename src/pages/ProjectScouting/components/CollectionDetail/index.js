import React, { Fragment } from "react";
import styles from "./index.less";
import { connect } from "dva";
import ReactDOM from "react-dom";
import { MyIcon } from "../../../../components/utils";
// import animateCss from '../../../../assets/css/animate.min.css';
import PhotoSwipe from "../../../../components/PhotoSwipe/action";
import { keepLastIndex } from "../../../../utils/utils";
import DetailAction from "../../../../lib/components/ProjectScouting/ScoutingDetail";
import { message, Row, Col, Carousel, Tag, Spin } from "antd";
import Event from "../../../../lib/utils/event";
import EditDescription from "./editDescription";
// import Slider from "react-slick";
import ReactPlayer from "react-player";
import TrafficDetail from "./TrafficDetail";
import throttle from "lodash/throttle";
import { func } from "prop-types";

@connect(
  ({ collectionDetail: { selectData, zIndex, type, isImg, small } }) => ({
    selectData,
    zIndex,
    type,
    isImg,
    small
  })
)
export default class CollectionDetail extends React.Component {
  timeout = null;
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      activeImg: {},
      disabled: false,
      currentIndex: 0,
      showSpin: true,
      sliderPages: {
        total: 1,
        current: 1
      },
      isSearch: false,
      checkedTag: "roadTraffic"
    };
    this.content = React.createRef();
    this.slider = React.createRef();
    this.activeType = "";
    this.tags = [
      {
        key: "roadTraffic",
        label: "道路交通"
      },
      {
        key: "railTransit",
        label: "轨道交通"
      }
      // {
      //   key:"UrbanTransportation",
      //   label: "城市交通"
      // }
    ];
    this.imageLoaing = false;
    this.loadedImage = null;
    this.lastResourceId = ""; // this.previewImg = throttle(this.previewImg, 1000);
  }

  componentDidMount() {
    this.InitActiveImg(this.props);
    const me = this;
    if (document.getElementById("id_ImgPreview")) {
      document.getElementById("id_ImgPreview").onload = function() {
        me.setState({
          showSpin: false
        });
      };
    }
  }

  // 预览图片
  previewImg = e => {
    // clearTimeout(this.timeout)
    // this.timeout = setTimeout(() => {

    // })
    let { selectData = {} } = this.props;
    if (this.loadedImage) {
      let w = this.loadedImage.width;
      let h = this.loadedImage.height;
      PhotoSwipe.show([
        { w, h, src: this.loadedImage.src, title: selectData.title }
      ]);
    } else {
      this.imageLoaing = true;
      let url = e.target?.src;
      if (!url) return;
      let img = new Image();
      img.src = url;
      img.onload = () => {
        this.setState(
          {
            showSpin: false
          },
          () => {
            this.imageLoaing = false;
            this.loadedImage = img;
            let w = img.width;
            let h = img.height;
            PhotoSwipe.show([
              { w, h, src: this.loadedImage.src, title: selectData.title }
            ]);
          }
        );
      };
    }
  };
  // 粘贴文本格式化
  textFormat(e) {
    e.preventDefault();
    var text;
    var clp = (e.originalEvent || e).clipboardData;
    if (clp === undefined || clp === null) {
      text = window.clipboardData.getData("text") || "";
      if (text !== "") {
        if (window.getSelection) {
          var newNode = document.createElement("span");
          newNode.innerHTML = text;
          window
            .getSelection()
            .getRangeAt(0)
            .insertNode(newNode);
        } else {
          document.selection.createRange().pasteHTML(text);
        }
      }
    } else {
      text = clp.getData("text/plain") || "";
      if (clp.files.length) {
        let file = clp.files[0];
        let { type } = file;
        let url = URL.createObjectURL(file);
        let img = new Image();
        img.src = url;
        img.crossorigin = "anonymous";
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          let baseUrl = canvas.toDataURL("image/jpeg", 1);
          document.execCommand("insertimage", false, baseUrl);
          img = null;
          canvas = null;
          ctx = null;
        };
      }
      if (text !== "") {
        document.execCommand("insertText", false, text);
      }
    }
  }
  toEdit = () => {
    let { isEdit } = this.state;
    if (!isEdit) {
      this.editEnd(true);
    }
  };
  // 编辑
  editEnd = flag => {
    // console.log(flag)
    this.setState(
      {
        isEdit: flag
      },
      () => {
        if (flag) {
          setTimeout(() => {
            let { current } = this.content;
            current.focus();
            keepLastIndex(current);
          }, 50);
        } else {
          this.saveEdit();
        }
      }
    );
  };
  // 设置
  setActiveImg = type => {
    let { selectData } = this.props;
    let { activeImg } = this.state;
    if (selectData && selectData.length) {
      let index = selectData.find(item => activeImg.id === item.id);
      if (index !== -1) {
        switch (type) {
          case "next":
            break;
          case "prev":
            break;
          default:
        }
      }
    }
  };

  InitActiveImg = props => {
    const { selectData, type } = props;
    let { sliderPages } = this.state;
    if (selectData) {
      let isArr = Array.isArray(selectData);
      if (isArr) {
        let data = selectData[0];
        this.setState({
          activeImg: data,
          disabled: type === "view",
          currentIndex: 0,
          sliderPages: { ...sliderPages, total: selectData.length, current: 1 }
        });
        this.lastResourceId = data.id;
      } else {
        this.setState({
          activeImg: selectData,
          disabled: type === "view",
          currentIndex: 0,
          sliderPages: { ...sliderPages, total: 1, current: 1 }
        });
        this.lastResourceId = selectData.id;
      }
    }
  };

  componentWillReceiveProps(nextProps) {
    this.loadedImage = null;
    const { selectData } = nextProps;
    if (Array.isArray(this.props.selectData)) {
      if (this.props.selectData[0].id === this.lastResourceId) {
        return false;
      }
    } else {
      if (this.props.selectData.id === this.lastResourceId) {
        return false;
      }
    }
    if (this.props.selectData !== selectData) {
      this.InitActiveImg(nextProps);
      this.detailBack();
    }
  }

  saveEdit = (text, val) => {
    let { selectData, dispatch } = this.props;
    selectData = Array.isArray(selectData)
      ? selectData
      : selectData
      ? [selectData]
      : [];
    if (val.description === text) return;
    let param = {
      id: val.id,
      description: text
    };
    DetailAction.editCollection(param).then(res => {
      message.success("保存成功");
      dispatch({
        type: "collectionDetail/updateDatas",
        payload: {
          selectData: selectData.map(item => {
            if (item.id === val.id) {
              item.description = text;
            }
            return item;
          }),
          type: "edit"
        }
      });
      let datas = DetailAction.oldData;
      let data = datas.map(item => {
        if (item.id === val.id) {
          item.description = text;
        }
        return item;
      });
      Event.Evt.firEvent("CollectionUpdate:reload", data);
    });
  };

  allVideoStop = () => {
    document.querySelectorAll("video").forEach(item => {
      item.pause();
    });
    document.querySelectorAll("audio").forEach(item => {
      item.pause();
    });
  };

  slideChange = current => {
    let { sliderPages } = this.state;
    this.allVideoStop();
    this.setState({
      currentIndex: current,
      sliderPages: { ...sliderPages, current: current + 1 }
    });
  };

  checkRender = val => {
    let type = DetailAction.checkCollectionType(val.target);
    if (type === "pic") {
      return (
        <Spin tip="加载中..." spinning={false}>
          <img
            crossOrigin="anonymous"
            src={val.resource_url}
            alt=""
            id="id_ImgPreview"
            onload={() => this.setState({ showSpin: false })}
            onError={() => this.setState({ showSpin: false })}
            onClick={e => {
              if (!this.imageLoaing) {
                this.previewImg(e);
              } else {
                message.info("图片正在加载中,请勿重复点击！");
              }
            }}
          />
        </Spin>
      );
    }
    if (type === "interview") {
      let config = {
        file: {
          forceVideo: type === "video",
          forceAudio: type === "interview"
        }
      };
      return (
        <ReactPlayer
          config={config}
          url={val.resource_url}
          width="100%"
          controls={true}
          height="195px"
          light={true}
        />
      );
    } else return "";
  };

  changeSmall = val => {
    const { dispatch } = this.props;
    dispatch({
      type: "collectionDetail/updateDatas",
      payload: {
        small: val
      }
    });
    this.allVideoStop();
  };
  renderPropertiesMap = val => {
    // console.log(val)
    if (val.properties_map) {
      let property = val.properties_map;
      let data = Object.keys(val.properties_map);
      return data.map((item, index) => (
        <div className={styles.properties_item} key={index}>
          <span className={styles.properties_item_key}>{item}</span>:
          <span dangerouslySetInnerHTML={{ __html: property[item] }}></span>
        </div>
      ));
    }
    return "";
  };

  detailClose = () => {
    const { dispatch } = this.props;
    DetailAction.clearSelectPoint();
    DetailAction.cancelSearchAround();
    dispatch({
      type: "collectionDetail/updateDatas",
      payload: { selectData: null, isImg: true }
    });
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
      isSearch: isSearchFlag
    });
  };

  checkType = () => {};

  toSearch = (val, data) => {
    let type;
    switch (val.key) {
      case "roadTraffic":
        type = "高速路入口";
        break;
      case "railTransit":
        type = "火车站";
        break;
      case "UrbanTransportation":
        type = "";
        break;
      default:
        type = "";
    }
    // this.activeType = type;
    this.setState({
      activeType: type
    });
    // 开始搜索
    this.searchAroundAbout(data, this.state.isSearch, type);
  };

  handleTag = (tag, checked) => {
    this.setState({
      checkedTag: tag.key
    });
  };
  componentWillUnmount() {
    DetailAction.cancelSearchAround();
  }
  detailBack = () => {
    this.searchAroundAbout({}, this.state.isSearch);
  };

  render() {
    const { sliderPages, currentIndex } = this.state;
    let { zIndex, selectData, isImg, small } = this.props;
    selectData = Array.isArray(selectData)
      ? selectData
      : selectData
      ? [selectData]
      : null;
    return ReactDOM.createPortal(
      <div className={`${styles.collection_detail}`} style={{ zIndex: zIndex }}>
        {!this.state.isSearch ? (
          <Fragment>
            <div className={styles.detail_title}>
              {small ? (
                <Fragment>
                  <div className={styles.smallTitle}>
                    <span className={styles.smallTitle_title}>
                      {selectData &&
                        selectData[currentIndex] &&
                        selectData[currentIndex].title}
                    </span>
                  </div>
                </Fragment>
              ) : (
                <Fragment>
                  <span className={styles.pages}>
                    {sliderPages.current}/{sliderPages.total}
                  </span>
                  <span
                    style={{ fontSize: "0.7em" }}
                    onClick={() => this.changeSmall(true)}
                  >
                    <MyIcon type="icon-suoxiao1" />
                  </span>
                </Fragment>
              )}
              {small && (
                <span onClick={() => this.changeSmall(false)}>
                  <MyIcon type="icon-jia1" />
                </span>
              )}
              <span className={styles.close}>
                <MyIcon
                  type="icon-guanbi2"
                  onClick={() => this.detailClose()}
                />
              </span>
            </div>
            <div
              className={`${styles.container}`}
              style={{ height: small ? 0 : "auto" }}
            >
              {selectData && selectData.length > 1 && (
                <Fragment>
                  <span
                    className={styles.prev}
                    onClick={() => {
                      this.slider.current?.prev();
                    }}
                  >
                    <MyIcon type="icon-bianzu681" />
                  </span>
                  <span
                    className={styles.next}
                    onClick={() => {
                      this.slider.current?.next();
                    }}
                  >
                    <MyIcon type="icon-bianzu671" />
                  </span>
                </Fragment>
              )}
              <Carousel
                ref={this.slider}
                loop={false}
                afterChange={this.slideChange}
              >
                {selectData &&
                  selectData.map(item => {
                    return (
                      <div key={item.id}>
                        {isImg && (
                          <div className={styles.container_img}>
                            {this.checkRender(item)}
                            {/* {item.resource_url ? <img crossOrigin="anonymous" src={item.resource_url} alt="" onClick={this.previewImg}/>
                      :
                      <span>暂不支持预览</span>} */}
                          </div>
                        )}
                        <div className={styles.data_msg}>
                          <div className={styles.data_title}>
                            {item.title ? (
                              <span>{item.title}</span>
                            ) : (
                              <span>&nbsp;</span>
                            )}
                          </div>
                          <EditDescription
                            disabled={this.state.disabled}
                            data={item}
                            onEdit={this.saveEdit}
                            isMaxHeight={!isImg}
                          />

                          {item.properties_map && (
                            <div className={styles.propertiesMap}>
                              {this.renderPropertiesMap(item)}
                              {/* <span className={styles.around_about} onClick={()=>this.searchAroundAbout(item,this.state.isSearch)}>
                          {this.state.isSearch ? <Tag color="red">取消</Tag> :<Tag color="purple">周边快查</Tag>}
                        </span> */}
                              <div className={styles.around_search_item}>
                                <div>周边快查</div>
                                {this.tags.map(tags => {
                                  return (
                                    <Tag
                                      key={tags.key}
                                      color="default"
                                      onClick={this.toSearch.bind(
                                        this,
                                        tags,
                                        item
                                      )}
                                    >
                                      {tags.label}
                                    </Tag>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <div className={styles.creator}>
                            <Row gutter={10}>
                              <Col xs={8} sm={12} md={8}>
                                {item.create_by && item.create_by.name}
                              </Col>
                              <Col
                                xs={8}
                                sm={6}
                                md={8}
                                style={{ textAlign: "center" }}
                              >
                                {DetailAction.dateFormat(
                                  item.create_time,
                                  "yyyy/MM/dd"
                                )}
                              </Col>
                              <Col
                                xs={8}
                                sm={6}
                                md={8}
                                style={{ textAlign: "center" }}
                              >
                                {DetailAction.dateFormat(
                                  item.create_time,
                                  "HH:mm"
                                )}
                              </Col>
                            </Row>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </Carousel>
            </div>
          </Fragment>
        ) : (
          <TrafficDetail
            onBack={this.detailBack}
            data={selectData && selectData[currentIndex]}
            type={this.state.activeType}
            onClose={this.detailClose}
          />
        )}
      </div>,
      document.body
    );
  }
}
