import React from "react";
import { Input, Dropdown, Button } from "antd";
import throttle from 'lodash/throttle';

import { DownOutlined } from "@ant-design/icons";
import POISearch from "@/lib/components/Search/POISeach";

import styles from "./Search.less";
import AreaPanel from "./AreaPanel";
import LocationPanel from "./LocationPanel";

export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locationName: "深圳市",
      showArea: false,
      showLocation: false,
      searchResult: [],
      searchPanelVisible: false,
      searchLoading: false,
    };
    this.handleSearch  = throttle(this.handleSearch, 1000);
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
    const { locationName } = this.state;
    const address = e.target.value;
    if (address === "") {
      this.setState({
        searchPanelVisible: false,
      });
    }
    this.handleSearch(address, locationName, 10);
  };

  handleSearch = (address, locationName, offset) => {
    this.setState({
      searchLoading: true,
    });
    POISearch.getPOI(address, locationName, offset).then((res) => {
      this.setState({
        searchResult: res,
        searchLoading: false,
        searchPanelVisible: res.length ? true : false,
      });
    });
  };
  changeLocationPanelVisible = () => {
    this.setState({
      searchPanelVisible: false,
    });
  };
  onSearch = (value, event) => {
    const { locationName } = this.state;
    this.handleSearch(value, locationName, 10);
  };
  render() {
    const areaPanel = (
      <AreaPanel
        handleClose={this.handleAreaClose}
        updateLocationName={this.updateLocationName}
      ></AreaPanel>
    );
    const locationPanle = (
      <LocationPanel
        searchResult={this.state.searchResult}
        changeLocationPanelVisible={this.changeLocationPanelVisible}
      ></LocationPanel>
    );
    return (
      <div className={styles.wrap} style={this.props.style}>
        <Dropdown overlay={areaPanel}>
          <Button>
            {this.state.locationName}
            <DownOutlined />
          </Button>
        </Dropdown>
        <Dropdown
          overlay={locationPanle}
          visible={this.state.searchPanelVisible}
          overlayClassName='testDrapdown'
          overlayStyle={
            {
              left:'16px'
            }
          }
        >
          <Input.Search
            style={{ height: 32 }}
            searchLoading={this.state.searchLoading}
            onSearch={(value, event) => this.onSearch(value, event)}
            onChange={this.handleSearchInputChange}
          />
        </Dropdown>
      </div>
    );
  }
}
