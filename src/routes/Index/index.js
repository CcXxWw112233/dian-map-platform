import React, { Component } from "react";
import { Route, Switch } from "dva/router";
import IndexPage from "../IndexPage";
import RedirectComp from "../RedirectComp";
import { connect } from "dva";
import { ENTRANCE_MODE_IFRAME } from "../../globalSet/config";
import Cookies from "js-cookie";
import { setSessionOrgId } from "../../utils/sessionData";
import { BASIC } from "../../services/config";
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
    //应用初始化进入需要权限的路由，当参数存在token和orgId则判断是内嵌界面
    if (ENTRANCE_MODE_IFRAME) {
      const { orgId, token } = BASIC.getUrlParam;
      Cookies.set("Authorization", token);
      setSessionOrgId(orgId);
      // console.log("Authorization", ENTRANCE_MODE_IFRAME, token, orgId);
    }
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
