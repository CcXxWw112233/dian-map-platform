import React, { PureComponent } from "react";
import { Input } from "antd";
import { DownOutlined } from "@ant-design/icons";
import globalStyle from "@/globalSet/styles/globalStyles.less";

import styles from "./Search.less";
import AreaPanel from "./AreaPanel";
import LocationPanel from "./LocationPanel";

import axios from 'axios'
import { baseConfig } from '@/globalSet/config'
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      locationName: "全国",
      showArea: false,
      showLocation: false,
    };
  }
  handleAreaClick = () => {
    this.setState({
      showArea: true,
    });
  };
  handleAreaClose = () => {
    this.setState({
      showArea: false,
    });
  };
  updateLocationName = (name) => {
    this.setState({
      locationName: name,
    });
  };
  handleSearchInputChange = (e) => {
    this.setState({
      showArea: false,
      showLocation: true,
    });
  };
  render() {
    return (
      <div className={styles.wrap}>
        <div className={styles.searchWrap}>
          <div className={styles.locate} onClick={this.handleAreaClick}>
            <span>{this.state.locationName}</span>
            <DownOutlined />
          </div>
          <div className={styles.search}>
            <Input.Search
              style={{ height: 32 }}
              // defaultValue="搜索资料或目的地"
              onChange={this.handleSearchInputChange}
            />
          </div>
        </div>
        {this.state.showArea ? (
          <AreaPanel
            handleClose={this.handleAreaClose}
            updateLocationName={this.updateLocationName}
          ></AreaPanel>
        ) : null}
        {this.state.showLocation ? <LocationPanel></LocationPanel> : null}
      </div>
    );
  }
}
