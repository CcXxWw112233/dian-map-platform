import React, { Fragment } from "react";
import {
  Menu,
  Dropdown,
  Popconfirm,
  Input,
  Button,
  Space,
  Upload,
  message,
} from "antd";
import {
  SettingOutlined,
  // CheckCircleOutlined ,CloseCircleOutlined
} from "@ant-design/icons";
import styles from "../ScoutingList.less";
import animateCss from "../../../assets/css/animate.min.css";
import globalStyle from "../../../globalSet/styles/globalStyles.less";
import { keepLastIndex } from "../../../utils/utils";
import { BASIC } from "../../../services/config";
import { MyIcon } from "../../../components/utils";
import { UploadBgPic } from "./ScoutingDetailsSubComponents";
import Nprogress from "nprogress";
export default class ScoutingItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      editName: false,
      name: "",
      // hidden 隐藏 small 跟多按钮 full 全部展开
      remarkStatus: "small",
      isEdit: false,
      remark: "暂无备注信息",
      defaultValue: "备注：",
    };
    this.colors = ["brickRed", "darkGreen", "lightBlue", "lightGreen"];
    this.colorStyle = styles[this.colors[Math.floor(Math.random() * 4)]];
    this.content = React.createRef();
  }

  ToEdit = () => {
    let name = this.props.name;
    this.setState({
      editName: true,
      visible: false,
      name: name,
      remarkStatus: "hidden",
    });
  };
  EditEnd = () => {
    this.setState({
      editName: false,
      remarkStatus: "small",
    });
  };

  onHandleMenu = ({ key }) => {
    if (key === "editBoard") {
      this.ToEdit();
    }
    if (key === "editRemark") {
      this.setState({
        visible: false,
        remarkStatus: "full",
      });
      this.editContent();
    }
    if (key === "setBgImg") {
      this.setState({
        visible: false,
      });
    }
  };
  SureName = (oldname) => {
    let { onRename } = this.props;
    let { name } = this.state;
    if (!name) {
      this.setState({
        name: oldname,
      });
    } else onRename && onRename(name);
    this.EditEnd();
  };

  // 显示更多
  showMore = () => {
    let { remarkText } = this.props;
    let { current } = this.content;
    current.innerText = "备注：" + (remarkText || "暂无备注信息");
    this.setState({
      remarkStatus: "full",
    });
  };

  // 编辑备注
  editContent = () => {
    let { current } = this.content;
    let { remarkText } = this.props;
    // console.dir(current)
    current.innerText = remarkText || "";
    this.setState(
      {
        isEdit: true,
        defaultValue: "",
        remark: remarkText,
      },
      () => {
        current.focus();
        keepLastIndex(current);
      }
    );
  };

  // 编写备注
  setRemark = () => {
    let { current } = this.content;
    let text = current.innerText.trim();
    current.innerText = "备注：" + text;
    setTimeout(() => {
      this.setState({
        isEdit: false,
        remark: text,
      });
    });
    let { onSaveRemark } = this.props;
    onSaveRemark && onSaveRemark(text);
  };
  // 粘贴文本格式化
  textFormat(e) {
    e.preventDefault();
    var text;
    var clp = (e.originalEvent || e).clipboardData;
    if (clp === undefined || clp === null) {
      text = window.clipboardData.getData("text") || "";
      if (text !== "") {
        if (window.getSelection) {
          var newNode = document.createElement("span");
          newNode.innerHTML = text;
          window.getSelection().getRangeAt(0).insertNode(newNode);
        } else {
          document.selection.createRange().pasteHTML(text);
        }
      }
    } else {
      text = clp.getData("text/plain") || "";
      if (clp.files.length) {
        let file = clp.files[0];
        let { type } = file;
        let url = URL.createObjectURL(file);
        let img = new Image();
        img.src = url;
        img.crossorigin = "anonymous";
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          let baseUrl = canvas.toDataURL("image/jpeg", 1);
          document.execCommand("insertimage", false, baseUrl);
          img = null;
          canvas = null;
          ctx = null;
        };
      }
      if (text !== "") {
        document.execCommand("insertText", false, text);
      }
    }
  }

  // 取消编辑
  onCancelEditRemark = () => {
    let { remarkText } = this.props;
    let { current } = this.content;
    current.innerText = "备注：" + (remarkText || "暂无备注信息");
    this.setState(
      {
        isEdit: false,
        remark: "",
      },
      () => {
        this.setState({
          remark: remarkText,
        });
      }
    );
  };

  onUploadImg = ({ file }) => {
    let { response } = file;
    const { onSetBgImg = () => {} } = this.props;
    if (response) {
      if (BASIC.checkResponse(response)) onSetBgImg(response.message);
      Nprogress.done();
    }
  };

  componentWillUnmount() {
    this.EditEnd();
  }
  render() {
    let { visible, editName, remarkStatus, isEdit } = this.state;
    let {
      onRemove,
      cb,
      name,
      date,
      remarkText = "暂无备注信息",
      bgImage,
      toolParent,
    } = this.props;
    // const menu = (
    //     <Menu onClick={this.onHandleMenu}>
    //       <Menu.Item key="editBoard">
    //         重命名
    //       </Menu.Item>
    //       <Menu.Item key="editRemark">
    //         编辑备注
    //       </Menu.Item>
    //       <Menu.Item key="setBgImg">

    //       </Menu.Item>
    //       <Menu.Item key="removeBoard">

    //       </Menu.Item>
    //     </Menu>
    // );
    return (
      <div
        className={[
          animateCss.animated,
          animateCss.slideInRight,
          styles.btn,
          styles.scoutingItem,
          this.colorStyle,
        ].join(" ")}
        onClick={cb}
        style={{ ...this.props.style }}
      >
        {bgImage && (
          <div className={styles.itemBgImage}>
            <img crossOrigin="anonymous" src={bgImage} alt="" />
          </div>
        )}
        <div
          className={`${
            remarkStatus === "full" ? styles.nameHidden : styles.nameShow
          } ${styles.nameBox}`}
        >
          {!this.state.editName && (
            <div
              className={styles.settings}
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className={`${styles.settings_item}`}
                title="配置权限"
                onClick={() => {
                  const { displayPermissionModal, data } = this.props;
                  displayPermissionModal(data);
                }}
                style={{
                  ...(toolParent &&
                    toolParent.getStyle(
                      "map:board:member:manage",
                      "project",
                      this.props.data.board_id
                    )),
                }}
                disabled={
                  toolParent &&
                  toolParent.getDisabled(
                    "map:board:member:manage",
                    "project",
                    this.props.data.board_id
                  )
                }
              >
                <MyIcon type="icon-weidenglutouxiang" />
              </span>
              <span
                className={`${styles.settings_item}`}
                title="修改项目名称"
                onClick={() => this.ToEdit()}
                style={{
                  ...(toolParent &&
                    toolParent.getStyle("map:board:update", "org")),
                }}
                disabled={
                  toolParent &&
                  toolParent.getDisabled("map:board:update", "project")
                }
              >
                <MyIcon type="icon-bianzu46" />
              </span>

              <UploadBgPic
                onUpload={this.onUploadImg}
                onStart={() => Nprogress.start()}
              >
                <span className={`${styles.settings_item}`} title="上传背景图">
                  <MyIcon type="icon-bianzu45" />
                </span>
              </UploadBgPic>

              <Popconfirm
                title="确定删除这个项目吗?"
                okText="删除"
                cancelText="取消"
                overlayStyle={{ zIndex: 10000 }}
                onConfirm={() => {
                  this.setState({ visible: false });
                  onRemove && onRemove();
                }}
                placement="topRight"
              >
                <span
                  className={`${styles.settings_item} ${styles.removeBtn}`}
                  title="删除项目"
                  style={{
                    ...(toolParent &&
                      toolParent.getStyle("map:board:remove", "org")),
                  }}
                >
                  <MyIcon type="icon-bianzu52" />
                </span>
              </Popconfirm>
            </div>
          )}
          <div className={styles.projectModal}></div>
          <div
            className={styles.name}
            onClick={(e) => {
              editName && e.stopPropagation();
            }}
          >
            {editName ? (
              <Fragment>
                <Input
                  defaultValue={name}
                  placeholder="请输入项目名称"
                  onBlur={this.SureName.bind(this, name)}
                  onPressEnter={this.SureName.bind(this, name)}
                  onChange={(val) =>
                    this.setState({ name: val.target.value.trim() })
                  }
                  style={{ width: "70%", borderRadius: "4px" }}
                  onClick={(e) => e.stopPropagation()}
                  allowClear={true}
                />
                <div
                  style={{
                    width: "70%",
                    borderRadius: "4px",
                    margin: "0 auto",
                    textAlign: "right",
                  }}
                >
                  <Space size="middle">
                    <Button size="small" onClick={this.EditEnd} ghost>
                      取消
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        this.SureName(name);
                      }}
                    >
                      确认
                    </Button>
                  </Space>
                </div>
              </Fragment>
            ) : (
              <span>{name}</span>
            )}
          </div>
          <p className={styles.date}>
            <span>{date}</span>
          </p>
        </div>

        <div
          className={[
            styles.remarksBox,
            remarkStatus === "small"
              ? styles.remarkNormal
              : remarkStatus === "full"
              ? styles.remarkFull
              : styles.remarkHidden,
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ height: "100%" }}>
            <div className={styles.remarkTitle}>
              {/* 小标题 */}
              {remarkStatus !== "full" ? (
                <div className={`${styles.remarkSmallTitle}`}>
                  <span>备注：</span>
                  {remarkText}
                  <span className={styles.moreText} onClick={this.showMore}>
                    更多
                    <b
                      className={globalStyle.global_icon}
                      dangerouslySetInnerHTML={{ __html: "&#xe7f0;" }}
                    ></b>
                  </span>
                </div>
              ) : (
                <div className={styles.normalTitle}>
                  <span
                    onClick={() => this.setState({ remarkStatus: "small" })}
                    title={name}
                    className={styles.remarkProjectName}
                  >
                    <span
                      className={globalStyle.global_icon}
                      dangerouslySetInnerHTML={{ __html: "&#xe7ef;" }}
                    ></span>
                    <span className={styles.remarkName}>{name}</span>
                  </span>
                  <span
                    className={`${globalStyle.global_icon} ${styles.remarkEdit}`}
                    dangerouslySetInnerHTML={{ __html: "&#xe791;" }}
                    onClick={() => this.editContent()}
                  ></span>
                </div>
              )}
            </div>
            <div
              className={`${styles.remarkContent} ${
                isEdit ? styles.active : ""
              } ${globalStyle.autoScrollY}`}
              suppressContentEditableWarning
              contentEditable={isEdit ? "true" : "false"}
              // onInput={this.setRemark}
              onPaste={this.textFormat}
              ref={this.content}
            ></div>
            {isEdit && (
              <div className={styles.remarkBtn}>
                <Button
                  type="default"
                  ghost
                  size="small"
                  style={{ marginRight: "8px", borderRadius: "3px" }}
                  onClick={this.onCancelEditRemark}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  size="small"
                  style={{ borderRadius: "3px" }}
                  onClick={this.setRemark}
                >
                  确定
                </Button>
              </div>
            )}
          </div>
          <div className={styles.blurBg}></div>
        </div>
      </div>
    );
  }
}
