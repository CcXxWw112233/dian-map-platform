import React from "react";
import { connect } from "dva";
import { routerRedux } from "dva/router";

function Index(props) {
  const { dispatch } = props;
  dispatch(routerRedux.replace("/home"));
  return <div></div>;
}

export default connect()(Index);
