import React, { useState, Fragment, useMemo } from "react";
import globalStyle from "../../../globalSet/styles/globalStyles.less";
import animateCss from "../../../assets/css/animate.min.css";
import styles from "../ScoutingDetails.less";
import Action from "../../../lib/components/ProjectScouting/ScoutingDetail";
import ListAction from "../../../lib/components/ProjectScouting/ScoutingList";
import PhotoSwipe from "../../../components/PhotoSwipe/action";
import InitMap from "../../../utils/INITMAP";
// import { dataURLtoFile } from "../../../utils/compressImg"
import { guid } from "../../../lib/components/index";
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
  Empty,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  // DeleteOutlined,
  // EditOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { BASIC } from "../../../services/config";
import Event from "../../../lib/utils/event";
import mapApp from "../../../utils/INITMAP";
import { DefaultUpload } from "../../../utils/XhrUploadFile";
import { formatSize } from "../../../utils/utils";
import ExcelRead from "../../../components/ExcelRead";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MyIcon } from "../../../components/utils";
import PublicDataTreeComponent from "../components/PublicDataTreeComponent";
import Nprogress from "nprogress";
import Axios from "axios";
// import { UploadFile } from '../../../utils/XhrUploadFile'

import Search from "../../../components/Search/Search";
import config from "../../../services/scouting";

import { Collapse } from "antd";
const { Panel } = Collapse;

export const UploadBgPic = ({ children, onUpload, onStart }) => {
  return (
    <Upload
      action="/api/map/file/upload/public"
      showUploadList={false}
      accept=".jpg, .jpeg, .png, .bmp"
      beforeUpload={() => {
        onStart && onStart();
        return true;
      }}
      headers={{ Authorization: BASIC.getUrlParam.token }}
      onChange={onUpload}
    >
      {children}
    </Upload>
  );
};

export const Title = ({
  name,
  date,
  cb,
  data = {},
  className = "",
  mini,
  parentTool,
  boardId,
  collectData,
  groupId,
}) => {
  // 预览图片
  const previewImg = (e) => {
    let url = e.target.src;
    let img = new Image();
    img.src = url;
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      PhotoSwipe.show([{ w, h, src: img.src, title: name }]);
    };
  };
  const [url, setUrl] = useState(data.bg_image);
  useMemo(() => {
    setUrl(data.bg_image);
  }, [data]);
  const onUpload = ({ file }) => {
    if (file.response) {
      Nprogress.done();
      if (BASIC.checkResponse(file.response)) {
        let src = file.response.message;
        setUrl(src);
        ListAction.editBoard(data.board_id, { bg_image: src }).then((res) => {
          message.success("设置成功");
        });
      }
    }
  };
  // 定位到项目位置
  const setToCenter = async () => {
    let coor = [+data.coordinate_x, +data.coordinate_y];
    if (!InitMap.checkNowIsGcj02System()) {
      // 需要纠偏
      let dic = InitMap.systemDic[InitMap.baseMapKey];
      coor = dic(coor[0], coor[1]);
    }
    await Action.toCenter({ center: coor, transform: true });
    Action.addAnimatePoint({ coordinates: coor, transform: true, name });
  };
  return (
    <div className={`${styles.title} ${className}`}>
      <Search
        onRef={() => { }}
        collectData={collectData}
        groupId={groupId}
        inProject={true}
        style={{ flex: "none", margin: 0, border: "1px solid #3333" }}
        placeholder="请输入名称"
      ></Search>
      <div className={styles.title_goBack}>
        <MyIcon type="icon-fanhuijiantou" onClick={cb} />
        <span
          className={`${styles.back_name} ${animateCss.animated} ${mini ? animateCss.fadeIn : animateCss.fadeOut
            }`}
        // style={mini ? { display: "" } : { display: "none" }}
        >
          {name}
        </span>
      </div>
      <div className={styles.title_name}>
        <span>{name}</span>
        <span
          className={styles.atPosition}
          title="定位到项目位置"
          onClick={() => {
            setToCenter();
          }}
        >
          <MyIcon type="icon-duomeitiicon-" />
        </span>
      </div>
      <div className={styles.title_remark} style={{ flex: "none" }}>
        <div style={{ textIndent: "1rem" }}>
          {data.remark || "暂无备注信息"}
        </div>
      </div>
      <div className={styles.title_boardBgImg}>
        {url ? (
          <div className={styles.boardBgImg}>
            <img
              crossOrigin="anonymous"
              src={url}
              alt=""
              onClick={previewImg}
            />
          </div>
        ) : (
            <div className={styles.boardBgImg}>
              <span>
                暂未设置图片~~
              <UploadBgPic
                  onStart={() => Nprogress.start()}
                  onUpload={onUpload}
                >
                  <a
                    style={{
                      ...(parentTool &&
                        parentTool.getStyle(
                          "map:collect:add:web",
                          "project",
                          boardId
                        )),
                    }}
                    disabled={
                      parentTool &&
                      parentTool.getDisabled(
                        "map:collect:add:web",
                        "project",
                        boardId
                      )
                    }
                  >
                    点击设置
                </a>
                </UploadBgPic>
              </span>
            </div>
          )}
      </div>
    </div>
  );
};

