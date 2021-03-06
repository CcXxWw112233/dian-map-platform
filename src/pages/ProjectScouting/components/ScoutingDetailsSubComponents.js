import React, { useState, Fragment, useMemo } from "react";
import globalStyle from "../../../globalSet/styles/globalStyles.less";
import animateCss from "../../../assets/css/animate.min.css";
import styles from "../ScoutingDetails.less";
import Action from "../../../lib/components/ProjectScouting/ScoutingDetail";
import ListAction from "../../../lib/components/ProjectScouting/ScoutingList";
import PhotoSwipe from "../../../components/PhotoSwipe/action";
import InitMap from "../../../utils/INITMAP";
import { guid } from "../../../lib/components/index";
import {
  Row,
  Input,
  Button,
  message,
  Upload,
  // Space,
  Dropdown,
  Menu,
  Popconfirm,
  Popover,
  Col,
  Checkbox,
  Switch
  // Empty,
} from "antd";
import Empty from "../../../components/Empty";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  // DeleteOutlined,
  // EditOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { Icon } from 'antd'

import { BASIC, MAP_REQUEST_URL } from "../../../services/config";
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
import { compress } from "../../../utils/pictureCompress";
import Cookies from 'js-cookie'

import { Collapse } from "antd";
const { Panel } = Collapse;

