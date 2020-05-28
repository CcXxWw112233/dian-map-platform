import React from "react";
import { Input, Dropdown, Button } from "antd";
import throttle from "lodash/throttle";

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
      searchHistory: [],
      searchVal: "",
    };
    this.handleSearch = throttle(this.handleSearch, 1000);
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
  updateSearchValue = (val) => {
    this.setState(
      {
        searchVal: val,
      },
      () => {
        const { locationName } = this.state;
        this.handleSearch(val, locationName, 10);
      }
    );
  };
  handleSearchInputChange = (e) => {
    const address = e.target.value;
    this.setState({
      showArea: false,
      showLocation: true,
      searchVal: address,
    });
    const { locationName } = this.state;
    if (address === "") {
      POISearch.removePOI();
      this.setState({
        searchPanelVisible: false,
        searchResult: [],
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
    POISearch.setSession(value);
  };
  onSearchFocus = async (e) => {
    // debugger
    this.getSearchHistory();
  };
  onLocationPanelVisibleChange = (value) => {
    const { searchHistory } = this.state;
    let newState = false;
    if (searchHistory.length > 0 && value === false) {
      this.setState({ searchPanelVisible: newState });
    }
  };
  getSearchHistory = async () => {
    const searchHistoryArr = await POISearch.getSessionArray();
    this.setState({
      searchHistory: searchHistoryArr,
      searchPanelVisible: searchHistoryArr.length > 0 ? true : false,
    });
  };
  render() {
    const areaPanel = (
      <AreaPanel
        handleClose={this.handleAreaClose}
        updateLocationName={this.updateLocationName}
      ></AreaPanel>
    );
    const locationPanel = (
      <LocationPanel
        searchHistory={this.state.searchHistory}
        getSearchHistory={this.getSearchHistory}
        searchResult={this.state.searchResult}
        updateSearchValue={this.updateSearchValue}
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
          overlay={locationPanel}
          visible={this.state.searchPanelVisible}
          overlayClassName="testDrapdown"
          onVisibleChange={(e) => this.setState({ searchPanelVisible: e })}
          trigger="hover"
        >
          <Input.Search
            allowClear={true}
            style={{ height: 32 }}
            value={this.state.searchVal}
            searchLoading={this.state.searchLoading}
            onSearch={(value, event) => this.onSearch(value, event)}
            onChange={this.handleSearchInputChange}
            onFocus={this.onSearchFocus}
          />
        </Dropdown>
      </div>
    );
  }
}
