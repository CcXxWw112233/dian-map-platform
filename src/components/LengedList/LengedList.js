import React, { PureComponent } from "react";
import styles from "./LengedList.less";
import mapSource from "utils/mapSource";
import mapApp from "utils/INITMAP";
import { Collapse } from "antd";
// import config from "./config";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { connect } from "dva";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Row } from "antd";
const Lenged = ({ data }) => {
  let activeKeys = []
  data.forEach(item => {
    activeKeys.push(item.key)
  })
  return (
    <Collapse
      expandIconPosition="right"
      activeKey={activeKeys}
    >
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
              }
              if (itemContent.borderColor) {
                style.border = `1px solid ${itemContent.borderColor}`;
              }
              if (itemContent.type) {
                if (itemContent.type === "line") {
                  style.height = 0;
                }
                if (itemContent.type === "point") {
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
@connect(({ lengedList: { config } ,openswitch: {lengedSwitch, showLengedButton }}) => ({ config ,lengedSwitch ,showLengedButton}))
export default class LengedList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      width: 322,
      selectedBaseMapId: mapSource[0].id,
    };
    this.lastConfig = [];
  }
  handleLengedListClick = () => {
    let { lengedSwitch, dispatch } = this.props;
    dispatch({
      type:"openswitch/updateDatas",
      payload:{
        lengedSwitch: !lengedSwitch
      }
    })
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
    const myMapApp = mapApp;
    this.toggleBaseMapChangeStyle(item.id);
    myMapApp.baseMaps.forEach((layer) => {
      layer.setVisible(false);
    });
    let layer = myMapApp.findLayerById(item.id, myMapApp.baseMaps);
    if (!layer) {
      layer = myMapApp.createTilelayer(item);
      myMapApp.addLayer(layer, myMapApp.baseMaps);
    } else {
      layer.setVisible(true);
    }
  };
  toggleBaseMapChangeStyle = (id) => {
    this.setState({
      selectedBaseMapId: id || mapSource[0].id,
    });
  };
  render() {
    const { config ,lengedSwitch, showLengedButton} = this.props;
    const newConfig = Array.from(new Set(config));
    this.lastConfig = config;
    const baseStyle = { position: "absolute", bottom: 0, right: 0, width: 322 };
    let style = baseStyle;
    if (!lengedSwitch) {
      style = { ...baseStyle, ...{ transform: "translateX(100%)" } };
    }
    return (
      <div style={style} className={styles.wrap + " transform"}>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className={styles.layerItems + ` ${globalStyle.autoScrollX}`}>
            {mapSource.map((item) => {
              let active = "";
              if (item.id === this.state.selectedBaseMapId) {
                active = styles.active;
              }
              return (
                <div
                  className={styles.layerItem + ` ${active}`}
                  key={item.id}
                  onClick={() => this.changeBaseMap(item)}
                >
                  <p className={styles.layerName}>{item.title}</p>
                </div>
              );
            })}
          </div>
          <div
            style={{ height: "calc(100% - 108px)" }}
            className={globalStyle.autoScrollY}
          >
            {config.length > 0 ? (
              <Lenged data={newConfig}></Lenged>
            ) : (
              this.createNULL()
            )}
          </div>
        </div>
        { showLengedButton ? 
          <div
            className={styles.controller}
            onClick={this.handleLengedListClick}
            style={{ height: 120 }}
          >
            {lengedSwitch === false ? (
              <LeftOutlined className={styles.myDirection} />
            ) : (
              <RightOutlined className={styles.myDirection} />
            )}
            <span style={{ borderBottom: "1px solid" }}>底图</span>
            <span>图例</span>
          </div>
        :"" }
        
      </div>
    );
  }
}
