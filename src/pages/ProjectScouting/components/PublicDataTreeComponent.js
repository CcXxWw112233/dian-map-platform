import react from "react";
import { Collapse } from "antd";

import styles from "../ScoutingDetails.less";
import publicDataStyles from "../PublicDataTreeComponent.less";
import { MyIcon } from "../../../components/utils";
import PublicDataAction from "../../../lib/components/PublicData";
import publicDataConf from "../../publicMapData/public_data";
import globalStyle from "@/globalSet/styles/globalStyles.less";

const { Panel } = Collapse;

class DetailItem extends react.Component {
  constructor(props) {
    super(props);
    this.eyeOpen = "icon-yanjing_xianshi";
    this.eyeClose = "icon-yanjing_yincang";
    this.populationDatas = ["人口分布", "人口密度", "就业岗位", "居民用地"];
    this.state = {
      eyeState: false,
    };
  }
  handleEyeClick = (data) => {
    this.setState(
      {
        eyeState: !this.state.eyeState,
      },
      () => {
        // 显示
        if (this.state.eyeState) {
          if (!PublicDataAction.hasInited) {
            PublicDataAction.init();
          }
          if (data && data.is_poi === "1") {
            PublicDataAction.getADPoi([data.title]);
          } else {
            const isPopulation = this.populationDatas.includes(data.title);
            let conf = publicDataConf.filter(
              (item) => item.title === data.title
            )[0];
            if (!conf) return;
            let loadFeatureKeys = conf.loadFeatureKeys[0];
            const fillColorKeyVals = data.fillColorKeyVals;
            if (isPopulation) {
              PublicDataAction.getPopulationDatas(
                fillColorKeyVals,
                data.title,
                loadFeatureKeys
              );
            } else {
              PublicDataAction.getPublicData({
                url: "",
                data: loadFeatureKeys,
                fillColor: fillColorKeyVals,
              });
            }
          }
        } else {
          // 隐藏
          if (data && data.is_poi === "1") {
            PublicDataAction.removeFeatures(data.title);
          } else {
            const isPopulation = this.populationDatas.includes(data.title);
            if (isPopulation) { // 人口
              PublicDataAction.removeFeatures(
                PublicDataAction.lastPopulationTypeName
              );
            } else {

            }
          }
        }
      }
    );
  };
  render() {
    const { data } = this.props;
    return (
      <div
        className={styles.uploadItem + ` ${globalStyle.btn}`}
        key={data.id}
        style={{ flexDirection: "row" }}
      >
        <div className={styles.uploadIcon}>
          <MyIcon type="icon-bianzu78beifen12" />
        </div>
        <div className={publicDataStyles.text}>
          <span>{data.title}</span>
        </div>
        <div
          className={styles.uploadItemOperation}
          onClick={() => this.handleEyeClick(data)}
        >
          <MyIcon type={this.state.eyeState ? this.eyeOpen : this.eyeClose} />
        </div>
      </div>
    );
  }
}
export default class PublicDataTreeComponent extends react.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { datas } = this.props;
    return datas.map((item) => {
      if (item.children.length === 0) {
        return <DetailItem key={item.id} data={item} />;
      } else {
        return (
          <Collapse bordered={false} ghost key="multi-00-000">
            {item.children.map((item2) => {
              return (
                <Panel header={item2.title} key={item2.id}>
                  {item2.children.length > 0 &&
                  item2.children[0].children.length > 0 ? (
                    <Collapse ghost bordered={false} key={item2.id + "0"}>
                      {item2.children.map((item3) => {
                        if (item3.children.length > 0) {
                          return (
                            <Panel header={item3.title} key={item3.id}>
                              {item3.children.map((item4) => {
                                return (
                                  <DetailItem key={item4.id} data={item4} />
                                );
                              })}
                            </Panel>
                          );
                        } else {
                          return null;
                        }
                      })}
                    </Collapse>
                  ) : (
                    <DetailItem key={item2.id} data={item2} />
                  )}
                  {item2.children.length > 0 &&
                  item2.children[0].children.length === 0
                    ? item2.children.map((item3) => {
                        return <DetailItem key={item3.id} data={item3} />;
                      })
                    : null}
                </Panel>
              );
            })}
          </Collapse>
        );
      }
    });
  }
}