// export const Title = ({ name, date, cb, data }) => {
//     return (
//       <div className={`${styles.title}`}>
//         {data.bg_image && (
//           <div className={styles.boardBgImg}>
//             <img crossOrigin="anonymous" src={data.bg_image} alt=""/>
//           </div>
//         )}
//         <div className={styles.projectModal}></div>
//         <div
//           style={{
//             position: "relative",
//             zIndex: 5,
//             width: "100%",
//             height: "100%",
//           }}
//         >
//           <p style={{ marginTop: 8 }}>
//             <i
//               className={globalStyle.global_icon + ` ${globalStyle.btn}`}
//               style={{
//                 color: "#fff",
//                 fontSize: 22,
//               }}
//               onClick={cb}
//             >
//               &#xe602;
//             </i>
//           </p>
//           <p className={styles.name} style={{ marginTop: 90 }}>
//             <span>{name}</span>
//           </p>
//           <p
//             className={styles.date}
//             style={{
//               marginTop: 5,
//             }}
//           >
//             <span className={styles.title_remark}> 备注: {data.remark || '暂无备注'}</span>
//           </p>
//         </div>
//       </div>
//     );
//   };

let uploadFiles = [];
const checkFileSize = (file) => {
  let { size, text } = formatSize(file.size);
  text = text.trim();
  if (+size > 60 && text === "MB") {
    message.error("文件不能大于60MB---" + file.name);
    return false;
  }
  // uploadFiles.push(file);
  return true;
};

const checkFileSize360Pic = (file) => {
  return new Promise((resolve, reject) => {
    let { size, text } = formatSize(file.size);
    text = text.trim();
    if (+size > 60 && text === "MB") {
      message.error("文件不能大于60MB---" + file.name);
      reject();
    } else {
      if (file.type.includes("image")) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          let image = new Image();
          image.crossorigin = "anonymous";
          image.src = reader.result;
          image.onload = function async () {
            if (image.width > 16384) {
              const { width: originWidth, height: originHeight } = image;
              // 最大尺寸限制
              const maxWidth = 16384;
              // const maxHeight = 16384;
              // 目标尺寸
              let targetWidth = originWidth;
              let targetHeight = originHeight;
              if (originWidth > maxWidth) {
                targetWidth = maxWidth;
                targetHeight = Math.round(originHeight * maxWidth / originWidth)
              }
              const canvas = document.createElement("canvas");
              const context = canvas.getContext("2d");
              canvas.width = targetWidth;
              canvas.height = targetHeight;
              context.clearRect(0, 0, targetWidth, targetHeight);
              // 图片绘制，新设置一个图片宽高，达到压缩图片的目地
              context.drawImage(image, 0, 0, targetWidth, targetHeight);
              const dataUrl = canvas.toDataURL(file.type);
              // let newFile = dataURLtoFile(dataUrl, file[0].name);
              var arr = dataUrl.split(",");
              var mime = arr[0].match(/:(.*?);/)[1];
              var bstr = atob(arr[1]);
              var n = bstr.length;
              var u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              //转换成file对象
              file = new File([u8arr], file.name, { type: mime });
              resolve(file);
            } else {
              resolve(true);
            }
          };
        };
      } else {
        resolve(true);
      }
    }
    // uploadFiles.push(file);
  });
};

