import React from "react";
import { Radio, Row, message } from "antd";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "../LeftToolBar.less";
import ScoutDetail from "../../../lib/components/ProjectScouting/ScoutingDetail";
import ListAction from "../../../lib/components/ProjectScouting/ScoutingList";
import { plotEdit } from "../../../utils/plotEdit";
import { TransformCoordinate } from "../../../lib/utils/index";
import Event from "../../../lib/utils/event";

export default class ProjectList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectList: [],
      projectId: "",
      groupId: "",
      projectName: "",
      openPanel: true,
      isInProject: false,
      groupList: [],
    };
  }
  componentDidMount() {
    ListAction.checkItem()
      .then((res) => {
        if (res) {
          // 项目内
          if (res.code === 0) {
            let param = { board_id: res.data.board_id };
            ScoutDetail.fetchAreaList(param).then((resp) => {
              resp.data.push({
                board_id: "other",
                name: "未分组",
              });
              this.setState({
                isInProject: true,
                projectId: res.data.board_id,
                projectName: res.data.board_name,
                groupList: resp.data,
              });
            });
          } else {
            this.setState({
              isInProject: false,
              projectList: ListAction.projects,
            });
          }
        }
      })
      .catch((e) => {
        this.setState({
          isInProject: false,
          projectList: ListAction.projects,
        });
      });
  }
  onChange = (value) => {
    // 项目外
    if (!this.state.isInProject) {
      this.setState(
        {
          projectId: value,
        },
        () => {
          const name = this.state.projectList.filter((project) => {
            return project.board_id === value;
          })[0].board_name;
          this.addFeatureToProject(this.props.selectFeatureOperatorList, name);
          this.props.goBackTempPlot(this.props.selectFeatureOperatorList);
        }
      );
    } else {
      const name = this.state.groupList.filter((group) => {
        return group.id === value;
      })[0].name;
      this.setState(
        {
          groupId: value,
          groupName: name,
        },
        () => {
          this.addFeatureToGroup(
            this.props.selectFeatureOperatorList,
            this.state.groupName
          );
          this.props.goBackTempPlot(this.props.selectFeatureOperatorList);
        }
      );
    }
  };

  addFeatureToGroup = (featureOperatorList, name) => {
    let promise = featureOperatorList.map(async (item) => {
      let { feature } = item;
      let param = {
        coordinates: feature.getGeometry().getCoordinates(),
        geoType: feature.getGeometry().getType(),
        ...item.attrs,
      };
      let obj = {
        collect_type: 4,
        title: item.name || item.title,
        target: "feature",
        area_type_id: this.state.groupId === "other" ? "" : this.state.groupId,
        board_id: this.state.projectId,
        content: JSON.stringify(param),
      };
      let xy = [];
      if (param.geoType === "Point") {
        xy = TransformCoordinate(param.coordinates, "EPSG:3857", "EPSG:4326");
      } else {
        const extent = item.feature.getGeometry().getExtent();
        let centerPoi = [
          (extent[0] + extent[2]) / 2,
          (extent[1] + extent[3]) / 2,
        ];
        xy = TransformCoordinate(centerPoi, "EPSG:3857", "EPSG:4326");
      }
      let res = await window.CallWebMapFunction("getCityByLonLat", {
        lon: xy[0],
        lat: xy[1],
      });
      obj.districtcode = res.addressComponent?.adcode;
      return ScoutDetail.addCollection(obj);
    });
    Promise.all(promise)
      .then((resp) => {
        Event.Evt.firEvent("updatePlotFeature");
        Event.Evt.firEvent("addCollectionForFeature", resp);
        message.success(`标绘已成功保存到${this.state.projectName}的${name}`);
        featureOperatorList.forEach((operator) => {
          plotEdit.plottingLayer.removeFeature(operator);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  
  addFeatureToProject = (featureOperatorList, name) => {
    let promise = featureOperatorList.map(async (item) => {
      let { feature } = item;
      let param = {
        coordinates: feature.getGeometry().getCoordinates(),
        geoType: feature.getGeometry().getType(),
        ...item.attrs,
      };
      let obj = {
        collect_type: 4,
        title: item.name || item.title,
        target: "feature",
        area_type_id: "",
        board_id: this.state.projectId,
        content: JSON.stringify(param),
      };
      if (param.geoType === "Point") {
        let xy = TransformCoordinate(
          param.coordinates,
          "EPSG:3857",
          "EPSG:4326"
        );
        let res = await window.CallWebMapFunction("getCityByLonLat", {
          lon: xy[0],
          lat: xy[1],
        });
        obj.districtcode = res.addressComponent?.adcode;
        return ScoutDetail.addCollection(obj);
      } else {
        return ScoutDetail.addCollection(obj);
      }
    });
    Promise.all(promise)
      .then((resp) => {
        Event.Evt.firEvent("updatePlotFeature");
        Event.Evt.firEvent("addCollectionForFeature", resp);
        message.success(`添加到${name}项目成功`);
        featureOperatorList.forEach((operator) => {
          plotEdit.plottingLayer.removeFeature(operator);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <div
          className={styles.header}
          style={{ padding: "0 20px", marginBottom: 10 }}
        >
          <i
            className={globalStyle.global_icon}
            onClick={() => this.props.goBackTempPlot([])}
          >
            &#xe758;
          </i>
        </div>
        <div
          className={`${styles.body} ${globalStyle.autoScrollY}`}
          style={{
            height: "calc(100% - 50px)",
          }}
        >
          {this.state.isInProject === false &&
          this.state.projectList.length > 0 ? (
            <div className={styles.content}>
              <Radio.Group
                onChange={(e) => this.onChange(e.target.value)}
                value={this.state.projectId}
                style={{ width: "100%", textAlign: "left" }}
              >
                {this.state.projectList.map((project) => {
                  return (
                    <Row
                      style={{ width: "100%", height: 30, lineHeight: 20 }}
                      key={project.board_id}
                    >
                      <Radio value={project.board_id}>
                        {project.board_name}
                      </Radio>
                    </Row>
                  );
                })}
              </Radio.Group>
            </div>
          ) : null}
          {this.state.isInProject === true &&
          this.state.groupList.length > 0 ? (
            <div className={styles.content}>
              <Radio.Group
                onChange={(e) => this.onChange(e.target.value)}
                value={this.state.groupId}
                style={{ width: "100%", textAlign: "left" }}
              >
                {this.state.groupList.map((group) => {
                  return (
                    <Row
                      style={{ width: "100%", height: 30, lineHeight: 20 }}
                      key={group.id}
                    >
                      <Radio value={group.id}>{group.name}</Radio>
                    </Row>
                  );
                })}
              </Radio.Group>
            </div>
          ) : null}
          {this.state.projectList.length === 0 && !this.state.isInProject ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                top: "30%",
              }}
            >
              <i
                className={globalStyle.global_icon}
                style={{ fontSize: 50, lineHeight: "50px" }}
              >
                &#xe7d1;
              </i>
              <span>暂无数据</span>
              <span>请先创建项目</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
