import React, { Component } from "react";
import { Menu } from "antd";
import { connect } from "dva";
import { changeCurrentOrg } from "../../../services/user";
import { BASIC } from "../../../services/config";
import { setSessionOrgId } from "../../../utils/sessionData";

@connect(mapStateToProps)
export default class OrgListSelect extends Component {
  handleClick = async ({ key }) => {
    const { dispatch, organizes } = this.props;
    const res = await changeCurrentOrg({ org_id: key });
    setSessionOrgId(key);
    dispatch({
      type: "user/updateState",
      payload: {
        currentOrganizeId: key,
        currentOrganize: organizes.find(item => item.id === key) || {}
      }
    });
  };
  render() {
    const { organizes, currentOrganizeId } = this.props;
    return (
      <Menu
        selectedKeys={[currentOrganizeId]}
        onClick={this.handleClick}
        style={{
          background: "rgba(255,255,255,1)",
          boxShadow: "0px 2px 8px 0px rgba(0,0,0,0.15)",
          borderRadius: 4
        }}
      >
        {organizes.map(item => {
          const { id, name } = item;
          return <Menu.Item key={id}>{name}</Menu.Item>;
        })}
      </Menu>
    );
  }
}
function mapStateToProps({ user: { organizes = [], currentOrganizeId } }) {
  return {
    organizes,
    currentOrganizeId
  };
}