const UploadBtn = ({ onChange, parentTool, boardId }) => {
  let [file, setFiles] = useState([]);
  const onupload = (e) => {
    let { size, text } = formatSize(e.file.size);
    text = text.trim();
    if (!(+size > 60 && text === "MB")) {
      setFiles(e.fileList);
      onChange(e);
    }
  };
  Event.Evt.on("uploadFileSuccess", (files) => {
    // setTimeout(()=>{
    setFiles(file.filter((item) => item.uid !== files.uid));
    // }, 2000)
  });

  // const customRequest = (val)=>{
  //     UploadFile(val.file, val.action,null, BASIC.getUrlParam.token ,(e)=>{
  //       // console.log(e);
  //     },val)
  // }
  return (
    <Upload
      action="/api/map/file/upload"
      beforeUpload={checkFileSize}
      multiple
      headers={{ Authorization: BASIC.getUrlParam.token }}
      onChange={(e) => {
        onupload(e);
      }}
      showUploadList={false}
      fileList={file}
    // customRequest={customRequest}
    >
      <span>上传采集资料</span>
      {/* <Button
          title="上传采集数据"
          shape="circle"
          type="primary"
          ghost
          size="large"
        >
          <i className={globalStyle.global_icon} style={{ color: "#0D4FF7" }}>
            &#xe628;
          </i>
        </Button> */}
    </Upload>
  );
};
const Upload360PicBtn = ({
  onChange,
  parentTool,
  boardId,
  parent,
  uploadPanorama,
}) => {
  let [file, setFiles] = useState([]);
  const onupload = (e) => {
    let { size, text } = formatSize(e.file.size);
    text = text.trim();
    // setFiles(e.fileList);
    if (!(+size > 60 && text === "MB")) {
      setFiles(e.fileList);
      onChange(e);
    }
  };

  Event.Evt.on("uploadFileSuccess", (files) => {
    // setTimeout(()=>{
    setFiles(file.filter((item) => item.uid !== files.uid));
    // }, 2000)
  });

  // const customRequest = (val)=>{
  //     UploadFile(val.file, val.action,null, BASIC.getUrlParam.token ,(e)=>{
  //       // console.log(e);
  //     },val)
  // }
  return (
    <Upload
      action="/api/map/file/upload"
      accept=".jpg, .jpeg, .png, .bmp, .mp4, .avi, .wmv"
      beforeUpload={checkFileSize360Pic}
      headers={{ Authorization: BASIC.getUrlParam.token }}
      onChange={(e) => {
        onupload(e);
      }}
      showUploadList={false}
      fileList={file}
    // customRequest={customRequest}
    >
      <span
        onClick={() => {
          if (parent) {
            parent.is360Pic = true;
          }
        }}
      >
        上传全景图片/视频
      </span>
    </Upload>
  );
};
let hasChangeFile = false;
let saveData = null;
export const ScoutingHeader = (props) => {
  let {
    onUpload,
    onChange,
    onError,
    dispatch,
    board,
    onUploadPlan = () => { },
    onUploadPlanStart = () => { },
    onUploadPlanCancel = () => { },
    onAreaDelete = () => { },
    onExcelSuccess = () => { },
    selected,
    edit,
    // remarkEdit,
    onCancel,
    onSave,
    // onRemarkSave,
    data,
    // index,
    onDragEnter,
    activeKey,
    multiple = false,
    onSelect = () => { },
    onAreaEdit = () => { },
    parentTool,
    boardId,
    parent,
    uploadPanorama,
  } = props;
  let [areaName, setAreaName] = useState(data.name);
  let [isEdit, setIsEdit] = useState(edit);
  let [showTips, setShowTips] = useState(false);
  let [menuShow, setMenuShow] = useState(false);

  let [planExtent, setPlanExtent] = useState("");
  let [coordSysType, setCoordSysType] = useState(0);
  let [transparency, setTransparency] = useState("1");
  let [transformFile, setTransformFile] = useState(null);
  // let [ saveData, setSaveData ] = useState();
  let [uploadUrl, setUploadUrl] = useState(`/api/map/ght/${data.id}`);
  // 保存事件
  const saveItem = () => {
    onSave && onSave(areaName);
    setIsEdit(false);
  };

  const checkColletion = (val) => {
    // console.log(val);
    onSelect(val, data.id);
  };

  const handleClick = ({ key }) => {
    // console.log(key)
    let onSetCoordinates = props.onSetCoordinates;
    if (key !== "delete") {
      setMenuShow(false);
    }
    if (key === "setCoordinates") {
      onSetCoordinates && onSetCoordinates(data);
    }
  };

  // 开始上传
  const startUpload = ({ file, fileList, event }) => {
    // console.log({ file, fileList, event })
    let { response } = file;
    onChange && onChange(file, fileList, event);
    if (response) {
      BASIC.checkResponse(response)
        ? onUpload && onUpload(response.data, file, fileList, event)
        : onError && onError(response, file);
    } else {
      // onError && onError(file)
    }
  };

  const startUpload360Pic = ({ file, fileList, event }) => {
    // console.log({ file, fileList, event })
    onChange && onChange(file, fileList, event);
  };

  // 上传规划图
  const onStartUploadPlan = ({ file, fileList }) => {
    let { response } = file;
    onUploadPlan && onUploadPlan(null, fileList, hasChangeFile, saveData);
    if (response) {
      BASIC.checkResponse(response)
        ? onUploadPlan &&
        onUploadPlan(response.data, fileList, hasChangeFile, saveData)
        : onError && onError(response, file);

      hasChangeFile = false;
      saveData = null;
    } else {
      // onError && onError(file)
    }
  };

  // 设置更新的文件
  const beforeTransformFile = () => {
    return Promise.resolve(transformFile);
  };

  const firstUpload = async (file, extent) => {
    let formdata = new FormData();
    formdata.append("file", file);
    formdata.append("extent", extent);
    formdata.append("transparency", transparency);
    formdata.append("coord_sys_type", coordSysType);
    let resp = await Axios.post(uploadUrl, formdata, {
      headers: { Authorization: BASIC.getUrlParam.token },
    });
    saveData = resp.data;
    return resp.data;
  };
  // 上传规划图
  const beforeUploadPlan = (val) => {
    onUploadPlanStart && onUploadPlanStart(val);
    // 文件大小限制
    let { size, text } = formatSize(val.size);
    text = text.trim();
    if (+size > 100 && text === "MB") {
      message.error("文件不能大于100MB");
      return false;
    }
    return new Promise((resolve, reject) => {
      let url = window.URL.createObjectURL(val);
      Action.addPlanPictureDraw(url, val, dispatch)
        .then(async (res) => {
          let { feature } = res;
          let extent = feature.getGeometry().getExtent();
          // console.log(extent)
          // 设置透明度,设置范围大小
          setTransparency(res.opacity);
          setPlanExtent(extent.join(","));
          const baseMapKeys = mapApp.baseMapKeys;
          const baseMapKey = mapApp.baseMapKey;
          setCoordSysType(baseMapKeys[0].indexOf(baseMapKey) > -1 ? 0 : 1);
          // await (()=>{
          //   return new Promise(resolve => {
          //     setTimeout(()=>{
          //       resolve()
          //     },300)
          //   })

          // })()
          // console.log(planExtent)
          if (res.blobFile) {
            // 设置文件
            hasChangeFile = true;
            setTransformFile(res.blobFile);
            // 如果改变了文件，则先保存一份
            await firstUpload(val, extent.join(","));
          } else {
            // 设置原文件
            setTransformFile(val);
          }
          resolve({ ...val });
          // resolve({})
        })
        .catch((err) => {
          reject(err);
          onUploadPlanCancel && onUploadPlanCancel(err);
          hasChangeFile = false;
          saveData = null;
        });
    });
  };

  const menu = (
    <Menu onClick={handleClick}>
      <Menu.Item
        key="setCoordinates"
        style={{
          ...(parentTool &&
            parentTool.getStyle("map:collect:add:web", "project", boardId)),
        }}
        disabled={
          parentTool &&
          parentTool.getDisabled("map:collect:add:web", "project", boardId)
        }
      >
        设置分类坐标
      </Menu.Item>
      <Menu.Item
        key="upload"
        style={{
          ...(parentTool &&
            parentTool.getStyle("map:collect:add:web", "project", boardId)),
        }}
        disabled={
          parentTool &&
          parentTool.getDisabled("map:collect:add:web", "project", boardId)
        }
      >
        {/* 上传采集资料 */}
        <UploadBtn
          onChange={startUpload}
          parentTool={parentTool}
          boardId={boardId}
        />
      </Menu.Item>
      <Menu.Item>
        <Upload360PicBtn
          onChange={startUpload}
          parentTool={parentTool}
          boardId={boardId}
          parent={parent}
          uploadPanorama={uploadPanorama}
        ></Upload360PicBtn>
      </Menu.Item>
      <Menu.Item
        key="uploadPlan"
        style={{
          ...(parentTool &&
            parentTool.getStyle("map:collect:add:web", "project", boardId)),
        }}
        disabled={
          parentTool &&
          parentTool.getDisabled("map:collect:add:web", "project", boardId)
        }
      >
        <Upload
          action={uploadUrl}
          accept=".jpg, .jpeg, .png, .bmp"
          headers={{ Authorization: BASIC.getUrlParam.token }}
          beforeUpload={beforeUploadPlan}
          transformFile={beforeTransformFile}
          data={{
            extent: planExtent,
            transparency,
            coord_sys_type: coordSysType,
          }}
          onChange={onStartUploadPlan}
          showUploadList={false}
        >
          <div>上传规划图</div>
        </Upload>
      </Menu.Item>
      <Menu.Item
        key="uploadExcel"
        style={{
          ...(parentTool &&
            parentTool.getStyle("map:collect:add:web", "project", boardId)),
        }}
        disabled={
          parentTool &&
          parentTool.getDisabled("map:collect:add:web", "project", boardId)
        }
      >
        {/* 导入数据 */}
        <ExcelRead
          id={data.id}
          group={data}
          board={board}
          parent={this}
          onExcelSuccess={onExcelSuccess}
        />
      </Menu.Item>
      <Menu.Item key="delete">
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
          overlayStyle={{ zIndex: 1065 }}
          placement="bottomLeft"
          onConfirm={() => {
            setMenuShow(false);
            onAreaDelete.call(this, data);
          }}
        >
          <div
            className="danger"
            style={{
              ...(parentTool &&
                parentTool.getStyle(
                  "map:collect:type:remove",
                  "project",
                  boardId
                )),
            }}
            disabled={
              parentTool &&
              parentTool.getDisabled(
                "map:collect:type:remove",
                "project",
                boardId
              )
            }
          >
            删除
          </div>
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      style={{
        display: "flex",
      }}
      onClick={(e) => {
        edit ? e.stopPropagation() : void 0;
      }}
      onDragEnter={onDragEnter}
    >
      <Fragment>
        <div className={styles.numberIcon}>
          <span>
            <MyIcon
              type={
                activeKey === data.id
                  ? "icon-wenjianzhankai"
                  : "icon-wenjianshouqi"
              }
            />
          </span>
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
              <div className={styles.groupTitle}>
                {data.name}
                {data.id === "other" &&
                  (!showTips ? (
                    <MyIcon
                      tip="点击查看帮助"
                      type="icon-wenhao"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTips(true);
                      }}
                      style={{ marginLeft: 15, color: "#1769FF" }}
                    />
                  ) : (
                      <span
                        tip="点击关闭帮助"
                        style={{ color: "#1769FF", fontSize: "12px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTips(false);
                        }}
                      >
                        （来自手机端采集的资料或转存的标绘）
                      </span>
                    ))}

                <div className={styles.headerTools}>
                  <span className={styles.checkBoxForHeader}>
                    {multiple && (
                      <Checkbox
                        checked={
                          selected.length && selected.indexOf(data.id) !== -1
                        }
                        onChange={checkColletion}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </span>
                  {!isEdit && data.id !== "other" && (
                    <span
                      className={styles.editNames}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAreaEdit(data);
                      }}
                      style={{
                        ...(parentTool &&
                          parentTool.getStyle(
                            "map:collect:type:update",
                            "project",
                            boardId
                          )),
                      }}
                      disabled={
                        parentTool &&
                        parentTool.getDisabled(
                          "map:collect:type:update",
                          "project",
                          boardId
                        )
                      }
                    >
                      <MyIcon type="icon-bianjimingcheng" />
                    </span>
                  )}
                  {/* 只有不是未分组的才可以显示 */}
                  {data.id !== "other" && (
                    <span
                      className={styles.moreOperations}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Dropdown
                        visible={menuShow}
                        overlay={menu}
                        onVisibleChange={(val) => {
                          setMenuShow(val);
                        }}
                        trigger="click"
                      >
                        <MyIcon type="icon-gengduo1" />
                      </Dropdown>
                    </span>
                  )}
                </div>
              </div>
            )}
        </div>
      </Fragment>
    </div>
  );
};

