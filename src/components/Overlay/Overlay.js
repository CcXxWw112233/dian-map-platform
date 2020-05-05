import React from "react";
import { connect } from "dva";

@connect(({ overlay: { childComponet, show } }) => ({ childComponet, show }))
export default class Overlay extends React.Component {
  constructor(props) {
    super(props)
  }
  setPosition = () => {};
  render() {
    let { childComponet, show } = this.props;
    return (
      <div
        style={{
          margin: 0,
          padding: 0
        }}
        className="myoverlay"
      >
        {show && childComponet}
      </div>
    );
  }
}
