import React from "react";

import styles from "./Panel.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import commonSearchAction from "@/lib/components/Search/CommonSeach";
import { connect } from "dva";

@connect(({ scoutingProject: { cb } }) => ({ cb }))
export default class LocationPanel extends React.Component {
  constructor(props) {
    super(props);
    this.divElement = null;
  }
  componentDidMount() {
    // document.addEventListener("click", this.outDivClickHandler);
  }
  componentWillUnmount() {
    // document.removeEventListener("click", this.outDivClickHandler);
    commonSearchAction.removePOI()
  }
  outDivClickHandler = (e) => {
    const target = e.target;
    // 组件已挂载且事件触发对象不在div内
    if (this.divElement && !this.divElement.contains(target)) {
      const { searchResult, searchHistory } = this.props;
      if (searchHistory.length > 0 && searchResult.length === 0) {
        return;
      }
      this.props.changeLocationPanelVisible();
    }
  };
  handleCleanHistoryClick = () => {
    commonSearchAction.cleanSearchSession();
    this.props.getSearchHistory();
  };
  handleRowClick = (item, historyMode) => {
    if (historyMode) {
      this.props.updateSearchValue(item);
    } else {
      if (item.id) {
        commonSearchAction.addPOIToMap(item);
      } else {
        this.props.cb(item);
      }
    }
  };
  render() {
    const { searchResult, searchHistory } = this.props;
    let historyMode = false;
    let newDivStyle = {};
    if (searchHistory.length > 0 && searchResult.length === 0) {
      historyMode = true;
      newDivStyle = { padding: 0 };
    }
    return (
      <div
        className={styles.locatePanel}
        style={{ maxHeight: 600, ...newDivStyle }}
        ref={(node) => (this.divElement = node)}
      >
        {historyMode
          ? searchHistory.map((item, index) => {
              return (
                <p
                  className={styles.searchItem}
                  key={index}
                  // style={newPStyle}
                  onClick={() => this.handleRowClick(item, historyMode)}
                >
                  <i
                    className={globalStyle.global_icon}
                    style={{ color: "rgb(23, 105, 251)" }}
                  >
                    &#xe784;
                  </i>
                  <span>{item}</span>
                </p>
              );
            })
          : searchResult.map((item, index) => {
              const iconfont = item.id ? "&#xe72a;" : "&#xe72b;";
              return (
                <p
                  className={styles.searchItem}
                  key={item.id || item.board_id}
                  onClick={() => this.handleRowClick(item, historyMode)}
                >
                  <i
                    className={globalStyle.global_icon}
                    style={{ color: "rgb(23, 105, 251)" }}
                    dangerouslySetInnerHTML={{ __html: iconfont }}
                  ></i>
                  <span>{item.name || item.board_name}</span>
                  {item.id ? (
                    <span
                      className={styles.area}
                    >{`${item.pname}${item.cityname}${item.adname}`}</span>
                  ) : null}
                </p>
              );
            })}
        {historyMode ? (
          <div
            className={styles.searchItem}
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingLeft: 16,
              paddingRight: 16,
              backgroundColor: "#F5F5F5",
            }}
          >
            <span>历史记录</span>
            <span
              style={{ color: "#1769FF", cursor: "pointer" }}
              onClick={(e) => this.handleCleanHistoryClick(e)}
            >
              清空
            </span>
          </div>
        ) : null}
      </div>
    );
  }
}
