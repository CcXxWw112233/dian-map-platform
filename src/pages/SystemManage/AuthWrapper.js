import React from "react";

export function checkAuth(functionName, menuId) {
  if (functionName) {
    let functionsList; //[{menuId:0,btnCode:"add"},{menuId:2,btnCode:"del"}]
    if (sessionStorage.getItem('permissionsButtonList')) {
      functionsList = JSON.parse(sessionStorage.getItem('permissionsButtonList');)
    } else {
      return false;
    }
    //这边有一个菜单ID-主要是为了兼容复用同一个组件情况
    if (menuId) {
      functionsList = functionsList.filter((item) => {
        return item.menuId == menuId
      })
    }
  
    const functions = functionName.split(',');
    const flag = functions.some((value) =>
      functionsList.some((func) => func.buttonCode == value.trim())
    );
    return flag;
  } else {
    return false;
  }
}


export class AuthWrapper extends React.Component {
  render() {
    return checkAuth(this.props.functionName, this.props.menuId)
  }
}
