import React, { PureComponent, useState, Fragment } from "react";
import globalStyle from "../../globalSet/styles/globalStyles.less";
import animateCss from "../../assets/css/animate.min.css";
import styles from "./ScoutingDetails.less";
import Action from "../../lib/components/ProjectScouting/ScoutingDetail";
import ScouListAction from "../../lib/components/ProjectScouting/ScoutingList";
import { connect } from "dva";
import {
  Collapse,
  Row,
  Tabs,
  Input,
  Button,
  message,
  Upload,
  Space,
  Dropdown,
  Menu,
  Popconfirm,
  Popover,
  Col,
} from "antd";
import {
  PlusCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingTwoTone,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { BASIC } from "../../services/config";
import Event from "../../lib/utils/event";
const { TabPane } = Tabs;

const Title = ({ name, date, cb, id }) => {
  return (
    <div
      className={`${styles.title} ${
        id === "1263868959841718272" ? styles.hasBg : ""
      }`}
    >
      <p style={{ marginTop: 8 }}>
        <i
          className={globalStyle.global_icon + ` ${globalStyle.btn}`}
          style={{
            color: "#fff",
            fontSize: 22,
          }}
          onClick={cb}
        >
          &#xe602;
        </i>
      </p>
      <p className={styles.name} style={{ marginTop: 109 }}>
        <span>{name}</span>
      </p>
      <p
        className={styles.date}
        style={{
          marginTop: 5,
        }}
      >
        <span>{date}</span>
      </p>
    </div>
  );
};
const UploadBtn = ({ onChange }) => {
  return (
    <Upload
      action="/api/map/file/upload"
      headers={{ Authorization: BASIC.getUrlParam.token }}
      onChange={(e) => onChange(e)}
      showUploadList={false}
    >
      <Button
        title="上传采集数据"
        shape="circle"
        type="primary"
        ghost
        size="large"
      >
        <i className={globalStyle.global_icon} style={{ color: "#0D4FF7" }}>
          &#xe628;
        </i>
      </Button>
    </Upload>
  );
};

const ScoutingHeader = (props) => {
  let { edit, onCancel, onSave, data, index, onDragEnter } = props;
  let [areaName, setAreaName] = useState(data.name);
  let [isEdit, setIsEdit] = useState(edit);
  // 保存事件
  const saveItem = () => {
    onSave && onSave(areaName);
    setIsEdit(false);
  };

  return (
    <div
      style={{
        display: "flex",
      }}
      onClick={(e) => {
        edit ? e.stopPropagation() : "";
      }}
      onDragEnter={onDragEnter}
    >
      <Fragment>
        <div className={styles.numberIcon}>
          <span>{index}</span>
        </div>
        <div className={styles.text}>
          {isEdit || edit ? (
            <Fragment>
              <Input
                placeholder="请输入名称"
                value={areaName}
                style={{ width: "70%", marginRight: "2%" }}
                allowClear
                onPressEnter={(e) => {
                  e.stopPropagation();
                  saveItem();
                }}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  setAreaName(e.target.value.trim());
                }}
              />
              <Button
                onClick={() => saveItem()}
                size="middle"
                type="primary"
                icon={<CheckCircleOutlined />}
              ></Button>
              <Button
                onClick={() => {
                  setIsEdit(false);
                  onCancel && onCancel(data);
                }}
                size="middle"
                icon={<CloseCircleOutlined />}
              ></Button>
            </Fragment>
          ) : (
            <div className={styles.groupTitle}>{data.name}</div>
          )}
        </div>
      </Fragment>
    </div>
  );
};