export const ScoutingItem = ({
  data,
  dataSource = [],
  onCollectionRemove,
  onEditCollection,
  areaList,
  onSelectGroup,
  onChangeDisplay = () => { },
  onEditPlanPic = () => { },
  onCopyCollection,
  selected = [],
  onModifyFeature = () => { },
  onModifyRemark = () => { },
  onRemarkSave = () => { },
  onStopMofifyFeatureInDetails,
  onDragEnd = () => { },
  onMergeUp,
  onMergeDown,
  onMergeCancel,
  CollectionEdit = false,
  onSelectCollection,
  onCheckItem = () => { },
  callback,
  parent,
  index,
}) => {
  const handleSelect = (val) => {
    // console.log(val);
    onSelectCollection && onSelectCollection(val);
  };
  return (
    <DragDropContext onDragEnd={() => onDragEnd.bind(this, data)}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <Checkbox.Group
              onChange={handleSelect}
              style={{ width: "100%" }}
              value={selected}
            >
              {dataSource.length ? (
                dataSource.map((item, index) => {
                  if (item.collect_type === "9") {
                    return (
                      <PublicDataTreeComponent
                        key={guid()}
                        datas={item}
                        areaList={areaList}
                        callback={callback}
                        index={index}
                        parent={parent}
                      ></PublicDataTreeComponent>
                    );
                  }
                  return (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <div
                            className={`${animateCss.animated} ${animateCss.slideInRight}`}
                            style={{
                              animationDuration: "0.3s",
                              animationDelay: index * 0.02 + "s",
                              position: "relative",
                              paddingLeft: "8px",
                              width: "100%",
                            }}
                            key={item.id}
                          >
                            <span
                              className={styles.handleCollection}
                              {...provided.dragHandleProps}
                            >
                              <MyIcon type="icon-tuozhuaitingliu" />
                            </span>
                            {item.type !== "groupCollection" ? (
                              <UploadItem
                                selected={selected}
                                Edit={CollectionEdit}
                                onCheckItem={onCheckItem}
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
                                onStopMofifyFeatureInDetails={
                                  onStopMofifyFeatureInDetails
                                }
                                onModifyRemark={onModifyRemark}
                                onMergeDown={onMergeDown}
                                onMergeUp={onMergeUp}
                                index={index}
                                length={dataSource.length}
                              />
                            ) : (
                                <div className={styles.groupCollection}>
                                  {item.child &&
                                    item.child.map((child, i) => (
                                      <UploadItem
                                        selected={selected}
                                        Edit={CollectionEdit}
                                        onCheckItem={onCheckItem}
                                        group_id={item.gid}
                                        subIndex={i}
                                        group_length={item.child.length}
                                        onCopyCollection={onCopyCollection}
                                        onChangeDisplay={onChangeDisplay}
                                        onEditPlanPic={onEditPlanPic}
                                        areaList={areaList}
                                        onSelectGroup={onSelectGroup}
                                        type={Action.checkCollectionType(
                                          child.target
                                        )}
                                        data={child}
                                        onRemove={onCollectionRemove}
                                        onEditCollection={onEditCollection}
                                        onRemarkSave={onRemarkSave}
                                        onModifyFeature={onModifyFeature}
                                        onStopMofifyFeatureInDetails={
                                          onStopMofifyFeatureInDetails
                                        }
                                        onModifyRemark={onModifyRemark}
                                        onMergeDown={onMergeDown}
                                        onMergeUp={onMergeUp}
                                        index={index}
                                        key={child.id}
                                        length={dataSource.length}
                                        onMergeCancel={onMergeCancel}
                                      />
                                    ))}
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })
              ) : (
                  <Empty
                    style={{ textAlign: "center" }}
                    description="暂无采集数据"
                  />
                )}
            </Checkbox.Group>

            {provided.placeholder}
            {/* <div
              style={{
                width: "100%",
                margin: "5px 0",
                padding: "10px 0",
                borderTop: "1px solid rgba(0,0,0,0.15)",
              }}
            >
            </div> */}
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
  Edit = false,
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
  onMergeUp,
  onMergeDown,
  index,
  length,
  subIndex,
  group_length,
  group_id,
  onCheckItem = () => { },
  onMergeCancel = () => { },
}) => {
  let obj = { ...data };
  // 过滤后缀
  let suffix =
    obj.title && obj.title.indexOf(".") !== -1
      ? obj.title.substring(obj.title.lastIndexOf("."))
      : "";
  let reg = /\.[a-z]/i;
  if (suffix && reg.test(suffix)) {
    obj.title = obj.title.replace(suffix, "");
  }

  let [visible, setVisible] = useState(false);
  let [groupVisible, setGroupVisible] = useState(false);
  let [copyVisible, setCopyVisible] = useState(false);
  let [isEdit, setIsEdit] = useState(false);
  let [remark, setRemark] = useState("");
  let [isAddMark, addRemark] = useState(false);
  let [isRemarkEdit, setIsRemarkEdit] = useState(false);
  let [isPlotEdit, setIsPlotEdit] = useState(false);
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
    paper: { text: "图纸", icon: "icon-tupian" },
    interview: { text: "访谈", icon: "icon-yinpin" },
    pic: { text: "图片", icon: "icon-tupian" },
    video: { text: "视频", icon: "icon-shipin" },
    word: { text: "文档", icon: "icon-wenjian" },
    annotate: { text: "批注", icon: "icon-pizhu1" },
    plotting: { text: "标绘", icon: "icon-biaohui2" },
    unknow: { text: "未知", icon: "icon-bianzu612" },
    planPic: { text: "规划", icon: "icon-bianzu581" },
    address: { text: "地址", icon: "icon-zuobiao2" },
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
      let newData = { ...data };
      delete newData.resource_url;
      onModifyRemark && onModifyRemark(newData);
    }
    if (key === "modifyFeature") {
      setVisible(false);
      setIsPlotEdit(true);
      onModifyFeature && onModifyFeature(data);
      Event.Evt.on("stopEditPlot", () => {
        setIsPlotEdit(false);
      });
    }
    if (key === "mergeUp") {
      // 向上组合
      setVisible(false);
      onMergeUp && onMergeUp(data, index);
    }
    if (key === "mergeDown") {
      // 向下组合
      setVisible(false);
      onMergeDown && onMergeDown(data, index);
    }
    if (key === "mergeCancel") {
      // 取消组合
      setVisible(false);
      onMergeCancel && onMergeCancel(data);
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
      return void 0;
    });
    if (list.length) return list;
    else return "暂无分组可以选择";
  };

  const menu = (
    <Menu onClick={onHandleMenu}>
      {data.collect_type !== "4" && data.collect_type !== "5" && (
        <Menu.Item key="editCollection">关联坐标</Menu.Item>
      )}
      <Menu.Item key="eidtTitle">修改名称</Menu.Item>
      {data.collect_type === "5" && (
        <Menu.Item key="editPlanPic">编辑</Menu.Item>
      )}
      {data.collect_type === "9" &&
        data.content &&
        JSON.parse(data.content)?.remark ? (
          <Menu.Item key="modifyRemark">编辑备注</Menu.Item>
        ) : null}
      {/* {data.content && JSON.parse(data.content)?.remark === "" ? (
        <Menu.Item key="addRemark">新增备注</Menu.Item>
      ) : null} */}
      {data.collect_type === "4" &&
        data.content &&
        JSON.parse(data.content)?.featureType ? (
          <Menu.Item key="modifyFeature">标绘编辑</Menu.Item>
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
      {data.collect_type === "4" && isPlotEdit ? (
        <Menu.Item key="copyToGroup">
          <Popconfirm
            title="系统检测到图形正在编辑中，是否先停止编辑图形?"
            okText="好的"
            cancelText="继续编辑"
            overlayStyle={{ zIndex: 10000 }}
            onConfirm={() => {
              setVisible(false);
              setIsPlotEdit(false);
              onStopMofifyFeatureInDetails && onStopMofifyFeatureInDetails();
            }}
            onCancel={() => {
              setVisible(false);
            }}
            placement="topRight"
          >
            <div style={{ width: "100%" }}>复制到分组</div>
          </Popconfirm>
        </Menu.Item>
      ) : null}
      {isPlotEdit ? (
        <Menu.Item key="selectGroup">
          <Popconfirm
            title="系统检测到图形正在编辑中，是否先停止编辑图形?"
            okText="好的"
            cancelText="继续编辑"
            overlayStyle={{ zIndex: 10000 }}
            onConfirm={() => {
              setVisible(false);
              setIsPlotEdit(false);
              onStopMofifyFeatureInDetails && onStopMofifyFeatureInDetails();
            }}
            onCancel={() => {
              setVisible(false);
            }}
            placement="topRight"
          >
            <div style={{ width: "100%" }}>移动到分组</div>
          </Popconfirm>
        </Menu.Item>
      ) : (
          <Menu.Item key="selectGroup">
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
        )}
      {((index !== 0 && onMergeUp && subIndex === undefined) ||
        (index !== 0 && onMergeUp && subIndex === 0)) && (
          <Menu.Item key="mergeUp">向上组合</Menu.Item>
        )}
      {((index < length - 1 && onMergeDown && subIndex === undefined) ||
        (index < length - 1 &&
          onMergeDown &&
          subIndex === group_length - 1)) && (
          <Menu.Item key="mergeDown">向下组合</Menu.Item>
        )}
      {group_id && <Menu.Item key="mergeCancel">退出组合</Menu.Item>}
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
  };

  const itemClick = (val) => {
    // let ty = Action.checkCollectionType(val.target);
    // if (ty === "pic") {
    //   // 点击的是图片
    //   onCheckItem(val);
    // } else {
    //   onCheckItem(null);
    // }
    Action.zoomToMap();
    setTimeout(function () {
      onCheckItem(val);
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
    }, 20);
  };
  Event.Evt.un("moveToCollect");
  Event.Evt.on("moveToCollect", (val) => {
    itemClick(val);
  });
  let oldRemark = data.content && JSON.parse(data.content).remark;
  if (oldRemark?.trim() === "") {
    oldRemark = null;
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
      // style={myStyle}
      onClick={() => itemClick(data)}
      id={`menu_collection_${data.id}`}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
        title={`${itemKeyVals[secondSetType].text} ${data.title}`}
      >
        <div
          className={styles.uploadIcon}
          onClick={(e) => {
            e.stopPropagation();
            Action.handleCollection(data);
          }}
        >
          <MyIcon
            type={itemKeyVals[secondSetType] && itemKeyVals[secondSetType].icon}
          />
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
                  // style={{ minHeight: "1rem" }}
                  // title={title}
                  className={`${styles.firstRow} ${styles.text_overflow} text_ellipsis`}
                >
                  {title}
                </span>
              )}
          </Row>
          {/* <Row>
              <Space size={8} style={{ fontSize: 12 }}>
                <span>{create_by.name}</span>
                <span>{time}</span>
                <span>{hours}</span>
              </Space>
            </Row> */}
        </div>
        <div className={styles.uploadItemOperation}>
          <span
            className={`${styles.eyes} ${globalStyle.global_icon}`}
            // style={{ color: "#1769FF" }}
            onClick={(e) => {
              e.stopPropagation();
              onChangeDisplay && onChangeDisplay(data);
            }}
          >
            {data.is_display === "0" ? (
              <MyIcon type="icon-yanjing_yincang" />
            ) : (
                <MyIcon type="icon-yanjing_xianshi" />
              )}
          </span>
          {!Edit ? (
            <Dropdown
              overlay={menu}
              trigger="click"
              onVisibleChange={(val) => setVisible(val)}
              visible={visible}
            >
              <span
              // style={{ color: "#1769FF" }}
              >
                <MyIcon type="icon-gengduo2" />
              </span>
            </Dropdown>
          ) : (
              <Checkbox value={data.id} style={{ marginLeft: 5 }}></Checkbox>
            )}
        </div>
      </div>
      {/* {oldRemark || isAddMark === true ? (
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
        ) : null} */}
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
