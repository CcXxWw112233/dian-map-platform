import React from "react";
import Event from "../../lib/utils/event";
import globalStyle from "@/globalSet/styles/globalStyles.less";

export default class SearchBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
    this.keywords = "";
    Event.Evt.on("displaySearchBtn", ({ visible, keywords }) => {
      this.keywords = keywords;
      this.setState({
        visible: visible,
      });
    });
  }
  handleSearch = () => {
    const keywords = this.keywords;
    Event.Evt.firEvent("getPoi", { keywords: keywords });
  };
  render() {
    let style = {
      position: "absolute",
      left: "50%",
      bottom: 20,
      width: 200,
      height: 36,
      color: "#fff",
      backgroundColor: "#559ffb",
      borderRadius: 2,
      transform: "translateX(-50%)",
      textAlign: "center",
      lineHeight: "36px",
      cursor: "pointer",
    };
    style = this.state.visible ? style : { ...style, display: "none" };
    return (
      <div style={style} onClick={this.handleSearch}>
        在此区域搜索
      </div>
    );
  }
}
