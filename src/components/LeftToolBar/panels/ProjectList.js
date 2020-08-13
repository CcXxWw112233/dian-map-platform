import React from "react";
import { Radio, Row, message } from "antd";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import styles from "../LeftToolBar.less";
import ScoutAction from "../../../lib/components/ProjectScouting/ScoutingList";
import ScoutDetail from "../../../lib/components/ProjectScouting/ScoutingDetail";
import ListAction from "../../../lib/components/ProjectScouting/ScoutingList";
import FeatureOperator from "../../../utils/plot2ol/src/core/FeatureOperator";
import { plotEdit } from "../../../utils/plotEdit";

export default class ProjectList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectList: ListAction.projects,
      projectId: "",
      projectName: "",
    };
  }
  onChange = (value) => {
    this.setState(
      {
        projectId: value,
      },
      () => {
        const name = this.state.projectList.filter((project) => {
          return project.board_id === value;
        })[0].board_name;
        this.addFeatureForProject(this.props.selectFeatureOperatorList, name);
        this.props.goBackTempPlot(this.props.selectFeatureOperatorList);
      }
    );
  };
  addFeatureForProject = (featureOperatorList, name) => {
    let promise = featureOperatorList.map((item) => {
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
      return ScoutDetail.addCollection(obj);
    });
    Promise.all(promise)
      .then((resp) => {
        // console.log(resp);
        message.success(`添加到${name}项目成功`);
        // Event.Evt.firEvent("appendToProjectSuccess", featureOperatorList);
        featureOperatorList.forEach((operator) => {
          plotEdit.plottingLayer.removeFeature(operator);
        });
        Event.Evt.firEvent("addCollectionForFeature", resp);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    return (
      <div
        className={styles.panel}
        style={{ position: "absolute", left: 56, top: 0 }}
      >
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
                    <Radio value={project.board_id}>{project.board_name}</Radio>
                  </Row>
                );
              })}
            </Radio.Group>
          </div>
        </div>
      </div>
    );
  }
}
