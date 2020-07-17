import React from "react";
import { Tabs } from "antd";
const { TabPane } = Tabs;
export default class HouseDetail extends React.Component {
  render() {
    return (
      <Tabs type="card">
        <TabPane tab="交通" key="1">
          <Tabs>
            <TabPane tab="地铁站" key="1-1"></TabPane>
            <TabPane tab="公交站" key="1-2"></TabPane>
          </Tabs>
        </TabPane>
        <TabPane tab="教育" key="2">
          <Tabs>
            <TabPane tab="幼儿园" key="2-1"></TabPane>
            <TabPane tab="小学" key="2-2"></TabPane>
            <TabPane tab="中学" key="2-2"></TabPane>
            <TabPane tab="大学" key="2-2"></TabPane>
          </Tabs>
        </TabPane>
        <TabPane tab="医疗" key="3">
          <Tabs>
            <TabPane tab="医院" key="3-1"></TabPane>
            <TabPane tab="药店" key="3-2"></TabPane>
          </Tabs>
        </TabPane>
        <TabPane tab="购物" key="4">
          <Tabs>
            <TabPane tab="商场" key="4-1"></TabPane>
            <TabPane tab="超市" key="4-2"></TabPane>
            <TabPane tab="市场" key="4-3"></TabPane>
          </Tabs>
        </TabPane>
        <TabPane tab="生活" key="5">
          <Tabs>
            <TabPane tab="银行" key="5-1"></TabPane>
            <TabPane tab="ATM" key="5-2"></TabPane>
            <TabPane tab="餐厅" key="5-3"></TabPane>
            <TabPane tab="咖啡馆" key="5-4"></TabPane>
          </Tabs>
        </TabPane>
        <TabPane tab="娱乐" key="6">
          <Tabs>
            <TabPane tab="公园" key="6-1"></TabPane>
            <TabPane tab="电影院" key="6-2"></TabPane>
            <TabPane tab="健身房" key="6-3"></TabPane>
            <TabPane tab="体育馆" key="4-4"></TabPane>
          </Tabs>
        </TabPane>
      </Tabs>
    );
  }
}
