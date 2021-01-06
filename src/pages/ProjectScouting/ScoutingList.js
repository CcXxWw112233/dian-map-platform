import React, { PureComponent } from "react";
import styles from "./ScoutingList.less";

import globalStyle from "../../globalSet/styles/globalStyles.less";
import { connect } from "dva";
import Action from "../../lib/components/ProjectScouting/ScoutingList";
import ScoutingItem from "./components/ScoutingItem";
import PermissionModal from "./components/permissionModal";
import { message, Empty } from "antd";
import Bitmap from "../../assets/Bitmap.png";
import Event from "../../lib/utils/event";
import { feature } from "@turf/turf";
import { addFeature } from "../../lib/utils";

const ScoutingAddBtn = ({ cb }) => {
  return (
    <div className={styles.btn + ` ${styles.scoutingAdd}`} onClick={cb}>
      <p>
        <i className={globalStyle.global_icon}>&#xe65f;</i>
        <span>制定踏勘计划</span>
      </p>
    </div>
  );
};
@connect(({ controller: { mainVisible } }) => ({ mainVisible }))
export default class ScoutingList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      permissionModalVisible: false,
      selectedProject: null,
    };
    this.projectDatas = [];
  }

  componentDidMount() {
    // 检查数据
    this.renderBoardList();
    const { dispatch } = this.props;
    Action.init(dispatch);
    Action.on("projectClick", (val) => {
      // console.log(val)
      this.handleClick(val);
    });
    Event.Evt.on("searchProject", (data) => {
      let tmpArr = [];
      if (!data) {
        tmpArr = this.projectDatas;
      } else {
        tmpArr = this.projectDatas.filter(
          (item) => item[data.type] === data.code
        );
      }
      if (!Array.isArray(tmpArr)) {
        tmpArr = [];
      }
      this.setState({
        projects: tmpArr,
      });
      const { dispatch } = this.props;
      dispatch({
        type: "scoutingProject/updateList",
        payload: {
          projectList: tmpArr,
          cb: this.handleClick.bind(this),
        },
      });
      this.renderPoint(tmpArr);
    });
  }
  componentWillUnmount() {
    Action.mounted = false;
  }

  renderBoardList = () => {
    // 获取列表
    this.getProjectList().then((val) => {
      // 没有列表的时候，不进行任何操作
      if (!val.length) return;
      this.renderPoint(val);
    });
  };

  renderPoint = (data) => {
    // 渲染数据
    Action.renderProjectPoint(data || []);
  };

  getProjectList = () => {
    const { dispatch } = this.props;
    return new Promise((resolve, reject) => {
      Action.getList()
        .then((res) => {
          this.setState({
            projects: res.data.reverse(),
          });
          this.projectDatas = res.data;
          dispatch({
            type: "scoutingProject/updateList",
            payload: {
              projectList: res.data.reverse(),
              cb: this.handleClick.bind(this),
            },
          });
          resolve(res.data.reverse());
          // console.log(res)
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  };

  // 检查输入的id存不存在与列表中
  checkData = (data, id) => {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      // 有存在的数据，可以跳转页面
      if (item.board_id.toString() === id.toString()) {
        return item;
      }
    }
  };

  // 点击项目
  handleClick = (val) => {
    let { dispatch } = this.props;
    this.checkData(this.state.projects, val.board_id);
    // 触发本地缓存
    Action.handleClickBoard(val);
    // 切换到详情页
    dispatch({
      type: "controller/updateMainVisible",
      payload: {
        mainVisible: "detail",
      },
    });
  };

  // 删除项目
  removeBoard = (val) => {
    // console.log(val.board_id)
    let id = val.board_id;
    Action.removeBoard(id).then((res) => {
      let list = [...this.state.projects];
      this.setState(
        {
          projects: list.filter((item) => item.board_id !== id),
        },
        () => {
          const { dispatch } = this.props;
          dispatch({
            type: "scoutingProject/updateList",
            payload: {
              projectList: this.state.projects,
            },
          });
          // 重新渲染
          Action.renderProjectPoint(this.state.projects);
          Action.projects = this.state.projects;
        }
      );
    });
  };

  // 编辑项目名称
  handleEditBoard = (val, name) => {
    if (val.board_name === name) {
      return;
    }
    const { dispatch } = this.props;
    Action.editBoard(val.board_id, { board_name: name })
      .then((res) => {
        message.success("项目名称修改成功");
        let projects = [...this.state.projects].map((item) => {
          if (item.board_id === val.board_id) {
            item.board_name = name;
          }
          return item;
        });
        this.setState(
          {
            projects,
          },
          () => {
            Action.renderProjectPoint(projects);
            Action.projects = projects;
            dispatch({
              type: "scoutingProject/updateList",
              payload: {
                projectList: projects,
              },
            });
          }
        );
      })
      .catch((err) => {
        message.error(err && err.message);
      });
  };

  // 添加项目请求
  addBoard = (val) => {
    let { name, remark } = val;
    message.destroy();
    Action.addBoard({
      board_name: name,
      remark,
      lng: val.coordinates[0],
      lat: val.coordinates[1],
      radius: val.radius,
    })
      .then((res) => {
        let { data } = res;
        // 添加数据
        this.setState(
          {
            projects: this.state.projects.concat([data]),
          },
          () => {
            Action.projects = this.state.projects;
            // 更新点的数据
            Action.renderProjectPoint(this.state.projects);
            const { dispatch } = this.props;
            dispatch({
              type: "scoutingProject/updateList",
              payload: {
                projectList: this.state.projects,
              },
            });
            this.getProjectList();
          }
        );
        try {
          if (window.parent) {
            window.parent.postMessage("map_board_create", "*");
          }
        } catch (err) {
          console.log(err);
        }
        // 调用灵犀

        message.success("新建项目成功");

        this.showOtherSlide();
      })
      .catch((err) => {
        console.log(err);
        this.showOtherSlide();
        Action.removeDraw();
        message.error(err && err.message);
      });
  };
  // 显示被隐藏的页面
  showOtherSlide = () => {
    let { dispatch } = this.props;
    // 显示已关闭其他不需要的元素
    dispatch({
      type: "openswitch/updateDatas",
      payload: {
        isShowBasemapGallery: true,
        isShowRightTools: true,
        isShowLeftToolBar: true,
        isShowPhotoSwipe: true,
      },
    });
  };

  // 隐藏不需要的页面
  hideOtherSlide = () => {
    let { dispatch } = this.props;
    Action.hideOverlay();
    // 关闭其他不需要的元素
    dispatch({
      type: "openswitch/updateDatas",
      payload: {
        isShowBasemapGallery: false,
        isShowRightTools: false,
        isShowLeftToolBar: false,
        isShowPhotoSwipe: false,
      },
    });
  };

  // 取消新增
  cancelAdd = (e) => {
    e && e.preventDefault();
    Action.removeDraw();
    this.showOtherSlide();
    Action.showOverlay();
    message.destroy();
  };

  // 添加按钮点击事件
  handleAddClick = () => {
    Event.Evt.firEvent("returnNation");
    // 隐藏其他不需要的窗体
    this.hideOtherSlide();
    // message.success(
    //   <span>
    //     请选择项目地点 或 <a onClick={this.cancelAdd}>取消新建</a>
    //   </span>,
    //   0
    // );
    // // 添加绘制功能
    // Action.addDrawBoard().then((evt) => {
    //   let { feature } = evt;
    //   let coor = feature.getGeometry().getCoordinates();
    //   // 添加overlay
    //   Action.addBoardOverlay(coor, { viewToCenter: true })
    //     .then((data) => {
    //       // console.log(data);
    //       data.coordinates = coor;
    //       this.addBoard(data);
    //     })
    //     .catch((err) => {
    //       // 取消新增
    //       this.cancelAdd();
    //       message.warn("已取消新建操作");
    //     });
    // });
    message.success(
      <span>
        请在地图圈选范围或 <a onClick={this.cancelAdd}>取消新建</a>
      </span>,
      0
    );
    Action.addBoardRadius().then((feature) => {
      let center = feature.getGeometry().getCenter();
      Action.addBoardOverlay(center, { viewToCenter: true })
        .then((data) => {
          data.coordinates = center;
          data.radius = Math.round(feature.getGeometry().getRadius());
          this.addBoard(data);
        })
        .catch((err) => {
          // 取消新增
          this.cancelAdd();
          message.warn("已取消新建操作");
        });
    });
  };

  // 保存备注
  onSaveRemark = (val, text) => {
    // if (!text || text === val.remark) return;
    // if (text.trim() === "") {
    //   message.info("不能输入空格。");
    //   return;
    // }
    Action.editBoard(val.board_id, { remark: text })
      .then((res) => {
        // console.log(res);
        let arr = this.state.projects.map((item) => {
          if (item.board_id === val.board_id) {
            item.remark = text;
          }
          return item;
        });
        this.setState({
          projects: arr,
        });
        message.success("修改备注成功");
      })
      .catch((err) => {
        message.error(err.message);
      });
  };

  // 设置背景图
  onSetBgImg = (val, url) => {
    Action.editBoard(val.board_id, { bg_image: url })
      .then((res) => {
        let arr = this.state.projects.map((item) => {
          if (item.board_id === val.board_id) {
            item.bg_image = url;
          }
          return item;
        });
        this.setState({
          projects: arr,
        });
        message.success("设置背景图完成");
      })
      .catch((err) => {
        message.error(err.message);
      });
  };

  displayPermissionModal = (data) => {
    this.setState({
      permissionModalVisible: true,
      selectedProject: data,
    });
  };

  addProjectExtent = (data) => {
    Action.addProjectExtent(data)
  }

  removeFeatureAndOvelay =() => {
    Action.removeFeatureAndOvelay();
  }

  render() {
    const { projects } = this.state;
    return (
      <div className={styles.wrap + ` ${globalStyle.autoScrollY}`}>
        {projects.length ? (
          projects.map((item, index) => {
            return (
              <ScoutingItem
                key={item.board_id}
                name={item.board_name}
                date={""}
                style={{
                  animationDelay: index * 0.05 + "s",
                  animationDuration: "0.3s",
                  animationTimingFunction: "ease-in-out",
                }}
                remarkText={item.remark}
                bgImage={item.bg_image}
                onRename={this.handleEditBoard.bind(this, item)}
                cb={this.handleClick.bind(this, item)}
                onRemove={this.removeBoard.bind(this, item)}
                onSaveRemark={this.onSaveRemark.bind(this, item)}
                onSetBgImg={this.onSetBgImg.bind(this, item)}
                displayPermissionModal={this.displayPermissionModal}
                data={item}
                parent={this}
                toolParent={this.props.toolParent}
              ></ScoutingItem>
            );
          })
        ) : (
          <Empty description="暂无项目数据" style={{ marginBottom: 10 }} />
        )}
        <ScoutingAddBtn
          cb={this.handleAddClick.bind(this)}
          style={{ ...this.props.toolParent.getStyle("map:board:add", "org") }}
          disabled={this.props.toolParent.getDisabled("map:board:add", "org")}
        />
        {this.state.permissionModalVisible ? (
          <PermissionModal
            permissionModal={this.state.permissionModalVisible}
            data={this.state.selectedProject}
            parent={this}
          />
        ) : null}
        <div className={styles.bgStyleImg}>
          <img crossOrigin="anonymous" src={Bitmap} />
        </div>
      </div>
    );
  }
}
