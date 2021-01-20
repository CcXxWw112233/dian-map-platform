import { request } from "./index";
import Cookies from "js-cookie";
import { BASIC, REQUEST_INTERGFACE_VERSION, REQUEST_UPMS } from "./config";

//获取用户信息
export async function getUserInfo(params) {
  let response = await request(
    "GET",
    `${REQUEST_UPMS}${REQUEST_INTERGFACE_VERSION}/user`
  );
  if (response) {
    return Promise.resolve(response.data);
  } else {
    return Promise.resolve({});
  }
  // if (BASIC.checkResponse(response)) {
  //   return response.data;
  // }
  // return Promise.reject(response && response.data);
}
//退出登录
export async function logOut(data) {
  let response = await request("GET", `${REQUEST_UPMS}/user/logout`, {
    accessToken: Cookies.get("Authorization"),
    refreshToken: Cookies.get("refreshToken")
  });
  if (BASIC.checkResponse(response)) {
    return response.data;
  }
  return Promise.reject(response && response.data);
}

// 查询用户组织列表
export async function getCurrentUserOrganizes(params) {
  let response = await request("GET", `${REQUEST_UPMS}/organization/map`);
  if (response) {
    return Promise.resolve(response.data);
  } else {
    return Promise.resolve({});
  }
  // if (BASIC.checkResponse(response)) {
  //   return response.data;
  // }
  // return Promise.reject(response && response.data);
}
// 切换组织
export async function changeCurrentOrg(data) {
  let response = await request(
    "PUT",
    `${REQUEST_UPMS}${REQUEST_INTERGFACE_VERSION}/user/changecurrentorg/${data.org_id}`,
    data
  );
  if (BASIC.checkResponse(response)) {
    return response.data;
  }
  return Promise.reject(response && response.data);
}
