import React from "react";
import { Button, Badge } from "antd";
import styles from "./TempPlottingIcon.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { connect } from "dva";
@connect(
  ({
    tempPlotting: { iconVisible, panelVisible },
    featureOperatorList: { featureOperatorList },
  }) => ({
    iconVisible,
    panelVisible,
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
    const { panelVisible, featureOperatorList } = this.props;
    let newIconVisible = false
    if (panelVisible) {
      newIconVisible = false
    } else if (!panelVisible && featureOperatorList.length){
      newIconVisible = true
    }
    return newIconVisible ? (
      <Badge count={featureOperatorList.length} className={styles.wrap}>
        <Button shape="circle" onClick={this.handleClick} title="标绘记录">
          <i className={globalStyle.global_icon}>&#xe7b0;</i>
        </Button>
      </Badge>
    ) : null;
  }
}
