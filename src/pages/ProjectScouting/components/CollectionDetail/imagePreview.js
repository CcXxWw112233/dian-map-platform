import React from "react";
import ReactDOM from "react-dom";
import styles from "./imagePreviewStyle.less";
import { MyIcon } from "../../../../components/utils";
import Event from "../../../../lib/utils/event";
import { message } from "antd";
import { connect } from "dva";
import { Pannellum, PannellumVideo } from "pannellum-react";

@connect(({ openswitch: { selectedImageData, imageDatas } }) => ({
  selectedImageData,
  imageDatas,
}))
export default class ImagePreview extends React.Component {
  constructor(props) {
    super(props);
    this.isPlay = false;
    this.state = {
      selectedImageData: null,
      isAllView: false,
    };
    this.selectedImageData = null;
  }

  componentWillUnmount() {
    this.isPlay = false;
  }
  handleDeleteClick = () => {
    this.isPlay = false;
    Event.Evt.firEvent("deletePlotImage", this.selectedImageData.id);
  };
  //上一张
  toPreImage = () => {
    this.isPlay = true;
    const { imageDatas } = this.props;
    let index = imageDatas.findIndex(
      (item) => item.id === this.selectedImageData.id
    );
    if (index > 0) {
      this.setState({
        selectedImageData: imageDatas[index - 1],
      });
    } else {
      message.info("已经是第一张了");
    }
  };
  // 下一张
  toNextImage = () => {
    this.isPlay = true;
    const { imageDatas } = this.props;
    let index = imageDatas.findIndex(
      (item) => item.id === this.selectedImageData.id
    );
    if (index < imageDatas.length - 1) {
      this.setState({
        selectedImageData: imageDatas[index + 1],
      });
    } else {
      message.info("已经是最后一张了");
    }
  };
  handleClose = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "openswitch/updateDatas",
      payload: {
        imagePreviewVisible: false,
      },
    });
  };
  render() {
    this.selectedImageData = !this.isPlay
      ? this.props.selectedImageData
      : this.state.selectedImageData;
    return ReactDOM.createPortal(
      <div className={styles.wrapper}>
        <span className={styles.closeModal} onClick={this.handleClose}>
          <MyIcon type="icon-guanbi2" />
        </span>
        <div className={styles.imageContainer}>
          {this.state.isAllView ? (
            <Pannellum
              width="100%"
              height="100%"
              image={this.selectedImageData.image_url}
              pitch={10}
              yaw={180}
              hfov={110}
              ref="pannellum"
              autoLoad
              showZoomCtrl={false}
            ></Pannellum>
          ) : (
            <img alt="" src={this.selectedImageData.image_url} />
          )}
        </div>
        <div className={styles.tools}>
          <span onClick={this.handleDeleteClick}>
            <MyIcon type="icon-bianzu52" />
          </span>
          <span
            onClick={() => {
              this.setState({
                isAllView: !this.state.isAllView,
              });
            }}
          >
            {!this.state.isAllView ? "全景" : "退出"}
          </span>
          <span onClick={this.toPreImage}>
            <MyIcon type="icon-bianzu681" />
          </span>
          <span onClick={this.toNextImage}>
            <MyIcon type="icon-bianzu671" />
          </span>
        </div>
      </div>,
      document.body
    );
  }
}
