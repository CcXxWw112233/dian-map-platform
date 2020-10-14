import react from "react";
import { Collapse } from "antd";

import publicDataStyles from "../PublicDataTreeComponent.less";
import PublicDataTreeDetailItem from "./PublicDataTreeDetailItem";
import PublicDataTreeComponetHeader from "./PublicDataTreeComponetHeader";

export default class PublicDataTreeComponent extends react.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { datas, callback } = this.props;
    const { Panel } = Collapse;
    return (
      <Collapse bordered={false} ghost className={publicDataStyles.wrapper}>
        <Panel
          className={publicDataStyles.header}
          header={
            <PublicDataTreeComponetHeader
              data={datas}
              collectionId={datas.id}
              areaList={this.props.areaList}
              callback={callback}
            />
          }
        >
          {datas.content &&
            datas.content.map((item) => {
              if (item.children && item.children.length > 0) {
                return (
                  <Collapse bordered={false} ghost key={item.id + "00"}>
                    <Panel
                      key={item.id}
                      header={
                        <PublicDataTreeComponetHeader
                          data={item}
                          collectionId={datas.id}
                          areaList={this.props.areaList}
                          callback={callback}
                        />
                      }
                    >
                      {item.children.map((item2) => {
                        return (
                          <PublicDataTreeDetailItem
                            key={item2.id}
                            data={item2}
                            collectionId={datas.id}
                            areaList={this.props.areaList}
                            callback={callback}
                          />
                        );
                      })}
                    </Panel>
                  </Collapse>
                );
              } else {
                return (
                  <PublicDataTreeDetailItem
                    key={item.id}
                    data={item}
                    collectionId={datas.id}
                    areaList={this.props.areaList}
                    callback={callback}
                  />
                );
              }
            })}
        </Panel>
      </Collapse>
    );
  }
}
