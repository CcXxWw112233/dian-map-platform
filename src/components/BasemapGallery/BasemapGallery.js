import React, { PureComponent } from "react";
import styles from "./BasemapGallery.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import mapApp from "utils/INITMAP";
import { setLocal, getLocal } from "../../utils/sessionManage";
import animateCss from "../../assets/css/animate.min.css";

import { Row, Switch } from "antd";

import { baseMapDictionary } from "utils/mapSource";

import event from "../../lib/utils/event";
import { connect } from "dva";

@connect(({ openswitch: { openPanel, panelDidMount } }) => ({
  openPanel,
  panelDidMount,
}))
export default class BasemapGallery extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      selectedIndex: 0,
      showRoadLabel: true,
      showPlotLabel: true,
      transform: "",
    };
    this.selectBaseMapKey = null;
  }
  componentDidMount() {
    getLocal("baseMapKey").then(({ data }) => {
      this.selectBaseMapKey = data;
      for (let i = 0; i < baseMapDictionary.length; i++) {
        if (baseMapDictionary[i].key === data) {
          this.setState({
            selectedIndex: i || 0,
          });
          break;
        }
      }
    });
    const me = this;
    window.addEventListener("resize", function () {
      const width = document.getElementById("leftPanel").clientWidth;
      const transform = `translateX(${width}px)`;
      me.setState({
        transform: transform,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    const { openPanel, panelDidMount } = nextProps;
    let transform = "translateX(0px)";
    if (panelDidMount) {
      if (openPanel) {
        const width = document.getElementById("leftPanel").clientWidth;
        transform = `translateX(${width}px)`;
      }
    }
    this.setState({
      transform: transform,
    });
  }
  onRoadLabelChange = (val) => {
    this.setState({
      showRoadLabel: val,
    });
    mapApp.showRoadLabel(this.selectBaseMapKey, val);
  };
  onPlotLabelChange = (val) => {
    this.setState(
      {
        showPlotLabel: val,
      },
      () => {
        let { plotEdit } = require("../../utils/plotEdit");
        let layer =
          plotEdit &&
          plotEdit.plottingLayer &&
          plotEdit.plottingLayer.showLayer;
        if (layer) {
          let source = layer.getSource();
          let features = source.getFeatures();
          features.forEach((item) => {
            // 显示名称
            if (val) {
              let text = item.get("name");
              let style = item.getStyle();
              let textStyle = style.getText();
              // console.log(textStyle)
              textStyle.setText(text);
              item.setStyle(style);
            } else {
              // 隐藏名称
              let style = item.getStyle();
              let textStyle = style.getText();
              // console.log(textStyle)
              textStyle.setText("");
              item.setStyle(style);
            }
          });
        }
      }
    );
  };
  handleNormalClick = () => {
    this.setState({
      isOpen: true,
    });
  };
  handleOpenContentClick = (item, index) => {
    this.setState(
      {
        selectedIndex: index,
        isOpen: false,
      },
      () => {
        setLocal("baseMapKey", item.key);
        mapApp.changeBaseMap(item.key);
        mapApp.showRoadLabel(item.key, this.state.showRoadLabel);
        this.selectBaseMapKey = item.key;
        event.Evt.firEvent("basemapchange", this.selectBaseMapKey);
        event.Evt.firEvent("transCoordinateSystems2ScoutingDetail");
        // event.Evt.firEvent("transCoordinateSystems2Plot");
        event.Evt.firEvent(
          "transCoordinateSystems2PublicData",
          this.selectBaseMapKey
        );
        event.Evt.firEvent(
          "transCoordinateSystems2ScoutingList",
          this.selectBaseMapKey
        );
        event.Evt.firEvent("transCoordinateSystems2AreaSearch");
        event.Evt.firEvent("transCoordinateSystems2CommonSearch");
      }
    );
  };
  render() {
    const { style } = this.props;
    let left = "66px";
    return (
      <div
        className={styles.wrapper}
        style={{
          ...(style || {}),
          ...{ left: left, transform: this.state.transform },
        }}
        // onMouseEnter={() => {
        //   this.setState({ isOpen: true });
        // }}
        // onMouseLeave={() => {
        //   this.setState({ isOpen: false });
        // }}
      >
        {this.state.isOpen ? (
          <div className={styles.open}>
            <div
              className={globalStyle.autoScrollX}
              style={{ width: "80%", display: "flex" }}
            >
              {baseMapDictionary &&
                baseMapDictionary.map((item, index) => {
                  return (
                    <div
                      className={`${styles.content} ${
                        index === this.state.selectedIndex
                          ? styles.content_active
                          : ""
                      }`}
                      style={{
                        background: "none",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                      key={`${item.name}${item.type}-${index}`}
                      onClick={() => this.handleOpenContentClick(item, index)}
                    >
                      <img crossOrigin="anonymous" alt="" src={item.img}></img>
                      <span
                        className={
                          index === this.state.selectedIndex
                            ? `${styles.active}`
                            : ""
                        }
                      >{`${item.name}${item.type}`}</span>
                    </div>
                  );
                })}
            </div>
            <div className={styles.switch}>
              <Row style={{ marginBottom: 8 }}>
                <Switch
                  checked={this.state.showRoadLabel}
                  onChange={(e) => this.onRoadLabelChange(e)}
                ></Switch>
                <div className={styles.nameDiv}>路网</div>
              </Row>
              <Row>
                <Switch
                  checked={this.state.showPlotLabel}
                  onChange={(e) => this.onPlotLabelChange(e)}
                ></Switch>
                <div className={styles.nameDiv}>名称</div>
              </Row>
            </div>
          </div>
        ) : (
          <div className={styles.normal} onClick={this.handleNormalClick}>
            <div className={styles.content}>
              <img
                alt=""
                src={baseMapDictionary[this.state.selectedIndex].img}
              ></img>
              <span className={styles.active}>{`${
                baseMapDictionary[this.state.selectedIndex].name
              }${baseMapDictionary[this.state.selectedIndex].type}`}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
