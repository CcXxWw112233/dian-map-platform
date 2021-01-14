import React, { Component } from "react";
import LoginPackge from "dian-npm-package-login";
import Nprogress from "nprogress";
import Cookie from "js-cookie";
import { message } from "antd";
import {
  COLLBACK_PRODUCTION_URL,
  WECHAT_APPID,
  COLLBACK_DEVELOPMENT_URL,
  REQUEST_PREFIX
} from "../../globalSet/config";
import { routerRedux } from "dva/router";
import styles from "./index.less";
import { connect } from "dva";

@connect(() => {})
export default class Index extends Component {
  loginSuccess = val => {
    const { dispatch } = this.props;
    if (val.code === "0") {
      const access_token = val.data.split("__")[0];
      const refresh_token = val.data.split("__")[1];
      Cookie.set("Authorization", access_token);
      Cookie.set("refreshToken", refresh_token);

      message.success("登录成功");
      setTimeout(() => {
        dispatch(routerRedux.replace("/home"));
      }, 200);
    } else {
      message.error(val.message || "登录失败");
    }
    Nprogress.done();
  };
  onLoginStart = async () => {
    Nprogress.start();
  };
  // 点击修改密码回调
  handleChangePassword = ({ data, calback }) => {
    // let params = {
    //   code: data.code,
    //   mobile: data.mobile,
    //   password: data.password,
    // };
    // resetPassword({ ...params }).then((res) => {
    //   if (res.code == "0") {
    //     message.success("重置密码成功");
    //     calback && typeof calback === "function" && calback();
    //   } else {
    //     message.success(res.message);
    //   }
    // });
  };
  componentDidMount() {
    Nprogress.done();
  }
  render() {
    const wechat_config = {
      appid: WECHAT_APPID,
      collBack_dev_url: COLLBACK_DEVELOPMENT_URL,
      location_name: "meeting",
      collBack_pro_url: COLLBACK_PRODUCTION_URL
    };
    return (
      <div className={styles.container}>
        <LoginPackge
          request_prefix={REQUEST_PREFIX + ""}
          platformName="隐翼地图"
          // platformLogoImg={require("../../assets/img/chengshi.png")}
          onEntryLogin={this.loginSuccess}
          beforeEntryLogin={this.onLoginStart}
          handleChangePassword={this.handleChangePassword}
          wechat_config={wechat_config}
        ></LoginPackge>
      </div>
    );
  }
}
