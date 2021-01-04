import {
  getUserInfo,
  getCurrentUserOrganizes,
  logOut,
  changeCurrentOrg
} from "@/services/user";
import Cookies from "js-cookie";
import { routerRedux } from "dva/router";

export default {
  namespace: "user",
  state: {
    // 状态
    status: null,
    userInfo: {}, //用户信息
    currentOrganize: {}, //当前组织id
    organizes: [] //组织列表
  },
  effects: {
    *initGetAuth({ payload }, { put, select, call }) {
      const Aa = yield put({
        type: "getUserInfo",
        payload: {}
      });
      const getUserInfoSync = () =>
        new Promise(resolve => {
          resolve(Aa.then());
        });
      const has_default_org = yield call(getUserInfoSync);
      const Bb = yield put({
        type: "getOrganizations",
        payload: {
          set_default: has_default_org //是否存在
        }
      });
      const getOrganizationsSync = () =>
        new Promise(resolve => {
          resolve(Bb.then());
        });
      yield call(getOrganizationsSync);
      return true;
    },
    //获取用户信息
    *getUserInfo({ payload }, { put, select, call }) {
      const res = yield call(getUserInfo);
      if (res.code === "0") {
        const current_org = res.data.current_org || {};
        const has_default_org = !!current_org.id && current_org.id !== "0";
        //更新用户信息和组织信息
        const update_data = has_default_org
          ? { currentOrganize: current_org || {} }
          : {}; //当前选中的组织
        yield put({
          type: "updateState",
          payload: {
            userInfo: res.data, //当前用户信息
            ...update_data
          }
        });
        return has_default_org;
      } else {
        return false;
      }
    },
    *getOrganizations({ payload }, { put, select, call }) {
      const { set_default } = payload;
      const res = yield call(getCurrentUserOrganizes);
      if (res.code === "0") {
        const update_data = set_default
          ? { currentOrganize: res.data.length ? res.data[0] : {} }
          : {}; //当前选中的组织
        yield put({
          type: "updateState",
          payload: {
            organizes: res.data, ////当前用户所属组织列表
            ...update_data
          }
        });
        return res.data;
      }
      return [];
    },
    *changeOrganization({ payload }, { put, select, call }) {
      const res = yield call(changeCurrentOrg);
      if (res.code === "0") {
        yield put({
          type: "updateState",
          payload: {
            organizes: res.data, ////当前用户所属组织列表
            currentOrganize: res.data.length ? res.data[0] : {} //当前选中的组织
          }
        });
      }
    },
    *logOut({ payload }, { put, select, call }) {
      const res = yield call(logOut);
      if (res.code === "0") {
        Cookies.remove("Authorization");
        Cookies.remove("refreshToken");
        yield put(routerRedux.replace({ pathname: "/login?redirect=/home" }));
      }
    },
    *routingJump({ payload }, { call, put }) {
      const { route } = payload;
      yield put(routerRedux.replace(route));
    }
  },
  reducers: {
    updateState(state, { payload }) {
      return { ...state, ...payload };
    }
  }
};
