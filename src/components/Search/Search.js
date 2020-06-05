import React from "react";
import { Input, Dropdown, Button } from "antd";
import throttle from "lodash/throttle";

import { DownOutlined } from "@ant-design/icons";
import commonSearchAction from "@/lib/components/Search/CommonSeach";

import styles from "./Search.less";
import AreaPanel from "./AreaPanel";
import LocationPanel from "./LocationPanel";
import { getMyPosition } from "utils/getMyPosition";
import { BASIC } from "../../services/config";

import { connect } from "dva";

@connect(({ scoutingProject: { projectList } }) => ({ projectList }))
export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locationName: "中国",
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
  componentDidMount() {
    getMyPosition.getPosition().then((val) => {
      this.setState({
        locationName: val.addressComponent.city || this.state.locationName,
      });
    });
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
    const token = BASIC.getUrlParam.token;
    if (token) {
      const address = e.target.value;
      this.setState({
        showArea: false,
        showLocation: true,
        searchVal: address,
      });
      const { locationName } = this.state;
      if (address === "") {
        commonSearchAction.removePOI();
        this.setState({
          searchPanelVisible: false,
          searchResult: [],
        });
      }
      this.handleSearch(address, locationName, 10);
    }
  };

  // handleSearch = (address, locationName, offset) => {
  //   this.setState({
  //     searchLoading: true,
  //   });
  //   commonSearchAction.getPOI(address, locationName, offset).then((res) => {
  //     this.setState({
  //       searchResult: res,
  //       searchLoading: false,
  //       searchPanelVisible: res.length ? true : false,
  //     });
  //   });
  // };
  handleSearch = (address, locationName, offset) => {
    this.setState({
      searchLoading: true,
    });
    commonSearchAction
      .getPOI(address, locationName, offset)
      .then((res) => {
        let scoutingProjectList = [];
        if (!this.props.isOnMap) {
          scoutingProjectList = this.props.projectList.filter((item) => {
            return item.board_name.indexOf(address) > -1;
          });
        }
        this.setState({
          searchResult: scoutingProjectList.concat(res),
          searchLoading: false,
          searchPanelVisible: res.length ? true : false,
        });
      })
      .catch((e) => {
        this.setState({
          searchLoading: false,
          searchPanelVisible: false,
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
    commonSearchAction.setSession(value);
  };
  onSearchFocus = async (e) => {
    this.getSearchHistory();
  };
  onLocationPanelVisibleChange = (value) => {
    const { searchHistory } = this.state;
    let newState = false;
    if (searchHistory.length > 0 && value === true) {
      newState = true;
    }
    this.setState({ searchPanelVisible: newState });
  };
  getSearchHistory = async () => {
    const searchHistoryArr = await commonSearchAction.getSessionArray();
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
          <Button style={{ borderRadius: 0 }}>
            {this.state.locationName}
            <DownOutlined />
          </Button>
        </Dropdown>
        <Dropdown
          overlay={locationPanel}
          visible={this.state.searchPanelVisible}
          overlayClassName="testDrapdown"
          onVisibleChange={(e) => this.onLocationPanelVisibleChange(e)}
          trigger="hover"
        >
          <Input.Search
            allowClear={true}
            style={{ height: 32 }}
            placeholder="搜索地址或项目"
            value={this.state.searchVal}
            loading={this.state.searchLoading}
            onSearch={(value, event) => this.onSearch(value, event)}
            onChange={this.handleSearchInputChange}
            onFocus={this.onSearchFocus}
          />
        </Dropdown>
      </div>
    );
  }
}