const ScoutingItem = ({
  data,
  onError,
  onUpload,
  onChange,
  dataSource = [],
  onCollectionRemove,
  onEditCollection,
  onDrop,
  areaList,
  onSelectGroup,
  onAreaEdit = () => {},
  onAreaDelete = () => {},
  onUploadPlan = () => {},
  onUploadPlanStart = () => {},
  onUploadPlanCancel = () => {},
  onChangeDisplay = () => {},
  onEditPlanPic = () => {},
}) => {
  let [planExtent, setPlanExtent] = useState("");
  let [transparency, setTransparency] = useState("1");

  // 开始上传
  const startUpload = ({ file, fileList }) => {
    let { response } = file;
    onChange && onChange(file, fileList);
    if (response) {
      BASIC.checkResponse(response)
        ? onUpload && onUpload(response.data, fileList)
        : onError && onError(response);
    } else {
      // onError && onError(file)
    }
  };

  const onStartUploadPlan = ({ file, fileList }) => {
    let { response } = file;
    onUploadPlan && onUploadPlan(null, fileList);
    if (response) {
      BASIC.checkResponse(response)
        ? onUploadPlan && onUploadPlan(response.data, fileList)
        : onError && onError(response);
    } else {
      // onError && onError(file)
    }
  };
  // 上传规划图
  const beforeUploadPlan = (val) => {
    onUploadPlanStart && onUploadPlanStart(val);
    return new Promise((resolve, reject) => {
      let url = window.URL.createObjectURL(val);
      Action.addPlanPictureDraw(url)
        .then((res) => {
          let { feature } = res;
          let extent = feature.getGeometry().getExtent();
          // 设置data
          setTransparency(res.opacity);
          setPlanExtent(extent.join(","));
          resolve({ ...val });
          // resolve({})
        })
        .catch((err) => {
          reject(err);
          onUploadPlanCancel && onUploadPlanCancel(err);
        });
    });
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => {
        e.preventDefault();
      }}
    >
      {/* <div className={styles.itemDetail}>
          <p className={styles.light}>
            <i className={globalStyle.global_icon}>&#xe616;</i>
            <span>3月15日</span>
            <i className={globalStyle.global_icon}>&#xe605;</i>
            <span>沙寮村委</span>
          </p>
          <p>
            <i className={globalStyle.global_icon}>&#xe685;</i>
            <span>执行任务清单、备忘、要求等细节说明填在此</span>
          </p>
        </div> */}
      {dataSource.map((item, index) => {
        return (
          <div
            className={`${animateCss.animated} ${animateCss.slideInRight}`}
            style={{
              animationDuration: "0.3s",
              animationDelay: index * 0.05 + "s",
            }}
            key={item.id}
          >
            <UploadItem
              onChangeDisplay={onChangeDisplay}
              onEditPlanPic={onEditPlanPic}
              areaList={areaList}
              onSelectGroup={onSelectGroup}
              type={Action.checkCollectionType(item.target)}
              data={item}
              onRemove={onCollectionRemove}
              onEditCollection={onEditCollection}
            />
          </div>
        );
      })}
      <div
        style={{
          width: "100%",
          margin: "5px 0",
          padding: "10px 0",
          borderTop: "1px solid rgba(0,0,0,0.15)",
        }}
      >
        <Space size={8}>
          {!!onUpload && <UploadBtn onChange={startUpload} />}
          {!!onUploadPlan && (
            <Upload
              action={`/api/map/ght/${data.id}`}
              accept=".jpg, .jpeg, .png, .bmp"
              headers={{ Authorization: BASIC.getUrlParam.token }}
              beforeUpload={beforeUploadPlan}
              data={{ extent: planExtent, transparency }}
              onChange={onStartUploadPlan}
              showUploadList={false}
            >
              <Button
                title="上传规划图"
                type="primary"
                shape="circle"
                size="large"
                ghost
                className={globalStyle.global_icon}
              >
                &#xe6ee;
              </Button>
            </Upload>
          )}
          {/* 编辑按钮 */}
          {!!onAreaEdit && (
            <Button
              onClick={onAreaEdit.bind(this, data)}
              title="编辑分组名称"
              type="primary"
              shape="circle"
              size="large"
              ghost
            >
              <EditOutlined />
            </Button>
          )}

          {/* 删除按钮 */}
          {!!onAreaDelete && (
            <Popconfirm
              title={
                <span>
                  确定删除分组[{data.name}]吗？
                  <br />
                  此操作不可逆(请确认分组内无任何资料)
                </span>
              }
              okText="确定"
              cancelText="取消"
              onConfirm={onAreaDelete.bind(this, data)}
            >
              <Button
                title="删除分组"
                type="danger"
                shape="circle"
                size="large"
                ghost
              >
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>
    </div>
  );
};
const ScoutingItem2 = ({ data }) => {
  const header = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ textAlign: "left" }}>
        <i
          className={
            globalStyle.global_icon + ` ${globalStyle.btn} ${styles.icon}`
          }
          style={{ margin: "0" }}
        >
          &#xe6d9;
        </i>
        人口
      </div>
    </div>
  );
  return (
    <Collapse expandIconPosition="right" className={styles.scoutingItem}>
      <Collapse.Panel header={header}>
        <UploadItem type="paper" />
        <UploadItem type="paper" />
        <UploadItem type="interview" />
        <UploadBtn />
      </Collapse.Panel>
    </Collapse>
  );
};
const UploadItem = ({
  type,
  data,
  onRemove,
  onEditCollection = () => {},
  areaList,
  onSelectGroup,
  onChangeDisplay,
  onEditPlanPic = () => {},
}) => {
  let [visible, setVisible] = useState(false);
  let [groupVisible, setGroupVisible] = useState(false);
  let [isEdit, setIsEdit] = useState(false);
  let [fileName, setFileName] = useState(data.title);
  const itemKeyVals = {
    paper: "图纸",
    interview: "访谈",
    pic: "图片",
    video: "视频",
    word: "文档",
    annotate: "批注",
    plotting: "标绘",
    unknow: "未知",
    planPic: "规划",
  };
  let { create_by, title, create_time } = data;
  let time = Action.dateFormat(create_time, "yyyy/MM/dd");
  let hours = Action.dateFormat(create_time, "HH:mm");

  let secondSetType = type;
  if (type === "unknow") {
    const lastIndex = data && data.title?.lastIndexOf(".");
    const originalType = data.title?.substr(
      lastIndex + 1,
      data.title.length - lastIndex - 1
    );
    const originalItemKeyVals = {
      paper: [], // 图纸
      interview: ["aac", "mp3", "语音"], // 访谈
      pic: ["jpg", "PNG", "gif", "jpeg"].map((item) =>
        item.toLocaleLowerCase()
      ),
      video: ["MP4", "WebM", "Ogg", "avi"].map((item) =>
        item.toLocaleLowerCase()
      ),
      word: [
        "ppt",
        "pptx",
        "xls",
        "xlsx",
        "doc",
        "docx",
        "zip",
        "rar",
        "txt",
        "xmind",
        "pdf",
      ].map((item) => item.toLocaleLowerCase()),
      annotate: [], // 批注
      plotting: ["feature"], // 标绘
      planPic: ["plan"], // 规划图
    };

    const keyVals = Object.keys(originalItemKeyVals);
    for (let i = 0; i < keyVals.length; i++) {
      const temp = originalItemKeyVals[keyVals[i]].filter((item) => {
        return item === originalType;
      });
      if (temp.length) {
        secondSetType = keyVals[i];
        break;
      }
    }
  }

  const onHandleMenu = ({ key }) => {
    // 添加坐标点
    if (key === "editCollection") {
      setVisible(false);
      onEditCollection && onEditCollection("editCoordinate", data);
    }
    if (key === "selectGroup") {
    }

    if (key === "eidtTitle") {
      setIsEdit(!isEdit);
      setVisible(false);
    }
    if (key === "display") {
      onChangeDisplay && onChangeDisplay(data);
      setVisible(false);
    }
    // 编辑规划图
    if (key === "editPlanPic") {
      setVisible(false);
      onEditPlanPic && onEditPlanPic(data);
    }
  };
  // 分组列表
  const AreaItem = () => {
    const setGroup = (item) => {
      setGroupVisible(false);
      setVisible(false);
      onSelectGroup && onSelectGroup(item, data);
    };
    let list = areaList.map((item) => {
      if (item.id !== data.area_type_id) {
        let dom = (
          <div
            className={styles.areaItem}
            key={item.id}
            onClick={setGroup.bind(this, item)}
          >
            {item.name}
          </div>
        );
        return dom;
      }
    });
    return list;
  };

  const menu = (
    <Menu onClick={onHandleMenu}>
      {data.collect_type !== "4" && data.collect_type != "5" && (
        <Menu.Item key="editCollection">关联坐标</Menu.Item>
      )}
      <Menu.Item key="eidtTitle">修改名称</Menu.Item>
      {data.collect_type === "5" && (
        <Menu.Item key="editPlanPic">编辑</Menu.Item>
      )}
      <Menu.Item key="selectGroup">
        <Popover
          overlayStyle={{ zIndex: 10000 }}
          trigger="click"
          placement="rightTop"
          visible={groupVisible}
          onVisibleChange={(val) => setGroupVisible(val)}
          title={data.title}
          content={<AreaItem />}
        >
          <div style={{ width: "100%" }}>移动到分组</div>
        </Popover>
      </Menu.Item>
      <Menu.Item key="display">
        {data.is_display === "0" ? "显示" : "隐藏"}
      </Menu.Item>
      <Menu.Item key="removeBoard">
        <Popconfirm
          title="确定删除此资料吗?"
          okText="删除"
          cancelText="取消"
          overlayStyle={{ zIndex: 10000 }}
          onConfirm={() => {
            setVisible(false);
            onRemove && onRemove(data);
          }}
          placement="topRight"
        >
          <div style={{ width: "100%" }}>删除</div>
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  const itemClick = (val) => {
    if (val.is_display === "0") return;
    if (
      val.location &&
      Object.keys(val.location).length &&
      val.is_display === "1"
    ) {
      let coor = [+val.location.longitude, +val.location.latitude];
      Action.toCenter({ center: coor });
    }

    // 标注
    if (val.collect_type === "4") {
      let feature = Action.findFeature(val.id);
      let extent = feature && feature.getGeometry().getExtent();
      if (extent) {
        Action.toCenter({ type: "extent", center: extent });
      }
    }

    // 规划图
    if (val.collect_type === "5") {
      let layer = Action.findImgLayer(val.resource_id);
      if (layer) {
        let extent = layer.getSource().getImageExtent();
        // console.log()
        Action.toCenter({ type: "extent", center: extent });
      }
    }
  };

  return (
    <div
      className={styles.uploadItem + ` ${globalStyle.btn}`}
      draggable={true}
      // onDragStart={e => console.log(e)}
      onClick={itemClick.bind(this, data)}
    >
      <div className={styles.uploadIcon + ` ${styles[secondSetType]}`}>
        <span>
          {secondSetType === "pic" ? (
            <img
              src={data.resource_url}
              width="48px"
              alt="图片"
              onError={(e) => {
                e.target.src = "";
                e.target.src = data.resource_url;
              }}
            />
          ) : (
            itemKeyVals[secondSetType]
          )}
        </span>
      </div>
      <div className={styles.uploadDetail}>
        <Row
          style={{ width: "95%", textAlign: "left" }}
          align="middle"
          justify="center"
        >
          {isEdit ? (
            <Fragment>
              <Col span={16}>
                <Input
                  style={{ borderRadius: "5px" }}
                  placeholder="请输入名称"
                  size="small"
                  autoFocus
                  onChange={(e) => setFileName(e.target.value.trim())}
                  onPressEnter={() => {
                    onEditCollection("editName", data, fileName);
                    setIsEdit(false);
                  }}
                  allowClear
                  value={fileName}
                />
              </Col>
              <Col span={4} style={{ textAlign: "right" }}>
                <Button
                  onClick={(e) => setIsEdit(false)}
                  size="small"
                  shape="circle"
                >
                  <CloseOutlined />
                </Button>
              </Col>
              <Col span={4} style={{ textAlign: "right" }}>
                <Button
                  size="small"
                  onClick={() => {
                    setIsEdit(false);
                    onEditCollection("editName", data, fileName);
                  }}
                  shape="circle"
                  type="primary"
                >
                  <CheckOutlined />
                </Button>
              </Col>
            </Fragment>
          ) : (
            <span
              style={{ minHeight: "1rem" }}
              title={title}
              className={`${styles.firstRow} ${styles.text_overflow} text_ellipsis`}
            >
              {title}
            </span>
          )}
        </Row>
        <Row>
          <Space size={8} style={{ fontSize: 12 }}>
            <span>{create_by.name}</span>
            <span>{time}</span>
            <span>{hours}</span>
          </Space>
        </Row>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingRight: "5px",
          flexDirection: "column",
        }}
      >
        <span
          className={`${styles.eyes} ${globalStyle.global_icon}`}
          dangerouslySetInnerHTML={{
            __html: data.is_display === "0" ? "&#xe6cb;" : "&#xe615;",
          }}
          onClick={() => {
            onChangeDisplay && onChangeDisplay(data);
          }}
        ></span>
        <Dropdown
          overlay={menu}
          trigger="click"
          onVisibleChange={(val) => setVisible(val)}
          visible={visible}
        >
          <SettingTwoTone />
        </Dropdown>
      </div>
    </div>
  );
};

