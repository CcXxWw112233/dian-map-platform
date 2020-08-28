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
import { setSession, getSession } from "utils/sessionManage";

import { connect } from "dva";

@connect(
  ({
    scoutingProject: { projectList },
    areaSearch: { locationName, adcode },
  }) => ({ projectList, locationName, adcode })
)
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
      adcode: "",
    };
    this.handleSearch = throttle(this.handleSearch, 1000);
  }
  componentDidMount() {
    getSession("xzqhCode").then((res) => {
      if (res.code === 0) {
        if (!res.data) {
          getMyPosition.getPosition().then((val) => {
            if (!val) return;
            setSession(
              "xzqhCode",
              `districtcode|${val.addressComponent?.adcode}|${val.addressComponent?.district}`
            );

            const options = {
              type: "districtcode",
              adcode: val.addressComponent?.adcode,
              locationName: val.addressComponent?.district,
            };
            this.updateState(options);
          });
        } else {
          const tempArr = res.data.split("|");
          const options = {
            type: tempArr[0],
            adcode: tempArr[1],
            locationName: tempArr[2],
          };
          this.updateState(options);
        }
      }
    });
  }

  updateState = (val) => {
    if (val.locationName) {
      const { dispatch } = this.props;
      dispatch({
        type: "areaSearch/update",
        payload: {
          locationName: val.locationName,
          adcode: val.adcode,
        },
      });
      const queryStr = `${val.type}='${val.adcode}'`;
      const { changeQueryStr } = this.props;
      changeQueryStr && changeQueryStr(queryStr);
    }
  };
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
    const { dispatch } = this.props;
    dispatch({
      type: "areaSearch/update",
      payload: {
        locationName: name,
      },
    });
  };
  updateSearchValue = (val) => {
    this.setState(
      {
        searchVal: val,
      },
      () => {
        const { locationName } = this.props;
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
      const { locationName } = this.props;
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
    // const { locationName } = this.state;
    const { locationName } = this.props;
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
        changeQueryStr={this.props.changeQueryStr}
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
        <Dropdown overlay={areaPanel} trigger="click">
          <Button style={{ borderRadius: 0 }}>
            {this.props.locationName}
            <DownOutlined />
          </Button>
        </Dropdown>
        <Dropdown
          overlay={locationPanel}
          visible={this.state.searchPanelVisible}
          overlayClassName="testDrapdown"
          onVisibleChange={(e) => this.onLocationPanelVisibleChange(e)}
          trigger="click"
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
