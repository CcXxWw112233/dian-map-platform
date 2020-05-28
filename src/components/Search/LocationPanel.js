import React from "react";

import styles from "./Panel.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import POISearch from "@/lib/components/Search/POISeach";
export default class LocationPanel extends React.Component {
  constructor(props) {
    super(props);
    this.divElement = null;
  }
  handleRowClick = (item) => {
    POISearch.addPOIToMap(item);
  };
  componentDidMount() {
    document.addEventListener("click", this.outDivClickHandler);
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.outDivClickHandler);
  }
  outDivClickHandler = (e) => {
    const target = e.target;
    // 组件已挂载且事件触发对象不在div内
    if (this.divElement && !this.divElement.contains(target)) {
      this.props.changeLocationPanelVisible();
    }
  };
  render() {
    const { searchResult } = this.props;
    return (
      <div
        className={styles.locatePanel}
        style={{ maxHeight: 600 }}
        ref={(node) => (this.divElement = node)}
      >
        {searchResult.map((item, index) => {
          return (
            <p
              className={styles.searchItem}
              key={index}
              onClick={() => this.handleRowClick(item)}
            >
              <i
                className={globalStyle.global_icon}
                style={{ color: "rgb(23, 105, 251)" }}
              >
                &#xe72a;
              </i>
              <span>{item.name}</span>
              <span
                className={styles.area}
              >{`${item.pname}${item.cityname}${item.adname}`}</span>
            </p>
          );
        })}
      </div>
    );
  }
}