export const UploadBgPic = ({ children, onUpload, onStart }) => {
  return (
    <Upload
      action={`${MAP_REQUEST_URL}/map/file/upload/public`}
      showUploadList={false}
      accept=".jpg, .jpeg, .png, .bmp"
      beforeUpload={() => {
        onStart && onStart();
        return true;
      }}
      headers={{ Authorization: Cookies.get('Authorization') }}
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
  currentBoard,
}) => {
  // ????????????
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
          message.success("????????????");
        });
      }
    }
  };
  // ?????????????????????
  const setToCenter = async () => {
    let coor = [+data.coordinate_x, +data.coordinate_y];
    if (!InitMap.checkNowIsGcj02System()) {
      // ????????????
      let dic = InitMap.systemDic[InitMap.baseMapKey];
      coor = dic(coor[0], coor[1]);
    }
    await Action.toCenter({ center: coor, transform: true });
    Action.addAnimatePoint({ coordinates: coor, transform: true, name });
  };
  return (
    <div className={`${styles.title} ${className}`}>
      <Search
        onRef={() => {}}
        collectData={collectData}
        groupId={groupId}
        inProject={true}
        currentBoard={currentBoard}
        style={{ flex: "none", margin: 0, border: "1px solid #3333" }}
        placeholder="???????????????"
      ></Search>
      <div className={styles.title_goBack}>
        <MyIcon type="icon-fanhuijiantou" onClick={cb} />
        <span
          className={`${styles.back_name} ${animateCss.animated} ${
            mini ? animateCss.fadeIn : animateCss.fadeOut
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
          title="?????????????????????"
          onClick={() => {
            setToCenter();
          }}
        >
          <MyIcon type="icon-duomeitiicon-" />
        </span>
      </div>
      <div className={styles.title_remark} style={{ flex: "none" }}>
        <div style={{ textIndent: "1rem" }}>
          {data.remark || "??????????????????"}
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
          <div
            className={styles.boardBgImg}
            style={{ background: "rgb(238,248,255)", textAlign: "center" }}
          >
            <span
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
              {/* ??????????????????~~ */}
              <UploadBgPic
                onStart={() => Nprogress.start()}
                onUpload={onUpload}
              >
                {/* <a
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
                  ????????????
                </a> */}
                <i
                  className={globalStyle.global_icon}
                  style={{
                    display: "block",
                    fontSize: 50,
                    color: "rgb(134,179,255)",
                    cursor: "pointer",
                  }}
                >
                  &#xe697;
                </i>
                <span style={{ color: "rgb(134,179,255)" }}>??????????????????</span>
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
//             <span className={styles.title_remark}> ??????: {data.remark || '????????????'}</span>
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
    message.error("??????????????????60MB---" + file.name);
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
      message.error("??????????????????60MB---" + file.name);
      reject();
    } else {
      if (file.type.includes("image")) {
        compress(file, 16384).then((res) => {
          resolve(res);
        });
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
  //     UploadFile(val.file, val.action,null, Cookies.get('Authorization') ,(e)=>{
  //       // console.log(e);
  //     },val)
  // }
  return (
    <Upload
      action={`${MAP_REQUEST_URL}/map/file/upload`}
      beforeUpload={checkFileSize}
      multiple
      headers={{ Authorization: Cookies.get('Authorization') }}
      onChange={(e) => {
        onupload(e);
      }}
      showUploadList={false}
      fileList={file}
      // customRequest={customRequest}
    >
      <span>??????????????????</span>
      {/* <Button
          title="??????????????????"
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
  //     UploadFile(val.file, val.action,null, Cookies.get('Authorization') ,(e)=>{
  //       // console.log(e);
  //     },val)
  // }
  return (
    <Upload
      action={`${MAP_REQUEST_URL}/map/file/upload`}
      accept=".jpg, .jpeg, .png, .bmp, .mp4, .avi, .wmv"
      beforeUpload={checkFileSize360Pic}
      headers={{ Authorization: Cookies.get('Authorization') }}
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
        ??????????????????/??????
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
    onUploadPlan = () => {},
    onUploadPlanStart = () => {},
    onUploadPlanCancel = () => {},
    onAreaDelete = () => {},
    onExcelSuccess = () => {},
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
    onSelect = () => {},
    onAreaEdit = () => {},
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
  let [uploadUrl, setUploadUrl] = useState(`${MAP_REQUEST_URL}/map/ght/${data.id}`);
  // ????????????
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
    if ("uploadPlan" === key) {
      let fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".jpg, .jpeg, .png, .bmp";
      fileInput.onchange = (evt) => {
        let target = evt.target;
        let file = target.files[0];
        customUpload(file)
        fileInput = null;
      };
      fileInput.click();
    }
  };

  // ???????????????
  const customUpload = async (file) => {
    beforeUploadPlan(file).then(msg => {
      if (msg === false) {
        // ???????????????????????????
      } else {
        // ????????????????????????
        // ??????????????????????????????????????????
        sendPlanPicture(msg);
      }
    }).catch(err => {
      console.log(err);
    })
  }

  // ???????????????
  const sendPlanPicture = (data) => {
    let keys = Object.keys(data);
    let formData = new FormData();
    keys.forEach(key => {
      formData.append(key, data[key])
    })
    Axios.post(uploadUrl, formData, { headers: { Authorization: Cookies.get("Authorization") } }).then((res) => {
      message.success("????????????");
      let response = res.data;
      // onStartUploadPlan()
      BASIC.checkResponse(response)
        ? onUploadPlan &&
          onUploadPlan(response.data, [], hasChangeFile, saveData)
        : onError && onError(response, data.file);
    })
  }

  // ????????????
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

  // ???????????????
  const onStartUploadPlan = ({ file, fileList }) => {
    let { response } = file;
    onUploadPlan && onUploadPlan(null, fileList, hasChangeFile, saveData);
    if (response) {


      hasChangeFile = false;
      saveData = null;
    } else {
      // onError && onError(file)
    }
  };

  // ?????????????????????
  // const beforeTransformFile = () => {
  //   return Promise.resolve(transformFile);
  // };

  const firstUpload = async (file, extent) => {
    let formdata = new FormData();
    formdata.append("file", file);
    formdata.append("extent", extent);
    formdata.append("transparency", transparency);
    formdata.append("coord_sys_type", coordSysType);
    let resp = await Axios.post(uploadUrl, formdata, {
      headers: { Authorization: Cookies.get('Authorization') },
    });
    saveData = resp.data;
    return resp.data;
  };
  // ???????????????
  const beforeUploadPlan = (val) => {
    onUploadPlanStart && onUploadPlanStart(val);
    // ??????????????????
    let { size, text } = formatSize(val.size);
    text = text.trim();
    if (+size > 100 && text === "MB") {
      message.error("??????????????????100MB");
      return false;
    }
    return new Promise((resolve, reject) => {
      let url = window.URL.createObjectURL(val);
      Action.addPlanPictureDraw(url, val, dispatch)
        .then(async (res) => {
          let beforeData = {};
          // let { feature } = res;
          // let extent = feature.getGeometry().getExtent();
          // ???????????????,??????????????????
          // setTransparency(res.opacity);
          // setPlanExtent(extent.join(","));
          const baseMapKeys = mapApp.baseMapKeys;
          const baseMapKey = mapApp.baseMapKey;
          // setCoordSysType(baseMapKeys[0].indexOf(baseMapKey) > -1 ? 0 : 1);

          beforeData.transparency = res.opacity;
          beforeData.extent = res.extent.join(',');
          beforeData.coord_sys_type = baseMapKeys[0].indexOf(baseMapKey) > -1 ? 0 : 1;
          if (res.blobFile) {
            // ????????????
            hasChangeFile = true;
            // setTransformFile(res.blobFile);
            beforeData.file = res.blobFile;
            // ??????????????????????????????????????????
            await firstUpload(val, res.extent.join(","));
          } else {
            // ???????????????
            // setTransformFile(val);
            beforeData.file = val
          }
          resolve(beforeData);
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
        ??????????????????
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
        {/* ?????????????????? */}
        <UploadBtn
          onChange={startUpload}
          parentTool={parentTool}
          boardId={boardId}
        />
      </Menu.Item>
      <Menu.Item
        style={{
          ...(parentTool &&
            parentTool.getStyle("map:collect:add:web", "project", boardId)),
        }}
        disabled={
          parentTool &&
          parentTool.getDisabled("map:collect:add:web", "project", boardId)
        }
      >
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
        <div>???????????????</div>
        {/* <Upload
          action={uploadUrl}
          accept=".jpg, .jpeg, .png, .bmp"
          headers={{ Authorization: Cookies.get('Authorization') }}
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
          <div>???????????????</div>
        </Upload> */}
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
        {/* ???????????? */}
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
              ??????????????????[{data.name}]??????
              <br />
              ??????????????????(?????????????????????????????????)
            </span>
          }
          okText="??????"
          cancelText="??????"
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
            ??????
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
                placeholder="???????????????"
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
                size="small"
                type="primary"
              >
                <Icon type="check-circle" CheckCircleOutlined />
              </Button>
              <Button
                onClick={() => {
                  setIsEdit(false);
                  onCancel && onCancel(data);
                }}
                size="small"
              >
                <Icon type="close-circle" CloseCircleOutlined />
              </Button>
            </Fragment>
          ) : (
            <div className={styles.groupTitle}>
              {data.name}
              {data.id === "other" &&
                (!showTips ? (
                  <MyIcon
                    tip="??????????????????"
                    type="icon-wenhao"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTips(true);
                    }}
                    style={{ marginLeft: 15, color: "#1769FF" }}
                  />
                ) : (
                  <span
                    tip="??????????????????"
                    style={{ color: "#1769FF", fontSize: "12px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTips(false);
                    }}
                  >
                    ??????????????????????????????????????????????????????
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
                {/* ??????????????????????????????????????? */}
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

export const ScoutingItem = (props) => {
  const {
    data,
    dataSource = [],
    onCollectionRemove,
    onEditCollection,
    areaList,
    onSelectGroup,
    onChangeDisplay = () => {},
    onEditPlanPic = () => {},
    onCopyCollection,
    selected = [],
    onModifyFeature = () => {},
    onModifyRemark = () => {},
    onRemarkSave = () => {},
    onStopMofifyFeatureInDetails,
    onDragEnd = () => {},
    onMergeUp,
    onMergeDown,
    onMergeCancel,
    CollectionEdit = false,
    onSelectCollection,
    onModifyGeojsonIcon = () => {},
    onRecoverGeojsonIcon = () => {},
    onCheckItem = () => {},
    callback,
    parent,
    index,
  } = props;
  const handleSelect = (val) => {
    // console.log(val);
    onSelectCollection && onSelectCollection(val);
  };
  return (
    <DragDropContext onDragEnd={(result) => onDragEnd(data, result)}>
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
                                {...props}
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
                                parent={parent}
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
                                onModifyGeojsonIcon={onModifyGeojsonIcon}
                                onRecoverGeojsonIcon={onRecoverGeojsonIcon}
                                index={index}
                                length={dataSource.length}
                              />
                            ) : (
                              <div className={styles.groupCollection}>
                                {item.child &&
                                  item.child.map((child, i) => (
                                    <UploadItem
                                      {...props}
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
                  description="??????????????????"
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
  onEditCollection = () => {},
  areaList,
  onSelectGroup,
  onChangeDisplay,
  onEditPlanPic = () => {},
  onCopyCollection = () => {},
  onModifyRemark = () => {},
  onModifyFeature = () => {},
  onStopMofifyFeatureInDetails,
  onRemarkSave = () => {},
  onToggleChangeStyle = () => {},
  onModifyGeojsonIcon = () => {},
  onRecoverGeojsonIcon = () => {},
  onMergeUp,
  onMergeDown,
  index,
  length,
  subIndex,
  group_length,
  group_id,
  parent,
  onCheckItem = () => {},
  onMergeCancel = () => {},
  onChangeAnimate = () => {},
  disabledAnimateToggle = false,
}) => {
  let obj = { ...data };
  // ????????????
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
    paper: { text: "??????", icon: "icon-tupian" },
    interview: { text: "??????", icon: "icon-yinpin" },
    pic: { text: "??????", icon: "icon-tupian" },
    video: { text: "??????", icon: "icon-shipin" },
    word: { text: "??????", icon: "icon-wenjian" },
    annotate: { text: "??????", icon: "icon-pizhu1" },
    plotting: { text: "??????", icon: "icon-biaohui2" },
    Point: { text: "?????????", icon: "icon-zuobiao2" },
    unknow: { text: "??????", icon: "icon-bianzu612" },
    planPic: { text: "??????", icon: "icon-bianzu581" },
    address: { text: "??????", icon: "icon-zuobiao2" },
  };
  let { create_by, title, create_time } = data;
  let time = Action.dateFormat(create_time, "yyyy/MM/dd");
  let hours = Action.dateFormat(create_time, "HH:mm");

  let secondSetType = type;

  if (data.content) {
    let content = JSON.parse(data.content);
    const geometryType = content.geometryType;
    if (geometryType === "Point") {
      secondSetType = "Point";
    }
  }

  const onHandleMenu = ({ key }) => {
    // ???????????????
    if (key === "editCollection") {
      setVisible(false);
      onEditCollection && onEditCollection("editCoordinate", data);
    }
    if (key === "selectGroup") {
    }

    if (key === "modifyGeojsonIcon") {
      setVisible(false);
      onModifyGeojsonIcon && onModifyGeojsonIcon(data);
    }

    if (key === "recoverGeojsonIcon") {
      setVisible(false);
      onRecoverGeojsonIcon && onRecoverGeojsonIcon(data);
    }

    if (key === "eidtTitle") {
      setIsEdit(!isEdit);
      setVisible(false);
    }
    if (key === "display") {
      onChangeDisplay && onChangeDisplay(data);
      setVisible(false);
    }
    // ???????????????
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
      // ????????????
      setVisible(false);
      onMergeUp && onMergeUp(data, index);
    }
    if (key === "mergeDown") {
      // ????????????
      setVisible(false);
      onMergeDown && onMergeDown(data, index);
    }
    if (key === "mergeCancel") {
      // ????????????
      setVisible(false);
      onMergeCancel && onMergeCancel(data);
    }
  };
  // ????????????
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
    else return "????????????????????????";
  };

  const menu = (
    <Menu onClick={onHandleMenu}>
      {data.collect_type !== "4" && data.collect_type !== "5" && (
        <Menu.Item key="editCollection">????????????</Menu.Item>
      )}
      <Menu.Item key="eidtTitle">????????????</Menu.Item>
      {data.collect_type === "8" && (
        <Menu.Item key="modifyGeojsonIcon">????????????</Menu.Item>
      )}
      {data.collect_type === "8" && (
        <Menu.Item key="recoverGeojsonIcon">??????????????????</Menu.Item>
      )}
      {data.collect_type === "5" && (
        <Menu.Item key="editPlanPic">??????</Menu.Item>
      )}
      {data.collect_type === "9" &&
      data.content &&
      JSON.parse(data.content)?.remark ? (
        <Menu.Item key="modifyRemark">????????????</Menu.Item>
      ) : null}
      {/* {data.content && JSON.parse(data.content)?.remark === "" ? (
        <Menu.Item key="addRemark">????????????</Menu.Item>
      ) : null} */}
      {data.collect_type === "4" &&
      data.content &&
      JSON.parse(data.content)?.featureType ? (
        <Menu.Item key="modifyFeature">????????????</Menu.Item>
      ) : null}
      {data.collect_type === "4" && !isPlotEdit ? (
        <Menu.Item key="copyToGroup">
          <Popover
            overlayStyle={{ zIndex: 10000 }}
            visible={copyVisible}
            onVisibleChange={(val) => setCopyVisible(val)}
            trigger="click"
            placement="rightTop"
            title={`?????? ${data.title} ???`}
            content={<AreaItem type="copy" />}
          >
            <div style={{ width: "100%" }}>???????????????</div>
          </Popover>
        </Menu.Item>
      ) : null}
      {data.collect_type === "4" && isPlotEdit ? (
        <Menu.Item key="copyToGroup">
          <Popconfirm
            title="???????????????????????????????????????????????????????????????????"
            okText="??????"
            cancelText="????????????"
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
            <div style={{ width: "100%" }}>???????????????</div>
          </Popconfirm>
        </Menu.Item>
      ) : null}
      {isPlotEdit ? (
        <Menu.Item key="selectGroup">
          <Popconfirm
            title="???????????????????????????????????????????????????????????????????"
            okText="??????"
            cancelText="????????????"
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
            <div style={{ width: "100%" }}>???????????????</div>
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
            title={`?????? ${data.title} ???`}
            content={<AreaItem type="select" />}
          >
            <div style={{ width: "100%" }}>???????????????</div>
          </Popover>
        </Menu.Item>
      )}
      {((index !== 0 && onMergeUp && subIndex === undefined) ||
        (index !== 0 && onMergeUp && subIndex === 0)) && (
        <Menu.Item key="mergeUp">????????????</Menu.Item>
      )}
      {((index < length - 1 && onMergeDown && subIndex === undefined) ||
        (index < length - 1 &&
          onMergeDown &&
          subIndex === group_length - 1)) && (
        <Menu.Item key="mergeDown">????????????</Menu.Item>
      )}
      {group_id && <Menu.Item key="mergeCancel">????????????</Menu.Item>}
      {/* <Menu.Item key="display">
          {data.is_display === "0" ? "??????" : "??????"}
        </Menu.Item> */}
      {data.collect_type === "8" && (
        <Menu.Item key="showAnimate">
          <div
            className={styles.toogleAnimate}
            onClick={(e) => e.stopPropagation()}
          >
            <span>????????????</span>
            <span>
              <Switch
                size="small"
                onChange={(val) => {
                  onChangeAnimate && onChangeAnimate(val, data);
                }}
              />
            </span>
          </div>
        </Menu.Item>
      )}

      <Menu.Item key="removeBoard">
        <Popconfirm
          title="?????????????????????????"
          okText="??????"
          cancelText="??????"
          overlayStyle={{ zIndex: 10000 }}
          onConfirm={() => {
            setVisible(false);
            onRemove && onRemove(data);
          }}
          placement="topRight"
        >
          <div style={{ width: "100%" }} className="danger">
            ??????
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
    parent.setItemClickState(true);
    parent.scrollForFeature(val.id);
    let feature = Action.findFeature(val.id);
    if (feature && feature.get("meetingRoomNum") !== undefined) {
      Action.fitFeature(feature);
      setTimeout(function () {
        Action.handlePlotClick(feature);
      }, 100);
    } else {
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

        // ??????
        if (val.collect_type === "4") {
          let extent = feature && feature.getGeometry().getExtent();
          if (extent) {
            Action.toCenter({ type: "extent", center: extent });
            Action.toggleFeatureStyle(feature);
          }
        }

        // ?????????
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
    }
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
                    placeholder="???????????????"
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
                    <Icon type="close" CloseOutlined />
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
                    <Icon type="check" CheckOutlined />
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
                onClick={(e) => e.stopPropagation()}
              >
                <MyIcon type="icon-gengduo1" />
              </span>
            </Dropdown>
          ) : (
            <Checkbox
              value={data.id}
              style={{ marginLeft: 5 }}
              onChange={(e) => {
                e.stopPropagation();
                parent.updateSelectedMeetingRooms(data.title);
              }}
            ></Checkbox>
          )}
        </div>
      </div>
      {/* {oldRemark || isAddMark === true ? (
          <div style={{ width: "100%", display: "flex" }}>
            <div
              className={styles.uploadIcon + ` ${styles[secondSetType]}`}
              style={{ background: 0 }}
            >
              <span style={{ verticalAlign: "top" }}>??????:</span>
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
