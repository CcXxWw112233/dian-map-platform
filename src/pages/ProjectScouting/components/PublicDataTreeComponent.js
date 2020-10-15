import react from "react";
import { Collapse } from "antd";

import publicDataStyles from "../PublicDataTreeComponent.less";
import PublicDataTreeDetailItem from "./PublicDataTreeDetailItem";
import PublicDataTreeComponetHeader from "./PublicDataTreeComponetHeader";
import datas from "../../publicMapData/public_data";

export default class PublicDataTreeComponent extends react.Component {
  constructor(props) {
    super(props);
  }

  /***
   * type=1,复制到分组
   * type=2,移动到分组
   * type=3,删除
   */
  updateData = (callbackData, type = 1) => {
    const { updateCollection } = this.props;
    let id1 = datas.id,
      id2 = "",
      id3 = "";
    if (callbackData.id === datas.id) {
      id1 = datas.id;
    } else {
      for (let i = 0; i < datas.content.length; i++) {
        if (datas.content[i].id === callbackData.id) {
          id2 = callbackData.id;
          break;
        }
      }
      if (id2 === "") {
        for (let i = 0; i < datas.content.length; i++) {
          const child = datas.content[i].children;
          for (let j = 0; j < child.length; j++) {
            if (child[j].id === callbackData.id) {
              id3 = child[j].id;
              break;
            }
          }
        }
      }
    }
    // 删除
    if (type === 3) {
      
    } else if (type === 2) { // 移动
      updateCollection && updateCollection(datas)
    } else { //复制
      updateCollection && updateCollection(datas)
    }
  };

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
