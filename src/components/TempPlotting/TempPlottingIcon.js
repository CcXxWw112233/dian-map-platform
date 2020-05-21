import React from "react";
import { Button, Tooltip } from "antd";
import styles from "./TempPlottingIcon.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { connect } from "dva";
@connect(
  ({
    tempPlotting: { iconVisible },
    featureOperatorList: { featureOperatorList },
  }) => ({
    iconVisible,
    featureOperatorList,
  })
)
export default class TempPlottingIcon extends React.Component {
  constructor(props) {
    super(props);
  }
  handleClick = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "tempPlotting/updateVisible",
      payload: {
        iconVisible: false,
        panelVisible: true,
      },
    });
  };
  render() {
    const { iconVisible,featureOperatorList } = this.props;
    let style = (featureOperatorList.length > 0 || iconVisible) ? { display: "" } : { display: "none" };
    if (featureOperatorList.length > 0) {
      style = { display: "" }
    }
    return (
      <Button
        shape="circle"
        className={styles.wrap}
        onClick={this.handleClick}
        style={{ ...style }}
        title="标绘记录"
      >
        <i className={globalStyle.global_icon}>&#xe7b0;</i>
      </Button>
    );
  }
}
