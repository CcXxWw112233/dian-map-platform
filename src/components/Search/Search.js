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
import Event from "../../lib/utils/event";

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
      locationName: "全国",
      showArea: false,
      showLocation: false,
      searchResult: [],
      searchPanelVisible: false,
      areaPanelVisible: false,
      searchLoading: false,
      searchHistory: [],
      searchVal: "",
      adcode: "",
    };
    this.placeholder = "搜索地址或项目";
    this.props.onRef(this);
    this.handleSearch = throttle(this.handleSearch, 1000);
  }
  componentDidMount() {
    setSession("xzqhCode", "");
    setSession("city", "");
    setSession("province", "");
    setSession("district", "");
    const options = {
      type: "nationcode",
      adcode: "100000",
      locationName: "全国",
    };
    this.updateState(options);
  }

  goBackToNation = () => {
    setSession("xzqhCode", "");
    setSession("city", "");
    setSession("province", "");
    setSession("district", "");
    const options = {
      type: "nationcode",
      adcode: "100000",
      locationName: "全国",
    };
    this.updateState(options);
    Event.Evt.firEvent("searchProject");
  };

  updateState = (val, noNeedUpdate = false) => {
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
      if (!noNeedUpdate) {
        changeQueryStr && changeQueryStr(queryStr);
      }
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
  handleSearch = (address, localtionName, offset) => {
    this.setState({
      searchLoading: true,
    });
    if (address === "") {
      this.setState({
        searchResult: [],
        searchLoading: false,
        searchPanelVisible: false,
      });
      return;
    }
    let scoutingProjectList = [];
    const { collectData, groupId } = this.props;
    if (collectData) {
      let tmp = [];
      let groupData = [];
      let newGroupId = groupId === "other" ? "" : groupId;
      groupData = collectData.filter((item) => {
        return item.area_type_id === newGroupId;
      });
      tmp = groupData.filter((item) => {
        return item.title.includes(address);
      });
      scoutingProjectList = tmp;
    }
    if (!this.props.inProject) {
      localtionName = localtionName === "全国" ? "" : localtionName;
      commonSearchAction
        .getPOI(address, localtionName, offset)
        .then((res) => {
          if (!this.props.isOnMap) {
            let tmp = this.props.projectList.filter((item) => {
              return item.board_name.indexOf(address) > -1;
            });
            scoutingProjectList = [...scoutingProjectList, ...tmp];
          }
          this.setState({
            searchResult: scoutingProjectList.concat(res),
            searchLoading: false,
            searchPanelVisible: scoutingProjectList.length ? true : false,
          });
        })
        .catch((e) => {
          this.setState({
            searchLoading: false,
            searchPanelVisible: false,
          });
        });
    } else {
      this.setState({
        searchResult: scoutingProjectList,
        searchLoading: false,
        searchPanelVisible: scoutingProjectList.length ? true : false,
      });
    }
  };
  changeAreaPanelVisible = () => {
    this.setState({
      areaPanelVisible: false,
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

  onAreaPanelVisibleChange = (value) => {
    this.setState({
      areaPanelVisible: value,
    });
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
        changeAreaPanelVisible={this.changeAreaPanelVisible}
        parent={this}
      ></AreaPanel>
    );
    const locationPanel = (
      <LocationPanel
        searchHistory={this.state.searchHistory}
        getSearchHistory={this.getSearchHistory}
        searchResult={this.state.searchResult}
        updateSearchValue={this.updateSearchValue}
        parent={this}
        changeLocationPanelVisible={this.changeLocationPanelVisible}
      ></LocationPanel>
    );
    return (
      <div className={styles.wrap} style={this.props.style}>
        {!this.props.inProject ? (
          <Dropdown
            overlay={areaPanel}
            trigger="click"
            visible={this.state.areaPanelVisible}
            onVisibleChange={(e) => this.onAreaPanelVisibleChange(e)}
          >
            <Button style={{ borderRadius: 0 }}>
              {this.props.locationName}
              <DownOutlined />
            </Button>
          </Dropdown>
        ) : null}
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
            placeholder={this.props.placeholder || this.placeholder}
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
