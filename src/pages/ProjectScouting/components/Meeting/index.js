import React, { useState, useMemo } from "react";
import styles from "./index.less";
import {
  Input,
  Button,
  Avatar,
  Popover,
  Row,
  Col,
  Checkbox,
  message,
} from "antd";
import { MyIcon } from "../../../../components/utils";
import Action from "../../../../lib/components/ProjectScouting/ScoutingDetail";
import animateCss from "../../../../assets/css/animate.min.css";
import { dateFormat } from "../../../../utils/utils";

export default function Meettings(props) {
  const [isAddPhone, setAddPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectUsers, setSelectUsers] = useState([]);
  const [boardUsers, setBoardUsers] = useState([]);
  let userPhone = [];
  let users = [];
  const reg = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/;
  const phoneChange = (e) => {
    let value = e.target.value;
    setPhoneNumber(value);
    if (value) {
      setAddPhone(true);
    } else setAddPhone(false);
  };
  const getUsersList = () => {
    Action.meetting
      .fetchUsers({ board_id: props.board.board_id })
      .then((res) => {
        let data = res.data;
        setBoardUsers(data);
      });
  };
  useMemo(() => {
    getUsersList();
  }, [props.data]);

  const addPhone = () => {
    let list = [...selectUsers];
    if (reg.test(phoneNumber)) {
      if (list.includes(phoneNumber) || userPhone.includes(phoneNumber)) {
        return message.warn("不能重复添加联系人");
      }
      // 关闭设置手机号
      setAddPhone(false);
      let user = boardUsers.find((item) => item.mobile === phoneNumber);
      // 如果发现输入的手机号是项目成员的
      if (user) {
        list.push(user.user_id);
      } else {
        list.push(phoneNumber);
      }
      setSelectUsers(list);
      // 清空手机号
      setPhoneNumber("");
    } else {
      message.warn("请输入合法手机号");
    }
  };

  const clickAddUser = (val) => {
    let arr = Array.from(selectUsers);
    if (arr.includes(val.user_id)) {
      arr = arr.filter((item) => item !== val.user_id);
    } else {
      arr.push(val.user_id);
    }
    setSelectUsers(arr);
  };

  const getUsersRender = () => {
    let arr = [...selectUsers];
    let list = arr.map((item) => {
      if (reg.test(item)) {
        // 这个是电话号码
        return { user_id: item, name: item, _type: "phone" };
      } else {
        // 这个是用户ID
        return boardUsers.find((user) => user.user_id === item);
      }
    });
    userPhone = list.map((item) => item.mobile || item.user_id);
    users = list;
    return list;
  };

  const removeUser = (val) => {
    let arr = Array.from(selectUsers);
    arr = arr.filter((item) => item !== val.user_id);
    setSelectUsers(arr);
  };

  const addSelect = (val) => {
    setSelectUsers(val);
  };

  const onStart = () => {
    if (!users.length) {
      return message.warn("未选择联系人");
    }
    message.info("正在发起会议");
    let ids = users.filter((item) => !item._type);
    let phone = users.filter((item) => item._type === "phone");
    ids = ids.map((item) => item.user_id);
    phone = phone.map((item) => item.user_id);
    let param = {
      topic:
        `地图协作会议` + dateFormat(new Date().getTime(), "yyyy/MM/dd HH:mm"),
      board_id: props.board.board_id,
      user_ids: ids.join(","),
      user_for: phone.join(","),
    };
    Action.meetting
      .meettingStart(param)
      .then((res) => {
        let data = res.data;
        if (data.start_url) {
          let url = data.start_url;
          message.destroy();
          setTimeout(() => {
            window.open(url, "_blank");
          }, 2000);
          setSelectUsers([]);
          userPhone = [];
          message.success("会议已发起,将自动跳转页面开启会议");
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };
  return (
    <div className={styles.meettingContainer}>
      <div className={styles.meettingHeader}>
        <div className={styles.meettingContainerTitle}>输入手机号邀请协作</div>
        <div className={styles.meettingPhoneNumber}>
          <Input
            placeholder="输入手机号邀请"
            onChange={phoneChange}
            value={phoneNumber}
            allowClear
            onPressEnter={addPhone}
          />
          {isAddPhone ? (
            <Avatar
              shape="square"
              className={styles.avatar}
              onClick={addPhone}
              icon={<MyIcon type="icon-querentianjia" />}
            />
          ) : (
            <Popover
              title={<div style={{ padding: "5px 0" }}>联系人</div>}
              trigger="click"
              placement="bottomLeft"
              overlayClassName={styles.selectUsers}
              overlayStyle={{ width: 290 }}
              content={
                <Checkbox.Group
                  onChange={addSelect}
                  style={{ width: "100%" }}
                  value={selectUsers}
                >
                  {boardUsers.map((item, index) => {
                    return (
                      <div
                        className={styles.border_user}
                        key={item.user_id || index}
                        onClick={() => clickAddUser(item)}
                      >
                        <Row gutter={6} align="middle">
                          <Col span={4}>
                            <Avatar src={item.avatar} />
                          </Col>
                          <Col style={{ textAlign: "left" }} span={18}>
                            <span>{item.name}</span>
                          </Col>
                          <Col span={2}>
                            <Checkbox
                              value={item.user_id}
                              onClick={(e) => e.stopPropagation()}
                              checked={selectUsers.includes(item.user_id)}
                            ></Checkbox>
                          </Col>
                        </Row>
                      </div>
                    );
                  })}
                </Checkbox.Group>
              }
            >
              <Avatar
                shape="square"
                className={styles.avatar}
                onClick={getUsersList}
                icon={<MyIcon type="icon-tianjiachengyuan" />}
              />
            </Popover>
          )}
        </div>
      </div>
      <div
        className={styles.renderList}
        style={{
          ...(props.miniTitle
            ? { height: "calc(100% - 172px)" }
            : { height: "calc(100% - 122px)" }),
        }}
      >
        {getUsersRender().map((item, index) => {
          return (
            <div
              className={`${styles.users} ${animateCss.animated} ${animateCss.fadeInUp}`}
              key={item.user_id || index}
            >
              {item._type === "phone" ? (
                <Avatar
                  icon={<MyIcon type="icon-weidenglutouxiang" />}
                  style={{ background: "rgba(141, 185, 255, 1)" }}
                  className={styles.user_avatar}
                />
              ) : (
                <Avatar src={item.avatar} className={styles.user_avatar} />
              )}
              <span>{item.name}</span>
              <span
                className={styles.removeUser}
                onClick={() => removeUser(item)}
              >
                <MyIcon type="icon-guanbi2" />
              </span>
            </div>
          );
        })}
      </div>
      <div className={styles.footer}>
        <Button type="primary" onClick={onStart}>
          发起协作
        </Button>
      </div>
    </div>
  );
}
