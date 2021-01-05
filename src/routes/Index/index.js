import React, { Component } from "react";
import { Route, Switch } from "dva/router";
import IndexPage from "../IndexPage";
import RedirectComp from "../RedirectComp";
import { connect } from "dva";
@connect(mapStateToProps)
export default class Index extends Component {
  constructor(props) {
    super(props);
    this.routes = [
      {
        path: "/home",
        component: IndexPage
      },
      {
        path: "*",
        component: RedirectComp
      }
    ];
    this.state = {
      show_route: false
    };
  }
  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: "user/initGetAuth",
      payload: {}
    }).then(res => {
      this.setState({
        show_route: true
      });
    });
  }
  componentDidMount() {
    console.log("ssssaaaasd", this.props);
  }
  renderRoute = () => {
    return (
      <Switch>
        {this.routes.map(({ path, component }, key) => {
          return <Route key={key} path={path} component={component} />;
        })}
      </Switch>
    );
  };

  render() {
    return <div>{this.state.show_route && <IndexPage />}</div>;
  }
}

function mapStateToProps({ user: { userInfo = {} } }) {
  return {
    userInfo
  };
}
