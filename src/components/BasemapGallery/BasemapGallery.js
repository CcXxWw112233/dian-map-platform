import React, { PureComponent } from "react";
import { Button, Tooltip } from "antd";
import style from "./BasemapGallery.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import mapApp from 'utils/INITMAP'

import mapSource from "utils/mapSource";

export default class BasemapGallery extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      display: "none",
      baseMaps: []
    };
  }
  handleShowPanelClick = () => {
    const { display } = this.state;
    let myDisplay = display;
    if (myDisplay === "none") {
      myDisplay = "flex";
    } else {
      myDisplay = "none";
    }
    this.setState({ display: myDisplay });
  };
  changeBaseMap = (item) => {
    const myMapApp = mapApp
    myMapApp.baseMaps.forEach(layer => {
      layer.setVisible(false)
    })
    let layer = myMapApp.findLayerById(item.id, myMapApp.baseMaps)
    if (!layer) {
      layer = myMapApp.createTilelayer(item)
      myMapApp.addLayer(layer, myMapApp.baseMaps)
    } else {
      layer.setVisible(true)
    }
  };

  render() {
    const { display } = this.state;

    return (
      <Tooltip title="底图切换" className={style.wrapper}>
        <div style={{ display: display }} className={style.panel}>
          <div className={style.layerTitle}></div>
          <div className={style.layerItems + ` ${globalStyle.autoScrollX}`}>
            {mapSource.map((item) => {
              return (
                <div className={style.layerItem} key={item.id} onClick={() => this.changeBaseMap(item)}>
                  <p className={style.layerName}>{item.title}</p>
                </div>
              );
            })}
          </div>
        </div>
        <Button shape="circle" onClick={this.handleShowPanelClick}>
          <i className={globalStyle.global_icon}>&#xe6ac;</i>
        </Button>
      </Tooltip>
    );
  }
}
