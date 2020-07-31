import React, { PureComponent } from "react";
import styles from "./LengedList.less";
import { baseMapDictionary, baseMaps } from "utils/mapSource";
import mapApp from "utils/INITMAP";
import { Collapse, Form, Switch } from "antd";
// import config from "./config";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { connect } from "dva";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { setLocal, getLocal } from "../../utils/sessionManage";
import HouseDetail from "../HouseDetail";
import { Row } from "antd";
const Lenged = ({ data }) => {
  let activeKeys = [];
  data.forEach((item) => {
    activeKeys.push(item.key);
  });
  return (
    <Collapse expandIconPosition="right" activeKey={activeKeys}>
      {data.map((item) => {
        const header = <span>{item.title || ""}</span>;
        return (
          <Collapse.Panel header={header} key={item.key}>
            {item.content.map((itemContent, index) => {
              let style = {
                marginRight: 10,
              };
              if (itemContent.bgColor) {
                style.backgroundColor = itemContent.bgColor;
              }
              if (itemContent.imgSrc) {
                style.backgroundImage = `url(${itemContent.imgSrc})`;
                style.backgroundColor = "#fff";
                style.backgroundRepeat = "no-repeat";
                style.backgroundPosition = "center";
                style.backgroundSize = "100%";
              }
              if (itemContent.borderColor) {
                style.border = `1px solid ${itemContent.borderColor}`;
              }
              if (itemContent.sigleImage) {
                style.backgroundImage = `url(${itemContent.sigleImage})`;
                style.backgroundRepeat = "no-repeat";
                style.backgroundPosition = "center";
                style.backgroundSize = "100%";
              }
              if (itemContent.type) {
                if (itemContent.type.indexOf("line") > -1) {
                  style.height = 0;
                  style.border = `1px solid ${itemContent.bgColor}`;
                }
                if (itemContent.type.indexOf("point") > -1) {
                  style.borderRadius = 7;
                }
              }
              if (itemContent.style) {
                style = { ...style, ...itemContent.style };
              }
              return (
                <Row className={styles.row} key={item.key + index}>
                  <div style={style}></div>
                  <span>{itemContent.font}</span>
                </Row>
              );
            })}
          </Collapse.Panel>
        );
      })}
    </Collapse>
  );
};
@connect(
  ({
    lengedList: { config },
    openswitch: { lengedSwitch, showLengedButton, showFeatureName },
  }) => ({ config, lengedSwitch, showLengedButton, showFeatureName })
)
export default class LengedList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      width: 322,
      selectedBaseMapIndex: "",
      roadLine: true,
      featureName: true,
      active: 1,
      houseActive: false,
      baseMapActive: false,
    };
    this.lastConfig = [];
    this.map = mapApp.map;
    this.view = mapApp.view;
  }
  componentDidMount () {
    getLocal("baseMapKey").then(({ data }) => {
      this.setState({
        selectedBaseMapIndex: data || "",
      });
    });
  }
  handleLengedListClick = () => {
    let { lengedSwitch, dispatch } = this.props;
    dispatch({
      type: "openswitch/updateDatas",
      payload: {
        lengedSwitch: !lengedSwitch,
      },
    });
  };
  createNULL = () => {
    return (
      <img
        alt=""
        src={require("../../assets/lenged/null.png")}
        style={{ marginTop: 75 }}
      ></img>
    );
  };
  changeBaseMap = (item) => {
    this.toggleBaseMapChangeStyle(item.key);
    setLocal("baseMapKey", item.key);
    mapApp.changeBaseMap(item.key);
  };
  toggleBaseMapChangeStyle = (key) => {
    this.setState(
      {
        selectedBaseMapIndex: key,
      },
      () => {
        let roadLine = this.state.roadLine;
        this.hideRoadLabel(roadLine);
      }
    );
  };
  hideRoadLabel = (flag) => {
    let firstName = this.state.selectedBaseMapIndex.split("_")[0];
    let mapName = firstName + "_roadLabel_tile";
    let layer = mapApp.findLayerById(mapName);
    // console.log(layer);
    // if(flag){
    layer && layer.setVisible(flag);
    // }
  };
  changeConfig = (changedValues, allChange) => {
    let { dispatch } = this.props;
    this.setState({
      roadLine: allChange.roadLine,
      featureName: allChange.featureName,
    });
    // 更新全局的是否显示元素名称开关
    dispatch({
      type: "openswitch/updateDatas",
      payload: {
        showFeatureName: allChange.featureName,
      },
    });
    let key = Object.keys(changedValues)[0];
    if (key === "roadLine") {
      // 切换隐藏路网
      this.hideRoadLabel(changedValues[key]);
    }
    if (key === "featureName") {
      // let layer = mapApp.findLayerById(soutingDetail.layerId);
      let { plotEdit } = require("../../utils/plotEdit");
      let layer =
        plotEdit && plotEdit.plottingLayer && plotEdit.plottingLayer.showLayer;
      if (layer) {
        let source = layer.getSource();
        let features = source.getFeatures();
        features.forEach((item) => {
          // 显示名称
          if (changedValues[key]) {
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
  };
  render () {
    const { config: lengedList, lengedSwitch, showLengedButton } = this.props;
    let newConfig = [];
    let newLengedList = lengedList;
    if (!Array.isArray(newLengedList)) {
      newLengedList = [lengedList];
    }
    newConfig = Array.from(new Set(newLengedList));
    this.lastConfig = newLengedList || [];
    const baseStyle = {
      position: "absolute",
      height: 510,
      bottom: 0,
      right: 0,
      width: 382,
    };
    let style = baseStyle;
    if (!lengedSwitch) {
      style = { ...baseStyle, ...{ transform: "translateX(100%)" } };
    }
    return (
      <div style={style} className={styles.wrap + " transform"}>
        {this.state.active === 0 ? (
          <HouseDetail></HouseDetail>
        ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className={styles.layerItems + ` ${globalStyle.autoScrollX}`}>
                {baseMapDictionary.map((item, index) => {
                  let activeStyle = {};
                  if (item.key === this.state.selectedBaseMapIndex) {
                    activeStyle = { border: "2px solid rgba(0,0,255,0.7)" };
                  }
                  if (item.name && item.key) {
                    return (
                      <div
                        className={styles.lengedItem}
                        style={activeStyle}
                        key={item.key}
                        onClick={() => this.changeBaseMap(item, index)}
                      >
                        <div
                          style={{ backgroundImage: `url(${item.img})` }}
                        ></div>
                        <span>
                          {item.name}
                          {item.type}
                        </span>
                      </div>
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
              <div
                style={{ height: "calc(100% - 200px)" }}
                className={globalStyle.autoScrollY}
              >
                {newConfig.length > 0 ? (
                  <Lenged data={newConfig}></Lenged>
                ) : (
                    this.createNULL()
                  )}
              </div>
              <div className={styles.configContainer}>
                <p className={styles.configTitle}>地图配置</p>
                <Form
                  labelAlign="right"
                  size="small"
                  initialValues={{
                    roadLine: true,
                    featureName: true,
                  }}
                  onValuesChange={this.changeConfig}
                  labelCol={{ span: 8 }}
                >
                  <Form.Item
                    label="路网"
                    name="roadLine"
                    style={{ marginBottom: 10 }}
                  >
                    <Switch
                      checkedChildren="开启"
                      unCheckedChildren="关闭"
                      checked={this.state.roadLine}
                      defaultChecked={true}
                      disabled={
                        this.state.selectedBaseMapIndex !== "gd_img" &&
                        this.state.selectedBaseMapIndex.indexOf("td_") === -1
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    label="标绘名称"
                    name="featureName"
                    style={{ marginBottom: 10 }}
                  >
                    <Switch
                      checkedChildren="开启"
                      checked={this.state.featureName}
                      defaultChecked={true}
                      unCheckedChildren="关闭"
                    />
                  </Form.Item>
                </Form>
              </div>
            </div>
          )}
        {showLengedButton ? (
          <div>
            <div
              className={`${styles.controller} ${
                this.state.active === 0 ? styles.activePanel : ""
                }`}
              style={{ height: 100, bottom: 140 }}
              onClick={() => {
                let { dispatch } = this.props;
                let { houseActive } = this.state;
                this.setState({
                  active: 0,
                  houseActive: !houseActive,
                  baseMapActive: false,
                });
                if (houseActive === false) {
                  dispatch({
                    type: "openswitch/updateDatas",
                    payload: {
                      lengedSwitch: true,
                    },
                  });
                }
              }}
            >
              <span>周边配套</span>
            </div>
            <div
              className={`${styles.controller} ${
                this.state.active === 1 ? styles.activePanel : ""
                }`}
              onClick={() => {
                let { dispatch } = this.props;
                let { baseMapActive } = this.state;
                this.setState({
                  active: 1,
                  houseActive: false,
                  baseMapActive: !baseMapActive,
                });
                if (baseMapActive === false) {
                  dispatch({
                    type: "openswitch/updateDatas",
                    payload: {
                      lengedSwitch: true,
                    },
                  });
                }
              }}
              style={{ height: 100, bottom: 40 }}
            >
              <span style={{ borderBottom: "1px solid" }}>底图</span>
              <span>图例</span>
            </div>
            <div className={styles.controller} style={{ height: 30 }} onClick={() => {
              let { dispatch, lengedSwitch } = this.props;
              dispatch({
                type: "openswitch/updateDatas",
                payload: {
                  lengedSwitch: !lengedSwitch,
                },
              });
            }}>
              {lengedSwitch === false ? (
                <LeftOutlined className={styles.myDirection} />
              ) : (
                  <RightOutlined className={styles.myDirection} />
                )}
            </div>
          </div>
        ) : (
            ""
          )}
      </div>
    );
  }
}
