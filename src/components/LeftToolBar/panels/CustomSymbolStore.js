import React, { Fragment } from "react";
import axios from "axios";
import { QuestionCircleOutlined } from "@ant-design/icons";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "../LeftToolBar.less";
import { Input, Button, Tooltip, Upload, message, Popconfirm } from "antd";
import server from "../../../services/symbolStore";
import { BASIC } from "../../../services/config";
import { formatSize } from "../../../utils/utils";
import RenameModal from "../components/RenameModal";
import { compress } from "../../../utils//pictureCompress"

export default class CustomSymbolStore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allIcons: [],
      isUploadFileList: [],
      uploadSymbolName: "",
      showRename: false,
      uploadingIcon: {},
      dataIcons: [],
      keywords: "",
      isRemoveActive: false,
      removeActives: [],
    };
    this.transfromUploadIcon = {};
  }

  componentDidMount() {
    // 更新所有上传的icon
    this.fetchIcons();
  }

  // 请求更新icon
  fetchIcons = async () => {
    let data = await server.GET_ICON().catch((err) => console.log(err));
    if (data) {
      // console.log(data)
      this.updateData(data.data);
      this.setState({
        allIcons: data.data,
      });
      return data;
    }
  };
  // 更新列表，用于搜索，排序等其他操作
  updateData = (data, str) => {
    let icons = data;
    this.setState({
      dataIcons: icons,
      keywords: str,
    });
  };

  checkFileSize = (file) => {
    // console.log(file);
    const type = ["image/png", "image/jpg", "image/jpeg", "image/bmp"].filter(
      (item) => {
        return item === file.type;
      }
    )?.[0];
    if (!type) {
      message.error("请上传.jpg, .jpeg, .png, .bmp格式文件");
      return false;
    }
    let { size, text } = formatSize(file.size);
    text = text.trim();
    // console.log(size, text);
    if (+size > 1 && text === "MB") {
      message.error("图片不能大于1MB");
      return false;
    }
    return true;
  };

  rename = (file, data) => {
    let url = window.URL.createObjectURL(file);
    let { uploadingIcon } = this.state;
    uploadingIcon.src = url;
    uploadingIcon.name = data.icon_name;
    this.setState(
      {
        uploadingIcon: { ...uploadingIcon },
        showRename: true,
      },
      () => {
        // console.log(this.state.uploadingIcon)
      }
    );
  };

  beforeUpload = (file) => {
    const checked = this.checkFileSize(file);
    if (checked) {
      return new Promise((resolve, reject) => {
        compress(file, 48).then(res => {
          const index = file.name.lastIndexOf(".");
          this.setState({
            uploadSymbolName: file.name.substr(0, index),
          });
          resolve(res)
        })
      });
    } else {
      return Promise.reject();
    }
  };
  //
  uploadChange = (val) => {};
  coustomFunction = (options) => {
    const { onSuccess, onError, file, onProgress, data } = options;
    // console.log(file,data);
    this.transfromUploadIcon = file;
    this.rename(file, data);
  };
  onUpload = (name) => {
    let headers = {
      Authorization: BASIC.getUrlParam.token,
      "Content-Type": "multipart/form-data",
    };
    let data = {
      icon_name: name,
      org_id: BASIC.getUrlParam.orgId,
    };
    let param = new FormData();
    param.append("file", this.transfromUploadIcon);
    param.append("org_id", data.org_id);
    param.append("icon_name", data.icon_name);
    axios
      .post("/api/map/icon", param, { headers })
      .then((res) => {
        if (BASIC.checkResponse(res.data)) {
          this.setState({
            showRename: false,
            uploadingIcon: {},
            fileList: [],
          });
          this.transfromUploadIcon = null;
          message.success("上传成功");
          this.props.parent.customSymbols = null;
          this.fetchIcons();
        } else {
          message.error("上传出现错误,请检查后再试");
        }
      })
      .catch((err) => {
        message.error("网络错误，上传失败，请检查网络状态");
      });
  };
  cancelUpload = () => {
    this.setState({
      showRename: false,
      uploadingIcon: {},
    });
    this.transfromUploadIcon = null;
  };

  serchForIconName = (e) => {
    let val = e.target.value;
    let { allIcons } = this.state;
    let arr;
    if (val) {
      arr = allIcons.filter((item) => item.icon_name.indexOf(val) !== -1);
    } else arr = allIcons;
    // console.log(arr);
    this.updateData(arr, val);
  };
  // 改动删除状态
  changeRemoveActive = (val) => {
    this.setState({
      isRemoveActive: val,
      removeActives: !val ? [] : this.state.removeActives,
    });
  };
  // 设置删除的id
  setRemoveKey = (id) => {
    if (!this.state.isRemoveActive) return;
    let { removeActives } = this.state;
    let arr = Array.from(removeActives);
    if (arr.includes(id)) {
      arr = arr.filter((item) => item !== id);
    } else {
      arr.push(id);
    }
    this.setState({
      removeActives: arr,
    });
  };

  toRemove = () => {
    this.props.parent.customSymbolsn = null;
    let { removeActives, allIcons, dataIcons } = this.state;
    let arr = Array.from(allIcons);
    let rArr = Array.from(removeActives);
    let dArr = Array.from(dataIcons);
    (async () => {
      for (let i = 0; i < removeActives.length; i++) {
        let item = removeActives[i];
        let res = await server.DeL_ICON(item).catch((err) => console.log(err));
        if (res) {
          arr = arr.filter((n) => n.id !== item);
          rArr = rArr.filter((v) => v !== item);
          dArr = dArr.filter((d) => d.id !== item);
        }
      }
      this.setState(
        {
          removeActives: rArr,
          allIcons: arr,
          dataIcons: dArr,
        },
        () => {
          this.updateData(dArr);
        }
      );
    })();
  };

  render() {
    const { dataIcons, keywords, isRemoveActive, removeActives } = this.state;
    return (
      <div
        className={styles.defineIcons}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <div
          className={styles.header}
          style={{ padding: "0 20px", marginBottom: 10 }}
        >
          <div>
            <span className={styles.title}>自定义符号</span>
          </div>
          <div
            className={`${styles.body} ${globalStyle.autoScrollY}`}
            style={{
              height: "calc(100% - 30px)",
            }}
          >
            <div className={styles.searchInput}>
              <Input.Search
                placeholder="搜索关键字或标绘名称"
                size="small"
                allowClear
                className={styles.input}
                onChange={this.serchForIconName}
              />
            </div>
            <div className={styles.searchKeywords}>
              {keywords && (
                <span>
                  搜索关键字:{" "}
                  <span className={styles.keywords}>{keywords}</span>
                </span>
              )}
            </div>
          </div>
          <RenameModal
            visible={this.state.showRename}
            appendTo={this}
            dataSource={this.state.uploadingIcon}
            onOk={this.onUpload}
            onCancel={() => {
              this.cancelUpload();
              console.log("取消编辑");
            }}
          />
        </div>

        <div className={styles.iconContainer}>
          {dataIcons.length ? (
            <div className={styles.iconWapper}>
              {dataIcons.map((item, index) => {
                return (
                  <Tooltip key={item.id} title={item.icon_name || "未设置名称"}>
                    <div
                      className={`${styles.iconItem} ${
                        removeActives.indexOf(item.id) !== -1
                          ? styles.activity
                          : ""
                      }`}
                      onClick={() => this.setRemoveKey(item.id)}
                    >
                      <div className={styles.iconItem_img}>
                        <img crossOrigin="anonymous" src={item.icon_url} alt="" />
                      </div>
                      <div className={styles.iconItem_name}>
                        {item.icon_name || "unkown"}
                      </div>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          ) : (
            <div className={styles.notUploadIcons}>
              <span>暂无自定义符号~~</span>
            </div>
          )}
        </div>
        <div className={styles.someThingsBtn}>
          {isRemoveActive ? (
            <Fragment>
              <Button
                type="default"
                onClick={() => this.changeRemoveActive(false)}
              >
                取消
              </Button>
              <Popconfirm
                title={`确定删除选择的${removeActives.length}个符号吗?`}
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                onConfirm={this.toRemove}
                okText="确定"
                cancelText="取消"
              >
                <Button danger className={styles.someThingsBtn_delete}>
                  删除
                </Button>
              </Popconfirm>
            </Fragment>
          ) : (
            <Fragment>
              <Upload
                action="/api/map/icon"
                accept=".jpg, .jpeg, .png, .bmp"
                data={{
                  icon_name: this.state.uploadSymbolName,
                  org_id: BASIC.getUrlParam.orgId,
                }}
                fileList={this.state.isUploadFileList}
                beforeUpload={this.beforeUpload}
                headers={{ Authorization: BASIC.getUrlParam.token }}
                onChange={(e) => this.uploadChange(e)}
                customRequest={this.coustomFunction}
              >
                <Button type="primary" className={styles.someThingsBtn_upload}>
                  上传
                </Button>
              </Upload>

              <Button
                type="primary"
                onClick={() => this.changeRemoveActive(true)}
              >
                编辑
              </Button>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}
