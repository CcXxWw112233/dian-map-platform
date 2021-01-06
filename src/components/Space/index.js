import React, { Component } from "react";

export default class index extends Component {
  setSize = () => {
    const { size = "small" } = this.props;
    let marginLeft = 8;
    switch (size) {
      case "small":
        marginLeft = 8;
        break;
      case "middle":
        marginLeft = 16;
        break;
      case "large":
        marginLeft = 24;
        break;
      default:
        if (typeof size === "number") {
          return size;
        }
        break;
    }
    return marginLeft;
  };
  render() {
    const { children } = this.props;
    return (
      <>
        {React.Children.map(children, child => {
          return child;
        })}
      </>
    );
  }
}