const areaScouting = () => {
  return (
    <div className={globalStyle.autoScrollY} style={{ height: "100%" }}>
      <ScoutingItem />
      <ScoutingItem />
      <ScoutingItem />
      <ScoutingItem />
    </div>
  );
};

const tagScouting = () => {
  return (
    <div className={globalStyle.autoScrollY} style={{ height: "100%" }}>
      <ScoutingItem2 />
      <ScoutingItem2 />
      <ScoutingItem2 />
    </div>
  );
};

@connect(({ controller: { mainVisible }, lengedList: { config } }) => ({
  mainVisible,
  config,
}))
export default class ScoutingDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    const panes = [
      { title: "按区域", content: areaScouting(), key: "1", closable: false },
      { title: "按标签", content: tagScouting(), key: "2", closable: false },
    ];
    this.state = {
      current_board: {},
      area_list: [],
      all_collection: [],
      not_area_id_collection: [],
      area_active_key: [],

      name: "阳山县沙寮村踏勘",
      date: "3/15-3/17",
      visible: true,
      activeKey: panes[0].key,
      panes,
    };
  }
  componentDidMount() {
    this.getDetails();
    // 删除存在与页面中的项目点和元素
    Action.removeListPoint();
    // 构建地图组件
    Action.init();
    // 当外部的数据保存成功后的回调
    // console.log(Event.Evt)
    Event.Evt.on("addCollectionForFeature", (data) => {
      this.fetchCollection();
    });
  }

  // 获取缓存中选定的项目
  getDetails = (flag) => {
    ScouListAction.checkItem().then((res) => {
      // console.log(res)
      let { data } = res;
      this.setState(
        {
          current_board: data,
        },
        () => {
          if (!flag) this.renderAreaList();
        }
      );
    });
  };

  // 渲染区域分类列表
  renderAreaList = () => {
    Action.fetchAreaList({ board_id: this.state.current_board.board_id })
      .then((resp) => {
        // console.log(resp)
        let respData = resp.data;
        this.setState({
          area_list: respData.map((item) =>
            Object.assign(item, { _edit: false })
          ),
          area_active_key: respData[0] && respData[0].id,
        });
        // 获取区域分类的数据列表
        this.fetchCollection();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleGoBackClick = () => {
    const { dispatch } = this.props;
    Action.onBack();

    dispatch({
      type: "controller/updateMainVisible",
      payload: {
        mainVisible: "list",
      },
    });
  };

  onChange = (activeKey) => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: "新建Tab", content: "", key: activeKey });
  };

  remove = (targetKey) => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter((pane) => pane.key !== targetKey);
    if (panes.length && activeKey === targetKey) {
      if (panes.length >= 0) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key;
      }
    }
    this.setState({ panes, activeKey });
  };

  // 更新本地显示
  pushAreaItem = () => {
    let obj = {
      id: Math.random() * 100000 + 1,
      _edit: true,
      name: "",
    };
    this.setState({
      area_list: this.state.area_list.concat([obj]),
    });
  };

  // 取消新增区域
  addCancel = (item) => {
    if (item.board_id) {
      // 取消编辑状态
      this.onAreaEdit(false, item);
      return;
    }
    this.setState({
      area_list: this.state.area_list.filter((val) => val.id !== item.id),
    });
  };

  // 保存新增的区域
  saveArea = (data, name) => {
    // 编辑状态
    if (data.board_id) {
      Action.editAreaName(data.id, { name }).then((res) => {
        this.onAreaEdit(false, data);
        this.setState({
          area_list: this.state.area_list.map((item) => {
            if (item.id === data.id) {
              item.name = name;
            }
            return item;
          }),
        });
      });
      message.success("修改成功");
      return;
    }
    let { current_board } = this.state;
    Action.addArea({ board_id: current_board.board_id, name: name }).then(
      (res) => {
        message.success("新增操作成功");
        // console.log(res);
        this.renderAreaList();
      }
    );
  };

  componentWillUnmount() {
    Action.removeLayer();
  }
  // 渲染带坐标的数据
  renderCollection = (data) => {
    const { config, dispatch } = this.props;
    data.length && Action.renderCollection(data, { config, dispatch });
  };

  // 获取资源列表，动态分类
  fetchCollection = () => {
    let params = {
      board_id: this.state.current_board.board_id,
    };
    Action.getCollectionList(params).then((res) => {
      let data = res.data;
      // 将重组后的数据更新,保存没有关联区域的数据
      this.reSetCollection(data);
    });
  };
  // 更新数据
  reSetCollection = (val) => {
    let data = val || [];
    let list = this.state.area_list.map((item) => {
      let f_list = data.filter((v) => v.area_type_id === item.id);
      item.collection = f_list;
      return item;
    });
    this.setState(
      {
        all_collection: data,
        area_list: list,
        not_area_id_collection: data.filter((i) => !i.area_type_id),
      },
      () => {
        // 之渲染选中的区域数据
        let obj =
          this.state.area_list.find(
            (item) => item.id === this.state.area_active_key
          ) || {};
        let arr = obj.collection;
        this.state.area_active_key === "other" &&
          (arr = this.state.not_area_id_collection);
        this.renderCollection(arr || []);
      }
    );
  };

  // 上传中
  filesChange = (val, file, fileList) => {
    console.log("上传中...", file, fileList);
  };
  // 上传完成
  fileUpload = (val, resp) => {
    if (resp) {
      message.success("上传成功");
      let { file_resource_id, suffix, original_file_name } = resp;

      let params = {
        board_id: this.state.current_board.board_id,
        area_type_id: val.id,
        collect_type: 3,
        resource_id: file_resource_id,
        target: suffix && suffix.replace(".", ""),
        title: original_file_name,
      };
      Action.addCollection(params)
        .then((res) => {
          // console.log(res);
          // 更新上传的列表
          this.fetchCollection();
        })
        .catch((err) => {
          // 添加失败
          console.log(err.message);
        });
    }
  };

  onAddError = () => {
    // message.error('添加失败，请稍后重试')
  };

  // 删除采集的资料
  onCollectionRemove = (item, collection) => {
    let { id } = collection;

    Action.removeCollection(id)
      .then((res) => {
        message.success("删除成功");
        this.setState(
          {
            all_collection: this.state.all_collection.filter(
              (i) => i.id !== id
            ),
          },
          () => {
            // 重新渲染
            this.reSetCollection(this.state.all_collection);
            // this.renderCollection();
          }
        );
      })
      .catch((err) => {
        message.err("删除失败,请稍后重试");
        console.log(err);
      });
  };

  // 取消新增
  cancelEditCollection = () => {
    message.destroy();
    Action.removeDraw();
    this.showOtherSlide();
  };

  // 隐藏不需要的页面
  hideOtherSlide = () => {
    let { dispatch } = this.props;
    // 关闭其他不需要的元素
    dispatch({
      type: "openswitch/updateDatas",
      payload: {
        slideSwitch: false,
        showSlideButton: false,
        lengedSwitch: false,
        showLengedButton: false,
      },
    });
  };

  // 显示被隐藏的元素
  showOtherSlide = () => {
    let { dispatch } = this.props;
    // 关闭其他不需要的元素
    dispatch({
      type: "openswitch/updateDatas",
      payload: {
        slideSwitch: true,
        showSlideButton: true,
        lengedSwitch: false,
        showLengedButton: true,
      },
    });
  };

  onEditCollection = async (editType, val, name) => {
    let res = "",
      params = {};
    let { id } = val;
    if (editType === "editCoordinate") {
      message.success(
        <span>
          选取一个坐标设置为资料展示点 或{" "}
          <a
            onClick={(e) => {
              e.stopPropagation();
              this.cancelEditCollection();
            }}
          >
            取消选择
          </a>
        </span>,
        0
      );
      // 隐藏
      this.hideOtherSlide();
      // 添加坐标点的事件
      res = await Action.addCollectionPosition(val);
      let { feature } = res;
      // console.log(res);
      let coor = feature.getGeometry().getCoordinates();
      coor = Action.transform(coor);
      params = {
        id,
        location: {
          longitude: coor[0],
          latitude: coor[1],
          site_name: val.title,
        },
      };
    } else if (editType === "editName") {
      if (!name || name === val.name) {
        return;
      }
      params = {
        title: name,
        id,
      };
    }
    // 执行保存
    Action.editCollection(params)
      .then((resp) => {
        // console.log(res);
        this.cancelEditCollection();
        this.fetchCollection();
        let f = editType == "editCoordinate" ? "关联坐标完成" : "修改名称完成";
        message.success(f);
      })
      .catch((err) => {
        console.log(err);
        this.cancelEditCollection();
      });
  };
  // 选中了分组
  onSelectGroup = (group, data) => {
    // console.log(group,data)
    let params = {
      id: data.id,
      area_type_id: group.id,
    };
    Action.editCollection(params).then((res) => {
      // console.log(res)
      message.success(
        <span>
          已将<a>{data.title}</a>
          移动到<a>{group.name}</a>
          分组
        </span>
      );
      this.fetchCollection();
    });
  };

  onAreaDelete = (val) => {
    if (val.collection && val.collection.length) {
      return message.error("分组中存在数据，无法删除");
    }
    Action.RemoveArea(val.id)
      .then((res) => {
        message.success("删除成功");
        this.setState({
          area_list: this.state.area_list.filter((item) => item.id !== val.id),
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // 编辑名称
  onAreaEdit = (flag, val) => {
    let data = { ...val, _edit: flag };
    let list = [...this.state.area_list];

    let arr = list.map((item) => {
      if (item.id === val.id) {
        item = data;
      }
      return item;
    });
    this.setState({
      area_list: arr,
    });
  };

  // 点击panel时的回调
  setActiveCollapse = (key) => {
    this.setState({ area_active_key: key });
    if (key) {
      let obj = this.state.area_list.find((item) => item.id === key);
      if (obj) {
        obj.collection && this.renderCollection(obj.collection);
      } else {
        this.renderCollection(this.state.not_area_id_collection || []);
      }
    }
  };

  // 计划图开始上传
  onUploadPlanStart = () => {
    this.hideOtherSlide();
  };

  // 计划图取消上传
  onUploadPlanCancel = () => {
    this.showOtherSlide();
  };

  // 上传规划图
  onUploadPlan = (val, resp) => {
    this.showOtherSlide();
    // console.log(resp);
    if (resp) {
      message.success("上传成功");
      let { id, name } = resp;

      let params = {
        board_id: this.state.current_board.board_id,
        area_type_id: val.id,
        collect_type: 5,
        resource_id: id,
        target: "plan",
        title: name,
      };
      Action.addCollection(params)
        .then((res) => {
          // console.log(res);
          // 更新上传的列表
          this.fetchCollection();
        })
        .catch((err) => {
          // 添加失败
          console.log(err.message);
        });
    }
  };

  // 切换显示隐藏
  onChangeDisplay = (val, collection) => {
    // console.log(val, collection)
    let is_display = collection.is_display;
    let param = {
      id: collection.id,
      is_display: is_display === "1" ? "0" : "1",
    };
    Action.editCollection(param).then((res) => {
      // console.log(res);
      let { all_collection } = this.state;
      // 更新状态重新渲染
      let arr = all_collection.map((item) => {
        if (item.id === collection.id) {
          collection.is_display = param.is_display;
          item = collection;
        }
        return item;
      });
      this.reSetCollection(arr);
    });
  };
  // 编辑规划图
  onEditPlanPic = (val, collection) => {
    // console.log(val,collection)
    this.hideOtherSlide();
    let img = Action.findImgLayer(collection.resource_id);
    Action.setEditPlanPicLayer(img)
      .then((resp) => {
        let param = {
          extent: resp.extent.join(","),
          transparency: resp.opacity,
        };
        this.showOtherSlide();
        Action.saveEditPlanPic(collection.resource_id, param).then((res) => {
          message.success(`修改${collection.title}成功`);
          this.fetchCollection();
        });
      })
      .catch((err) => {
        if (err.code === -1) message.warn(err.message);
        else message.error(err.message);
        this.showOtherSlide();
      });
  };

  render(h) {
    const { current_board, area_list, not_area_id_collection } = this.state;
    const panelStyle = {
      height: "96%",
    };
    return (
      <div
        className={`${styles.wrap} ${animateCss.animated} ${animateCss.slideInLeft}`}
        style={{ animationDuration: "0.3s" }}
      >
        <Title
          name={current_board.board_name}
          date={""}
          id={current_board.board_id}
          cb={this.handleGoBackClick.bind(this)}
        ></Title>
        <Tabs
          onChange={this.onChange}
          activeKey={this.state.activeKey}
          // type="editable-card"
          onEdit={this.onEdit}
          tabBarGutter={10}
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "absolute",
            top: 207,
            left: 0,
            bottom: 2,
            width: "100%",
          }}
        >
          {/* {this.state.panes.map((pane) => (
            <TabPane
              tab={<span>{pane.title}</span>}
              key={pane.key}
              closable={pane.closable}
              style={pane.key === "1" ? panelStyle : null}
            >
              {pane.content}
            </TabPane>
          ))} */}
          <TabPane
            tab={<span style={{ visibility: "hidden" }}>按区域</span>}
            key="1"
            style={panelStyle}
          >
            <div
              className={globalStyle.autoScrollY}
              style={{ height: "100%", paddingBottom: "40px" }}
            >
              <Collapse
                expandIconPosition="right"
                onChange={(e) => {
                  this.setActiveCollapse(e);
                }}
                className={styles.scoutingItem}
                accordion={true}
                activeKey={this.state.area_active_key}
              >
                {area_list.map((item, index) => {
                  return (
                    <Collapse.Panel
                      header={
                        <ScoutingHeader
                          data={item}
                          index={index + 1}
                          edit={item._edit}
                          onCancel={this.addCancel.bind(this, item)}
                          onSave={this.saveArea.bind(this, item)}
                          // onDragEnter={e => {this.setState({area_active_key: item.id})}}
                        />
                      }
                      key={item.id}
                      style={{ backgroundColor: "#fff", marginBottom: "10px" }}
                    >
                      <ScoutingItem
                        // onDrop={()=> console.log(item)}
                        data={item}
                        onAreaEdit={this.onAreaEdit.bind(this, true)}
                        onAreaDelete={this.onAreaDelete}
                        onSelectGroup={this.onSelectGroup}
                        onChange={this.filesChange.bind(this, item)}
                        onUpload={this.fileUpload.bind(this, item)}
                        dataSource={item.collection}
                        onError={this.onAddError}
                        areaList={area_list}
                        onUploadPlan={this.onUploadPlan.bind(this, item)}
                        onCollectionRemove={this.onCollectionRemove.bind(
                          this,
                          item
                        )}
                        onEditCollection={this.onEditCollection}
                        onUploadPlanStart={this.onUploadPlanStart.bind(
                          this,
                          item
                        )}
                        onUploadPlanCancel={this.onUploadPlanCancel}
                        onChangeDisplay={this.onChangeDisplay.bind(this, item)}
                        onEditPlanPic={this.onEditPlanPic.bind(this, item)}
                      />
                    </Collapse.Panel>
                  );
                })}
                <Collapse.Panel
                  key="other"
                  style={{ backgroundColor: "#fff", marginBottom: "10px" }}
                  header={
                    <ScoutingHeader
                      data={{ name: "未分组" }}
                      edit={false}
                      index={area_list.length + 1}
                      onCancel={() => {}}
                      onSave={() => {}}
                      // onDragEnter={e => {this.setState({area_active_key: item.id})}}
                    />
                  }
                >
                  {!!not_area_id_collection.length && (
                    <div className={styles.norAreaIdsData}>
                      {not_area_id_collection.map((item, index) => {
                        return (
                          <div
                            key={item.id}
                            className={`${animateCss.animated} ${animateCss.slideInRight}`}
                            style={{
                              animationDuration: "0.3s",
                              animationDelay: index * 0.05 + "s",
                            }}
                          >
                            <UploadItem
                              data={item}
                              type={Action.checkCollectionType(item.target)}
                              areaList={area_list}
                              onSelectGroup={this.onSelectGroup}
                              onRemove={this.onCollectionRemove.bind(
                                this,
                                item
                              )}
                              onEditCollection={this.onEditCollection}
                              onChangeDisplay={this.onChangeDisplay.bind(
                                this,
                                item
                              )}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Collapse.Panel>
              </Collapse>
            </div>
            <div className={styles.addAreaBtn}>
              <Button
                type="primary"
                ghost
                icon={<PlusCircleOutlined />}
                onClick={this.pushAreaItem}
              >
                新增
              </Button>
            </div>
          </TabPane>
          {/* <TabPane tab={<span>按标签</span>} key="2">
            <div className={globalStyle.autoScrollY} style={{ height: "100%" }}>
              <ScoutingItem2 />
              <ScoutingItem2 />
              <ScoutingItem2 />
            </div>
          </TabPane> */}
        </Tabs>
      </div>
    );
  }
}
