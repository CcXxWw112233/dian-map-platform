import React, { useState, Fragment } from "react";
import globalStyle from "../../../globalSet/styles/globalStyles.less";
import animateCss from "../../../assets/css/animate.min.css";
import styles from "../ScoutingDetails.less";
import Action from "../../../lib/components/ProjectScouting/ScoutingDetail";
import {
  Row,
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
  Checkbox,
  Empty
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { BASIC } from "../../../services/config";
import Event from "../../../lib/utils/event";
import { formatSize } from '../../../utils/utils';
import ExcelRead from '../../../components/ExcelRead'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { MyIcon } from '../../../components/utils'
import { UploadFile } from '../../../utils/XhrUploadFile'

export const Title = ({ name, date, cb, data }) => {
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
    if (+size > 60 && text === 'MB') {
      message.error('文件不能大于60MB');
      return false;
    }
    return true;
  }

const UploadBtn = ({ onChange }) => {
    let [file, setFiles] = useState([]);
    const onupload = (e)=>{
      let { size, text } = formatSize(e.file.size);
      text = text.trim();
      if (!(+size > 60 && text === 'MB')) {
        setFiles(e.fileList);
        onChange(e);
        // 清空上传列表
        if(e.file.response){
          let fFile = file.filter(item => item.uid !== e.file.uid);
          setFiles(fFile);
        }
      }
    }
    // const customRequest = (val)=>{
    //     UploadFile(val.file, val.action,null, BASIC.getUrlParam.token ,(e)=>{
    //       // console.log(e);
    //     },val)
    // }
    return (
      <Upload
        action="/api/map/file/upload"
        beforeUpload={checkFileSize}
        headers={{ Authorization: BASIC.getUrlParam.token }}
        onChange={(e) => { onupload(e) }}
        showUploadList={false}
        fileList={file}
        // customRequest={customRequest}
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

export const ScoutingHeader = (props) => {
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
      onSelect = ()=>{},
      onAreaEdit = ()=>{}
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
                  <div className={styles.headerTools}>
                    {
                      (!isEdit && data.id !=='other') &&
                      <span className={styles.editNames} onClick={(e) =>{e.stopPropagation(); onAreaEdit(data)}}>
                        <MyIcon type='icon-bianjimingcheng'/>
                      </span>
                    }
                    <span className={styles.checkBoxForHeader}>
                      {multiple && <Checkbox checked={ selected.length && selected.indexOf(data.id) !== -1 } onChange={checkColletion} onClick={(e) => e.stopPropagation()}/>}
                    </span>
                  </div>
                </div>
              )}
          </div>
        </Fragment>
      </div>
    );
  };

export const ScoutingItem = ({
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
    onDragEnd = ()=>{},
    onMergeUp,
    onMergeDown,
    onMergeCancel
  }) => {
    let [planExtent, setPlanExtent] = useState("");
    let [transparency, setTransparency] = useState("1");
    let [transformFile ,setTransformFile] = useState(null);

    // 开始上传
    const startUpload = ({ file, fileList, event }) => {
      // console.log({ file, fileList, event })
      let { response } = file;
      onChange && onChange(file, fileList, event);
      if (response) {
        BASIC.checkResponse(response)
          ? onUpload && onUpload(response.data,file, fileList, event)
          : onError && onError(response,file);
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
          : onError && onError(response,file);
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
      <DragDropContext onDragEnd={onDragEnd.bind(this,data)}>
        <Droppable droppableId="droppable">
          {(provided, snapshot)=>(
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}>
              {dataSource.length ? dataSource.map((item, index) => {
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
                            { item.type !== 'groupCollection' ?
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
                                onMergeDown={onMergeDown}
                                onMergeUp={onMergeUp}
                                index={index}
                                length={dataSource.length}
                              />
                              :
                              <div className={styles.groupCollection} >
                                {
                                  item.child && item.child.map((child,i) =>
                                    (
                                       <UploadItem
                                        group_id={item.gid}
                                        subIndex={i}
                                        group_length={item.child.length}
                                         onCopyCollection={onCopyCollection}
                                         onChangeDisplay={onChangeDisplay}
                                         onEditPlanPic={onEditPlanPic}
                                         areaList={areaList}
                                         onSelectGroup={onSelectGroup}
                                         type={Action.checkCollectionType(child.target)}
                                         data={child}
                                         onRemove={onCollectionRemove}
                                         onEditCollection={onEditCollection}
                                         onRemarkSave={onRemarkSave}
                                         onModifyFeature={onModifyFeature}
                                         onStopMofifyFeatureInDetails={onStopMofifyFeatureInDetails}
                                         onModifyRemark={onModifyRemark}
                                         onMergeDown={onMergeDown}
                                         onMergeUp={onMergeUp}
                                         index={index}
                                         key={child.id}
                                         length={dataSource.length}
                                         onMergeCancel={onMergeCancel}/>
                                     )
                                  )
                                }
                               </div>
                            }

                          </div>
                        </div>
                      )}
                    </Draggable>
                );
              }): <Empty style={{textAlign:"center"}} description="暂无采集数据"/>}
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
                {/* {!!onAreaEdit && (
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
                */}
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
export const UploadItem = ({
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
    onMergeUp ,
    onMergeDown,
    index,
    length,
    subIndex,
    group_length,
    group_id,
    onMergeCancel = ()=>{}
  }) => {
    let obj = { ...data };
    // 过滤后缀
    let suffix = (obj.title && obj.title.indexOf('.') !== -1) ? obj.title.substring(obj.title.lastIndexOf('.')) :'';
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
      address:"地址"
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
      if(key === 'mergeUp'){
        // 向上组合
        setVisible(false);
        onMergeUp && onMergeUp(data,index)
      }
      if(key === 'mergeDown'){
        // 向下组合
        setVisible(false);
        onMergeDown && onMergeDown(data,index)
      }
      if(key === 'mergeCancel'){
        // 取消组合
        setVisible(false);
        onMergeCancel && onMergeCancel(data)
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
          </Menu.Item>
        }
        {
          (( index !== 0 && onMergeUp && subIndex === undefined) ||
          (index !== 0 && onMergeUp && subIndex === 0 ))
           &&
          <Menu.Item key="mergeUp">
            向上组合
          </Menu.Item>
        }
        {
          ((index < length - 1 && onMergeDown && subIndex === undefined) ||
          (index < length - 1 && onMergeDown && subIndex === group_length - 1) )
           &&
          <Menu.Item key="mergeDown">
            向下组合
          </Menu.Item>
        }
        {
          group_id && <Menu.Item key="mergeCancel">
            退出组合
          </Menu.Item>
        }
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
        Action.editZIndexOverlay(val.id);
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
          <div className={styles.uploadIcon + ` ${styles[secondSetType]}`}
          onClick={(e)=>
          {
            e.stopPropagation();
            Action.handleCollection(data)
          }}>
            <span>
              {secondSetType === "pic" ? (
                <img
                  src={data.resource_url}
                  style={{ width: 46, height: 46, borderRadius: 4 }}
                  alt="图片"
                  onError={(e) => {
                    // e.target.src = "";
                    // e.target.src = data.resource_url;
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

export const areaScouting = () => {
    return (
      <div className={globalStyle.autoScrollY} style={{ height: "75vh" }}>
        <ScoutingItem />
        <ScoutingItem />
        <ScoutingItem />
        <ScoutingItem />
      </div>
    );
  };
