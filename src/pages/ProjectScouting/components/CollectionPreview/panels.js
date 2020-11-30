import React from "react";
import overlayStyle from "./overlay.less";
import panelStyle from "./panel.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { Input, Button } from "antd";
import { useState } from "react";
const MyInput = ({ value, index, parent }) => {
  let [name, setName] = useState(value);
  return (
    <div
      style={{ height: 40 }}
      onClick={() => {
        parent && parent.setActiveIndex(index);
      }}
    >
      <Input
        placeholder="请输入名称"
        value={name}
        style={{ height: "100%" }}
        onChange={(e) => {
          setName(e.target.value);
          parent.newName = e.target.value;
        }}
      />
    </div>
  );
};
class PanoramaOverlay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: -1,
    };
    this.newName = "";
  }

  setActiveIndex = (index) => {
    this.setState({
      activeIndex: index,
    });
  };

  render() {
    const { timeData, list, parent } = this.props;
    const keys = Object.keys(timeData);
    let datas = [];
    keys.forEach((item) => {
      if (timeData[item].length > 0) {
        timeData[item].forEach((item0) => {
          datas.push(item0.data);
        });
      }
    });
    list.forEach((item0) => {
      let data = datas.filter((item) => item.id === item0.target_id);
      if (data.length > 0) {
        item0.resourceUrl = data[0].resource_url;
      }
    });
    return (
      <div className={overlayStyle.overlay}>
        <div
          className={`${overlayStyle.content} ${globalStyle.autoScrollY}`}
          style={{ height: "86%", marginBottom: 10 }}
        >
          {list.map((item, index) => {
            return (
              <div key={item.id} className={overlayStyle.item}>
                {item.resourceUrl ? (
                  <img src={item.resourceUrl} alt="" />
                ) : (
                  <span>视频</span>
                )}
                <MyInput value={item.name} index={index} parent={this} />
                {this.state.activeIndex === index ? (
                  <Button
                    type="primary"
                    style={{ width: 100, height: 40 }}
                    onClick={() => {
                      this.setState({
                        activeIndex: -1,
                      });
                      parent &&
                        parent.handleSavePanoramaName(item.id, this.newName);
                    }}
                  >
                    确定
                  </Button>
                ) : (
                  <div className={overlayStyle.tools}>
                    <span
                      onClick={() => {
                        parent && parent.handleMoveToPanoramaLink(item);
                        parent.setState({
                          overlayVisible: false,
                        });
                      }}
                    >
                      <i className={globalStyle.global_icon}>&#xe81a;</i>
                    </span>
                    <span
                      onClick={() => {
                        parent && parent.handleDelPanoramaScene(item.id);
                      }}
                    >
                      <i className={globalStyle.global_icon}>&#xe819;</i>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {list.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                top: "40%",
                textAlign: "center",
              }}
            >
              <i
                className={globalStyle.global_icon}
                style={{ fontSize: 50, lineHeight: "50px" }}
              >
                &#xe7d1;
              </i>
              <span>暂无数据</span>
            </div>
          ) : null}
        </div>
        <div className={overlayStyle.footer} style={{ height: "12%" }}>
          <Button
            type="primary"
            style={{ float: "right", marginRight: 16, marginBottom: 16 }}
            onClick={() => {
              parent && parent.addNextPanoramaScene();
            }}
          >
            添加场景
          </Button>
        </div>
      </div>
    );
  }
}

const ImagePanel = ({ timeData, parent }) => {
  const images = ["jpg", "png"];
  const keys = Object.keys(timeData);
  let arr = [];
  let [selectIndex, setSelectIndex] = useState(-1);
  keys.forEach((item) => {
    let tmpArr = timeData[item];
    tmpArr.forEach((item2) => {
      if (images.includes(item2.data?.target)) {
        arr.push(item2);
      }
    });
  });
  return (
    <div
      className={panelStyle.panel}
      style={{
        position: "absolute",
        left: "calc(50% - 236px)",
        top: "calc(50% - 220px)",
        background: "rgb(255, 255, 255)",
        zIndex: 999,
      }}
    >
      <div className={panelStyle.content}>
        {arr.map((item, index) => {
          return (
            <div
              key={item.id}
              className={panelStyle.item}
              onClick={() => setSelectIndex(index)}
            >
              <img key={index} src={item.data.resource_url} alt="" />
              {selectIndex === index ? (
                <div className={panelStyle.circle}>
                  <i className={globalStyle.global_icon}>&#xe75b;</i>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div
        className={panelStyle.footer}
        style={{ display: "flex", flexDirection: "row" }}
      >
        <div style={{ width: "calc(100% - 140px)" }} className={panelStyle.txt}>
          <span>选择下一个场景</span>
        </div>
        <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
          <Button
            style={{ marginRight: 12 }}
            onClick={() => {
              parent && parent.handleCloseImagePanel();
            }}
          >
            取消
          </Button>
          <Button
            type="primary"
            style={{ marginRight: 24 }}
            onClick={() => {
              parent && parent.handleSavePanoramaLink(arr[selectIndex]);
            }}
          >
            确定
          </Button>
        </div>
      </div>
    </div>
  );
};

export { PanoramaOverlay, ImagePanel };
