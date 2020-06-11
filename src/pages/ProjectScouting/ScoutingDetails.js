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
  Checkbox
} from "antd";
import {
  PlusCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
  CaretRightOutlined 
} from "@ant-design/icons";
import { BASIC } from "../../services/config";
import Event from "../../lib/utils/event";
import AudioControl from "./components/audioPlayControl";
import { formatSize } from '../../utils/utils';
import ExcelRead from '../../components/ExcelRead'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { MyIcon } from '../../components/utils'
const { TabPane } = Tabs;

const Title = ({ name, date, cb, data }) => {
  return (
    <div className={`${styles.title}`}>
      {data.bg_image && (
        <div className={styles.boardBgImg}>
          <img src={data.bg_image} />
        </div>
      )}
      <div className={styles.projectModal}></div>
      <div
        style={{
          position: "relative",
          zIndex: 5,
          width: "100%",
          height: "100%",
        }}
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
        <p className={styles.name} style={{ marginTop: 90 }}>
          <span>{name}</span>
        </p>
        <p
          className={styles.date}
          style={{
            marginTop: 5,
          }}
        >
          <span className={styles.title_remark}> 备注: {data.remark || '暂无备注'}</span>
        </p>
      </div>
    </div>
  );
};

const checkFileSize = (file) => {
  // console.log(file);
  let { size, text } = formatSize(file.size);
  text = text.trim();
  console.log(size, text);
  if (+size > 100 && text === 'MB') {
    message.error('文件不能大于100MB');
    return false;
  }
  return true;
}

const UploadBtn = ({ onChange }) => {
  return (
    <Upload
      action="/api/map/file/upload"
      beforeUpload={checkFileSize}
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
  let {
    selected,
    edit,
    remarkEdit,
    onCancel,
    onSave,
    onRemarkSave,
    data,
    index,
    onDragEnter,
    activeKey,
    multiple = false,
    onSelect = ()=>{}
  } = props;
  let [areaName, setAreaName] = useState(data.name);
  let [isEdit, setIsEdit] = useState(edit);
  // 保存事件
  const saveItem = () => {
    onSave && onSave(areaName);
    setIsEdit(false);
  };

  const checkColletion = (val)=>{
    // console.log(val);
    onSelect(val,data.id)
  }

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
          <span><MyIcon type={activeKey === data.id ?"icon-wenjianzhankai":"icon-wenjianshouqi"}/></span>
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
              <div className={styles.groupTitle}>{data.name}
                <span className={styles.checkBoxForHeader}>
                  {multiple && <Checkbox checked={ selected.length && selected.indexOf(data.id) !== -1 } onChange={checkColletion} onClick={(e) => e.stopPropagation()}/>}
                </span>
              </div>
            )}
        </div>
      </Fragment>
    </div>
  );
};

