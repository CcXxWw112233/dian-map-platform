import React, { Fragment } from "react";
import { Modal, message } from "antd";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "./ModalStyle.less";
export default class SubscribeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: true,
    };
  }
  closeModal = () => {
    const { parent } = this.props;
    parent.setState({
      showModal: false,
    });
  };
  render() {
    const { parent } = this.props;
    const { meetingRooms } = parent.state;
    let keys = Object.keys(parent.selectedMeetingRoom);
    const selectedMeetingRoom = parent.selectedMeetingRoom;
    return (
      <div className={styles.wrapper}>
        <Modal
          title="确定订单信息"
          visible={this.state.modalVisible}
          okText="完成"
          cancelText="取消"
          className={styles.wrapper}
          onOk={() => {
            this.closeModal();
            message.success("预订成功");
          }}
          onCancel={this.closeModal}
        >
          <div
            className={`${globalStyle.autoScrollY} ${styles.body}`}
            style={{
              height: "15vw",
            }}
          >
            <div className={styles.info_list}>
              {keys.map((item, index) => {
                return (
                  <div className={styles.info_item} key={index}>
                    <p className={styles.title}>{meetingRooms[item].hotelName}</p>
                    {selectedMeetingRoom[item].map((item2) => {
                      return (
                        <div className={styles.info_item2}>
                          <p className={`${styles.title} ${styles.title2}`}>
                            <span>{item2}号会议室</span>
                            <span>120元/小时</span>
                          </p>
                          <p>设备：65寸交互大屏/投影/音响</p>
                          <p>容纳人数：80人</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div className={styles.sure_panel}>
              <img
                src="https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2020-12-15/1518b3f0778e47a0a970798dcd647b0f.jpg"
                alt=""
              ></img>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
