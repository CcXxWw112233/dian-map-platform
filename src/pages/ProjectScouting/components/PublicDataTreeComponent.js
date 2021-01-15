import react from "react";
import { Collapse } from "antd";

import publicDataStyles from "../PublicDataTreeComponent.less";
import PublicDataTreeDetailItem from "./PublicDataTreeDetailItem";
import PublicDataTreeComponetHeader from "./PublicDataTreeComponetHeader";
import datas from "../../publicMapData/public_data";
import { connect } from "dva";

@connect(({ publicDataLink: { publicDataLinkArr } }) => ({ publicDataLinkArr }))
export default class PublicDataTreeComponent extends react.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstActiveKey: "",
      activeKeys: [],
      firstEyeActive: false,
      secondEyeActive: false,
    }
    this.datas = null;
    this.firstActiveKey = ""
    
    this.activeKeys = []
    this.firstEyeActive = false;
    this.secondEyeActive = false;
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

  firstCollapseChange = (e) => {
    const { index, publicDataLinkArr, dispatch } = this.props
    if (!publicDataLinkArr[index]) {
      publicDataLinkArr[index] = {}
    }
    publicDataLinkArr[index].key = e
    publicDataLinkArr[index].children = []

    if (Array.isArray(e)) {
      dispatch({
        type: "publicDataLink/update",
        payload: {
          publicDataLinkArr: publicDataLinkArr
        }
      })
      this.setState({
        firstActiveKey: e
      })
    }
  }

  collapseChange = (e, index) => {
    const { index: parentIndex, publicDataLinkArr, dispatch } = this.props;
    if (!publicDataLinkArr[parentIndex].children) {
      publicDataLinkArr[parentIndex].children = []
    }
    publicDataLinkArr[parentIndex].children[index] = e
    if (Array.isArray(e)) {
      dispatch({
        type: "publicDataLink/update",
        payload: {
          publicDataLinkArr: publicDataLinkArr
        }
      })
      this.activeKeys[index] = e
      this.setState({
        activeKeys: this.activeKeys
      })
    }
  }

  render () {
    const { datas, callback, index: parentIndex, publicDataLinkArr } = this.props;
    const { Panel } = Collapse;
    if (datas)
      return (
        <Collapse activeKey={publicDataLinkArr[parentIndex]?.key || ""} bordered={false} ghost key={datas.id} className={publicDataStyles.wrapper} onChange={(e) => this.firstCollapseChange(e)}>
          <Panel
            className={publicDataStyles.header}
            key={datas.id}
            header={
              <PublicDataTreeComponetHeader
                data={datas}
                collectionId={datas.id}
                areaList={this.props.areaList}
                callback={callback}
                // parent={this}
                isFirst={true}
              />
            }
          >
            {datas.content &&
              datas.content.map((item, index) => {
                if (item.children && item.children.length > 0) {
                  this.activeKeys = Array(item.children.length).fill("");
                  return (
                    <Collapse bordered={false} ghost key={item.id + "00"} activeKey={publicDataLinkArr[parentIndex]?.children[index] ||""} onChange={(e) => this.collapseChange(e, index)}>
                      <Panel
                        key={item.id}
                        header={
                          <PublicDataTreeComponetHeader
                            data={item}
                            collectionId={datas.id}
                            areaList={this.props.areaList}
                            callback={callback}
                            // parent={this}
                            // showEyeByFirst={this.state.firstEyeActive}
                            
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
                              changeQueryStr={this.props.changeQueryStr}
                              // parent={this}
                              // showEyeByFirst={this.state.firstEyeActive}
                              // showEyeBySecond={this.state.secondEyeActive}
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
                      changeQueryStr={this.props.changeQueryStr}
                      // parent={this}
                      // showEyeByFirst={this.state.firstEyeActive}
                    />
                  );
                }
              })}
          </Panel>
        </Collapse>
      );
  }
}