const ScoutingItem = ({
  dispatch,
  data,
  onError,
  onUpload,
  onChange,
  dataSource = [],
  onCollectionRemove,
  onEditCollection,
  onDrop,
  board,
  areaList,
  onSelectGroup,
  onAreaEdit = () => { },
  onAreaDelete = () => { },
  onUploadPlan = () => { },
  onUploadPlanStart = () => { },
  onUploadPlanCancel = () => { },
  onChangeDisplay = () => { },
  onEditPlanPic = () => { },
  onCopyCollection,
  onModifyFeature = () => { },
  onModifyRemark = () => { },
  onRemarkSave = () => { },
  onStopMofifyFeatureInDetails,
  onExcelSuccess =()=>{},
  onDragEnd = ()=>{}
}) => {
  let [planExtent, setPlanExtent] = useState("");
  let [transparency, setTransparency] = useState("1");
  let [transformFile ,setTransformFile] = useState(null);

  // 开始上传
  const startUpload = ({ file, fileList, event }) => {
    let { response } = file;
    onChange && onChange(file, fileList, event);
    if (response) {
      BASIC.checkResponse(response)
        ? onUpload && onUpload(response.data, fileList, event)
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

  // 设置更新的文件
  const beforeTransformFile = ()=>{
    return Promise.resolve(transformFile)
  }

  // 上传规划图
  const beforeUploadPlan = (val) => {
    onUploadPlanStart && onUploadPlanStart(val);
    // 文件大小限制
    let { size, text } = formatSize(val.size);
    text = text.trim();
    if (+size > 100 && text === 'MB') {
      message.error('文件不能大于100MB');
      return false;
    }
    return new Promise((resolve, reject) => {
      let url = window.URL.createObjectURL(val);
      Action.addPlanPictureDraw(url,val,dispatch)
        .then((res) => {
          let { feature } = res;
          let extent = feature.getGeometry().getExtent();
          if(res.blobFile){
            // 设置文件
            setTransformFile(res.blobFile);
          }else{
            setTransformFile(val);
          }
          // 设置透明度,设置范围大小
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
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot)=>(
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}>  
            {dataSource.map((item, index) => {
              return (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        >
                        <div
                          className={`${animateCss.animated} ${animateCss.slideInRight}`}
                          style={{
                            animationDuration: "0.3s",
                            animationDelay: index * 0.05 + "s",
                            position:"relative",
                            paddingLeft:"8px"
                          }}
                          key={item.id}
                        >
                          <span className={styles.handleCollection} {...provided.dragHandleProps}>
                            <MyIcon type="icon-tuozhuaitingliu"/>
                          </span>
                          <UploadItem
                            onCopyCollection={onCopyCollection}
                            onChangeDisplay={onChangeDisplay}
                            onEditPlanPic={onEditPlanPic}
                            areaList={areaList}
                            onSelectGroup={onSelectGroup}
                            type={Action.checkCollectionType(item.target)}
                            data={item}
                            onRemove={onCollectionRemove}
                            onEditCollection={onEditCollection}
                            onRemarkSave={onRemarkSave}
                            onModifyFeature={onModifyFeature}
                            onStopMofifyFeatureInDetails={onStopMofifyFeatureInDetails}
                            onModifyRemark={onModifyRemark}
                          />
                        </div>
                      </div>
                    )}
                  </Draggable>
              );
            })}
            {provided.placeholder}
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
                  transformFile={beforeTransformFile}
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
              <ExcelRead id={data.id} group={data} board={board} onExcelSuccess={onExcelSuccess}/>
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
        )}
      </Droppable>
    </DragDropContext>
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
  onEditCollection = () => { },
  areaList,
  onSelectGroup,
  onChangeDisplay,
  onEditPlanPic = () => { },
  onCopyCollection = () => { },
  onModifyRemark = () => { },
  onModifyFeature = () => { },
  onStopMofifyFeatureInDetails,
  onRemarkSave = () => { },
  onToggleChangeStyle = () => { },
}) => {
  let obj = { ...data };
  // 过滤后缀
  let suffix = obj.title && obj.title.substring(obj.title.lastIndexOf('.'));
  let reg = /\.[a-z]/i;
  if (suffix && reg.test(suffix)) {
    obj.title = obj.title.replace(suffix, '');
  }

  let [visible, setVisible] = useState(false);
  let [groupVisible, setGroupVisible] = useState(false);
  let [copyVisible, setCopyVisible] = useState(false);
  let [isEdit, setIsEdit] = useState(false);
  let [remark, setRemark] = useState("");
  let [isAddMark, addRemark] = useState(false);
  let [isRemarkEdit, setIsRemarkEdit] = useState(false);
  let [isPlotEdit, setIsPlotEdit] = useState(false)
  let [fileName, setFileName] = useState(obj.title);
  const { TextArea } = Input;
  const saveRemark = (data) => {
    let dataObj = JSON.parse(data.content);
    dataObj.remark = remark;
    data.content = JSON.stringify(dataObj);
    onRemarkSave && onRemarkSave(data);
    setIsRemarkEdit(false);
  };
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
    if (key === "modifyRemark") {
      setIsRemarkEdit(true);
      setVisible(false);
      onModifyRemark && onModifyRemark(data);
    }
    if (key === "addRemark") {
      addRemark(!isAddMark);
      setIsRemarkEdit(true);
      setVisible(false);
      let newData = { ...data }
      delete newData.resource_url
      onModifyRemark && onModifyRemark(newData);
    }
    if (key === "modifyFeature") {
      setVisible(false);
      setIsPlotEdit(true)
      onModifyFeature && onModifyFeature(data);
      Event.Evt.on("stopEditPlot", () => {
        setIsPlotEdit(false)
      })
    }
  };
  // 分组列表
  const AreaItem = ({ type = "select" }) => {
    const setGroup = (item) => {
      setCopyVisible(false);
      setGroupVisible(false);
      setVisible(false);
      if (type === "select") onSelectGroup && onSelectGroup(item, data);
      else onCopyCollection && onCopyCollection(item, data);
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
    if (list.length) return list;
    else return "暂无分组可以选择";
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
      {data.content && JSON.parse(data.content)?.remark ? (
        <Menu.Item key="modifyRemark">编辑备注</Menu.Item>
      ) : null}
      {data.content && JSON.parse(data.content)?.remark === "" ? (
        <Menu.Item key="addRemark">新增备注</Menu.Item>
      ) : null}
      {data.content && JSON.parse(data.content)?.featureType ? (
        <Menu.Item key="modifyFeature">编辑几何图形</Menu.Item>
      ) : null}
      {data.collect_type === "4" && !isPlotEdit ? (
        <Menu.Item key="copyToGroup">
          <Popover
            overlayStyle={{ zIndex: 10000 }}
            visible={copyVisible}
            onVisibleChange={(val) => setCopyVisible(val)}
            trigger="click"
            placement="rightTop"
            title={`复制 ${data.title} 到`}
            content={<AreaItem type="copy" />}
          >
            <div style={{ width: "100%" }}>复制到分组</div>
          </Popover>
        </Menu.Item>
      ) : null}
      {data.collect_type === "4" && isPlotEdit ? <Menu.Item key="copyToGroup">
        <Popconfirm
          title="系统检测到图形正在编辑中，是否先停止编辑图形?"
          okText="好的"
          cancelText="继续编辑"
          overlayStyle={{ zIndex: 10000 }}
          onConfirm={() => {
            setVisible(false);
            setIsPlotEdit(false)
            onStopMofifyFeatureInDetails && onStopMofifyFeatureInDetails()
          }}
          onCancel={() => { setVisible(false) }}
          placement="topRight"
        >
          <div style={{ width: "100%" }}>复制到分组</div>
        </Popconfirm>
      </Menu.Item> : null}
      {isPlotEdit ? <Menu.Item key="selectGroup">
        <Popconfirm
          title="系统检测到图形正在编辑中，是否先停止编辑图形?"
          okText="好的"
          cancelText="继续编辑"
          overlayStyle={{ zIndex: 10000 }}
          onConfirm={() => {
            setVisible(false);
            setIsPlotEdit(false)
            onStopMofifyFeatureInDetails && onStopMofifyFeatureInDetails()
          }}
          onCancel={() => { setVisible(false) }}
          placement="topRight"
        >
          <div style={{ width: "100%" }}>移动到分组</div>
        </Popconfirm>
      </Menu.Item> : <Menu.Item key="selectGroup">
          <Popover
            overlayStyle={{ zIndex: 10000 }}
            trigger="click"
            placement="rightTop"
            visible={groupVisible}
            onVisibleChange={(val) => setGroupVisible(val)}
            title={`移动 ${data.title} 到`}
            content={<AreaItem type="select" />}
          >
            <div style={{ width: "100%" }}>移动到分组</div>
          </Popover>
        </Menu.Item>}
      {/* <Menu.Item key="display">
        {data.is_display === "0" ? "显示" : "隐藏"}
      </Menu.Item> */}
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
          <div style={{ width: "100%" }} className="danger">
            删除
          </div>
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  const setSuffix = (name) => {
    if (suffix) return name + suffix;
    else return name;
  }

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
    onToggleChangeStyle && onToggleChangeStyle(val);
  };
  let oldRemark = data.content && JSON.parse(data.content).remark;
  if (oldRemark?.trim() === "") {
    oldRemark = null
  }
  let myStyle = null;
  if (oldRemark || isAddMark) {
    myStyle = {
      height: 100,
    };
    if (isRemarkEdit) {
      myStyle = {
        height: 115,
      };
    } else {
      myStyle = {
        height: 100,
      };
    }
  }
  return (
    <div
      className={styles.uploadItem + ` ${globalStyle.btn}`}
      draggable={true}
      style={myStyle}
      onClick={() => itemClick(data)}
    >
      <div style={{ width: "100%", display: "flex" }}>
        <div className={styles.uploadIcon + ` ${styles[secondSetType]}`}>
          <span>
            {secondSetType === "pic" ? (
              <img
                src={data.resource_url}
                style={{ width: 46, height: 46, borderRadius: 4 }}
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
          <Row style={{ textAlign: "left" }} align="middle" justify="center">
            {isEdit ? (
              <Fragment>
                <Col span={18}>
                  <Input
                    style={{ borderRadius: "5px" }}
                    placeholder="请输入名称"
                    size="small"
                    autoFocus
                    onChange={(e) => setFileName(e.target.value.trim())}
                    onPressEnter={() => {
                      onEditCollection("editName", data, setSuffix(fileName));
                      setIsEdit(false);
                    }}
                    allowClear
                    value={fileName}
                  />
                </Col>
                <Col span={3} style={{ textAlign: "right" }}>
                  <Button
                    onClick={(e) => setIsEdit(false)}
                    size="small"
                    shape="circle"
                  >
                    <CloseOutlined />
                  </Button>
                </Col>
                <Col span={3} style={{ textAlign: "center" }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setIsEdit(false);
                      onEditCollection("editName", data, setSuffix(fileName));
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
            style={{ color: "#1769FF" }}
            onClick={(e) => {
              e.stopPropagation();
              onChangeDisplay && onChangeDisplay(data);
            }}
          >
            {data.is_display === "0" ? "显示" : "隐藏"}
          </span>
          <Dropdown
            overlay={menu}
            trigger="click"
            onVisibleChange={(val) => setVisible(val)}
            visible={visible}
          >
            <span style={{ color: "#1769FF" }}>更多</span>
          </Dropdown>
        </div>
      </div>
      {oldRemark || isAddMark === true ? (
        <div style={{ width: "100%", display: "flex" }}>
          <div
            className={styles.uploadIcon + ` ${styles[secondSetType]}`}
            style={{ background: 0 }}
          >
            <span style={{ verticalAlign: "top" }}>备注:</span>
          </div>
          {isRemarkEdit ? (
            <div
              style={{ display: "flex", flexDirection: "row", width: "85%" }}
            >
              <TextArea
                defaultValue={oldRemark}
                onChange={(e) => setRemark(e.target.value)}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Button
                  onClick={() => saveRemark(data)}
                  size="middle"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                ></Button>
                <Button
                  onClick={() => {
                    setIsRemarkEdit(false);
                  }}
                  size="middle"
                  icon={<CloseCircleOutlined />}
                ></Button>
              </div>
            </div>
          ) : (
              <div className={styles.uploadDetail} style={{ textAlign: "left" }}>
                <span title={oldRemark}>{oldRemark}</span>
              </div>
            )}
        </div>
      ) : null}
    </div>
  );
};

const areaScouting = () => {
  return (
    <div className={globalStyle.autoScrollY} style={{ height: "75vh" }}>
      <ScoutingItem />
      <ScoutingItem />
      <ScoutingItem />
      <ScoutingItem />
    </div>
  );
};

const tagScouting = () => {
  return (
    <div className={globalStyle.autoScrollY} style={{ height: "75vh" }}>
      <ScoutingItem2 />
      <ScoutingItem2 />
      <ScoutingItem2 />
    </div>
  );
};

@connect((
  { controller: { mainVisible }, 
  lengedList: { config } }) => 
({
  mainVisible,
  config
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
      multipleGroup:false,
      area_selected:[],

      visible: true,
      activeKey: panes[0].key,
      panes,
      activeId: -1,
      audioData: {},
    };
    this.scrollView = React.createRef();
  }
  componentDidMount () {
    this.getDetails();
    // 删除存在与页面中的项目点和元素
    Action.removeListPoint();
    // 构建地图组件
    Action.init(this.props.dispatch);
    // 当外部的数据保存成功后的回调
    // console.log(Event.Evt)
    Event.Evt.on("addCollectionForFeature", (data) => {
      this.setState({
        area_active_key: "other",
      });
      this.fetchCollection();
    });
    // 有音频正在播放
    Event.Evt.on("hasAudioStart", (data) => {
      this.setAudio(data);
    });

    Event.Evt.on("updatePlotFeature", (data) => {
      this.fetchCollection();
    });
  }

  // 设置正在播放的数据
  setAudio = (data) => {
    // console.log(data)
    this.setState({
      audioData: data,
    });
  };
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
            Object.assign(item, { _edit: false, _remarkEdit: false })
          ),
          area_active_key: respData[0] && respData[0].id,
          area_selected:[respData[0] && respData[0].id],
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
    this.setState(
      {
        area_list: this.state.area_list.concat([obj]),
      },
      () => {
        // 将新增的顶上去
        this.scrollView.current &&
          (this.scrollView.current.scrollTop =
            this.scrollView.current.scrollHeight + 1000);
      }
    );
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
    if (!name) return message.warn('分组名称不能为空');
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

  componentWillUnmount () {
    const { dispatch, config: lengedList } = this.props;
    let newLengedList = [...lengedList];
    if (!Array.isArray(lengedList)) {
      newLengedList = [lengedList];
    }
    const key = Action.lenged?.key;
    const index = newLengedList.findIndex((item) => {
      return item.key === key;
    });
    newLengedList.splice(index, 1);
    dispatch({
      type: "lengedList/updateLengedList",
      payload: {
        config: newLengedList,
      },
    });
    Action.removeLayer();
  }
  // 渲染带坐标的数据
  renderCollection = (data) => {
    const { config: lenged, dispatch } = this.props;
    Action.renderCollection(data || [], { lenged, dispatch });
  };

  // 获取资源列表，动态分类
  fetchCollection = () => {
    let params = {
      board_id: this.state.current_board.board_id,
    };
    Action.getCollectionList(params).then((res) => {
      let data = res.data;
      // 将重组后的数据更新,保存没有关联区域的数据
      let array = this.reSetCollection(data);
      this.updateCollection(data, array)
    });
  };

  // 更新数据
  updateCollection = (data ,area_list)=>{
    this.setState(
      {
        all_collection: data,
        area_list: area_list,
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
  }
  // 更新数据
  reSetCollection = (val) => {
    let data = val || [];
    let list = this.state.area_list.map((item) => {
      let f_list = data.filter((v) => v.area_type_id === item.id);
      item.collection = f_list;
      return item;
    });
    return list;
  };

  // 上传中
  filesChange = (val, file, fileList, event) => {
    // console.log("上传中...", file, fileList,event);
    if (event) {
      let percent = Math.floor((event.loaded / event.total) * 100);
      console.log(percent, event.percent);
    }
  };
  // 上传完成
  fileUpload = (val, resp, event) => {
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
            let arr = this.reSetCollection(this.state.all_collection);
            // this.renderCollection();
            this.updateCollection(Array.from(this.state.all_collection), arr);
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

  // 多选数据进行展示
  onMultipleSelectGroup = (val,id)=>{
    let arr = Array.from(this.state.area_selected)
    if(val.target.checked){
      arr.push(id);
    }else{
      arr = arr.filter(item => item !== id);
    }
    this.setState({
      area_selected:arr
    },()=>{
      let data = [...this.state.area_list];
      let selectData = [];
      arr.forEach(item => {
        let obj = data.find(d => d.id === item);
        if(obj){
          selectData = selectData.concat(obj.collection || [])
        }
      })
      this.renderCollection(selectData)
    })
  }

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
    if(this.state.multipleGroup) return;
    this.setState({area_selected:[key]})
    if (key) {
      let obj = this.state.area_list.find((item) => item.id === key);
      if (obj) {
        this.renderCollection(obj.collection || []);
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
      let list = this.reSetCollection(arr);
      this.updateCollection(Array.from(all_collection), list);
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
        if (err.code === -1) { /**message.warn(err.message)*/ }
        else message.error(err.message);
        this.showOtherSlide();
      });
  };
  //
  audioDistory = () => {
    // 页面清除了
  };

  onRemarkSave = (data) => {
    Action.modifyRemark(data).then((res) => {
      this.fetchCollection();
    });
  };

  //激活编辑几何图形
  onModifyFeatureInDetails = (data) => {
    Action.modifyFeature(data);
  };

  //停止编辑几何图形
  onStopMofifyFeatureInDetails = () => {
    Action.stopModifyFeature()
  }

  onToggleChangeStyle = (val) => {
    this.setState({
      activeId: val.id,
    });
  };
  // 复制collection
  onCopyCollection = (val, collection) => {
    let obj = {
      collect_type: collection.collect_type,
      title: collection.title,
      target: collection.target,
      area_type_id: val.id,
      board_id: val.board_id,
      content: collection.content,
    };
    // console.log(obj)
    Action.addCollection(obj).then((res) => {
      // console.log(res)
      message.success(
        <span>
          已将<a>{collection.title}</a>
          复制到<a>{val.name}</a>
          分组
        </span>
      );
      this.fetchCollection();
    });
  };

  // 
  onBeforeUploadPlan = ()=>{

  }
  onExcelSuccess = (arr)=>{
    this.fetchCollection();
  }


  // 设置多选
  setMultipleCheck = ()=>{
    this.setState({multipleGroup:!this.state.multipleGroup});
  }

  // 拖拽排序
  onCollectionDragEnd = (result)=>{
    return message.warn('排序功能暂未开放');
    if (!result.destination) {
      return;
    }
    // 重新记录数组顺序
    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      //删除并记录 删除元素
      const [removed] = result.splice(startIndex, 1);
      //将原来的元素添加进数组
      result.splice(endIndex, 0, removed);
      return result;
    };

    const items = reorder(
      [],
      result.source.index,
      result.destination.index
    );

  }

  render (h) {
    const { current_board, area_list, not_area_id_collection } = this.state;
    const panelStyle = {
      height: "96%",
    };
    const { activeId } = this.state;
    const { dispatch } = this.props;
    return (
      <div
        className={`${styles.wrap} ${animateCss.animated} ${animateCss.slideInLeft}`}
        style={{ animationDuration: "0.3s" }}
      >
        {this.state.audioData.ele && !this.state.audioData.ele.paused && (
          <AudioControl
            audioEle={this.state.audioData.ele}
            onDistory={this.audioDistory}
            data={this.state.audioData}
            onClose={() => this.setState({ audioData: {} })}
          />
        )}

        <Title
          name={current_board.board_name}
          date={""}
          id={current_board.board_id}
          data={current_board}
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
              style={{ height: "75vh", paddingBottom: "40px" }}
              ref={this.scrollView}
            >
              <Collapse
                expandIconPosition="right"
                onChange={(e) => {
                  this.setActiveCollapse(e);
                }}
                className={styles.scoutingItem}
                accordion={true}
                activeKey={this.state.area_active_key}
                expandIconPosition="left"
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              >
                {area_list.map((item, index) => {
                  let activeStyle = null;
                  if (item.id === activeId) {
                    activeStyle = { backgroundColor: "rgba(214,228,255,0.5)" };
                  }
                  return (
                    <Collapse.Panel
                      header={
                        <ScoutingHeader
                          selected={this.state.area_selected}
                          onSelect={this.onMultipleSelectGroup}
                          data={item}
                          activeKey={this.state.area_active_key}
                          index={index + 1}
                          edit={item._edit}
                          remarkEdit={item._remarkEdit}
                          onCancel={this.addCancel.bind(this, item)}
                          onSave={this.saveArea.bind(this, item)}
                          onRemarkSave={() => this.saveRemark(item)}
                          multiple={this.state.multipleGroup}
                        // onDragEnter={e => {this.setState({area_active_key: item.id})}}
                        />
                      }
                      key={item.id}
                      style={{ backgroundColor: "#fff", marginBottom: "10px" }}
                    >
                      <ScoutingItem
                        board={this.state.current_board}
                        dispatch={dispatch}
                        // onDrop={()=> console.log(item)}
                        style={activeStyle}
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
                        onRemarkSave={this.onRemarkSave}
                        onModifyRemark={this.onModifyRemark}
                        onModifyFeature={this.onModifyFeatureInDetails}
                        onStopMofifyFeatureInDetails={() => this.onStopMofifyFeatureInDetails()}
                        onToggleChangeStyle={this.onToggleChangeStyle}
                        onCopyCollection={this.onCopyCollection}
                        onExcelSuccess={this.onExcelSuccess}
                        onDragEnd={this.onCollectionDragEnd}
                      />
                    </Collapse.Panel>
                  );
                })}
                <Collapse.Panel
                  key="other"
                  style={{ backgroundColor: "#fff", marginBottom: "10px" }}
                  header={
                    <ScoutingHeader
                      data={{ name: "未分组" ,id:'other'}}
                      edit={false}
                      activeKey={this.state.area_active_key}
                      index={area_list.length + 1}
                      onCancel={() => { }}
                      onSave={() => { }}
                    // onDragEnter={e => {this.setState({area_active_key: item.id})}}
                    />
                  }
                >
                  {!!not_area_id_collection.length && (
                    <div className={styles.norAreaIdsData}>
                      {not_area_id_collection.map((item, index) => {
                        let activeStyle = null;
                        if (item.id === activeId) {
                          activeStyle = {
                            backgroundColor: "rgba(214,228,255,0.5)",
                          };
                        }
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
                              style={activeStyle}
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
                              onModifyRemark={this.onModifyRemark}
                              onRemarkSave={this.onRemarkSave}
                              onModifyFeature={this.onModifyFeatureInDetails}
                              onStopMofifyFeatureInDetails={this.onStopMofifyFeatureInDetails}
                              onToggleChangeStyle={this.onToggleChangeStyle}
                              onCopyCollection={this.onCopyCollection}
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
              <Space style={{paddingBottom:10}}>
                <Button
                  type="primary"
                  ghost
                  icon={<PlusCircleOutlined />}
                  onClick={this.pushAreaItem}
                  shape="round"
                >
                  新增
                </Button>
                <Button 
                shape="round"
                type="primary"
                disabled={area_list.length < 2}
                onClick={()=> this.setMultipleCheck()}
                ghost
                icon={<MyIcon type="icon-duoxuan"/>}>
                  {this.state.multipleGroup ? '切换单选':'切换多选'}
                </Button>
              </Space>
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
