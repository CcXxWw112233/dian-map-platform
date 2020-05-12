import React from "react";
import PropTypes from "prop-types";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Button, Menu } from "antd";
import { MyIcon } from "components/utils";
import globalStyle from "@/globalSet/styles/globalStyles.less";

const DropOption = ({ options }) => {
  const name = options.name;
  const optionKey = options.key;
  const children = options.children;
  const menu = children.map((item) => (
    <Menu.Item key={item.key} onClick={item.cb}>
      {/* <MyIcon type={item.icon} /> */}
      <i
        style={{ color: "rgba(24, 144, 255,1)", fontSize: 14, marginRight: 5 }}
        className={globalStyle.global_icon}
        dangerouslySetInnerHTML={{ __html: item.icon }}
      ></i>
      {item.name}
    </Menu.Item>
  ));
  const icon = options.icon;
  let downOutlined, myOvelay;
  if (children.length > 0) {
    downOutlined = <DownOutlined />;
    myOvelay = <Menu>{menu}</Menu>;
  } else {
    return (
      <Button
        style={{ border: "none", padding: "4px 10px", cursor: "pointer" }}
        onClick={options.cb}
      >
        {/* <MyIcon type={icon} /> */}
        <i
          style={{ color: "rgba(24, 144, 255,1)", fontSize: 14, marginRight: 5 }}
          className={globalStyle.global_icon}
          dangerouslySetInnerHTML={{ __html: icon }}
        ></i>
        {name}
      </Button>
    );
  }
  return (
    <Dropdown overlay={myOvelay}>
      <Button
        style={{ border: "none", padding: "4px 10px", cursor: "pointer" }}
        key={optionKey}
      >
        {/* <MyIcon type={ icon }/> */}
        <i
          style={{ color: "rgba(24, 144, 255,1)", fontSize: 14, marginRight: 5 }}
          className={globalStyle.global_icon}
          dangerouslySetInnerHTML={{ __html: icon }}
        ></i>
        {name}
        {downOutlined}
      </Button>
    </Dropdown>
  );
};

DropOption.propTypes = {
  options: PropTypes.object,
};

export default DropOption;
